import React from 'react';
import { Check, X } from 'lucide-react';
import type { StepperProps, StepStatus } from './Stepper.types';

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep = 0,
  orientation = 'horizontal',
  color = 'primary',
  showNumbers = true,
  extendStart = false,
  extendEnd = false,
  className = '',
}) => {
  const getStatus = (index: number, explicitStatus?: StepStatus): StepStatus => {
    if (explicitStatus) return explicitStatus;
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  // `extendStart`'s connector has no real preceding step to take its color
  // from, so it mirrors the first step's own status instead - colored only
  // once that step is actually completed. `extendEnd`'s connector *does*
  // have a real preceding step (the last one) and colors via the adjacent-
  // sibling rule in Stepper.scss, same as a between-step connector.
  const isFirstStepCompleted = steps.length > 0 && getStatus(0, steps[0].status) === 'completed';

  return (
    <div
      className={['eidos-stepper', `eidos-stepper--${orientation}`, className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Progress steps"
    >
      {/*
        `extendStart`/`extendEnd` render as standalone connectors, siblings
        of the steps rather than nested inside one - nesting one inside (say)
        the first step's own dot-row would make it share that step's fixed
        flex slot with its regular trailing connector, silently shrinking
        the real Account-Profile gap to make room. As an extra sibling, it
        gets its own independent share of the row instead, so every existing
        gap shrinks by the same small, uniform amount rather than one
        specific connector taking the whole hit.
      */}
      {extendStart && (
        <div
          className={[
            'eidos-stepper-connector',
            'eidos-stepper-connector--extend',
            isFirstStepCompleted && `eidos-stepper-connector--${color}`,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      )}
      {steps.map((step, index) => {
        const status = getStatus(index, step.status);
        // The last step only skips its own trailing connector when there's
        // truly nothing after it - if `extendEnd` adds a connector past it,
        // it needs one too, exactly like every other step, so there's no
        // blank gap between its dot and the extend connector.
        const isLast = index === steps.length - 1 && !extendEnd;
        // That trailing connector and the standalone extend connector right
        // after it both carry the usual margin meant for the gap before a
        // *dot* - stacked together with no dot between them, that reads as
        // an unwanted extra gap. Only the extend connector's own side of
        // that junction is zeroed in Stepper.scss; this is the other side.
        const joinsExtendEnd = index === steps.length - 1 && extendEnd;

        const dotContent = step.icon ? (
          step.icon
        ) : status === 'completed' ? (
          <Check aria-hidden="true" />
        ) : status === 'error' ? (
          <X aria-hidden="true" />
        ) : showNumbers ? (
          <span>{index + 1}</span>
        ) : null;

        return (
          <div
            key={index}
            className={[
              'eidos-stepper-step',
              `eidos-stepper-step--${status}`,
              `eidos-stepper-step--${color}`,
              !isLast && 'eidos-stepper-step--has-connector',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            {/* Dot + connector wrapper */}
            <div className="eidos-stepper-dot-row">
              <div className="eidos-stepper-dot" aria-hidden="true">
                {dotContent}
              </div>
              {!isLast && (
                <div
                  className={[
                    'eidos-stepper-connector',
                    joinsExtendEnd && 'eidos-stepper-connector--joins-extend',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Labels */}
            <div className="eidos-stepper-label-group">
              <span className="eidos-stepper-label">{step.label}</span>
              {step.description && (
                <span className="eidos-stepper-description">{step.description}</span>
              )}
            </div>
          </div>
        );
      })}
      {extendEnd && (
        <div
          className="eidos-stepper-connector eidos-stepper-connector--extend"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

Stepper.displayName = 'Stepper';
