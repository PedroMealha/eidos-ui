import type React from 'react';
import type { IconType } from '../../utils';
import type { MenuItemType } from '../Menu';
import type { BulkAction, TableFilters } from '../Table/Table.types';

export type DataGridCellType =
  'text' | 'number' | 'select' | 'checkbox' | 'date' | 'readonly' | 'actions';

export interface DataGridSelectOption {
  value: string;
  label: string;
}

/**
 * Defines one filterable field for the grid's filter dropdown - see
 * `DataGridProps.filterConfig`. Deliberately decoupled from `columns`: `key`
 * doesn't need to match a rendered column, so you can filter on any row-data
 * field (including ones you don't display), without hunting through column
 * definitions to find which ones set a filter flag.
 */
export interface DataGridFilterField {
  /** Row data key this filter reads/writes. Does not need to match a `columns` entry. */
  key: string;
  label: string;
  /** Filter UI type. @default 'text' */
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  /** Options for filterType='select'. */
  filterOptions?: Array<{ id: string; value: string; label: string }>;
  /** UI mode for filterType='date'. @default 'single' */
  dateFilterMode?: 'single' | 'multiple' | 'range';
}

/** A single entry in a `type: 'actions'` column's menu - see `DataGridColumn.actions`. */
export interface DataGridRowAction<T = Record<string, unknown>> {
  /** Defaults to `label` if omitted - only needs to be unique within this column's `actions`. */
  id?: string;
  label: string;
  icon?: IconType;
  onClick: (row: T, index: number) => void;
  disabled?: boolean | ((row: T) => boolean);
  /** Styles the item (and its icon) in the danger colour, e.g. for a destructive action. */
  danger?: boolean;
  /** Renders a separator directly above this item. */
  divider?: boolean;
}

export interface DataGridColumn<T = Record<string, unknown>> {
  /** Matches the key in the data row object. Unused when `type: 'actions'`, but still required - any placeholder string works. */
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
  /** Lock this column to the left or right edge on horizontal scroll */
  pin?: 'left' | 'right';

  // ── Actions column (type: 'actions') ───────────────────────────────────────
  /**
   * The menu items shown for this row. Required for the column to render
   * anything - a `type: 'actions'` column with no `actions` renders nothing.
   * Only one column may set `type: 'actions'`; if several do, only the
   * first is honored. Always rendered at the far right in table mode
   * (regardless of the column's position in `columns` or any `pin`), and
   * in the card's top-right corner in card view, regardless of position.
   */
  actions?: DataGridRowAction<T>[];
  /** Overrides the default vertical "more" (⋮) trigger icon. */
  actionsIcon?: IconType;
  /**
   * Escape hatch for menu capabilities `actions` can't express - nested
   * submenus (`type: 'nested'`), custom content (`type: 'component'`), or
   * keyboard `shortcut` labels. When set, this completely replaces `actions`
   * for this column: you build the full `MenuItemType[]` yourself (including
   * `id`s and `onClick` callbacks bound to `row`/`index`), and `actions` is
   * ignored.
   */
  renderActions?: (row: T, index: number) => MenuItemType[];

  // ── Card view (see DataGridProps.hasCardView) ──────────────────────────────
  /**
   * Render this column's value as the card's title instead of a label:value
   * field row. Only the first column with `cardHeader` set is used - if
   * several are marked, the rest are silently ignored.
   */
  cardHeader?: boolean;
  /**
   * Render this column's value as the card's subtitle, directly under the
   * `cardHeader` value. Only the first column with `cardSubheader` set is
   * used. Has no effect without a `cardHeader` column also being set.
   */
  cardSubheader?: boolean;
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
  /** Master editable switch. @default false */
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
  /**
   * Which fields can be filtered, and how - a dedicated schema array, kept
   * separate from `columns` so it's one place to see every filterable field
   * (including ones that aren't rendered as a column at all), rather than
   * columns each carrying their own filter flag.
   */
  filterConfig?: DataGridFilterField[];
  /** Controlled filter state (the current values, keyed by `filterConfig[].key`). When provided with onFiltersChange → server-side mode. */
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

  // ── Row expansion ──────────────────────────────────────────────────────────
  /**
   * Renders a chevron column (table mode) / toolbar toggle (card mode) that
   * expands the row to show `renderExpandedContent`. Rendering nothing for a
   * `renderExpandedContent`-less grid, since there'd be nothing to expand into.
   * @default false
   */
  expandable?: boolean;
  /** Content shown below a row once it's expanded. Required for `expandable` to do anything. */
  renderExpandedContent?: (row: T, index: number) => React.ReactNode;
  /** Per-row opt-out - rows this returns `false` for render no chevron/toggle and can't be expanded. */
  isRowExpandable?: (row: T) => boolean;
  /**
   * Allow more than one row expanded at once. When `false`, expanding a row
   * collapses whichever other row was open (accordion behaviour).
   * @default true
   */
  expandMultiple?: boolean;
  /** Controlled expanded row keys. */
  expandedRows?: string[];
  /** Uncontrolled initial expanded row keys. */
  defaultExpandedRows?: string[];
  onExpandedRowsChange?: (expandedKeys: string[]) => void;

  // ── Display ────────────────────────────────────────────────────────────────
  /** @default 'comfortable' */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** Show a density picker dropdown in the toolbar. @default false */
  showDensity?: boolean;

  // ── Card view ──────────────────────────────────────────────────────────────
  /**
   * Below `cardViewBreakpoint`, swap the table for a stacked list of cards -
   * one per row. Only the row rendering changes: pagination, filtering,
   * sorting, selection, and cell editing all keep working exactly as in
   * table mode, driven off the grid's own measured width (not the viewport),
   * so it responds correctly even inside a narrow sidebar on a wide screen.
   * Row drag-reordering (`draggableRows`) is not available in card view.
   * @default false
   */
  hasCardView?: boolean;
  /** Container width (px) at/below which card view kicks in. @default 640 */
  cardViewBreakpoint?: number;
  /**
   * Cards lay out in a responsive grid (CSS `repeat(auto-fill, minmax(...))`)
   * rather than one per row - this sets the minimum width (px) a card can
   * shrink to before the next one wraps to a new row, so as many fit per row
   * as the container allows.
   * @default 280
   */
  cardMinWidth?: number;
}

export type EditingCell = { rowIndex: number; colKey: string } | null;
