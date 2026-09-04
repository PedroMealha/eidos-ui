import type { ComponentType, ReactNode } from 'react';

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  variant?: 'filled' | 'outlined' | 'text';
  onClick: (selectedRows: T[]) => void;
  disabled?: boolean | ((selectedRows: T[]) => boolean);
}

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { id: string; value: string; label: string }[];
  // Date filter specific options
  dateFilterMode?: 'single' | 'multiple' | 'range';
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'data' | 'icon' | 'action';
  /** Enables position:sticky on this column */
  pin?: 'left' | 'right';
}

type FilterValue =
  string | string[] | boolean | { start: string | null; end: string | null } | undefined;

interface TableFilters {
  [key: string]: FilterValue;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  showFooter?: boolean;
  totalItems?: number;
  // Pagination props
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  // Server-side sorting
  onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  currentSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  // Server-side filtering
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
  defaultFilters?: TableFilters;
  showFilters?: boolean;
  // Row selection / bulk actions
  selectable?: boolean;
  rowKey?: keyof T;
  selectedRows?: string[];
  defaultSelectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;
  bulkActions?: BulkAction<T>[];
  // Feature 1: Row density
  density?: 'compact' | 'comfortable' | 'spacious';
  // Feature 2: Column visibility toggle
  showColumnVisibility?: boolean;
  // Feature 3: CSV Export
  showExport?: boolean;
  // Feature 4: Row density (built-in picker)
  showDensity?: boolean;
  // Feature 5: Column drag-reorder
  draggableColumns?: boolean;
  onColumnReorder?: (newColumns: TableColumn<T>[]) => void;
}

export type { TableColumn, TableFilters, TableProps, FilterValue };
