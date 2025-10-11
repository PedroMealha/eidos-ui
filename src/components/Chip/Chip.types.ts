type IconType = React.ComponentType<{ className?: string }>;

interface BaseChipProps {
  variant?: "filled" | "outlined" | "soft";
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

interface TextChipProps extends BaseChipProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
}

type ChipProps = TextChipProps;

export type { ChipProps, IconType, TextChipProps };
