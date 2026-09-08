import React from 'react';
import type { ComponentSizeProps } from '../../utils';

export interface ComboboxOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface ComboboxProps {
  options?: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  allowFreeText?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  size?: ComponentSizeProps;
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  className?: string;
  maxHeight?: number | string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}
