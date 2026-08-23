export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export interface ColorPickerProps {
  /** Controlled hex value, e.g. '#6366f1' */
  value?: string;
  /** Initial hex value for uncontrolled usage */
  defaultValue?: string;
  /** Fires on every color change with the new hex string */
  onChange?: (hex: string) => void;
  /** Which text-input format to show initially. Default: 'hex' */
  format?: ColorFormat;
  /** Show the alpha (opacity) slider. Default: false */
  showAlpha?: boolean;
  /** Show preset colour swatches. Default: true */
  showSwatches?: boolean;
  /** Override the default swatch palette with custom hex strings */
  swatches?: string[];
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  /** Render the picker panel inline - no popover trigger. Default: false */
  inline?: boolean;
  label?: string;
  className?: string;
}
