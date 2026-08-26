import React from "react";
import type { ProgressProps } from "./Progress.types";
import "./Progress.scss";

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  color = "primary",
  size = "md",
  showLabel = false,
  label,
  striped = false,
  className,
}) => {
  const percentage =
    value !== undefined
      ? Math.min(100, Math.max(0, (value / max) * 100))
      : undefined;

  const isIndeterminate = percentage === undefined;

  const displayLabel =
    label ?? (percentage !== undefined ? `${Math.round(percentage)}%` : undefined);

  const classes = [
    "eidos-progress",
    `eidos-progress--${color}`,
    `eidos-progress--${size}`,
    striped && "eidos-progress--striped",
    isIndeterminate && "eidos-progress--indeterminate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const fillClasses = [
    "eidos-progress-fill",
    isIndeterminate && "eidos-progress-fill--indeterminate",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? (isIndeterminate ? "Loading…" : `${Math.round(percentage!)}%`)}
    >
      <div className="eidos-progress-track">
        <div
          className={fillClasses}
          style={!isIndeterminate ? { width: `${percentage}%` } : undefined}
        />
      </div>
      {showLabel && !isIndeterminate && (
        <span className="eidos-progress-label">{displayLabel}</span>
      )}
    </div>
  );
};
