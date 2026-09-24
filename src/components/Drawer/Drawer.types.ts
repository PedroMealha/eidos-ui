import type { ReactNode } from 'react';
import type { ButtonColorProps, ButtonVariantProps } from '../Button/Button.types';
import type { ComponentSizeProps } from '../../utils';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = ComponentSizeProps | 'full';

export interface DrawerAction {
  id: string;
  label: string;
  variant?: ButtonVariantProps;
  color?: ButtonColorProps;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Side from which the drawer slides in. Default: 'right'. */
  placement?: DrawerPlacement;
  /** Panel heading. Accepts inline nodes alongside the text, not just a string. */
  title?: ReactNode;
  children: ReactNode;
  /** Footer action buttons. */
  actions?: DrawerAction[];
  /**
   * Width (left/right) or height (top/bottom) of the panel.
   * sm = 280px / 40%, md = 400px / 50%, lg = 560px / 65%, full = 100%.
   * Widths never exceed the viewport: on a narrower screen the panel is
   * full-width. Default: 'md'.
   */
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
