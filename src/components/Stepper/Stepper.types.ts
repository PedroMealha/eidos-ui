import React from 'react';

export type StepStatus = 'completed' | 'active' | 'pending' | 'error';

export type StepperColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

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
  color?: StepperColorProps;
  /** Whether to show step numbers inside the dot. Default: true. */
  showNumbers?: boolean;
  /**
   * Extend a connector before the first step out to the container's edge
   * (the left edge when horizontal, the top edge when vertical). Combined
   * with `extendEnd`, this centers the steps in the container; alone, it
   * pushes them toward the end (right / bottom).
   */
  extendStart?: boolean;
  /**
   * Extend a connector after the last step out to the container's edge
   * (the right edge when horizontal, the bottom edge when vertical).
   * Combined with `extendStart`, this centers the steps in the container;
   * alone, it pushes them toward the start (left / top).
   */
  extendEnd?: boolean;
  className?: string;
}
