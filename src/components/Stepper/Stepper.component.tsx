import React from 'react';
import { Check, X } from 'lucide-react';
import type { StepperProps, StepStatus } from './Stepper.types';

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep = 0,
  orientation = 'horizontal',
  color = 'primary',
  showNumbers = true,
  className = '',
}) => {
  const getStatus = (index: number, explicitStatus?: StepStatus): StepStatus => {
    if (explicitStatus) return explicitStatus;
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div
      className={[
        'eidos-stepper',
        `eidos-stepper--${orientation}`,
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Progress steps"
    >
      {steps.map((step, index) => {
        const status = getStatus(index, step.status);
        const isLast = index === steps.length - 1;

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
            ].filter(Boolean).join(' ')}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            {/* Dot + connector wrapper */}
            <div className="eidos-stepper-dot-row">
              <div className="eidos-stepper-dot" aria-hidden="true">
                {dotContent}
              </div>
              {!isLast && <div className="eidos-stepper-connector" aria-hidden="true" />}
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
    </div>
  );
};

Stepper.displayName = 'Stepper';
