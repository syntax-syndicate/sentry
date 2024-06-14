from datetime import datetime, timedelta, timezone
from unittest.mock import call, patch
from urllib.parse import urlencode

from django.test import override_settings

from sentry.api.validators.auth import MISSING_PASSWORD_OR_U2F_CODE
from sentry.auth.superuser import COOKIE_NAME
from sentry.models.authenticator import Authenticator
from sentry.models.authidentity import AuthIdentity
from sentry.models.authprovider import AuthProvider
from sentry.testutils.cases import APITestCase, AuthProviderTestCase
from sentry.testutils.silo import control_silo_test
from sentry.utils.auth import SSO_EXPIRY_TIME, SsoSession


def create_authenticator(user) -> None:
    Authenticator.objects.create(
        type=3,  # u2f
        user=user,
        config={
            "devices": [
                {
                    "binding": {
                        "publicKey": "aowekroawker",
                        "keyHandle": "devicekeyhandle",
                        "appId": "https://testserver/auth/2fa/u2fappid.json",
                    },
                    "name": "Amused Beetle",
                    "ts": 1512505334,
                },
                {
                    "binding": {
                        "publicKey": "publickey",
                        "keyHandle": "aowerkoweraowerkkro",
                        "appId": "https://testserver/auth/2fa/u2fappid.json",
                    },
                    "name": "Sentry",
                    "ts": 1512505334,
                },
            ]
        },
    )


@control_silo_test
class AuthDetailsEndpointTest(APITestCase):
    path = "/api/0/auth/"

    def test_logged_in(self):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.get(self.path)
        assert response.status_code == 200
        assert response.data["id"] == str(user.id)

    def test_logged_out(self):
        response = self.client.get(self.path)
        assert response.status_code == 400


@control_silo_test
class AuthLoginEndpointTest(APITestCase):
    path = "/api/0/auth/"

    def test_valid_password(self):
        user = self.create_user("foo@example.com")
        response = self.client.post(
            self.path,
            HTTP_AUTHORIZATION=self.create_basic_auth_header(user.username, "admin"),
        )
        assert response.status_code == 200
        assert response.data["id"] == str(user.id)

    def test_invalid_password(self):
        user = self.create_user("foo@example.com")
        response = self.client.post(
            self.path,
            HTTP_AUTHORIZATION=self.create_basic_auth_header(user.username, "foobar"),
        )
        assert response.status_code == 401


@control_silo_test
class AuthVerifyEndpointTest(APITestCase):
    path = "/api/0/auth/"

    def setUp(self):
        super().setUp()
        self.validator_params = {"challenge": '{"foo":"bar"}', "response": '{"baz":"biz"}'}

    @patch("sentry.api.endpoints.auth_index.metrics")
    def test_valid_password(self, mock_metrics):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.put(self.path, data={"password": "admin"})
        assert response.status_code == 200
        assert response.data["id"] == str(user.id)
        mock_metrics.incr.assert_any_call(
            "auth.password.success", sample_rate=1.0, skip_internal=False
        )

    @patch("sentry.api.endpoints.auth_index.metrics")
    def test_invalid_password(self, mock_metrics):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.put(self.path, data={"password": "foobar"})
        assert response.status_code == 403
        assert (
            call("auth.password.success", sample_rate=1.0, skip_internal=False)
            not in mock_metrics.incr.call_args_list
        )

    def test_no_password_no_u2f(self):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.put(self.path, data={})
        assert response.status_code == 400
        assert response.data["detail"]["code"] == MISSING_PASSWORD_OR_U2F_CODE

    @patch("sentry.api.endpoints.auth_index.metrics")
    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_valid_password_u2f(self, mock_validate, mock_is_available, mock_metrics):
        user = self.create_user("foo@example.com")
        self.org = self.create_organization(owner=user, name="foo")
        self.login_as(user)
        create_authenticator(user)
        response = self.client.put(
            self.path,
            user=user,
            data={"password": "admin", **self.validator_params},
        )

        assert response.status_code == 200
        assert mock_validate.call_count == 1
        assert mock_validate.call_args.kwargs["challenge"] == {"foo": "bar"}
        assert mock_validate.call_args.kwargs["response"] == {"baz": "biz"}
        assert mock_validate.call_args.kwargs["state"] is None
        mock_metrics.incr.assert_any_call("auth.2fa.success", sample_rate=1.0, skip_internal=False)

    @patch("sentry.api.endpoints.auth_index.metrics")
    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_valid_password_u2f_with_state(self, mock_validate, mock_is_available, mock_metrics):
        user = self.create_user("foo@example.com")
        self.org = self.create_organization(owner=user, name="foo")
        self.login_as(user)
        create_authenticator(user)
        response = self.client.put(
            self.path,
            user=user,
            data={"password": "admin", "auth_state": '{"wiz":"waz"}', **self.validator_params},
        )

        assert response.status_code == 200
        assert mock_validate.call_count == 1
        assert mock_validate.call_args.kwargs["challenge"] == {"foo": "bar"}
        assert mock_validate.call_args.kwargs["response"] == {"baz": "biz"}
        assert mock_validate.call_args.kwargs["state"] == {"wiz": "waz"}
        mock_metrics.incr.assert_any_call("auth.2fa.success", sample_rate=1.0, skip_internal=False)

    @patch("sentry.api.endpoints.auth_index.metrics")
    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=False)
    def test_invalid_password_u2f(self, mock_validate, mock_is_available, mock_metrics):
        user = self.create_user("foo@example.com")
        self.org = self.create_organization(owner=user, name="foo")
        self.login_as(user)
        create_authenticator(user)
        response = self.client.put(
            self.path,
            user=user,
            data={"password": "admin", **self.validator_params},
        )

        assert response.status_code == 403
        assert mock_validate.call_count == 1
        assert mock_validate.call_args.kwargs["challenge"] == {"foo": "bar"}
        assert mock_validate.call_args.kwargs["response"] == {"baz": "biz"}
        assert mock_validate.call_args.kwargs["state"] is None
        assert (
            call("auth.2fa.success", sample_rate=1.0, skip_internal=False)
            not in mock_metrics.incr.call_args_list
        )


@control_silo_test
class AuthVerifyEndpointSuperuserTest(AuthProviderTestCase, APITestCase):
    path = "/api/0/auth/"

    def setUp(self):
        self.validator_params = {"challenge": '{"foo":"bar"}', "response": '{"baz":"biz"}'}
        self.superuser = self.create_user("superuser@sentry.io", is_superuser=True)
        self.org_provider = AuthProvider.objects.create(
            organization_id=self.organization.id, provider="dummy"
        )

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_superuser_sso_user_no_password_saas_product(self, mock_validate, mock_is_available):
        self.superuser.update(password="")
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                    **self.validator_params,
                },
            )

        assert response.status_code == 200
        assert COOKIE_NAME in response.cookies
        assert mock_validate.call_args.kwargs["state"] is None

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_superuser_sso_user_no_password_saas_product_with_state(
        self, mock_validate, mock_is_available
    ):
        self.superuser.update(password="")
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                    "auth_state": '{"wiz":"waz"}',
                    **self.validator_params,
                },
            )

        assert response.status_code == 200
        assert COOKIE_NAME in response.cookies
        assert mock_validate.call_args.kwargs["state"] == {"wiz": "waz"}

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=False)
    def test_superuser_expired_sso_user_no_password_saas_product(
        self, mock_validate, mock_is_available
    ):
        self.superuser.update(password="")
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            sso_session_expired = SsoSession(
                self.organization.id,
                datetime.now(tz=timezone.utc) - SSO_EXPIRY_TIME - timedelta(hours=1),
            )
            self.session[sso_session_expired.session_key] = sso_session_expired.to_dict()
            self.save_session()

            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                    **self.validator_params,
                },
            )

        # status code of 401 means invalid SSO session
        assert response.status_code == 401
        assert response.data == {
            "detail": {
                "code": "sso-required",
                "extra": {"loginUrl": f"/auth/login/{self.organization.slug}/"},
                "message": "Must login via SSO",
            }
        }
        assert COOKIE_NAME not in response.cookies

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=False)
    def test_superuser_expired_sso_user_no_password_saas_product_customer_domain(
        self, mock_validate, mock_is_available
    ):
        # An organization that a superuser is not a member of, but will try to access.
        other_org = self.create_organization(name="other_org")

        self.superuser.update(password="")
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            sso_session_expired = SsoSession(
                self.organization.id,
                datetime.now(tz=timezone.utc) - SSO_EXPIRY_TIME - timedelta(hours=1),
            )
            self.session[sso_session_expired.session_key] = sso_session_expired.to_dict()
            self.save_session()

            referrer = f"http://{other_org.slug}.testserver/issues/"

            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                    **self.validator_params,
                },
                SERVER_NAME=f"{other_org.slug}.testserver",
                HTTP_REFERER=referrer,
            )

        # status code of 401 means invalid SSO session
        assert response.status_code == 401
        query_string = urlencode({"next": referrer})
        assert response.data == {
            "detail": {
                "code": "sso-required",
                "extra": {
                    "loginUrl": f"http://{self.organization.slug}.testserver/auth/login/{self.organization.slug}/?{query_string}"
                },
                "message": "Must login via SSO",
            }
        }
        assert COOKIE_NAME not in response.cookies

    def test_superuser_sso_user_no_u2f_saas_product(self):
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserReason": "for testing",
                },
            )

        assert response.status_code == 400
        assert response.data["detail"]["code"] == MISSING_PASSWORD_OR_U2F_CODE

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_superuser_sso_user_has_password_saas_product(self, mock_validate, mock_is_available):
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser, organization_id=self.organization.id)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                    **self.validator_params,
                },
            )

        assert response.status_code == 200
        assert COOKIE_NAME in response.cookies

    @patch("sentry.auth.authenticators.U2fInterface.is_available", return_value=True)
    @patch("sentry.auth.authenticators.U2fInterface.validate_response", return_value=True)
    def test_superuser_no_sso_user_has_password_saas_product(
        self, mock_validate, mock_is_available
    ):
        create_authenticator(self.superuser)
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "password": "admin",
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                },
            )
        assert response.status_code == 401

    @override_settings(SENTRY_SELF_HOSTED=True)
    def test_superuser_no_sso_user_has_password_self_hosted(self):
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", None):
            response = self.client.put(
                self.path,
                data={
                    "password": "admin",
                    "isSuperuserModal": True,
                },
            )
        assert response.status_code == 200

    @override_settings(SENTRY_SELF_HOSTED=True)
    def test_superuser_no_sso_user_no_password_or_u2f_self_hosted(self):

        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", None):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                },
            )

        assert response.status_code == 400
        assert response.data["detail"]["code"] == MISSING_PASSWORD_OR_U2F_CODE

    @override_settings(SENTRY_SELF_HOSTED=False)
    # su form is disabled by overriding local dev setting which skip checks
    @patch("sentry.api.endpoints.auth_index.DISABLE_SSO_CHECK_FOR_LOCAL_DEV", True)
    @patch("sentry.api.endpoints.auth_index.has_completed_sso", return_value=True)
    @patch("sentry.auth.superuser.has_completed_sso", return_value=True)
    def test_superuser_no_sso_user_no_password_or_u2f_sso_disabled_local_dev_saas(
        self, mock_endpoint_has_completed_sso, mock_superuser_has_completed_sso
    ):

        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                },
            )

        assert response.status_code == 200
        assert COOKIE_NAME in response.cookies

    @override_settings(SENTRY_SELF_HOSTED=True)
    def test_superuser_no_sso_user_has_password_su_form_on_self_hosted(self):
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", None):
            response = self.client.put(
                self.path,
                data={
                    "password": "admin",
                    "isSuperuserModal": True,
                },
            )
        assert response.status_code == 200

    @override_settings(SENTRY_SELF_HOSTED=True)
    def test_superuser_no_sso_su_form_on_no_password_or_u2f_self_hosted(self):
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", None):
            response = self.client.put(
                self.path,
                data={
                    "isSuperuserModal": True,
                },
            )

        assert response.status_code == 400
        assert response.data["detail"]["code"] == MISSING_PASSWORD_OR_U2F_CODE

    def test_superuser_no_sso_with_referrer(self):
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                HTTP_REFERER="http://testserver/bar",
                data={
                    "password": "admin",
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                },
            )

        assert response.status_code == 401
        assert self.client.session["_next"] == "http://testserver/bar"

    def test_superuser_no_sso_with_bad_referrer(self):
        create_authenticator(self.superuser)
        AuthIdentity.objects.create(user=self.superuser, auth_provider=self.org_provider)
        self.login_as(self.superuser)

        with patch("sentry.api.endpoints.auth_index.SUPERUSER_ORG_ID", self.organization.id):
            response = self.client.put(
                self.path,
                HTTP_REFERER="http://hacktheplanet/bar",
                data={
                    "password": "admin",
                    "isSuperuserModal": True,
                    "superuserAccessCategory": "for_unit_test",
                    "superuserReason": "for testing",
                },
            )

        assert response.status_code == 401
        assert self.client.session.get("_next") is None


@control_silo_test
class AuthLogoutEndpointTest(APITestCase):
    path = "/api/0/auth/"

    def test_logged_in(self):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.delete(self.path)
        assert response.status_code == 204
        assert list(self.client.session.keys()) == []

    def test_logged_out(self):
        user = self.create_user("foo@example.com")
        self.login_as(user)
        response = self.client.delete(self.path)
        assert response.status_code == 204
        assert list(self.client.session.keys()) == []
        updated = type(user).objects.get(pk=user.id)
        assert updated.session_nonce != user.session_nonce
