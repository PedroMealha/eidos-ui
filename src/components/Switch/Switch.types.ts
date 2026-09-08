import React from 'react';
import type { ComponentSizeProps } from '../../utils';

export type SwitchColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  color?: SwitchColorProps;
  size?: ComponentSizeProps;
  className?: string;
}
