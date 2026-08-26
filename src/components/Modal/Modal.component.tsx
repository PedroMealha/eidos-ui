import React, { useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button.component";
import type { ModalProps } from "./Modal.types";
import { renderIcon } from "../../utils";

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  type,
  children,
  actions = [],
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  className = "",
}) => {
  const titleId = useId();
  const bodyId = useId();

  // Handle escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscapeKey]);

  // Don't render if not open
  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`eidos-modal ${
        isOpen ? "eidos-modal--is-open" : ""
      } ${className}`}
    >
      <div className="eidos-modal-backdrop" onClick={handleBackdropClick} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={bodyId}
        className={`eidos-modal-content eidos-modal-content--${size}`}
      >
        {title && (
          <div
            className={`eidos-modal-header ${
              type ? `eidos-modal-header--${type}` : ""
            }`}
          >
            <h4 id={titleId}>
              {icon && renderIcon(icon, 'eidos-modal-icon')} {title}
            </h4>
          </div>
        )}

        <div id={bodyId} className="eidos-modal-body">{children}</div>

        {actions.length > 0 && (
          <div className={`eidos-modal-footer`}>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outlined"}
                size={action.size || "medium"}
                color={action.color}
                disabled={action.disabled}
                loading={action.loading}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = "Modal";
