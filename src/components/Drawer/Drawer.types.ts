import type { ReactNode } from 'react';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export interface DrawerAction {
  id: string;
  label: string;
  variant?: 'filled' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Side from which the drawer slides in. Default: 'right'. */
  placement?: DrawerPlacement;
  title?: string;
  children: ReactNode;
  /** Footer action buttons. */
  actions?: DrawerAction[];
  /**
   * Width (left/right) or height (top/bottom) of the panel.
   * small = 280px / 40%, medium = 400px / 50%, large = 560px / 65%, full = 100%.
   * Default: 'md'.
   */
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
