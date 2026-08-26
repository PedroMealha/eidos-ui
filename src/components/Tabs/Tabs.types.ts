import React from 'react';
import type { IconType } from '../../utils';

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
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
  size: 'sm' | 'md' | 'lg';
  color: 'primary' | 'secondary' | 'success' | 'danger';
  fullWidth: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}
