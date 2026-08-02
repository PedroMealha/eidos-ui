import React from "react";
import type { IconType } from "../../utils";

export interface BaseMenuItem {
  id: string;
  disabled?: boolean;
}

export interface MenuItem extends BaseMenuItem {
  type: "item";
  label: string;
  icon?: IconType;
  onClick?: () => void;
  shortcut?: string;
  /** Applies a semantic color to the item. Use `'danger'` for destructive actions. */
  color?: 'danger';
}

export interface MenuComponentItem extends BaseMenuItem {
  type: "component";
  component: React.ReactNode;
}

export interface MenuSeparator extends BaseMenuItem {
  type: "separator";
}

export interface MenuNestedItem extends BaseMenuItem {
  type: "nested";
  label: string;
  icon?: IconType;
  items: MenuItemType[];
}

export type MenuItemType =
  | MenuItem
  | MenuComponentItem
  | MenuSeparator
  | MenuNestedItem;

export interface MenuProps {
  items: MenuItemType[];
  className?: string;
  onItemClick?: (item: MenuItem) => void;
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
