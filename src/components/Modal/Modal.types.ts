import type { ReactNode } from 'react';
import type { IconType, ComponentSizeProps } from '../../utils';
import type { ButtonColorProps, ButtonVariantProps } from '../Button/Button.types';

/** Modal's own dialog size supports 'full' in addition to the shared scale. */
export type ModalSize = ComponentSizeProps | 'full';

export interface ModalAction {
  id: string;
  label: string;
  variant?: ButtonVariantProps;
  size?: ComponentSizeProps;
  color?: ButtonColorProps;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: IconType;
  type?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  actions?: ModalAction[];
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: ModalSize;
  className?: string;
}
