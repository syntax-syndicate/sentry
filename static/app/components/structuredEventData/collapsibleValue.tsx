import type {ReactNode} from 'react';
import {Children, useState} from 'react';
import styled from '@emotion/styled';

import {Button} from 'sentry/components/button';
import {IconChevron} from 'sentry/icons';
import {t, tn} from 'sentry/locale';
import {space} from 'sentry/styles/space';

interface Props {
  children: ReactNode;
  closeTag: string;
  depth: number;
  maxDefaultDepth: number;
  openTag: string;
  path: string;
  /**
   * Forces the value to start expanded, otherwise it will expand if there are
   * less than 5 (MAX_ITEMS_BEFORE_AUTOCOLLAPSE) items
   */
  forceDefaultExpand?: boolean;
  prefix?: ReactNode;
}

const MAX_ITEMS_BEFORE_AUTOCOLLAPSE = 5;

export function CollapsibleValue({
  children,
  openTag,
  closeTag,
  prefix = null,
  depth,
  maxDefaultDepth,
  forceDefaultExpand,
}: Props) {
  const numChildren = Children.count(children);
  const [isExpanded, setIsExpanded] = useState(
    forceDefaultExpand ??
      (numChildren <= MAX_ITEMS_BEFORE_AUTOCOLLAPSE && depth < maxDefaultDepth)
  );

  const shouldShowToggleButton = numChildren > 0;
  const isBaseLevel = depth === 0;

  // Toggle buttons get placed to the left of the open tag, but if this is the
  // base level there is no room for it. So we add padding in this case.
  const baseLevelPadding = isBaseLevel && shouldShowToggleButton;

  return (
    <CollapsibleDataContainer data-base-with-toggle={baseLevelPadding}>
      {numChildren > 0 ? (
        <ToggleButton
          aria-label={isExpanded ? t('Collapse') : t('Expand')}
          borderless
          data-base-with-toggle={baseLevelPadding}
          icon={
            <IconChevron direction={isExpanded ? 'down' : 'right'} legacySize="10px" />
          }
          onClick={() => setIsExpanded(oldValue => !oldValue)}
          size="zero"
        />
      ) : null}
      {prefix}
      <span>{openTag}</span>
      {shouldShowToggleButton && !isExpanded ? (
        <NumItemsButton size="zero" onClick={() => setIsExpanded(true)}>
          {tn('%s item', '%s items', numChildren)}
        </NumItemsButton>
      ) : null}
      {shouldShowToggleButton && isExpanded ? (
        <IndentedValues>{children}</IndentedValues>
      ) : null}
      <span>{closeTag}</span>
    </CollapsibleDataContainer>
  );
}

const CollapsibleDataContainer = styled('span')`
  position: relative;

  &[data-base-with-toggle='true'] {
    display: block;
    padding-left: ${space(3)};
  }
`;

const IndentedValues = styled('div')`
  padding-left: ${space(1.5)};
`;

const NumItemsButton = styled(Button)`
  background: none;
  border: none;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: ${p => p.theme.fontWeightNormal};
  box-shadow: none;
  font-size: ${p => p.theme.fontSizeSmall};
  color: ${p => p.theme.subText};
  margin: 0 ${space(0.5)};
`;

const ToggleButton = styled(Button)`
  position: absolute;
  left: -${space(3)};
  top: 2px;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;

  &[data-base-with-toggle='true'] {
    left: 0;
  }
`;
