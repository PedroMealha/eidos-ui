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
  /**
   * Controlled open state. Omit it (along with `onClose`) to let the palette
   * manage its own open state internally, which is enough on its own to wire
   * up `shortcutKey` with no `useState`/`useEffect` in your app at all:
   * ```tsx
   * <CommandPalette items={items} />
   * ```
   */
  open?: boolean;
  /** Initial open state when uncontrolled (`open` omitted). @default false */
  defaultOpen?: boolean;
  /** Called whenever the palette closes. Required if `open` is controlled. */
  onClose?: () => void;
  /**
   * Called when `shortcutKey` fires while `open` is controlled - the palette
   * can't flip your `open` state itself, so this is the hook to do it
   * (`onOpen={() => setOpen(true)}`). Not needed in uncontrolled mode.
   */
  onOpen?: () => void;
  /**
   * Global Cmd/Ctrl+<key> shortcut that opens the palette, e.g. `'k'` for
   * ⌘K, `'r'` for ⌘R. Pass `null` to disable the built-in listener entirely
   * (e.g. if you only want to open it from your own trigger). @default 'k'
   */
  shortcutKey?: string | null;
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
  /**
   * Renders a clickable entry point inline, wherever `<CommandPalette>` is
   * mounted, wired up to open it - no external button/state required.
   * - Omitted (default): nothing is rendered inline, matching the fully
   *   headless behaviour of a bare `<CommandPalette items={items} />`.
   * - `true`: renders a built-in default trigger (button + `Kbd` shortcut
   *   badge reflecting `shortcutKey`).
   * - A `ReactNode`: renders your own element instead, with the open click
   *   handler wired onto a wrapping element (mirrors the `trigger` prop on
   *   `Menu`/`Dropdown`).
   */
  trigger?: boolean | React.ReactNode;
  /** Label used by the built-in default trigger (`trigger={true}`). @default 'Search' */
  triggerLabel?: string;
}
