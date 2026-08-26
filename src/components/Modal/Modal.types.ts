import type { ReactNode } from "react";
import type { IconType } from "../../utils";

export interface ModalAction {
  id: string;
  label: string;
  variant?: "filled" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
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
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}
