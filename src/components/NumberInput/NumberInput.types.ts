import type { ComponentSizeProps } from '../../utils';

export interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places to display in the input. Default: 0 (integer). */
  precision?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  size?: ComponentSizeProps;
  fullWidth?: boolean;
  /** Allow the user to type directly in the input field. Default: true. */
  allowTyping?: boolean;
  className?: string;
  id?: string;
  name?: string;
}
