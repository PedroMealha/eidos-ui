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
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'end' | 'center';
  delay?: number;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
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
