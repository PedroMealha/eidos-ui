import type { IconType } from '../../utils';

export interface SplitButtonOption {
  id: string;
  label: string;
  icon?: IconType;
  disabled?: boolean;
  /** Called when this secondary option is chosen from the dropdown. */
  onClick: () => void;
}

export interface SplitButtonProps {
  /** Label for the primary (left) action. */
  label: string;
  /** Fired when the primary button is clicked directly. */
  onClick: () => void;
  /** Secondary actions shown in the dropdown. */
  options: SplitButtonOption[];
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  /** Icon shown before the primary label. */
  preIcon?: IconType;
  className?: string;
}
