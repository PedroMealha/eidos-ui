import type React from 'react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  /** e.g. ['⌘', 'K'] - each key rendered as a <kbd> badge */
  shortcut?: string[];
  group?: string;
  disabled?: boolean;
  /** Called when the item is selected */
  action?: () => void;
  /** Additional terms used for filtering; not displayed */
  keywords?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  onSelect?: (item: CommandItem) => void;
  /** @default 'Search commands…' */
  placeholder?: string;
  /** @default 'No commands found' */
  emptyText?: string;
  /** Scrollable list max-height. @default 360 (px) */
  maxHeight?: number | string;
  className?: string;
  /** Optional content rendered on the right side of the footer */
  footer?: React.ReactNode;
}
