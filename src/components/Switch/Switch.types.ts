import React from 'react';

export type SwitchColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  color?: SwitchColorProps;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
