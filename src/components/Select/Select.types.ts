import type { InputProps } from "../Input/Input.types";

export type IconType = React.ComponentType<{ className?: string }> | string;

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  icon?: IconType;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputProps?: Partial<InputProps>;
  name?: string;
  id?: string;
  required?: boolean;
  fullWidth?: boolean;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  autoWidth?: boolean;
  clearable?: boolean;
  dropdownProps?: {
    dropdownLevel?: number;
    dropdownGroup?: string;
    [key: string]: unknown;
  };
}
