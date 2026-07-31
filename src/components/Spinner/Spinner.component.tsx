import React from "react";
import { LoaderCircle } from "lucide-react";

export interface SpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "medium",
  color = "primary",
  className = "",
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={[
      'eidos-spinner-wrapper',
      `eidos-spinner-wrapper--${size}`,
      `eidos-spinner-wrapper--${color}`,
      className,
    ].filter(Boolean).join(' ')}
  >
    <LoaderCircle className="eidos-spinner" aria-hidden="true" />
  </div>
);
