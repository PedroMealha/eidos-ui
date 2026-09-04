import React from 'react';
import { createPortal } from 'react-dom';
import { useSnackbarContext } from './Snackbar.context';
import { SnackbarComponent } from './Snackbar.component';

export const SnackbarContainer: React.FC = () => {
  const { snackbars, removeSnackbar } = useSnackbarContext();

  if (snackbars.length === 0) {
    return null;
  }

  return createPortal(
    <div className={'eidos-snackbar-container'}>
      {snackbars.map((snackbar) => (
        <div key={snackbar.id} className={'eidos-snackbar-wrapper'}>
          <SnackbarComponent snackbar={snackbar} onClose={removeSnackbar} />
        </div>
      ))}
    </div>,
    document.body,
  );
};

SnackbarContainer.displayName = 'SnackbarContainer';
