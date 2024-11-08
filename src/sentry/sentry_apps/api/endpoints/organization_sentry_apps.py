from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.request import Request
from rest_framework.response import Response

from sentry.api.api_owners import ApiOwner
from sentry.api.api_publish_status import ApiPublishStatus
from sentry.api.base import control_silo_endpoint
from sentry.api.bases.organization import ControlSiloOrganizationEndpoint
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.apidocs.parameters import GlobalParams
from sentry.constants import SentryAppStatus
from sentry.organizations.services.organization import RpcOrganization
from sentry.organizations.services.organization.model import RpcUserOrganizationContext
from sentry.sentry_apps.api.bases.sentryapps import add_integration_platform_metric_tag
from sentry.sentry_apps.api.serializers.sentry_app import (
    SentryAppSerializer as ResponseSentryAppSerializer,
)
from sentry.sentry_apps.models.sentry_app import SentryApp


class OrganizationSentryQueryParamsSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=SentryAppStatus.as_choices(),
        help_text=(),
    )


@extend_schema(tags=["Integration"])
@control_silo_endpoint
class OrganizationSentryAppsEndpoint(ControlSiloOrganizationEndpoint):
    owner = ApiOwner.INTEGRATIONS
    publish_status = {
        "GET": ApiPublishStatus.PUBLIC,
    }

    @extend_schema(
        operation_id="Retrieve the custom integrations by an organization",
        parameters=[GlobalParams.ORG_ID_OR_SLUG, OrganizationSentryQueryParamsSerializer],
        request=None,
        responses={
            200: list[ResponseSentryAppSerializer],
        },
    )
    @add_integration_platform_metric_tag
    def get(
        self,
        request: Request,
        organization_context: RpcUserOrganizationContext,
        organization: RpcOrganization,
    ) -> Response:
        """
        Get the custom integrations the organization has created that are not deleted.
        """
        queryset = SentryApp.objects.filter(owner_id=organization.id, application__isnull=False)

        status = request.GET.get("status")
        if status is not None:
            queryset = queryset.filter(status=SentryAppStatus.as_int(status))

        return self.paginate(
            request=request,
            queryset=queryset,
            order_by="-date_added",
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(
                x, request.user, access=request.access, serializer=ResponseSentryAppSerializer()
            ),
        )
