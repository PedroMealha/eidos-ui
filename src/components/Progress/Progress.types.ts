export interface ProgressProps {
  value?: number;
  max?: number;
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  className?: string;
}
