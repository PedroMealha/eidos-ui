import React from 'react';

type SnackbarVariant = 'success' | 'danger' | 'warning' | 'info';

interface SnackbarAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface BaseSnackbarProps {
  id: string;
  variant?: SnackbarVariant;
  duration?: number;
  action?: SnackbarAction;
  className?: string;
  onClose?: (id: string) => void;
}

interface TextSnackbarProps extends BaseSnackbarProps {
  message: string;
  component?: never;
  componentProps?: never;
}

interface ComponentSnackbarProps extends BaseSnackbarProps {
  component: React.ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
  message?: never;
}

type SnackbarProps = TextSnackbarProps | ComponentSnackbarProps;

type SnackbarState = 'entering' | 'entered' | 'exiting' | 'exited';

interface SnackbarItem {
  id: string;
  variant?: SnackbarVariant;
  duration?: number;
  action?: SnackbarAction;
  className?: string;
  onClose?: (id: string) => void;
  message?: string;
  component?: React.ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
  state: SnackbarState;
  createdAt: number;
}

interface SnackbarContextValue {
  snackbars: SnackbarItem[];
  addSnackbar: (snackbar: Omit<SnackbarProps, 'id'>) => string;
  removeSnackbar: (id: string) => void;
  clearAllSnackbars: () => void;
  /** Pause a snackbar's auto-dismiss countdown (hover / focus). */
  pauseSnackbar: (id: string) => void;
  /** Resume it with whatever time was left. */
  resumeSnackbar: (id: string) => void;
}

interface UseSnackbarReturn {
  showSnackbar: (snackbar: Omit<SnackbarProps, 'id'>) => string;
  hideSnackbar: (id: string) => void;
  clearAll: () => void;
  showSuccess: (
    message: string,
    options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>,
  ) => string;
  showError: (
    message: string,
    options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>,
  ) => string;
  showWarning: (
    message: string,
    options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>,
  ) => string;
  showInfo: (
    message: string,
    options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>,
  ) => string;
}

export type {
  SnackbarVariant,
  SnackbarAction,
  BaseSnackbarProps,
  TextSnackbarProps,
  ComponentSnackbarProps,
  SnackbarProps,
  SnackbarState,
  SnackbarItem,
  SnackbarContextValue,
  UseSnackbarReturn,
};
