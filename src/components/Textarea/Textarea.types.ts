import React from 'react';
import type { IconType, ComponentSizeProps } from '../../utils';

export type TextareaVariantProps = 'filled' | 'outlined' | 'text';
export type TextareaColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  variant?: TextareaVariantProps;
  color?: TextareaColorProps;
  size?: ComponentSizeProps;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  label?: string;
  error?: string;
  disclaimerIcon?: IconType;
  disclaimerContent?: string;
  required?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'both';
  showCount?: boolean;
  maxLength?: number;
}

export type { IconType };
