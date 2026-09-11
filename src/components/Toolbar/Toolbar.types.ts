import { BreadcrumbProps } from "../Breadcrumb";
import { IconButtonProps } from "../Button";
import { MenuItemType } from "../Menu";
import { CommandItem } from "../CommandPalette";

export interface ToolbarProps {
  /** Breadcrumb trail rendered above the page. */
  breadcrumbs: Pick<BreadcrumbProps, 'items' | 'separator'>;
  /** User menu items, rendered right-aligned. */
  userMenu: MenuItemType[];
  /** Command palette items, rendered right-aligned. */
  cmdPaletteItems?: CommandItem[];
  /** Trailing action buttons, rendered right-aligned. */
  actions?: ToolbarActionProps[];
  className?: string;
}

/**
 * Restricted, discriminated subset of ButtonProps for Toolbar actions.
 */
export type ToolbarActionProps =
  | Pick<
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