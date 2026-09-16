import { BreadcrumbProps } from '../Breadcrumb';
import { AvatarProps } from '../Avatar';
import { IconButtonProps } from '../Button';
import { MenuItemType } from '../Menu';
import { CommandItem } from '../CommandPalette';

export interface ToolbarProps {
  /** Breadcrumb trail rendered above the page. Omit to leave the leading region empty. */
  breadcrumbs?: Pick<BreadcrumbProps, 'items' | 'separator'>;
  /**
   * The signed-in user, rendered as the `Avatar` at the far right. Omit it
   * (along with `userMenu`) to render no avatar at all.
   */
  user?: Pick<AvatarProps, 'name' | 'src' | 'color'>;
  /**
   * User menu items, opened from the `user` avatar. Omit (or pass an empty
   * array) to render the avatar as a plain, non-interactive mark.
   */
  userMenu?: MenuItemType[];
  /** Command palette items, rendered right-aligned. */
  cmdPaletteItems?: CommandItem[];
  /**
   * Free-form content rendered at the start of the trailing region, before
   * the command palette trigger - an environment badge, an org/tenant
   * switcher, a global toggle. Unlike `actions`, which is a restricted
   * button subset, this region takes any node and is laid out as-is.
   */
  content?: React.ReactNode;
  /** Trailing action buttons, rendered right-aligned. */
  actions?: ToolbarActionProps[];
  className?: string;
}

/**
 * Restricted, discriminated subset of ButtonProps for Toolbar actions.
 */
export type ToolbarActionProps = Pick<
  IconButtonProps,
  | 'color'
  | 'loading'
  | 'disabled'
  | 'preIcon'
  | 'posIcon'
  | 'icon'
  | 'children'
  | 'onClick'
  | 'tooltip'
>;
