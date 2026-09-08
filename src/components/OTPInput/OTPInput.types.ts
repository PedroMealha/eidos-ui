import type { ComponentSizeProps } from '../../utils';

export interface OTPInputProps {
  /** Number of individual slots. Default: 6 */
  length?: number;
  /** Controlled value - the full concatenated string */
  value?: string;
  /** Uncontrolled seed value */
  defaultValue?: string;
  /** Called with the full string on every change */
  onChange?: (value: string) => void;
  /** Called when all slots are filled */
  onComplete?: (value: string) => void;
  /** Restrict accepted characters. Default: 'numeric' */
  type?: 'numeric' | 'alphanumeric';
  /** Mask filled slots as password dots. Default: false */
  mask?: boolean;
  /** Visual size of each slot. Default: 'md' */
  size?: ComponentSizeProps;
  disabled?: boolean;
  /** Error message - turns all slots red and renders the message below */
  error?: string;
  label?: string;
  hint?: string;
  /** Focus the first empty slot on mount. Default: false */
  autoFocus?: boolean;
  className?: string;
}
