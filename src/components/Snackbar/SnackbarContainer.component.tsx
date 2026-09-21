import React from 'react';
import { createPortal } from 'react-dom';
import { useSnackbarContext } from './Snackbar.context';
import { SnackbarComponent } from './Snackbar.component';

export const SnackbarContainer: React.FC = () => {
  const { snackbars, removeSnackbar, pauseSnackbar, resumeSnackbar } = useSnackbarContext();

  if (snackbars.length === 0) {
    return null;
  }

  return createPortal(
    <div className={'eidos-snackbar-container'}>
      {snackbars.map((snackbar) => (
        <div
          key={snackbar.id}
          className={'eidos-snackbar-wrapper'}
          // Holds the auto-dismiss countdown while the user is engaged with
          // this snackbar, which is what makes the time limit adjustable
          // (SC 2.2.1). Hover covers reading it; focus covers reaching its
          // action by keyboard - `onFocus`/`onBlur` bubble in React, so a
          // focused "Undo" button inside pauses the whole snackbar.
          onMouseEnter={() => pauseSnackbar(snackbar.id)}
          onMouseLeave={() => resumeSnackbar(snackbar.id)}
          onFocus={() => pauseSnackbar(snackbar.id)}
          onBlur={() => resumeSnackbar(snackbar.id)}
        >
          <SnackbarComponent snackbar={snackbar} onClose={removeSnackbar} />
        </div>
      ))}
    </div>,
    document.body,
  );
};

SnackbarContainer.displayName = 'SnackbarContainer';
