import type { ReactNode } from 'react';
import type { IconType } from '../../utils';
import type { ButtonColorProps, ButtonVariantProps } from '../Button/Button.types';

export interface ModalAction {
  id: string;
  label: string;
  variant?: ButtonVariantProps;
  size?: 'sm' | 'md' | 'lg';
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
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}
