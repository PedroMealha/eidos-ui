import type { ComponentSizeProps } from '../../utils';

export type SliderColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  color?: SliderColorProps;
  size?: ComponentSizeProps;
  disabled?: boolean;
  /** Display current value label above the thumb. */
  showValue?: boolean;
  /** Display min/max labels below the track. */
  showMinMax?: boolean;
  /** Accessible label; also displayed above the track when provided. */
  label?: string;
  /** Unit appended to the value display and min/max labels (e.g. '%', 'px', 'kg'). */
  unit?: string;
  /**
   * Range within [min, max] where the thumb is blocked from entering.
   * The blocked zone is rendered in danger-red on the track. The value is
   * clamped to blockedRange.min - the user cannot slide past it.
   */
  blockedRange?: { min: number; max: number };
  className?: string;
}
