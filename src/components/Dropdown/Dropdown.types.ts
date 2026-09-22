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
   * This exists because the open state being private forced every consumer in
   * this library to fake it: `Select`, `Combobox`, `TagInput`, `DatePicker` and
   * `TableFiltersDropdown` all forced a close by remounting the dropdown
   * through a changing `key`, `Menu` dispatched a synthetic `mousedown` at
   * `document`, and `Combobox` opens by synthesising a click on a hidden
   * zero-height span. Worse than ugly, it was wrong: a component cannot set
   * `aria-expanded` truthfully about a state it has to guess at, and `Select`
   * could not be opened from the keyboard at all because its own idea of
   * "open" reached nothing.
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
   * `Dropdown` is a positioning primitive and cannot know what its content is,
   * so there is no correct default other than none. It used to hardcode
   * `role="menu"`, which was wrong for nearly every consumer: `Select`,
   * `Combobox` and `TagInput` render their own `role="listbox"` inside it (a
   * listbox is not a valid child of a menu), and `DatePicker`, `ColorPicker`,
   * `TableFiltersDropdown` and the `Table`/`DataGrid` toolbars are plain
   * panels that were announced as menus with no items.
   *
   * For a real menu, use `Menu`/`MenuPanel`: the role belongs on the element
   * that directly contains the items, together with the keyboard model that
   * role implies (arrow keys, Home/End, Enter/Space). Setting `role="menu"`
   * here on a `<div>` of arbitrary content promises both and supplies neither.
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
