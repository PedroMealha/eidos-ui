import type { IconType, ComponentSizeProps } from '../../utils';
import type { ChipColorProps, ChipVariantProps } from '../Chip/Chip.types';

export interface SplitChipSegment {
  /** Stable, unique key for the segment. */
  id: string;
  /** Content of the segment. */
  label: React.ReactNode;
  /** Visual style of this segment. Falls back to the `SplitChip`'s `variant`. */
  variant?: ChipVariantProps;
  /** Colour of this segment. Falls back to the `SplitChip`'s `color`. */
  color?: ChipColorProps;
  /**
   * Makes the segment a button with hover and press feedback. A segment
   * without it is static: no pointer cursor, no hover state.
   */
  onClick?: () => void;
  /** Icon before the label. Lucide component or icon name. */
  preIcon?: IconType;
  /** Icon after the label. Lucide component or icon name. */
  posIcon?: IconType;
  /** Tooltip shown when this segment is hovered or focused. */
  tooltip?: string;
  /** Disables this segment only. */
  disabled?: boolean;
}

export interface SplitChipProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'color'
> {
  /** The segments, rendered left to right as one joined chip. */
  segments: SplitChipSegment[];
  /** Default visual style for segments that do not set their own. */
  variant?: ChipVariantProps;
  /** Default colour for segments that do not set their own. */
  color?: ChipColorProps;
  /** Size of every segment. */
  size?: ComponentSizeProps;
  /** Disables every segment. */
  disabled?: boolean;
  /** Draws a 1px divider between adjacent segments. */
  showDividers?: boolean;
  className?: string;
}
