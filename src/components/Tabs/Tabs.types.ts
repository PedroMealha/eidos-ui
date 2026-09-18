import React from 'react';
import type { IconType, ComponentSizeProps } from '../../utils';

export type TabsColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

/**
 * How an overflowing tab strip is scrolled.
 *
 * - `auto` - previous/next buttons appear only while the strip overflows, and
 *   the native scrollbar is hidden because the buttons are the affordance.
 * - `none` - no buttons; the strip keeps its native scrollbar.
 *
 * Native scrolling (touch swipe, trackpad, shift+wheel) works either way.
 */
export type TabsScrollButtonsProps = 'auto' | 'none';

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
  size?: ComponentSizeProps;
  color?: TabsColorProps;
  fullWidth?: boolean;
  scrollButtons?: TabsScrollButtonsProps;
  className?: string;
  children: React.ReactNode;
}

export interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: IconType;
  className?: string;
}

export interface TabPanelProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export interface TabsContextValue {
  activeValue: string;
  onSelect: (value: string) => void;
  variant: 'line' | 'enclosed' | 'pills';
  size: ComponentSizeProps;
  color: TabsColorProps;
  fullWidth: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}
