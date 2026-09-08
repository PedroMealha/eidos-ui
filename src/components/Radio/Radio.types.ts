import React from 'react';
import type { ComponentSizeProps } from '../../utils';

export type RadioColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  label?: React.ReactNode;
  color?: RadioColorProps;
  size?: ComponentSizeProps;
  className?: string;
}

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  color?: RadioColorProps;
  size?: ComponentSizeProps;
  disabled?: boolean;
  error?: string;
  className?: string;
}
