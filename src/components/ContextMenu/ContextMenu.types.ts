import type { MenuItemType } from '../Menu';

export interface ContextMenuProps {
  /** Menu items to show on right-click. Supports all MenuItemType variants. */
  items: MenuItemType[];
  /** The element(s) that the context menu is attached to. */
  children: React.ReactNode;
  /** Disable the context menu (falls through to the browser's native menu). */
  disabled?: boolean;
  className?: string;
}
