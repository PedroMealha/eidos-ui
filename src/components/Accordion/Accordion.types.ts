import React from 'react';

export type AccordionColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface AccordionProps {
  /** Allow multiple items open simultaneously. Default: false (only one open at a time). */
  multiple?: boolean;
  /** Controlled open item(s). String for single mode, string[] for multiple mode. */
  value?: string | string[];
  /** Uncontrolled initial open item(s). */
  defaultValue?: string | string[];
  /** Callback fired when open state changes. Receives a string in single mode, string[] in multiple mode. */
  onChange?: (value: string | string[]) => void;
  /** Visual variant. Default: 'default'. */
  variant?: 'default' | 'bordered' | 'separated';
  /** Size affecting padding and font size. Default: 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Color applied to the active trigger label. Default: 'primary'. */
  color?: AccordionColorProps;
  className?: string;
  children: React.ReactNode;
}

export interface AccordionItemProps {
  /** Unique value identifying this item - used in controlled/uncontrolled open state. */
  value: string;
  /** Trigger label (always visible). */
  label: React.ReactNode;
  /** Optional icon shown to the left of the label. */
  icon?: React.ReactNode;
  /** Whether this item is disabled (cannot be toggled). */
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AccordionContextValue {
  openValues: string[];
  toggle: (value: string) => void;
  variant: AccordionProps['variant'];
  size: AccordionProps['size'];
  color: AccordionProps['color'];
}
