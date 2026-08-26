import type { IconType } from "../../utils";

interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  tooltip?: string;
}

export interface TextButtonProps extends BaseButtonProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
  icon?: never;
  loadingText?: string;
}

export interface IconButtonProps extends BaseButtonProps {
  icon: IconType;
  children?: never;
  preIcon?: never;
  posIcon?: never;
  loadingText?: never;
}

export type ButtonProps = TextButtonProps | IconButtonProps;
