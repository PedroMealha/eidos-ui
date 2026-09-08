import type { ReactNode } from 'react';
import type { IconType } from '../../utils';
import type { ButtonColorProps, ButtonVariantProps } from '../Button/Button.types';

/** A secondary action inside a `type: 'split-button'` bulk action's dropdown. */
export interface BulkActionSplitOption<T> {
  id: string;
  label: string;
  icon?: IconType;
  disabled?: boolean;
  /** Receives the full array of currently selected row objects. */
  onClick: (selectedRows: T[]) => void;
}

interface BulkActionCommon<T> {
  /** Only needs to be unique within this `bulkActions` array. */
  id: string;
  color?: ButtonColorProps;
  disabled?: boolean | ((selectedRows: T[]) => boolean);
  /** Primary action - fired on click for `'button'`, or on the primary (left) segment for `'split-button'`. */
  onClick: (selectedRows: T[]) => void;
}

export interface BulkActionButton<T> extends BulkActionCommon<T> {
  /** @default 'button' */
  type?: 'button';
  /** Omit to render an icon-only button - `icon` becomes the sole icon in that case. */
  label?: string;
  icon?: IconType;
  posIcon?: IconType;
  variant?: ButtonVariantProps;
}

export interface BulkActionSplitButton<T> extends BulkActionCommon<T> {
  type: 'split-button';
  /** Required - SplitButton always renders a primary label. */
  label: string;
  icon?: IconType;
  /** SplitButton has no `text` variant. */
  variant?: Exclude<ButtonVariantProps, 'text'>;
  /** Secondary actions shown in the split-button's dropdown. */
  options: BulkActionSplitOption<T>[];
}

export type BulkAction<T> = BulkActionButton<T> | BulkActionSplitButton<T>;

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
