import type { IconType } from '../../utils';

/** Shared across every Button-family component (Button, ButtonGroup, SplitButton, bulk actions, ...). */
export type ButtonVariantProps = 'filled' | 'outlined' | 'text';
/** Shared across every Button-family component (Button, ButtonGroup, SplitButton, bulk actions, ...). */
export type ButtonColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantProps;
  color?: ButtonColorProps;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  tooltip?: string;
}

export interface TextButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
  icon?: never;
  loadingText?: string;
}

export interface IconButtonProps extends BaseButtonProps {
  icon: IconType;
  children?: never;
  preIcon?: never;
  posIcon?: never;
  loadingText?: never;
}

export type ButtonProps = TextButtonProps | IconButtonProps;
