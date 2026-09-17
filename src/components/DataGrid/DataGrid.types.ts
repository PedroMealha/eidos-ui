import type React from 'react';
import type { IconType, RowKey } from '../../utils';
import type { ComboboxOption } from '../Combobox';
import type { MenuItemType } from '../Menu';
import type { SelectOption } from '../Select';
import type { SegmentedControlColorProps, SegmentedOption } from '../SegmentedControl';
import type { BulkAction, TableFilters } from '../Table/Table.types';

export type DataGridCellType =
  'text' | 'number' | 'select' | 'checkbox' | 'date' | 'readonly' | 'custom' | 'actions';

/** Cell types that address a row field, i.e. everything but the two escape hatches. */
export type DataGridValueCellType = Exclude<DataGridCellType, 'custom' | 'actions'>;

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
export interface DataGridFilterField<T extends object = Record<string, unknown>> {
  /**
   * Row data key this filter reads/writes. Does not need to match a `columns`
   * entry - the decoupling from `columns` is intact, so filtering an
   * undisplayed field still works. It does have to be a real field of `T`,
   * because the filter evaluates `row[key]`: a name that isn't on the row
   * type used to compile fine and then silently match nothing.
   */
  key: RowKey<T>;
  label: string;
  /** Filter UI type. @default 'text' */
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  /** Options for filterType='select'. */
  filterOptions?: Array<{ id: string; value: string; label: string }>;
  /** UI mode for filterType='date'. @default 'single' */
  dateFilterMode?: 'single' | 'multiple' | 'range';
}

// ─── Quick filters ───────────────────────────────────────────────────────────
// Option shapes are derived from the underlying components' own option types
// so they can't drift out of sync, minus `id` - it would only ever duplicate
// `value` here, so the grid fills it in internally.

export type DataGridQuickFilterSelectOption = Omit<SelectOption, 'id'>;
export type DataGridQuickFilterComboboxOption = Omit<ComboboxOption, 'id'>;
export type DataGridQuickFilterSegmentedOption = SegmentedOption;

interface DataGridQuickFilterBase<T extends object = Record<string, unknown>> {
  /**
   * Row data key this filter reads/writes. Does not need to match a `columns`
   * entry, but must be a real field of `T` - the filter evaluates `row[key]`.
   */
  key: RowKey<T>;
  /**
   * Short label for the control. The toolbar has no room for a visible field
   * label, so this is used as the control's placeholder and its accessible
   * name rather than being rendered above it.
   */
  label: string;
  disabled?: boolean;
  /**
   * Control width. Omit for the default (160px). Only sizing is configurable -
   * `size`, `fullWidth`, and `className` are fixed by the grid so every quick
   * filter matches the rest of the toolbar.
   */
  width?: number | string;
  /**
   * Initial value, applied only when the grid manages filter state itself.
   * Ignored in server-side mode (when `onFiltersChange` is set), where the
   * caller owns `filters` and should seed its own initial state instead.
   */
  defaultValue?: string | string[];
}

export interface DataGridQuickFilterSelect<
  T extends object = Record<string, unknown>,
> extends DataGridQuickFilterBase<T> {
  type: 'select';
  options: DataGridQuickFilterSelectOption[];
  /** Select several values at once - writes a `string[]` filter value. @default false */
  multiple?: boolean;
  /** Lets the user clear the filter - this is the control's "no filter" state. @default true */
  clearable?: boolean;
  /** Defaults to `label`. */
  placeholder?: string;
}

export interface DataGridQuickFilterCombobox<
  T extends object = Record<string, unknown>,
> extends DataGridQuickFilterBase<T> {
  type: 'combobox';
  /** Optional so options can be supplied asynchronously via `onSearch`. */
  options?: DataGridQuickFilterComboboxOption[];
  /** Defaults to `label`. */
  placeholder?: string;
  /** Lets the user clear the filter - this is the control's "no filter" state. @default true */
  clearable?: boolean;
  emptyText?: string;
  /** Fires as the user types - use it to fetch `options` for long/remote lists. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  loadingText?: string;
}

export interface DataGridQuickFilterSegmented<
  T extends object = Record<string, unknown>,
> extends DataGridQuickFilterBase<T> {
  type: 'segmented';
  /**
   * Rendered after the reset segment, which the grid always prepends - a
   * SegmentedControl has no empty state of its own, so without it the filter
   * could never be cleared.
   */
  options: DataGridQuickFilterSegmentedOption[];
  color?: SegmentedControlColorProps;
  /** Label for the auto-prepended reset segment. @default 'All' */
  allLabel?: string;
}

/**
 * One always-visible filter control in the toolbar - see
 * `DataGridProps.quickFilters`. Discriminated on `type`, so each control only
 * accepts the props that actually apply to it.
 */
export type DataGridQuickFilter<T extends object = Record<string, unknown>> =
  DataGridQuickFilterSelect<T> | DataGridQuickFilterCombobox<T> | DataGridQuickFilterSegmented<T>;

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

/** Members every column variant shares, whether or not it addresses a row field. */
interface DataGridColumnCommon {
  header: string;
  width?: number | string;
  minWidth?: number | string;
  /** Enable click-to-sort on this column */
  sortable?: boolean;
  /**
   * Horizontal alignment of this column's header and cell content - same
   * values as `TableColumn.align`. Applies in table mode only: card view
   * renders each field as a label above its value, where aligning the value
   * away from its own label reads as a misalignment rather than a choice.
   * Typically `'right'` for numeric columns.
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
  /** Lock this column to the left or right edge on horizontal scroll */
  pin?: 'left' | 'right';

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

/**
 * A column bound to the row field named by `key`, which is what makes `value`
 * knowable: every callback below receives `T[K]` rather than `unknown`.
 *
 * Not used directly - `DataGridColumn` distributes this over `keyof T` so each
 * entry in a `columns` array correlates its own `key` with its own value type.
 */
export interface DataGridValueColumn<
  T extends object,
  K extends RowKey<T>,
> extends DataGridColumnCommon {
  /** Matches the key in the data row object. */
  key: K;
  /** @default 'text' */
  type?: DataGridValueCellType;
  /** @default true */
  editable?: boolean;
  /** Show error if cell is left empty */
  required?: boolean;
  /** For type='select' */
  options?: DataGridSelectOption[];
  /** Return an error string or `true` if valid */
  validate?: (value: T[K]) => string | true;
  renderCell?: (value: T[K], row: T, rowIndex: number) => React.ReactNode;
  renderEditor?: (value: T[K], onChange: (v: T[K]) => void, row: T) => React.ReactNode;
}

/**
 * A column that renders from the whole row rather than one field - a computed
 * or composite value (`${row.first} ${row.last}`), a link, a status derived
 * from several fields. `key` is free-form here because nothing reads
 * `row[key]`: it's only an identity for React keys, sorting and `data-col-key`.
 *
 * This is the home for what used to be expressible by pointing `key` at a
 * field that didn't exist. Not editable - there is no single field to write
 * back to - so `editable`, `required`, `validate` and `renderEditor` are all
 * absent by design.
 */
export interface DataGridCustomColumn<T extends object> extends DataGridColumnCommon {
  /** Free-form - must only be unique within `columns`. */
  key: string;
  type: 'custom';
  /**
   * Required: a custom column has no field to fall back to rendering.
   * `value` is always `undefined` and exists only to keep the parameter list
   * aligned with `DataGridValueColumn.renderCell`, so `(_, row) => ...` reads
   * the same on both.
   */
  renderCell: (value: undefined, row: T, rowIndex: number) => React.ReactNode;
}

/**
 * The row-actions column. Addresses no field, so it needs no `key` at all -
 * previously this had to carry a required placeholder string that nothing read.
 */
export interface DataGridActionsColumn<T extends object> extends DataGridColumnCommon {
  /** Optional, and unused - only ever an identity for React keys. */
  key?: string;
  type: 'actions';
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
}

/**
 * One column definition. A union of three variants, discriminated on `type`:
 *
 * - **value column** (default, `type` omitted or a cell type) - `key` must be a
 *   field of `T`, and `renderCell`/`renderEditor`/`validate` receive that
 *   field's type instead of `unknown`.
 * - **`type: 'custom'`** - renders from the whole row; `key` is free-form.
 * - **`type: 'actions'`** - the row-actions menu; `key` is optional.
 *
 * The value variant is produced by distributing over `RowKey<T>`, which is
 * what correlates `key` with the value type. Note this keeps a single public
 * type parameter, so no consumer signature changes.
 *
 * With the untyped default `T`, `RowKey<T>` is `string` and `T[K]` is
 * `unknown`, which is byte-identical to the pre-2.0 behaviour.
 */
export type DataGridColumn<T extends object = Record<string, unknown>> =
  | { [K in RowKey<T>]: DataGridValueColumn<T, K> }[RowKey<T>]
  | DataGridCustomColumn<T>
  | DataGridActionsColumn<T>;

export interface DataGridProps<T extends object = Record<string, unknown>> {
  columns: DataGridColumn<T>[];
  data: T[];
  /** Field name used as React key. @default 'id' */
  rowKey?: RowKey<T>;
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
  currentSort?: { key: RowKey<T>; direction: 'asc' | 'desc' };
  /** Server-side sort callback. When omitted, sorting is handled client-side. */
  onSortChange?: (key: RowKey<T>, direction: 'asc' | 'desc') => void;

  // ── Filtering ──────────────────────────────────────────────────────────────
  /** Show the filter button in the toolbar. */
  showFilters?: boolean;
  /**
   * Which fields can be filtered, and how - a dedicated schema array, kept
   * separate from `columns` so it's one place to see every filterable field
   * (including ones that aren't rendered as a column at all), rather than
   * columns each carrying their own filter flag.
   */
  filterConfig?: DataGridFilterField<T>[];
  /** Controlled filter state (the current values, keyed by `filterConfig[].key`). When provided with onFiltersChange → server-side mode. */
  filters?: TableFilters;
  /** Filter change callback. When omitted, filtering is handled client-side. */
  onFiltersChange?: (filters: TableFilters) => void;

  // ── Quick filters ──────────────────────────────────────────────────────────
  /**
   * Always-visible filter controls rendered on the left of the toolbar, for
   * the one or two filters users reach for constantly - no `showFilters`-style
   * flag, a non-empty array is what enables them.
   *
   * They write into the same filter state as the filter dropdown, so both
   * compose (a quick filter and a dropdown filter narrow the data together)
   * and server-side mode still receives one `onFiltersChange` object. Each
   * `key` must therefore be distinct from every `filterConfig` key: a key
   * claimed here wins and is dropped from the dropdown, rather than letting
   * two controls fight over the same value.
   *
   * Hidden while rows are selected - the selection count and bulk actions
   * occupy the same toolbar zone.
   */
  quickFilters?: DataGridQuickFilter<T>[];

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
  /**
   * Fires with every selected key, plus the row object for each of those keys.
   *
   * `selectedKeys` is authoritative; `selectedRows` is best-effort. The row
   * for each selected key is cached, so a row selected on a previous page
   * still comes back after `data` has moved on (which is what makes selection
   * usable with server-side pagination) - but a key that was selected before
   * the grid ever saw its row (seeded via `defaultSelectedRows`, say) has no
   * row to hand back.
   */
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;
  /**
   * What the select-all control acts on - the header checkbox in table mode,
   * or the toolbar checkbox in card view (where there is no header row):
   *
   * - `'all'` - every row in `data`, across pages.
   * - `'page'` - only the rows currently rendered.
   *
   * Either way it only ever adds to or removes from the rows in its own
   * scope, so a selection made on another page survives.
   *
   * `'all'` can only reach the rows the grid actually holds. Under
   * server-side pagination (`onPageChange` + `totalRows`) that is a single
   * page: the grid cannot know the keys of rows it has never received, so
   * "all" means "all 20 loaded", not "all 1000 matching", and it says so with
   * a dev-only warning. Matches `Table.selectAllScope`.
   *
   * @default 'all'
   */
  selectAllScope?: 'all' | 'page';
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
   * On by default: below `cardViewBreakpoint`, or once the grid's own width
   * can no longer fit every column at a reasonable minimum, swap the table
   * for a stacked list of cards - one per row. Only the row rendering
   * changes: pagination, filtering, sorting, selection, and cell editing all
   * keep working exactly as in table mode, driven off the grid's own
   * measured width (not the viewport), so it responds correctly even inside
   * a narrow sidebar on a wide screen. Row drag-reordering (`draggableRows`)
   * is not available in card view. Set to `false` to always render a table.
   * @default true
   */
  hasCardView?: boolean;
  /**
   * Container width (px) at/below which card view kicks in. This is an
   * explicit floor - card view also switches on automatically, regardless
   * of this value, once the container is narrower than the number of
   * displayed columns times a 100px minimum column width. That means a
   * grid with many columns never has to overflow horizontally waiting for
   * a hand-tuned breakpoint; this prop is mainly useful for forcing card
   * view earlier than that automatic threshold.
   * @default 640
   */
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

export type EditingCell<T extends object = Record<string, unknown>> = {
  rowIndex: number;
  colKey: RowKey<T>;
} | null;
