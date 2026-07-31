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
  <div className={`eidos-spinner-wrapper eidos-spinner-wrapper--${size} eidos-spinner-wrapper--${color} ${className}`.trim()}>
    <LoaderCircle className="eidos-spinner" />
  </div>
);
