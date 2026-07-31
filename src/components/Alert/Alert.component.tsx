import React from "react";
import { Info, CircleCheck, TriangleAlert, CircleX, X } from "lucide-react";
import type { AlertProps } from "./Alert.types";
import type { IconType } from "../../utils";
import { renderIcon } from "../../utils";
import { Button } from "../Button/Button.component";
import "./Alert.scss";

// ============================================================================
// Constants
// ============================================================================

type Variant = NonNullable<AlertProps["variant"]>;

const DEFAULT_ICONS: Record<Variant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
};

/**
 * Button only ships primary | secondary | success | danger.
 * Warning maps to primary (closest neutral-positive colour available).
 */
const VARIANT_TO_BUTTON_COLOR: Record<Variant, "primary" | "success" | "danger"> = {
  info: "primary",
  success: "success",
  warning: "primary",
  danger: "danger",
};

// ============================================================================
// Type guard
// ============================================================================

function isIconType(value: boolean | IconType): value is IconType {
  return typeof value !== "boolean";
}

// ============================================================================
// Component
// ============================================================================

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  icon,
  onDismiss,
  action,
  className = "",
}) => {
  const classes = [
    "eidos-alert",
    `eidos-alert--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Determine icon rendering
  const showIcon = icon !== false;
  let iconNode: React.ReactNode = null;

  if (showIcon) {
    if (icon === true || icon === undefined) {
      const DefaultIcon = DEFAULT_ICONS[variant];
      iconNode = <DefaultIcon className="eidos-alert-icon" aria-hidden="true" />;
    } else if (isIconType(icon)) {
      iconNode = renderIcon(icon, "eidos-alert-icon");
    }
  }

  const buttonColor = VARIANT_TO_BUTTON_COLOR[variant];

  return (
    <div className={classes} role="alert">
      {showIcon && (
        <span className="eidos-alert-icon-wrapper">{iconNode}</span>
      )}

      <div className="eidos-alert-body">
        {title && <p className="eidos-alert-title">{title}</p>}
        {children && <div className="eidos-alert-content">{children}</div>}
        {action && (
          <div className="eidos-alert-action">
            <Button
              variant={action.variant === "filled" ? "filled" : "text"}
              size="small"
              color={buttonColor}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          className="eidos-alert-dismiss"
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss"
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
