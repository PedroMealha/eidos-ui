import React from 'react';

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
  size?: 'small' | 'medium' | 'large';
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  className?: string;
  maxHeight?: number | string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}
