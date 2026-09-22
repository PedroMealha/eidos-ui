export interface DropdownPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface DropdownState {
  isVisible: boolean;
  position: DropdownPosition;
  isPositioned: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  /** Open the dropdown immediately on first mount. Useful for programmatic contexts. */
  defaultOpen?: boolean;
  /**
   * Controlled open state. Pass it together with `onOpenChange` to own the
   * open/closed decision entirely; omit both to let `Dropdown` manage itself
   * (optionally seeded by `defaultOpen`).
   *
   * Reach for this when something other than the trigger decides: content that
   * dismisses itself on commit, a keyboard shortcut, or a trigger that has to
   * describe the state - `aria-expanded` can only be honest about a state its
   * owner can read.
   */
  open?: boolean;
  /**
   * Called with the requested state whenever the dropdown wants to open or
   * close - a trigger click, a click outside, Escape, a group sibling opening,
   * or the `delay` timer elapsing.
   *
   * Fires in both controlled and uncontrolled mode, so it doubles as a plain
   * notification. When `open` is passed, this is the only way the dropdown can
   * change: it never moves on its own.
   */
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'end' | 'center';
  delay?: number;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /**
   * ARIA role for the portaled content element. Defaults to no role.
   *
   * `Dropdown` positions a panel and does not know what is in it, so pass a
   * role only when the panel itself carries the semantics. When its content
   * already provides them - a `role="listbox"` you render inside, for instance -
   * leave this unset, or you nest one interactive role inside another.
   *
   * A role also implies an interaction contract: `role="menu"` promises arrow-key
   * navigation. For a menu, use `Menu`, which supplies the roles, the roving tab
   * stop and the keys together.
   */
  role?: React.AriaRole;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;

  isNested?: boolean;
  parentDropdownId?: string;
  onNestedDropdownOpen?: (dropdownId: string) => void;
  onNestedDropdownClose?: (dropdownId: string) => void;

  dropdownLevel?: number;
  dropdownGroup?: string;

  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  autoWidth?: boolean;
  fullWidth?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export interface NestedDropdownItem {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  children?: NestedDropdownItem[];
  disabled?: boolean;
  divider?: boolean;
}
