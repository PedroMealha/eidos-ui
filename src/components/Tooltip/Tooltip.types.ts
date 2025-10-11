import React from "react";

interface BaseTooltipProps {
  children: React.ReactElement;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
  className?: string;
  triggerType?: "hover" | "click" | "focus";
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

interface TooltipProps extends BaseTooltipProps {
  message?: string;
  component?: React.ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
}

interface TooltipState {
  isVisible: boolean;
  position: {
    top: number;
    left: number;
    placement: "top" | "bottom" | "left" | "right";
  };
  isPositioned: boolean;
}

export type { TooltipProps, TooltipState };
