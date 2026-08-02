import React from "react";
import type { IconType } from "../../utils";

interface BaseInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "filled" | "outlined" | "text" | "bare";
  color?: "primary" | "secondary" | "success" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  width?: number | string;
  label?: string;
  error?: string;
  disclaimerIcon?: IconType;
  disclaimerContent?: string;
  preIcon?: IconType;
  posIcon?: IconType;
  posIconButton?: boolean;
  onPosIconClick?: () => void;
  required?: boolean;
  isSelect?: boolean;
  clearable?: boolean;
}

interface TextInputProps extends BaseInputProps {
  type?: "text" | "email" | "tel" | "url" | "search";
}

interface PasswordInputProps extends BaseInputProps {
  type: "password";
}

interface NumberInputProps extends BaseInputProps {
  type: "number";
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

interface DateInputProps extends BaseInputProps {
  type: "date";
}

export type InputProps =
  | TextInputProps
  | PasswordInputProps
  | NumberInputProps
  | DateInputProps;

export type { IconType };
