import type { ButtonColorProps, ButtonVariantProps } from '../Button/Button.types';
import type { ComponentSizeProps } from '../../utils';

export interface ButtonGroupProps {
  /** Buttons (or other elements) to group. */
  children: React.ReactNode;
  /**
   * Fallback size applied to children that don't specify their own size.
   * Each child can still override this individually.
   */
  size?: ComponentSizeProps;
  /**
   * Fallback variant applied to children that don't specify their own variant.
   */
  variant?: ButtonVariantProps;
  /**
   * Fallback color applied to children that don't specify their own color.
   */
  color?: ButtonColorProps;
  /** Stack buttons vertically instead of horizontally. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}
