import React from 'react';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverState {
  isVisible: boolean;
  isPositioned: boolean;
  position: { top: number; left: number; placement: PopoverPlacement };
}

export interface PopoverProps {
  /** Element that triggers the popover on click. */
  trigger: React.ReactNode;
  /** Content rendered inside the floating panel. */
  children: React.ReactNode;
  /** Optional heading shown at the top of the panel. */
  title?: string;
  /** Preferred placement relative to the trigger. Flips automatically when it doesn't fit. Default: 'bottom'. */
  placement?: PopoverPlacement;
  /** Show a × close button in the panel header. Default: false. */
  showCloseButton?: boolean;
  /** Dismiss on click outside. Default: true. */
  closeOnClickOutside?: boolean;
  /** Dismiss on Escape key. Default: true. */
  closeOnEscape?: boolean;
  /** Disable the trigger from opening the popover. */
  disabled?: boolean;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Max width of the panel in px. Default: 320. */
  maxWidth?: number;
  className?: string;
  contentClassName?: string;
}
