import type { ComponentSizeProps } from '../../utils';

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
  size?: ComponentSizeProps;
  /** Render the picker panel inline - no popover trigger. Default: false */
  inline?: boolean;
  label?: string;
  /**
   * Accessible name for the trigger when no visible `label` is rendered.
   *
   * Needed when the label lives outside the component - `ThemeEditor` draws
   * its own row labels, so without this every picker on the page is
   * announced as "Open colour picker" and they cannot be told apart.
   */
  ariaLabel?: string;
  className?: string;
}
