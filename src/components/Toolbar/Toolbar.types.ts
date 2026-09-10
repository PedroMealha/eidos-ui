import { AvatarProps } from "../Avatar";
import { TextButtonProps, IconButtonProps } from "../Button";

export interface ToolbarProps {
  /** Text shown next to the brand avatar, inside the clickable brand button. Defaults to `"Brand Name"`. */
  brandName?: string;
  /** Avatar rendered to the left of the brand name. Omit to render the brand name on its own. */
  avatar?: ToolbarAvatarProps;
  /** Trailing action buttons, rendered right-aligned. */
  actions?: ToolbarActionProps[];
  className?: string;
}

/**
 * Restricted, discriminated subset of ButtonProps for Toolbar actions.
 */
export type ToolbarActionProps =
  | Pick<
      TextButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
    >
  | Pick<
      IconButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
    >;

/** Toolbar brand avatar - only the presentational fields, no `onClick`/`className` since the brand button already owns click handling and layout owns styling. */
export type ToolbarAvatarProps = Pick<AvatarProps, 'src' | 'alt' | 'name' | 'color' | 'fallback'>;
