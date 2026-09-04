import type React from 'react';
import type { BulkAction, TableFilters } from '../Table/Table.types';

export type DataGridCellType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'readonly';

export interface DataGridSelectOption {
  value: string;
  label: string;
}

export interface DataGridColumn<T = Record<string, unknown>> {
  /** Matches the key in the data row object */
  key: string;
  header: string;
  /** @default 'text' */
  type?: DataGridCellType;
  width?: number | string;
  minWidth?: number | string;
  /** @default true */
  editable?: boolean;
  /** Show error if cell is left empty */
  required?: boolean;
  /** For type='select' */
  options?: DataGridSelectOption[];
  /** Return an error string or `true` if valid */
  validate?: (value: unknown) => string | true;
  renderCell?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  renderEditor?: (value: unknown, onChange: (v: unknown) => void, row: T) => React.ReactNode;

  // ── Read/display features ──────────────────────────────────────────────────
  /** Enable click-to-sort on this column */
  sortable?: boolean;
  /** Enable the filter dropdown to filter on this column */
  filterable?: boolean;
  /** Filter UI type. @default 'text' */
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  /** Options for filterType='select'. Same shape as TableColumn filterOptions. */
  filterOptions?: Array<{ id: string; value: string; label: string }>;
  /** UI mode for filterType='date'. Same as TableColumn dateFilterMode. @default 'single' */
  dateFilterMode?: 'single' | 'multiple' | 'range';
  /** Lock this column to the left or right edge on horizontal scroll */
  pin?: 'left' | 'right';
}

export interface DataGridProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: DataGridColumn<T>[];
  data: T[];
  /** Field name used as React key. @default 'id' */
  rowKey?: string;
  /** Called after each cell commit with the full updated dataset */
  onChange?: (data: T[]) => void;
  /** Returns a blank row object; if omitted, no Add-row button is shown */
  onRowAdd?: () => T;
  onRowDelete?: (row: T, index: number) => void;
  /** Master editable switch. @default true */
  editable?: boolean;
  loading?: boolean;
  emptyText?: string;
  className?: string;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  /** @default false */
  showRowNumbers?: boolean;
  /** Enable drag-to-reorder rows with a grip handle. @default false */
  draggableRows?: boolean;
  /** Called with the full re-ordered dataset after a drop. */
  onRowReorder?: (newData: T[]) => void;

  // ── Sorting ────────────────────────────────────────────────────────────────
  /** Controlled sort state. When provided, component is in server-side sort mode. */
  currentSort?: { key: string; direction: 'asc' | 'desc' };
  /** Server-side sort callback. When omitted, sorting is handled client-side. */
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;

  // ── Filtering ──────────────────────────────────────────────────────────────
  /** Show the filter button in the toolbar. */
  showFilters?: boolean;
  /** Controlled filter state. When provided with onFiltersChange → server-side mode. */
  filters?: TableFilters;
  /** Filter change callback. When omitted, filtering is handled client-side. */
  onFiltersChange?: (filters: TableFilters) => void;

  // ── Pagination ─────────────────────────────────────────────────────────────
  showPagination?: boolean;
  /** @default 10 */
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Total row count for server-side pagination. Defaults to data.length. */
  totalRows?: number;
  /** Server-side pagination callback. When omitted, pagination is client-side. */
  onPageChange?: (page: number, pageSize: number) => void;

  // ── Row selection + bulk actions ───────────────────────────────────────────
  selectable?: boolean;
  /** Controlled selected row keys. */
  selectedRows?: string[];
  defaultSelectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;
  bulkActions?: BulkAction<T>[];

  // ── Display ────────────────────────────────────────────────────────────────
  /** @default 'comfortable' */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** Show a density picker dropdown in the toolbar. @default false */
  showDensity?: boolean;
}

export type EditingCell = { rowIndex: number; colKey: string } | null;
