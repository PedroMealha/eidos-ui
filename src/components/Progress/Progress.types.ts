export type ProgressColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface ProgressProps {
  value?: number;
  max?: number;
  color?: ProgressColorProps;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  className?: string;
}
