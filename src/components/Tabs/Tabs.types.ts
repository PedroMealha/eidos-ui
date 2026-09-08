import React from 'react';
import type { IconType, ComponentSizeProps } from '../../utils';

export type TabsColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
  size?: ComponentSizeProps;
  color?: TabsColorProps;
  fullWidth?: boolean;
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
