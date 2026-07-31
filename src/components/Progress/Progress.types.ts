export interface ProgressProps {
  value?: number;
  max?: number;
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  className?: string;
}
