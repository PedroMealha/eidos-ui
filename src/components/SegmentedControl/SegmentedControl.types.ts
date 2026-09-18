import type { IconType, ComponentSizeProps } from '../../utils';

export type SegmentedControlColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SegmentedOption {
  /** Unique value for this segment. */
  value: string;
  /** Text label (optional if `icon` is provided). */
  label?: string;
  /** Icon to show before the label. */
  icon?: IconType;
  /** Disable this individual segment. */
  disabled?: boolean;
  /** Tooltip shown on hover. */
  tooltip?: string;
}

/**
 * How an overflowing segment track is scrolled. Mirrors `TabsScrollButtonsProps`
 * - the two components solve the same problem the same way.
 *
 * - `auto` - previous/next buttons appear only while the track overflows, and
 *   the native scrollbar is hidden because the buttons are the affordance.
 * - `none` - no buttons; the track keeps its native scrollbar.
 *
 * Native scrolling (touch swipe, trackpad, shift+wheel) works either way.
 */
export type SegmentedControlScrollButtonsProps = 'auto' | 'none';

export interface SegmentedControlProps {
  /** Segment definitions. */
  options: SegmentedOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial value when uncontrolled. Defaults to the first option's value. */
  defaultValue?: string;
  /** Called with the newly selected value whenever the selection changes. */
  onChange?: (value: string) => void;
  size?: ComponentSizeProps;
  color?: SegmentedControlColorProps;
  /** Disable all segments. */
  disabled?: boolean;
  /** Stretch to fill the parent's width. */
  fullWidth?: boolean;
  /**
   * Scroll affordance for a track too wide for its container. @default 'auto'
   */
  scrollButtons?: SegmentedControlScrollButtonsProps;
  className?: string;
}
