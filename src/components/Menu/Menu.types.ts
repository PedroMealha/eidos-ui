import React from 'react';
import type { IconType } from '../../utils';

export interface BaseMenuItem {
  id: string;
  disabled?: boolean;
}

export interface MenuItem extends BaseMenuItem {
  type: 'item';
  label: string;
  icon?: IconType;
  onClick?: () => void;
  shortcut?: string;
  /** Applies a semantic color to the item. Use `'danger'` for destructive actions. */
  color?: 'danger';
}

export interface MenuComponentItem extends BaseMenuItem {
  type: 'component';
  component: React.ReactNode;
}

export interface MenuSeparator extends BaseMenuItem {
  type: 'separator';
}

export interface MenuNestedItem extends BaseMenuItem {
  type: 'nested';
  label: string;
  icon?: IconType;
  items: MenuItemType[];
}

export type MenuItemType = MenuItem | MenuComponentItem | MenuSeparator | MenuNestedItem;

export interface MenuProps {
  items: MenuItemType[];
  className?: string;
  onItemClick?: (item: MenuItem) => void;
  /**
   * Called when the panel itself asks to be dismissed - `ArrowLeft` in a
   * submenu, which the ARIA menu pattern defines as "close this level and go
   * back to the item that opened it".
   *
   * A submenu cannot close itself: the overlay holding it belongs to the
   * parent panel. Whoever renders the panel owns that, so it is passed in.
   */
  onRequestClose?: () => void;
}

export interface NestedMenuProps {
  items: MenuItemType[];
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

export interface MenuWrapperProps {
  trigger: React.ReactNode;
  items: MenuItemType[];

  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  autoWidth?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
  closeOnItemClick?: boolean;
  tooltip?: string;
}
