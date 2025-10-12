import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { icons } from "lucide-react";
import { Button } from "../Button/Button.component";
import type { ModalProps } from "./Modal.types";

/**
 * Helper to render an icon (either string name or component)
 */
const renderIcon = (
  icon: string | React.ComponentType<{ className?: string }>,
  className: string
) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    // String-based icon name (Lucide dynamic icons)
    // Convert to PascalCase (e.g., "arrow-right" -> "ArrowRight")
    const iconName = icon
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const LucideIcon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];

    if (LucideIcon) {
      return React.createElement(LucideIcon, { className });
    }

    // Fallback: treat as CSS class (for Font Awesome, etc.)
    return <i className={icon} aria-hidden="true" />;
  }

  // Component-based icon (Lucide, MUI, etc.)
  return React.createElement(icon, { className });
};

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
  size = "medium",
  className = "",
}) => {
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
      document.body.style.overflow = "unset";
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
      <div className={`eidos-modal-backdrop`} onClick={handleBackdropClick} />
      <div className={`eidos-modal-content eidos-modal-content--${size}`}>
        {title && (
          <div
            className={`eidos-modal-header ${
              type ? `eidos-modal-header--${type}` : ""
            }`}
          >
            <h4>
              {icon && renderIcon(icon, 'eidos-modal-icon')} {title}
            </h4>
          </div>
        )}

        <div className={`eidos-modal-body`}>{children}</div>

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
