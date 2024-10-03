import type {Project} from 'sentry/types/project';
import {useApiQuery} from 'sentry/utils/queryClient';
import useRouteAnalyticsParams from 'sentry/utils/routeAnalytics/useRouteAnalyticsParams';
import useOrganization from 'sentry/utils/useOrganization';
import SetupMessagingIntegrationButton, {
  MessagingIntegrationAnalyticsView,
} from 'sentry/views/alerts/rules/issue/setupMessagingIntegrationButton';

interface ProjectWithAlertIntegrationInfo extends Project {
  hasAlertIntegrationInstalled: boolean;
}

type Props = {
  projectSlug: string;
  refetchConfigs: () => void;
};

function AlertCreationSetupMessagingIntegrationButton({
  projectSlug,
  refetchConfigs,
}: Props) {
  const organization = useOrganization();

  const projectQuery = useApiQuery<ProjectWithAlertIntegrationInfo>(
    [
      `/projects/${organization.slug}/${projectSlug}/`,
      {query: {expand: 'hasAlertIntegration'}},
    ],
    {staleTime: Infinity}
  );

  const refetchConfigsHandler = () => {
    projectQuery.refetch();
    refetchConfigs();
  };

  const shouldRenderSetupButton =
    projectQuery.data != null && !projectQuery.data.hasAlertIntegrationInstalled;

  useRouteAnalyticsParams({
    setup_message_integration_button_shown: shouldRenderSetupButton,
  });

  if (projectQuery.isPending || projectQuery.isError || !shouldRenderSetupButton) {
    return null;
  }
  return (
    <SetupMessagingIntegrationButton
      refetchConfigs={refetchConfigsHandler}
      analyticsParams={{
        view: MessagingIntegrationAnalyticsView.ALERT_RULE_CREATION,
      }}
    />
  );
}

export default AlertCreationSetupMessagingIntegrationButton;
