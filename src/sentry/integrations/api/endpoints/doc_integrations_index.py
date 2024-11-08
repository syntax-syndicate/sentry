import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response

from sentry.api.api_owners import ApiOwner
from sentry.api.api_publish_status import ApiPublishStatus
from sentry.api.base import control_silo_endpoint
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.apidocs.constants import RESPONSE_BAD_REQUEST
from sentry.apidocs.utils import inline_sentry_response_serializer
from sentry.auth.elevated_mode import has_elevated_mode
from sentry.integrations.api.bases.doc_integrations import DocIntegrationsBaseEndpoint
from sentry.integrations.api.serializers.models.doc_integration import (
    DocIntegrationSerializerResponse,
)
from sentry.integrations.api.serializers.rest_framework.doc_integration import (
    DocIntegrationSerializer,
)
from sentry.integrations.models.doc_integration import DocIntegration

logger = logging.getLogger(__name__)


@extend_schema(tags=["Integrations"])
@control_silo_endpoint
class DocIntegrationsEndpoint(DocIntegrationsBaseEndpoint):
    owner = ApiOwner.INTEGRATIONS
    publish_status = {
        "GET": ApiPublishStatus.PUBLIC,
        "POST": ApiPublishStatus.PRIVATE,
    }

    @extend_schema(
        operation_id="Fetch All Document Based Integrations",
        parameters=[],
        request=None,
        responses={
            200: inline_sentry_response_serializer(
                "ListDocIntegrationResponse", list[DocIntegrationSerializerResponse]
            ),
        },
    )
    def get(self, request: Request):
        """
        Fetch paginated list of all available document based integrations.
        """
        # TODO(schew2381): Change to is_active_staff once the feature flag is rolled out.
        if has_elevated_mode(request):
            queryset = DocIntegration.objects.all()
        else:
            queryset = DocIntegration.objects.filter(is_draft=False)
        return self.paginate(
            request=request,
            queryset=queryset,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user, access=request.access),
        )

    @extend_schema(
        operation_id="Add a Document Based Integration",
        parameters=[],
        request=DocIntegrationSerializer,
        responses={201: DocIntegrationSerializer, 400: RESPONSE_BAD_REQUEST},
    )
    def post(self, request: Request):
        """
        Add a document based integration.
        """
        # Override any incoming JSON for these fields
        data = request.json_body
        data["is_draft"] = True
        data["metadata"] = self.generate_incoming_metadata(request)
        serializer = DocIntegrationSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        doc_integration = serializer.save()
        return Response(
            serialize(doc_integration, request.user),
            status=status.HTTP_201_CREATED,
        )
