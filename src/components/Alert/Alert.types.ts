import React from 'react';
import type { IconType } from '../../utils';

export interface AlertAction {
  label: string;
  onClick: () => void;
  /** Default is 'text'. Use 'filled' for a more prominent CTA. */
  variant?: 'text' | 'filled';
}

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** Alert heading. Accepts inline nodes alongside the text, not just a string. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * Icon control:
   * - `true` or omitted → default icon for the current variant
   * - `false` → no icon rendered
   * - `IconType` → custom icon component or lucide string name
   */
  icon?: boolean | IconType;
  /** Callback to dismiss the alert. Renders a × button when provided. */
  onDismiss?: () => void;
  action?: AlertAction;
  className?: string;
}
