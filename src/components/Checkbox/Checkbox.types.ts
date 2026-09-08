import React from 'react';
import type { ComponentSizeProps } from '../../utils';

export type CheckboxColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  label?: React.ReactNode;
  error?: string;
  indeterminate?: boolean;
  color?: CheckboxColorProps;
  size?: ComponentSizeProps;
  className?: string;
}
