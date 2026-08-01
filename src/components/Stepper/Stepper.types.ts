import React from 'react';

export type StepStatus = 'completed' | 'active' | 'pending' | 'error';

export interface StepItem {
  label: string;
  description?: string;
  /** Override the computed status for this step. */
  status?: StepStatus;
  /** Optional icon to render inside the step dot (overrides the step number / check). */
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  /** Zero-based index of the currently active step. */
  activeStep?: number;
  /** Layout direction. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /** Color of the active/completed steps. Default: 'primary'. */
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  /** Whether to show step numbers inside the dot. Default: true. */
  showNumbers?: boolean;
  className?: string;
}
