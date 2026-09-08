import React from 'react';

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
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
