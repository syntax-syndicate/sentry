import {Fragment, useCallback, useEffect} from 'react';
import {createPortal} from 'react-dom';
import type {Theme} from '@emotion/react';
import {css, useTheme} from '@emotion/react';

import {Button} from 'sentry/components/button';
import InteractionStateLayer from 'sentry/components/interactionStateLayer';
import List from 'sentry/components/list';
import ListItem from 'sentry/components/list/listItem';
import {IconClose, IconTarget} from 'sentry/icons';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import {useLocation} from 'sentry/utils/useLocation';
import {useNavigate} from 'sentry/utils/useNavigate';

type Exercise = {
  description: React.ReactNode;
  title: string;
  target?: string;
};

type Step = {
  title: string;
  description?: string;
  target?: string;
};

type OnboardingStep = {
  exercises: Exercise[];
  title: string;
  steps?: Step[];
};

const definiedSteps = {
  0: {
    title: t('Issues'),
    steps: [
      {
        title: t('Issue Stream'),
        description: t(
          'Here is the destination for triaging all bugs related to application.'
        ),
        // Hack -- the target is the id of the frontend issue
        target: '4332613',
      },
    ],
    exercises: [
      {
        title: t('Exercise: View an issue'),
        description: t('Humour us by clicking the highlighted issue.'),
        target: '4332613',
      },
    ],
  },
  1: {
    title: t('Issue Details'),
    steps: [
      {
        title: t('Event Hightlights'),
        description: t(
          'You can see that you were using Chrome when you threw the error.'
        ),
        target: 'event-highlights',
      },
      {
        title: t('Breadcrumbs'),
        description: t(
          'You can see that the culprit of this issue is related to the button you just clicked.'
        ),
        target: 'event-breadcrumbs',
      },
      {
        title: t('Stack Trace'),
        description: t(
          'And, if it wasn’t completely obvious by this point, you can see the culprit exists on Line 8 in “page.tsx”.'
        ),
        target: 'event-exception',
      },
    ],
    exercises: [
      {
        title: t('Exercise: Squash this bug'),
        target: 'event-exception',
        description: (
          <ol>
            <li>{t('Open “page.tsx” in your IDE')}</li>
            <li>{t('Delete line 8 and save this change')}</li>
            <li>{t('Click the exploding button again in the local dev environment.')}</li>
          </ol>
        ),
      },
    ],
  },
  2: {
    title: t('Issues'),
    exercises: [
      {
        title: t('Exercise 1: Resolve your first issue'),
        description: t('Select the issue using the checkbox and mark as “Resolved”.'),
        // Hack -- the target is the id of the frontend issue
        target: '4332613',
      },
      {
        title: t('Exercise 2: View this Issue'),
        description: t(
          'When you clicked the exploding button in the example page, a new issue appeared, but how could that be? Find out, by viewing the issue.'
        ),
        // Hack -- the target is the id of the frontend issue
        target: '4332614',
      },
    ],
  },
  3: {
    title: t('Issue Details'),
    steps: [
      {
        title: t('Trace Connection'),
        description: t(
          'With tracing, you can see that this frontend issue isn’t the root cause.'
        ),
        target: 'event-trace',
      },
    ],
    exercises: [
      {
        title: t('Exercise: Find the real culprit'),
        description: (
          <Fragment>
            <div>
              {t(
                'Clicking the "View Full Trace" link, you’ll not only gain knowledge on identifying related issues, but also on debugging slow services within your application'
              )}
            </div>
            <br />
            <div>{t('Happy Squashing.')}</div>
          </Fragment>
        ),
        target: 'event-trace',
      },
    ],
  },
};

function getNodeTarget(target?: string) {
  return target ? document.getElementById(target) : null;
}

function highlightTarget(node: HTMLElement | null) {
  if (!node) return;

  node.style.outline = '8px solid rgb(108, 95, 199)';
  node.style.borderRadius = '1rem';
  node.style.outlineOffset = '8px';
  node.style.zIndex = '10000';
  node.style.position = 'relative';

  node.scrollIntoView({block: 'nearest', behavior: 'smooth'});
}

function unHighlightTarget(node: HTMLElement | null) {
  if (!node) return;

  node.style.outline = 'initial';
  node.style.borderRadius = '0';
  node.style.outlineOffset = '0';
  node.style.zIndex = '0';
  node.style.position = 'static';
}

function OnboardingWidgetSteps({
  steps,
  onExpand,
}: {
  onExpand: (title: string) => void;
  steps?: Step[];
}) {
  const theme = useTheme();
  const location = useLocation();

  if (!steps) {
    return null;
  }

  return (
    <List symbol="colored-numeric" css={stepsCss(theme)}>
      {steps.map(step => (
        <ListItem key={step.title} onClick={() => onExpand(step.title)}>
          <InteractionStateLayer
            isPressed={location.query.onboardingStep === step.title}
          />
          <div css={itemContentCss}>
            <div css={itemTitle}>{step.title}</div>
            {location.query.onboardingStep === step.title && step.description}
          </div>
        </ListItem>
      ))}
    </List>
  );
}

function OnboardingWidgetExercises({
  exercises,
  onExpand,
}: {
  exercises: Exercise[];
  onExpand: (title: string) => void;
}) {
  const theme = useTheme();
  const location = useLocation();

  return (
    <List css={[stepsCss(theme), exercisesCss(theme)]}>
      {exercises.map(exercise => (
        <ListItem key={exercise.title} onClick={() => onExpand(exercise.title)}>
          <InteractionStateLayer
            isPressed={location.query.onboardingStep === exercise.title}
          />
          <div css={exerciseContentCss}>
            <IconTarget color="purple400" />
            <div>
              <strong>{exercise.title}</strong>
              {location.query.onboardingStep === exercise.title && exercise.description}
            </div>
          </div>
        </ListItem>
      ))}
    </List>
  );
}

export function OnboardingWidget() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const stepIndex = Number(location.query.onboarding);
  const displayStep: OnboardingStep | undefined = definiedSteps[stepIndex];

  const handleDismiss = useCallback(() => {
    navigate({
      ...location,
      query: {...location.query, onboarding: undefined},
    });
  }, [location, navigate]);

  const handleExpand = useCallback(
    (title: string) => {
      const currentTitle = location.query.onboardingStep;

      if (title === currentTitle) {
        navigate({...location, query: {...location.query, onboardingStep: null}});
      } else {
        displayStep?.steps?.forEach(step => {
          const nodeTarget = getNodeTarget(step.target);
          nodeTarget && unHighlightTarget(nodeTarget);
        });
        displayStep?.exercises.forEach(exercise => {
          const nodeTarget = getNodeTarget(exercise.target);
          nodeTarget && unHighlightTarget(nodeTarget);
        });

        navigate({...location, query: {...location.query, onboardingStep: title}});
      }
    },
    [displayStep, location, navigate]
  );

  useEffect(() => {
    if (!displayStep) return;

    const currentStep = location.query.onboardingStep;
    if (currentStep) {
      const targetStep = displayStep.steps?.find(step => step.title === currentStep);
      if (targetStep) {
        highlightTarget(getNodeTarget(targetStep?.target));
      } else {
        const targetExercise = displayStep.exercises.find(
          exercise => exercise.title === currentStep
        );
        highlightTarget(getNodeTarget(targetExercise?.target));
      }
    } else {
      navigate({
        ...location,
        query: {
          ...location.query,
          onboardingStep: displayStep.steps?.[0]?.title ?? displayStep.exercises[0].title,
        },
      });
    }
  }, [displayStep, location, navigate]);

  if (!displayStep) {
    return null;
  }

  return (
    <Fragment>
      {createPortal(
        <div css={[fixedContainerBaseCss, fixedContainerRightEdgeCss]}>
          <div css={contentCss(theme)}>
            <div css={headerCss(theme)}>
              {displayStep.title}
              <Button
                aria-label={t('Dismiss onboarding guide')}
                icon={<IconClose />}
                onClick={handleDismiss}
                size="sm"
                borderless
              />
            </div>
            <OnboardingWidgetSteps steps={displayStep.steps} onExpand={handleExpand} />
            <OnboardingWidgetExercises
              exercises={displayStep.exercises}
              onExpand={handleExpand}
            />
          </div>
        </div>,
        document.body
      )}
    </Fragment>
  );
}

const contentCss = (theme: Theme) => css`
  width: 320px;
  border-radius: ${theme.borderRadius};
  border: 1px solid ${theme.border};
  background: ${theme.background};
  right: ${space(2)};
  padding: ${space(0.5)};
`;

const headerCss = (theme: Theme) => css`
  padding-left: ${space(1.5)};
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: ${space(1)};
  color: ${theme.gray300};
  align-items: center;
  font-weight: 600;
`;

const stepsCss = (theme: Theme) => css`
  li {
    padding: ${space(1)} ${space(1.5)};
    border-radius: ${theme.borderRadius};
    cursor: pointer;
    display: flex;
    flex-direction: column;

    :before {
      margin-left: ${space(1.5)};
      width: 16px;
      height: 16px;
      font-size: ${theme.fontSizeSmall};
    }
  }
`;

const exercisesCss = (theme: Theme) => css`
  margin-top: ${space(0.5)};
  color: ${theme.purple400};
  li ul {
    gap: 0;
  }
  ol {
    margin: 0;
    padding: 0;
    padding-left: 16px;
    li {
      display: list-item;
      padding: 0;
    }
  }
`;

const itemContentCss = css`
  padding-left: calc(${space(0.5)} + ${space(3)});
`;

const itemTitle = css`
  font-weight: 600;
  line-height: 16px;
`;

const exerciseContentCss = css`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: ${space(1)};
  strong {
    line-height: 16px;
    display: block;
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;

const fixedContainerBaseCss = css`
  display: flex;
  gap: ${space(1.5)};
  inset: 0;
  pointer-events: none;
  position: fixed;
  z-index: 300000;

  & > * {
    pointer-events: all;
  }
`;

const fixedContainerRightEdgeCss = css`
  flex-direction: row-reverse;
  justify-content: flex-start;
  place-items: center;
  right: ${space(2)};
`;
