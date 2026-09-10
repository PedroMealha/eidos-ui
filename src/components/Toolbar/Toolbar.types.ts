import { AvatarProps } from "../Avatar";
import { TextButtonProps, IconButtonProps } from "../Button";

export interface ToolbarProps {
  brandName: string;
  avatar?: ToolbarAvatarProps;
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
