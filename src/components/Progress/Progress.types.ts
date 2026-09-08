import type { ComponentSizeProps } from '../../utils';

export type ProgressColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface ProgressProps {
  value?: number;
  max?: number;
  color?: ProgressColorProps;
  size?: ComponentSizeProps;
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  className?: string;
}
