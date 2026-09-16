import React from 'react';
import type { ComponentSizeProps } from '../../utils';

export interface EmptyStateProps {
  /** Large icon or illustration rendered at the top. Any ReactNode. */
  icon?: React.ReactNode;
  /** Main heading. Accepts inline nodes alongside the text, not just a string. */
  title: React.ReactNode;
  /** Supporting text below the title. */
  description?: string;
  /** Optional CTA - typically a Button. Any ReactNode. */
  action?: React.ReactNode;
  /** Controls overall size (icon size, text size, padding). Default: 'md'. */
  size?: ComponentSizeProps;
  className?: string;
}
