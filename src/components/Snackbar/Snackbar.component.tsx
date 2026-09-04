import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button.component';
import type { SnackbarItem } from './Snackbar.types';

interface SnackbarComponentProps {
  snackbar: SnackbarItem;
  onClose: (id: string) => void;
}

export const SnackbarComponent: React.FC<SnackbarComponentProps> = ({ snackbar, onClose }) => {
  const {
    id,
    variant = 'info',
    message,
    component: Component,
    componentProps,
    action,
    state,
  } = snackbar;

  const handleClose = () => {
    // onClose callback is fired by removeSnackbar (context) to cover both
    // manual and auto-close paths without duplication.
    onClose(id);
  };

  const handleActionClick = () => {
    if (action?.onClick) {
      action.onClick();
    }
  };

  // Render content based on type
  const renderContent = () => {
    if (message) {
      return <span className={'eidos-snackbar-message'}>{message}</span>;
    }
    if (Component) {
      return <Component {...(componentProps || {})} />;
    }
    return null;
  };

  return (
    <div
      className={`eidos-snackbar eidos-snackbar--${variant} eidos-snackbar--${state} ${snackbar.className || ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={'eidos-snackbar-content'}>{renderContent()}</div>

      {action && (
        <div className={'eidos-snackbar-actions'}>
          <Button
            variant={action.variant === 'primary' ? 'filled' : 'text'}
            size="sm"
            onClick={handleActionClick}
            className={'eidos-snackbar-action-button'}
          >
            {action.label}
          </Button>
        </div>
      )}

      <button
        className={'eidos-snackbar-close-button'}
        onClick={handleClose}
        aria-label="Close notification"
        type="button"
      >
        <X className={'eidos-snackbar-close-icon'} />
      </button>
    </div>
  );
};

SnackbarComponent.displayName = 'SnackbarComponent';
