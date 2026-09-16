import type { ReactNode } from 'react';
import type { IconType, RowKey } from '../../utils';
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

/** Members shared by every column variant, field-addressing or not. */
interface TableColumnCommon {
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { id: string; value: string; label: string }[];
  // Date filter specific options
  dateFilterMode?: 'single' | 'multiple' | 'range';
  width?: string;
  /**
   * Cell text alignment. Applies in table mode only: card view renders each
   * field as a label above its value, where aligning the value away from its
   * own label reads as a misalignment rather than a choice.
   */
  align?: 'left' | 'center' | 'right';
  /** Enables position:sticky on this column */
  pin?: 'left' | 'right';

  // ── Card view (see TableProps.hasCardView) ─────────────────────────────────
  /**
   * Render this column's value as the card's title instead of a label:value
   * field row. Only the first column with `cardHeader` set is used - if
   * several are marked, the rest render as normal fields.
   */
  cardHeader?: boolean;
  /**
   * Render this column's value as the card's subtitle, directly under the
   * `cardHeader` value. Only the first column with `cardSubheader` set is
   * used. Has no effect without a `cardHeader` column also being set.
   */
  cardSubheader?: boolean;
}

/**
 * A column bound to the row field named by `key`, which is what lets `render`
 * receive `T[K]` rather than `unknown`.
 *
 * Not used directly - `TableColumn` distributes this over `keyof T` so each
 * entry correlates its own `key` with its own value type.
 */
interface TableValueColumn<T extends object, K extends RowKey<T>> extends TableColumnCommon {
  key: K;
  /** @default 'data' */
  type?: 'data';
  render?: (value: T[K], item: T) => ReactNode;
}

/**
 * A column that renders from the whole row rather than one field - an icon or
 * action cell, or a computed/composite value. `key` is free-form here because
 * nothing reads `row[key]`: it's only an identity for React keys, sorting and
 * `data-col-key`.
 *
 * `'icon'` and `'action'` carry their existing cell styling; `'custom'` styles
 * like a normal data cell but takes a free-form key, which is the home for a
 * derived column (previously expressible only by pointing `key` at a field
 * that didn't exist).
 */
interface TableCustomColumn<T extends object> extends TableColumnCommon {
  /** Free-form - must only be unique within `columns`. */
  key: string;
  type: 'icon' | 'action' | 'custom';
  /** `value` is always `undefined`; render from `item`. */
  render?: (value: undefined, item: T) => ReactNode;
}

/**
 * One column definition. A union of two variants, discriminated on `type`:
 *
 * - **value column** (default, `type` omitted or `'data'`) - `key` must be a
 *   field of `T`, and `render` receives that field's type instead of `unknown`.
 * - **`type: 'icon' | 'action' | 'custom'`** - renders from the whole row;
 *   `key` is free-form.
 *
 * With the untyped default `T`, `RowKey<T>` is `string` and `T[K]` is
 * `unknown`, which is byte-identical to the pre-2.0 behaviour.
 *
 * Replaces `key: keyof T | string`, which looked constrained but wasn't:
 * `keyof T` is assignable to `string`, so that union collapsed to plain
 * `string` and checked nothing.
 */
type TableColumn<T extends object = Record<string, unknown>> =
  { [K in RowKey<T>]: TableValueColumn<T, K> }[RowKey<T>] | TableCustomColumn<T>;

type FilterValue =
  string | string[] | boolean | { start: string | null; end: string | null } | undefined;

interface TableFilters {
  [key: string]: FilterValue;
}

interface TableProps<T extends object = Record<string, unknown>> {
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
  onSortChange?: (sortBy: RowKey<T>, sortDirection: 'asc' | 'desc') => void;
  currentSort?: {
    key: RowKey<T>;
    direction: 'asc' | 'desc';
  };
  // Server-side filtering
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
  defaultFilters?: TableFilters;
  showFilters?: boolean;
  // Row selection / bulk actions
  selectable?: boolean;
  rowKey?: RowKey<T>;
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

  // ── Card view ──────────────────────────────────────────────────────────────
  /**
   * On by default: below `cardViewBreakpoint`, or once the table's own width
   * can no longer fit every visible column at a usable width, swap the table
   * for a stacked list of cards - one per row. Only the row rendering
   * changes; the toolbar, pagination, filtering, sorting and selection all
   * keep working. `draggableColumns` has no effect in card view (there are no
   * column headers to drag).
   *
   * Matches `DataGridProps.hasCardView` - both components use the same
   * defaults and the same measured-container logic. Set to `false` to always
   * render a table.
   *
   * @default true
   */
  hasCardView?: boolean;
  /**
   * Container width (px) at/below which card view kicks in. This is an
   * explicit floor - card view also switches on automatically, regardless
   * of this value, once the container can't fit every visible column at a
   * usable minimum width, so a many-column table never has to overflow
   * horizontally waiting for a hand-tuned breakpoint.
   *
   * @default 640
   */
  cardViewBreakpoint?: number;
  /**
   * Cards lay out in a responsive grid (CSS `repeat(auto-fill, minmax(...))`)
   * rather than one per row - this sets the minimum width (px) a card can
   * shrink to before the next one wraps to a new row.
   *
   * @default 280
   */
  cardMinWidth?: number;
}

export type { TableColumn, TableFilters, TableProps, FilterValue };
export type { TableValueColumn, TableCustomColumn };
