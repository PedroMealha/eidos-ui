import type { IconType } from "../../utils";

interface BaseChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  variant?: "filled" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export interface TextChipProps extends BaseChipProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
}

export type ChipProps = TextChipProps;
