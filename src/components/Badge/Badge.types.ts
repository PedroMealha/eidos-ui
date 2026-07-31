import React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  variant?: "filled" | "outlined" | "soft";
  size?: "small" | "medium";
  /** Renders a coloured dot with no text content */
  dot?: boolean;
  /** When children is a number, clamp display to `max+` if exceeded */
  max?: number;
  className?: string;
}
