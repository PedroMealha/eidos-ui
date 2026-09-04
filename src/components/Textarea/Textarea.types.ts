import React from 'react';
import type { IconType } from '../../utils';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  variant?: 'filled' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
