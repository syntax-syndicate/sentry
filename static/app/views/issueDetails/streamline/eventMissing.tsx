import styled from '@emotion/styled';

import Alert from 'sentry/components/alert';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';

export function EventMissing() {
  return (
    <MissingSection type="muted" showIcon>
      {t('No events found matching the above filters. Some possible fixes:')}
      <ReasonList>
        <li>{t('Changing the environment filter')}</li>
        <li>{t('Increasing the date range')}</li>
        <li>{t('Adjusting your event query')}</li>
      </ReasonList>
    </MissingSection>
  );
}

const MissingSection = styled(Alert)`
  border: 1px solid ${p => p.theme.translucentBorder};
  background: ${p => p.theme.background};
  border-radius: ${p => p.theme.borderRadius};
  padding: ${space(1.5)};
`;

const ReasonList = styled('ul')`
  margin: 0;
`;
