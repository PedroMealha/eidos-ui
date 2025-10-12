import type { ReactNode } from "react";

export type IconType = React.ComponentType<{ className?: string }> | string;

export interface ModalAction {
  id: string;
  label: string;
  variant?: "filled" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: IconType;
  type?: "info" | "success" | "warning" | "danger";
  children: ReactNode;
  actions?: ModalAction[];
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
}
