import type { IconType, ComponentSizeProps } from '../../utils';

export type ChipVariantProps = 'filled' | 'outlined' | 'text';
export type ChipColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BaseChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  variant?: ChipVariantProps;
  color?: ChipColorProps;
  size?: ComponentSizeProps;
  fullWidth?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export interface TextChipProps extends BaseChipProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
}

export type ChipProps = TextChipProps;
