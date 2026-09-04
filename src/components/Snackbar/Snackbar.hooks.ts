import { useCallback } from 'react';
import { useSnackbarContext } from './Snackbar.context';
import type { UseSnackbarReturn, SnackbarProps } from './Snackbar.types';

export const useSnackbar = (): UseSnackbarReturn => {
  const { addSnackbar, removeSnackbar, clearAllSnackbars } = useSnackbarContext();

  const showSnackbar = useCallback(
    (snackbar: Omit<SnackbarProps, 'id'>): string => {
      return addSnackbar(snackbar);
    },
    [addSnackbar],
  );

  const hideSnackbar = useCallback(
    (id: string): void => {
      removeSnackbar(id);
    },
    [removeSnackbar],
  );

  const clearAll = useCallback((): void => {
    clearAllSnackbars();
  }, [clearAllSnackbars]);

  const showSuccess = useCallback(
    (message: string, options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>) => {
      return showSnackbar({
        message,
        variant: 'success',
        duration: 5000,
        ...options,
      });
    },
    [showSnackbar],
  );

  const showError = useCallback(
    (message: string, options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>) => {
      return showSnackbar({
        message,
        variant: 'danger',
        duration: 5000,
        ...options,
      });
    },
    [showSnackbar],
  );

  const showWarning = useCallback(
    (message: string, options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>) => {
      return showSnackbar({
        message,
        variant: 'warning',
        duration: 5000,
        ...options,
      });
    },
    [showSnackbar],
  );

  const showInfo = useCallback(
    (message: string, options?: Partial<Omit<SnackbarProps, 'id' | 'message' | 'variant'>>) => {
      return showSnackbar({
        message,
        variant: 'info',
        duration: 5000,
        ...options,
      });
    },
    [showSnackbar],
  );

  return {
    showSnackbar,
    hideSnackbar,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useSnackbar;
