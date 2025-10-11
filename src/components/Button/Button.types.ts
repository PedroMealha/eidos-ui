export type IconType = React.ComponentType<{ className?: string }> | string;

interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  tooltip?: string;
}

export interface TextButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
  icon?: never;
}

export interface IconButtonProps extends BaseButtonProps {
  icon: IconType;
  children?: never;
  preIcon?: never;
  posIcon?: never;
}

export type ButtonProps = TextButtonProps | IconButtonProps;
