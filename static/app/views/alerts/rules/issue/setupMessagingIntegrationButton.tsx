import styled from '@emotion/styled';

import {openModal} from 'sentry/actionCreators/modal';
import {Button} from 'sentry/components/button';
import {Tooltip} from 'sentry/components/tooltip';
import {t} from 'sentry/locale';
import PluginIcon from 'sentry/plugins/components/pluginIcon';
import {space} from 'sentry/styles/space';
import type {IntegrationProvider} from 'sentry/types/integrations';
import {trackAnalytics} from 'sentry/utils/analytics';
import {getIntegrationFeatureGate} from 'sentry/utils/integrationUtil';
import {useApiQuery} from 'sentry/utils/queryClient';
import useOrganization from 'sentry/utils/useOrganization';
import MessagingIntegrationModal from 'sentry/views/alerts/rules/issue/messagingIntegrationModal';

export enum MessagingIntegrationAnalyticsView {
  ALERT_RULE_CREATION = 'alert_rule_creation',
  PROJECT_CREATION = 'project_creation',
}

type Props = {
  refetchConfigs: () => void;
  analyticsParams?: {
    view: MessagingIntegrationAnalyticsView;
  };
};

function SetupMessagingIntegrationButton({refetchConfigs, analyticsParams}: Props) {
  const providerKeys = ['slack', 'discord', 'msteams'];
  const organization = useOrganization();

  // Only need to fetch the first provider to check if the feature is enabled, as all providers will return the same response
  const integrationQuery = useApiQuery<{providers: IntegrationProvider[]}>(
    [
      `/organizations/${organization.slug}/config/integrations/?provider_key=${providerKeys[0]}`,
    ],
    {staleTime: Infinity}
  );

  const {IntegrationFeatures} = getIntegrationFeatureGate();

  if (integrationQuery.isPending || integrationQuery.isError) {
    return null;
  }

  return (
    <IntegrationFeatures
      organization={organization}
      features={integrationQuery.data.providers[0].metadata.features}
    >
      {({disabled, disabledReason}) => (
        <Tooltip
          title={
            disabled
              ? disabledReason
              : t('Send alerts to your messaging service. Install the integration now.')
          }
        >
          <Button
            size="sm"
            icon={
              <IconWrapper>
                {providerKeys.map((value: string) => {
                  return <PluginIcon key={value} pluginId={value} size={16} />;
                })}
              </IconWrapper>
            }
            disabled={disabled}
            onClick={() => {
              openModal(
                deps => (
                  <MessagingIntegrationModal
                    {...deps}
                    headerContent={t('Connect with a messaging tool')}
                    bodyContent={t('Receive alerts and digests right where you work.')}
                    providerKeys={providerKeys}
                    onAddIntegration={refetchConfigs}
                  />
                ),
                {
                  closeEvents: 'escape-key',
                }
              );
              trackAnalytics('onboarding.messaging_integration_modal_rendered', {
                organization,
                ...analyticsParams,
              });
            }}
          >
            {t('Connect to messaging')}
          </Button>
        </Tooltip>
      )}
    </IntegrationFeatures>
  );
}

const IconWrapper = styled('div')`
  display: flex;
  gap: ${space(1)};
`;

export default SetupMessagingIntegrationButton;
