import React from "react";
import { X } from "lucide-react";
import type { ChipProps } from "./Chip.types";
import { Tooltip } from "../Tooltip/Tooltip.component";
import { renderIcon } from "../../utils";

export const Chip: React.FC<ChipProps> = ({
  variant = "filled",
  color = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  tooltip,
  className = "",
  preIcon,
  posIcon,
  children,
  onClick,
  onRemove,
  ...chipProps
}) => {
  const isClickable = !!onClick;
  const isRemovable = !!onRemove;

  // Build CSS classes
  const chipClasses = [
    "eidos-chip",
    `eidos-chip--${variant}`,
    `eidos-chip--${color}`,
    `eidos-chip--${size}`,
    disabled && "eidos-chip--disabled",
    isClickable && "eidos-chip--clickable",
    isRemovable && "eidos-chip--removable",
    fullWidth && "eidos-chip--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (disabled || !onClick) return;
    onClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chip click when removing
    if (disabled || !onRemove) return;
    onRemove();
  };

  // Use div when removable to avoid nested buttons, button only when clickable without remove
  const ChipElement = isClickable && !isRemovable ? "button" : "div";

  const ChipContent = () => (
    <ChipElement
      className={chipClasses}
      disabled={ChipElement === "button" ? disabled : undefined}
      onClick={isClickable ? handleClick : undefined}
      role={ChipElement === "div" && isClickable ? "button" : undefined}
      tabIndex={ChipElement === "div" && isClickable ? 0 : undefined}
      onKeyDown={
        ChipElement === "div" && isClickable
          ? (e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      {...chipProps}
    >
      {preIcon && renderIcon(preIcon, "eidos-chip--pre-icon")}

      <span className="eidos-chip--copy">{children}</span>

      {posIcon && renderIcon(posIcon, "eidos-chip--pos-icon")}

      {isRemovable && (
        <button
          className="eidos-chip--remove-button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove"
          type="button"
        >
          <X className="eidos-chip--remove-icon" />
        </button>
      )}
    </ChipElement>
  );

  return tooltip ? (
    <Tooltip message={tooltip}>
      <ChipContent />
    </Tooltip>
  ) : (
    <ChipContent />
  );
};
