import React from 'react';
import type { IconType, ComponentSizeProps } from '../../utils';

export type InputVariantProps = 'filled' | 'outlined' | 'text' | 'bare';
export type InputColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariantProps;
  color?: InputColorProps;
  size?: ComponentSizeProps;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  width?: number | string;
  label?: string;
  error?: string;
  disclaimerIcon?: IconType;
  disclaimerContent?: string;
  preIcon?: IconType;
  posIcon?: IconType;
  posIconButton?: boolean;
  onPosIconClick?: () => void;
  /**
   * Accessible name for the `posIconButton`. Required in practice whenever
   * that button is rendered - an icon-only button with no name is announced
   * as just "button", and only the caller knows what the icon means.
   *
   * Omitting it logs a `devWarn` and falls back to a generic name, rather
   * than throwing or silently shipping a nameless control. It is optional
   * only to avoid a breaking change; treat it as required.
   */
  posIconLabel?: string;
  required?: boolean;
  isSelect?: boolean;
  clearable?: boolean;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
}

interface PasswordInputProps extends BaseInputProps {
  type: 'password';
}

interface NumberInputProps extends BaseInputProps {
  type: 'number';
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

interface DateInputProps extends BaseInputProps {
  type: 'date';
}

export type InputProps = TextInputProps | PasswordInputProps | NumberInputProps | DateInputProps;

export type { IconType };
