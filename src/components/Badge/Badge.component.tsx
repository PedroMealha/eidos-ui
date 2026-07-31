import React from "react";
import type { BadgeProps } from "./Badge.types";
import "./Badge.scss";

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = "primary",
  variant = "filled",
  size = "medium",
  dot = false,
  max,
  className = "",
}) => {
  const classes = [
    "eidos-badge",
    `eidos-badge--${variant}`,
    `eidos-badge--${color}`,
    `eidos-badge--${size}`,
    dot && "eidos-badge--dot",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (dot) {
    return <span className={classes} />;
  }

  let content: React.ReactNode = children;
  if (typeof children === "number" && max !== undefined) {
    content = children > max ? `${max}+` : children;
  }

  return <span className={classes}>{content}</span>;
};
