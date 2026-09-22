import type { InputProps } from '../Input/Input.types';
import type { IconType } from '../../utils';

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  icon?: IconType;
}

export interface SelectProps {
  options: SelectOption[];
  /** Controlled selected value(s). */
  value?: string | string[];
  /** Initial selected value(s) for uncontrolled usage. Ignored when `value` is provided. */
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  /**
   * Visible label, rendered as a real `<label>` bound to the field - the same
   * prop `Input`, `Checkbox`, `Radio` and `Textarea` take.
   *
   * For a field that must stay visually unlabelled, pass
   * `inputProps={{ 'aria-label': '…' }}` instead. One of the two is needed: a
   * `placeholder` is not a label, since it disappears as soon as a value is
   * chosen. Omitting both logs a development warning.
   */
  label?: string;
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
  /** Open the dropdown immediately on mount - useful for inline cell editors. */
  autoOpen?: boolean;
  dropdownProps?: {
    dropdownLevel?: number;
    dropdownGroup?: string;
    [key: string]: unknown;
  };
}
