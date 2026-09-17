import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronRight,
  Plus,
  AlignJustify,
  Check,
  FolderOpen,
  SearchX,
  MoreVertical,
} from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../Button';
import { SplitButton } from '../SplitButton';
import { Input } from '../Input/Input.component';
import { Select } from '../Select/Select.component';
import { Combobox } from '../Combobox';
import { SegmentedControl } from '../SegmentedControl';
import { Checkbox } from '../Checkbox/Checkbox.component';
import { Spinner } from '../Spinner/Spinner.component';
import { Pagination } from '../Pagination';
import { EmptyState } from '../EmptyState';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import type { MenuItemType } from '../Menu';
import { TableFiltersDropdown } from '../Table/TableFiltersDropdown.component';
import type { FilterValue, TableColumn, TableFilters } from '../Table/Table.types';
import type {
  DataGridProps,
  DataGridActionsColumn,
  DataGridCellType,
  DataGridFilterField,
  DataGridQuickFilter,
  DataGridSelectOption,
  EditingCell,
} from './DataGrid.types';
import { renderIcon, devWarn } from '../../utils';
import type { RowKey } from '../../utils';
import './DataGrid.scss';

// Minimum usable widths (px) per column, summed into the automatic card-view
// threshold so a grid with many columns doesn't have to overflow horizontally
// before `cardViewBreakpoint` (a single, hand-tuned number) is reached. See
// `isCardView` below.
//
// The system columns and the actions column are counted at their real, fixed
// width rather than as a full data column: they never grow, so charging them
// 100px each overstated the grid's minimum and flipped grids into card view
// while they still had room to spare. Keep in sync with DataGrid.scss (and
// with Table's own copy of these, which must agree for the two siblings to
// switch over at the same point).
const MIN_DATA_COLUMN_WIDTH_PX = 100;
const ACTIONS_COLUMN_WIDTH_PX = 48;
const CHECKBOX_COLUMN_WIDTH_PX = 40;
const ROW_NUMBER_COLUMN_WIDTH_PX = 40;
const DRAG_HANDLE_COLUMN_WIDTH_PX = 32;
const EXPAND_COLUMN_WIDTH_PX = 32;

// Container width (px) below which the toolbar's own buttons drop their labels
// and render icon-only (with tooltips), and quick filters stretch to one per
// row. Measured off the container, not the viewport, so a grid in a narrow pane
// compacts too.
//
// Compaction only ever applies to what this component renders itself. A
// consumer's `bulkActions` are rendered exactly as given and rely on the
// toolbar wrapping instead - which is the part that actually guarantees
// nothing overlaps, since arbitrary content can always be wider than any
// threshold. Same value in Table.
const COMPACT_TOOLBAR_WIDTH_PX = 560;

// ─────────────────────────────────────────────────────────────────────────────
// Internal column + row access
//
// The public `DataGridColumn<T>` is a discriminated union, which is what lets
// a consumer's `key` be checked against `keyof T` and gives `renderCell` /
// `renderEditor` / `validate` the field's own value type instead of `unknown`.
//
// Internally the grid walks `columns` generically: it probes members that
// exist on only one variant (`validate` on value columns, `actions` on the
// actions column) and looks row fields up by a runtime string key. Narrowing
// the union at each of those ~30 sites would add a lot of noise for no added
// safety - the union is enforced where it matters, at the consumer's call
// site - so the grid widens it once, here, and the render code below is
// unchanged from when `DataGridColumn` was a single flat interface.
// ─────────────────────────────────────────────────────────────────────────────
type InternalColumn<T extends object> = Omit<DataGridActionsColumn<T>, 'type' | 'key'> & {
  /**
   * Widened to a required plain string. Only the actions variant may omit
   * `key`, and it never reaches a path that consumes one: it renders in its
   * own dedicated slot with a hard-coded `data-col-key="__actions__"`, and is
   * filtered out of `dataColumns` / `sortedColumns`.
   */
  key: string;
  type?: DataGridCellType;
  editable?: boolean;
  required?: boolean;
  options?: DataGridSelectOption[];
  validate?: (value: unknown) => string | true;
  renderCell?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  renderEditor?: (value: unknown, onChange: (v: unknown) => void, row: T) => React.ReactNode;
};

/** Reads a row field by a runtime string key - see `InternalColumn` above. */
const cellOf = <T extends object>(row: T, key: string): unknown =>
  (row as Record<string, unknown>)[key];

// Value of the reset ("All") segment a quick filter's SegmentedControl always
// prepends - a SegmentedControl has no empty state of its own, so it needs an
// explicit segment standing for "no filter".
const QUICK_FILTER_RESET_VALUE = '';

// Whether a filter value is meaningful enough to keep in the filter state.
// Empty values are *deleted* from it rather than stored as '' / [], so the
// key count stays an accurate "are any filters active?" signal - that's what
// drives the "No results found" empty state and the dropdown's active
// indicator.
const hasFilterValue = (value: FilterValue): boolean => {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && 'start' in value) return !!(value.start || value.end);
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// SortableTableRow - wraps a <tr> with dnd-kit sortable behaviour.
//
// Render-prop pattern: passes `dragHandleProps` down to whichever child element
// should be the drag handle (typically the grip icon's <span>), so the <tr>
// itself owns the DOM ref + layout-transform while the handle owns the listeners.
// Pass `disabled={true}` when draggableRows is off - useSortable is always
// called unconditionally to satisfy the Rules of Hooks.
// ─────────────────────────────────────────────────────────────────────────────
function SortableTableRow({
  id,
  disabled,
  className,
  children,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  children: (dragHandleProps: object, isDragging: boolean) => React.ReactNode;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <tr
      ref={setNodeRef}
      className={[className, isDragging ? 'eidos-datagrid-row--dragging' : '']
        .filter(Boolean)
        .join(' ')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
    >
      {children(listeners ?? {}, isDragging)}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useExpandAnimation - drives a row's expanded-content open/close transition.
// Mirrors the max-height technique AccordionItem uses, so row expansion
// animates consistently with Accordion elsewhere in the library - but also
// keeps tracking the content's height for as long as the panel stays open
// (via ResizeObserver on the unclipped inner node), not just once at the
// moment it opens. Content whose height changes after opening - e.g. an
// async fetch resolving into more/less content than a loading placeholder -
// would otherwise stay clipped at whatever height was measured on open.
//
// Content stays mounted through the close animation (so it can transition
// shut instead of vanishing instantly), but is never mounted before the row
// is actually opened for the first time - so `renderExpandedContent` (which
// may kick off a data fetch) never runs for a row nobody has expanded.
//
// Must be called from its own per-row component (not inline in a .map()
// callback) so the number of hook calls stays constant across renders
// regardless of how many rows are currently displayed.
// ─────────────────────────────────────────────────────────────────────────────
function useExpandAnimation(isOpen: boolean): {
  mounted: boolean;
  maxHeight: number;
  outerRef: React.RefObject<HTMLDivElement | null>;
  innerRef: React.RefObject<HTMLDivElement | null>;
  handleTransitionEnd: () => void;
} {
  // outerRef: the clipped, max-height/overflow-hidden wrapper actually
  // animated - its own rendered height is pinned by `maxHeight` below, so it
  // can't be the thing observed for size changes (see innerRef).
  const outerRef = useRef<HTMLDivElement>(null);
  // innerRef: the unconstrained content itself - always laid out at its
  // natural height regardless of the outer wrapper's clipping, so its size
  // genuinely changes when its content does. That's what ResizeObserver
  // needs to be watching.
  const innerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [mounted, setMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    if (!isOpen) {
      setMaxHeight(0);
      return;
    }

    const node = innerRef.current;
    if (!node) return;

    const update = () => setMaxHeight(node.scrollHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen, mounted]);

  const handleTransitionEnd = useCallback(() => {
    if (!isOpen) setMounted(false);
  }, [isOpen]);

  return { mounted, maxHeight, outerRef, innerRef, handleTransitionEnd };
}

// Table mode: one extra full-width <tr> rendered directly after an expanded
// row - see `expandable`/`renderExpandedContent` on DataGridProps.
function ExpandedTableRow({
  isOpen,
  colSpan,
  render,
}: {
  isOpen: boolean;
  colSpan: number;
  render: () => React.ReactNode;
}): React.ReactElement | null {
  const { mounted, maxHeight, outerRef, innerRef, handleTransitionEnd } =
    useExpandAnimation(isOpen);
  if (!mounted) return null;

  return (
    <tr className="eidos-datagrid-expanded-row">
      <td colSpan={colSpan} className="eidos-datagrid-expanded-cell">
        <div
          ref={outerRef}
          className="eidos-datagrid-expand-panel"
          style={{ maxHeight: `${maxHeight}px` }}
          onTransitionEnd={handleTransitionEnd}
        >
          <div ref={innerRef} className="eidos-datagrid-expand-panel-inner">
            {render()}
          </div>
        </div>
      </td>
    </tr>
  );
}

// Card mode: the same animated panel, appended inside the card itself below
// its fields.
function ExpandedCardPanel({
  isOpen,
  render,
}: {
  isOpen: boolean;
  render: () => React.ReactNode;
}): React.ReactElement | null {
  const { mounted, maxHeight, outerRef, innerRef, handleTransitionEnd } =
    useExpandAnimation(isOpen);
  if (!mounted) return null;

  return (
    <div
      ref={outerRef}
      className="eidos-datagrid-expand-panel"
      style={{ maxHeight: `${maxHeight}px` }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={innerRef} className="eidos-datagrid-expand-panel-inner">
        {render()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner implementation (generic function so we can assign .displayName cleanly)
// ─────────────────────────────────────────────────────────────────────────────
function DataGridInner<T extends object>({
  // ── Existing props ─────────────────────────────────────────────────────────
  columns: columnsProp,
  data,
  rowKey,
  onChange,
  onRowAdd,
  editable = false,
  loading = false,
  emptyText = 'No data available',
  className,
  stickyHeader = false,
  maxHeight,
  showRowNumbers = false,
  draggableRows = false,
  onRowReorder,
  // ── Sorting ────────────────────────────────────────────────────────────────
  currentSort,
  onSortChange,
  // ── Filtering ──────────────────────────────────────────────────────────────
  showFilters = false,
  filterConfig = [],
  filters,
  onFiltersChange,
  // ── Quick filters ──────────────────────────────────────────────────────────
  quickFilters = [],
  // ── Pagination ─────────────────────────────────────────────────────────────
  showPagination = false,
  pageSize = 10,
  pageSizeOptions,
  totalRows: totalRowsProp,
  onPageChange,
  // ── Row selection + bulk actions ───────────────────────────────────────────
  selectable = false,
  selectedRows: controlledSelectedRows,
  defaultSelectedRows,
  onSelectionChange,
  selectAllScope = 'all',
  onSelectAllMatching,
  bulkActions,
  // ── Row expansion ────────────────────────────────────────────────────────────
  expandable = false,
  renderExpandedContent,
  isRowExpandable,
  expandMultiple = true,
  expandedRows: controlledExpandedRows,
  defaultExpandedRows,
  onExpandedRowsChange,
  // ── Display ────────────────────────────────────────────────────────────────
  density = 'comfortable',
  showDensity = false,
  // ── Card view ────────────────────────────────────────────────────────────────
  hasCardView = true,
  cardViewBreakpoint = 640,
  cardMinWidth = 280,
}: DataGridProps<T>): React.ReactElement {
  // See `InternalColumn` above - a cast, not a copy, so the identity
  // comparisons below (`c !== actionsColumn`) still hold.
  const columns = columnsProp as InternalColumn<T>[];
  // `rowKey` is `RowKey<T>` publicly, so the `'id'` default can't live in the
  // destructuring: `'id'` isn't a field of every `T`.
  const rowKeyField: string = rowKey ?? 'id';
  // ── State + paired refs (editing - preserved exactly) ─────────────────────
  // We keep a ref alongside each piece of mutable state so that event
  // handlers registered in effects can always read the *latest* value without
  // stale-closure bugs, while the state variables drive re-renders normally.

  const [localData, _setLocalData] = useState<T[]>(data);
  const localDataRef = useRef<T[]>(data);

  const [editingCell, _setEditingCell] = useState<EditingCell>(null);
  const editingCellRef = useRef<EditingCell>(null);

  const [editValue, _setEditValue] = useState<unknown>(null);
  const editValueRef = useRef<unknown>(null);

  const [editError, setEditError] = useState<string | null>(null);

  // ── Validation error tooltip (portaled) ─────────────────────────────────────
  // Positioned via a portal into document.body rather than `position: absolute`
  // inside the cell - a cell on the last visible row would otherwise place the
  // tooltip past the scroll container's bottom edge, which still counts toward
  // that container's scrollable content size and forces an unwanted scrollbar
  // just to reveal a tooltip nobody asked to scroll to. Portaling escapes the
  // scroll container's box entirely, the same way Dropdown's own content does.
  // HTMLElement (not HTMLTableCellElement) so the same ref can anchor either
  // a <td> in table mode or a card field <div> in card view - only
  // `getBoundingClientRect()` is ever called on it.
  const errorTooltipAnchorRef = useRef<HTMLElement | null>(null);
  const [errorTooltipPosition, setErrorTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const activeCellError = editingCell && editError ? editError : null;

  useLayoutEffect(() => {
    if (!activeCellError) {
      setErrorTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const node = errorTooltipAnchorRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setErrorTooltipPosition({ top: rect.bottom + 4, left: rect.left });
    };

    updatePosition();

    // Capture phase catches scroll events from any scrollable ancestor
    // (e.g. this grid's own scroll container), not just window/document -
    // `scroll` doesn't bubble, so a plain (bubble-phase) listener on window
    // would miss it entirely.
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeCellError]);

  // ── New state ──────────────────────────────────────────────────────────────
  // Density (internal when showDensity=true, otherwise respects the prop)
  const [internalDensity, setInternalDensity] = useState<'compact' | 'comfortable' | 'spacious'>(
    density,
  );
  const effectiveDensity = showDensity ? internalDensity : density;

  // Sorting (client-side internal state)
  const [internalSort, setInternalSort] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filtering (client-side internal state), seeded from any quick filter
  // `defaultValue`s. Lazy, so it only reads `quickFilters` on mount - later
  // edits to the array's default values don't yank a filter the user has
  // since changed. In server-side mode this state is unused entirely, which
  // is why `defaultValue` is documented as client-side only.
  const [internalFilters, setInternalFilters] = useState<TableFilters>(() => {
    const seeded: TableFilters = {};
    quickFilters.forEach(({ key, defaultValue }) => {
      if (hasFilterValue(defaultValue)) seeded[key] = defaultValue;
    });
    return seeded;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Selection
  const isControlledSelection = controlledSelectedRows !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(
    () => new Set(defaultSelectedRows ?? []),
  );

  // Row expansion
  const isControlledExpansion = controlledExpandedRows !== undefined;
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(
    () => new Set(defaultExpandedRows ?? []),
  );

  // Card view: measured off the grid's own container width (not the
  // viewport) via ResizeObserver, so it responds correctly even when the
  // grid sits in a narrow sidebar/split-pane on an otherwise wide screen.
  // Starts `null` (unmeasured) rather than 0, so the table is what renders
  // for one frame on mount instead of briefly flashing cards.
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // A callback ref (not `useRef` + a `useLayoutEffect` keyed on `hasCardView`)
  // so this fires whenever the container DOM node actually becomes
  // available, not just when `hasCardView` changes. A plain effect only
  // reruns on its own dependency changing - it does NOT rerun just because
  // a *different* conditional branch attaches the ref for the first time.
  // The `loading` early-return below renders its own container div; any
  // consumer whose `loading` prop starts `true` on mount (e.g. fetching
  // data asynchronously, so it can never resolve before the first render)
  // would mount that div first, find `containerRef.current` still null, and
  // then never re-run the effect once `loading` flips to `false` and the
  // real container mounts - `hasCardView` itself never changed, so nothing
  // triggered a re-run, leaving `containerWidth` (and therefore card view)
  // permanently stuck. A callback ref sidesteps that entirely: whichever
  // container div actually mounts, this runs for it.
  // Deliberately NOT gated on `hasCardView`: the same measurement also drives
  // `isCompactToolbar` below, which a grid with `hasCardView={false}` still
  // needs - it has a toolbar to fit into a narrow container either way.
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;

    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setContainerWidth(width);
    });
    observer.observe(el);
    resizeObserverRef.current = observer;
  }, []);
  // Narrowest width the grid can render at without overflowing: the sum of
  // every column's own minimum (see the constants above). Computed directly
  // from props, so it's available here without waiting on the `dataColumns`/
  // `actionsColumn` memos below - `columns` already includes the actions
  // column if any, matching how `totalCols` is derived further down.
  const minTableWidth = useMemo(
    () =>
      columns.reduce(
        (total, column) =>
          total + (column.type === 'actions' ? ACTIONS_COLUMN_WIDTH_PX : MIN_DATA_COLUMN_WIDTH_PX),
        (showRowNumbers ? ROW_NUMBER_COLUMN_WIDTH_PX : 0) +
          (draggableRows ? DRAG_HANDLE_COLUMN_WIDTH_PX : 0) +
          (selectable ? CHECKBOX_COLUMN_WIDTH_PX : 0) +
          (expandable ? EXPAND_COLUMN_WIDTH_PX : 0),
      ),
    [columns, showRowNumbers, draggableRows, selectable, expandable],
  );

  // Card view kicks in below the explicit `cardViewBreakpoint` OR once the
  // container is too narrow to fit the grid at that minimum - the latter
  // means a wide/many-column grid auto-switches without the consumer having
  // to hand-calculate a breakpoint for it.
  const isCardView =
    hasCardView &&
    containerWidth !== null &&
    (containerWidth < cardViewBreakpoint || containerWidth < minTableWidth);

  // Independent of card view on purpose: card view can also trigger on column
  // count in a container that's still plenty wide for labelled buttons, and a
  // `hasCardView={false}` grid still needs its toolbar to fit.
  const isCompactToolbar = containerWidth !== null && containerWidth < COMPACT_TOOLBAR_WIDTH_PX;

  // Card view header/subheader: only the first matching column is honored
  // (see DataGridColumn.cardHeader/cardSubheader).
  const cardHeaderColumn = useMemo(() => columns.find((c) => c.cardHeader), [columns]);
  const cardSubheaderColumn = useMemo(() => columns.find((c) => c.cardSubheader), [columns]);
  // The row-actions column, if any - only the first `type: 'actions'` column
  // is honored (see DataGridColumn.actions). Rendered in its own dedicated
  // slot (far right in table mode, top-right of the card in card view),
  // never as a normal data column.
  const actionsColumn = useMemo(() => columns.find((c) => c.type === 'actions'), [columns]);
  // Every column that actually renders as data - excludes the actions
  // column entirely (it's never a normal cell) from both table columns and
  // pinning/filtering/validation logic.
  const dataColumns = useMemo(
    () => columns.filter((c) => c !== actionsColumn),
    [columns, actionsColumn],
  );
  // A card with no system controls, no heading and no actions column has
  // nothing to put in its top bar - rendering it anyway leaves a dead strip
  // and a divider above the first field. Table applies the same guard.
  const hasCardToolbar =
    selectable ||
    showRowNumbers ||
    expandable ||
    !!cardHeaderColumn ||
    !!cardSubheaderColumn ||
    !!actionsColumn;

  // Remaining columns render as label:value field rows, in declaration order.
  const cardFieldColumns = useMemo(
    () => dataColumns.filter((c) => c !== cardHeaderColumn && c !== cardSubheaderColumn),
    [dataColumns, cardHeaderColumn, cardSubheaderColumn],
  );

  // Pinned columns offset map (computed in useLayoutEffect)
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [pinnedOffsets, setPinnedOffsets] = useState<
    Map<string, { side: 'left' | 'right'; offset: number }>
  >(new Map());

  // ── Synced setters (preserved exactly) ────────────────────────────────────
  const setLocalData = useCallback((v: T[]) => {
    localDataRef.current = v;
    _setLocalData(v);
  }, []);

  const setEditingCell = useCallback((v: EditingCell) => {
    editingCellRef.current = v;
    _setEditingCell(v);
  }, []);

  const setEditValue = useCallback((v: unknown) => {
    editValueRef.current = v;
    _setEditValue(v);
  }, []);

  // ── Sync when the data prop changes externally (preserved) ─────────────────
  useEffect(() => {
    setLocalData(data);
  }, [data, setLocalData]);

  // ── Active sort / filters (derived) ───────────────────────────────────────
  // Server-side sort: caller controls currentSort + onSortChange.
  // Client-side sort: we manage internalSort.
  const activeSort = currentSort ?? internalSort;

  // Server-side filter: caller controls filters + onFiltersChange.
  // Client-side filter: we manage internalFilters.
  const activeFilters: TableFilters = useMemo(
    () => (onFiltersChange ? (filters ?? {}) : internalFilters),
    [onFiltersChange, filters, internalFilters],
  );

  // ── Selection derived state ────────────────────────────────────────────────
  const selectedSet = useMemo(
    () =>
      new Set(isControlledSelection ? (controlledSelectedRows ?? []) : [...internalSelectedKeys]),
    [isControlledSelection, controlledSelectedRows, internalSelectedKeys],
  );

  const hasSelection = selectedSet.size > 0;

  // Row objects for selected keys, kept across changes to `data`. Filtering
  // the current rows alone silently handed `bulkActions` and
  // `onSelectionChange` fewer rows than the selection count claimed - and
  // under server-side pagination, none at all once the user paged away from
  // everything they had selected. Always prefers the row currently in `data`
  // over the cached copy, so an edited row is never stale.
  const selectedRowCacheRef = useRef(new Map<string, T>());

  const rowsForKeys = useCallback(
    (keys: string[]): T[] => {
      const current = new Map<string, T>();
      localDataRef.current.forEach((row, idx) =>
        current.set(String(cellOf(row, rowKeyField) ?? idx), row),
      );
      const cache = selectedRowCacheRef.current;
      return keys
        .map((key) => current.get(key) ?? cache.get(key))
        .filter((row): row is T => row !== undefined);
    },
    [rowKeyField],
  );

  // Prunes as well as fills: an entry only survives while its key is still
  // selected, so the cache can't grow without bound.
  useEffect(() => {
    const cache = selectedRowCacheRef.current;
    const current = new Map<string, T>();
    localData.forEach((row, idx) => current.set(String(cellOf(row, rowKeyField) ?? idx), row));
    const next = new Map<string, T>();
    selectedSet.forEach((key) => {
      const row = current.get(key) ?? cache.get(key);
      if (row) next.set(key, row);
    });
    selectedRowCacheRef.current = next;
  }, [localData, selectedSet, rowKeyField]);

  const selectedItems = useMemo(
    () => rowsForKeys([...selectedSet]),
    // `localData` isn't read directly here - `rowsForKeys` reads it through a
    // ref - but it must still retrigger this when the loaded rows change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowsForKeys, selectedSet, localData],
  );

  // ── Row expansion derived state ─────────────────────────────────────────────
  const expandedSet = useMemo(
    () =>
      new Set(isControlledExpansion ? (controlledExpandedRows ?? []) : [...internalExpandedKeys]),
    [isControlledExpansion, controlledExpandedRows, internalExpandedKeys],
  );

  // ── Quick filters: key ownership ───────────────────────────────────────────
  // Quick filters and the filter dropdown share one TableFilters object, so
  // each side has to own a disjoint set of keys - see `dropdownFilters` below
  // for why the dropdown can't just be handed the whole thing.
  const quickFilterKeys = useMemo(() => new Set(quickFilters.map((f) => f.key)), [quickFilters]);

  // ── Filter dropdown adapter: DataGridFilterField → TableColumn ─────────────
  // TableFiltersDropdown expects TableColumn<T>[]; we project our (decoupled,
  // column-independent) filter schema onto that shape. A key already claimed
  // by a quick filter is dropped: the quick filter is the always-visible
  // control, and two controls writing one key would each clobber the other.
  const filterDropdownColumns = useMemo((): TableColumn<T>[] => {
    return filterConfig
      .filter((field) => !quickFilterKeys.has(field.key))
      .map(
        (field: DataGridFilterField<T>) =>
          ({
            key: field.key,
            label: field.label,
            filterable: true,
            filterType: field.filterType,
            filterOptions: field.filterOptions,
            dateFilterMode: field.dateFilterMode,
          }) as TableColumn<T>,
      );
  }, [filterConfig, quickFilterKeys]);

  const dropdownFilterKeys = useMemo(
    () => new Set(filterDropdownColumns.map((col) => String(col.key))),
    [filterDropdownColumns],
  );

  // The dropdown gets only the keys it owns, never the whole filter object.
  // It mirrors every key it's handed into a filter row, so a key it has no
  // matching column for (a quick filter's, or a server-side caller's filter
  // on an unlisted field) would render as a blank, un-removable "Select
  // column" row - and its Apply, which emits its complete set, would drop
  // that value on the floor.
  const dropdownFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(activeFilters).filter(([key]) => dropdownFilterKeys.has(key)),
      ),
    [activeFilters, dropdownFilterKeys],
  );

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    // Server-side mode: parent is responsible for filtering; use data as-is.
    if (onFiltersChange) return localData;

    const filterEntries = Object.entries(activeFilters).filter(([, val]) => {
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

    if (filterEntries.length === 0) return localData;

    return localData.filter((row) =>
      filterEntries.every(([key, filterValue]) => {
        const cellValue = cellOf(row, key);

        if (Array.isArray(filterValue)) {
          return filterValue.includes(String(cellValue ?? ''));
        }
        if (typeof filterValue === 'boolean') {
          return Boolean(cellValue) === filterValue;
        }
        if (typeof filterValue === 'object' && filterValue !== null && 'start' in filterValue) {
          const { start, end } = filterValue as { start: string | null; end: string | null };
          const dateStr = String(cellValue ?? '');
          if (start && dateStr < start) return false;
          if (end && dateStr > end) return false;
          return true;
        }
        // Default: case-insensitive text contains
        return String(cellValue ?? '')
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      }),
    );
  }, [localData, activeFilters, onFiltersChange]);

  // ── Client-side sorting ────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    // Server-side mode or no active sort: use data as-is.
    if (onSortChange || !activeSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = cellOf(a, activeSort.key);
      const bVal = cellOf(b, activeSort.key);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const compare =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));

      return activeSort.direction === 'asc' ? compare : -compare;
    });
  }, [filteredData, activeSort, onSortChange]);

  // ── Client-side pagination ─────────────────────────────────────────────────
  const displayData = useMemo(() => {
    if (!showPagination) return sortedData;
    if (onPageChange) return sortedData; // Server-side: parent slices the data
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, showPagination, currentPage, currentPageSize, onPageChange]);

  const totalItemCount = totalRowsProp ?? sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItemCount / currentPageSize));

  // ── Select-all (scope-aware) ──────────────────────────────────────────────
  // Defined after `displayData` because `'page'` scope is exactly that set.
  const selectAllKeys = useMemo(
    () =>
      (selectAllScope === 'page' ? displayData : localData).map((row, idx) =>
        String(cellOf(row, rowKeyField) ?? idx),
      ),
    [selectAllScope, displayData, localData, rowKeyField],
  );

  const allSelected =
    selectAllKeys.length > 0 && selectAllKeys.every((key) => selectedSet.has(key));
  const someSelected = !allSelected && selectAllKeys.some((key) => selectedSet.has(key));

  // `'all'` can only ever select the rows the grid holds. With server-side
  // pagination that's one page, and the keys of rows it has never received
  // are unknowable here - warn rather than quietly selecting a page and
  // calling it "all".
  useEffect(() => {
    if (!selectable || selectAllScope !== 'all') return;
    if (totalItemCount <= localData.length) return;
    devWarn(
      `datagrid-select-all-scope:${localData.length}/${totalItemCount}`,
      `DataGrid: selectAllScope="all" can only select the ${localData.length} row(s) currently ` +
        `loaded, but there are ${totalItemCount} in total. The keys of rows the grid has never ` +
        `received cannot be known here - use selectAllScope="page" to make the scope explicit, ` +
        'or resolve the full key set yourself and pass it as `selectedRows`.',
    );
  }, [selectable, selectAllScope, totalItemCount, localData.length]);

  // Reset to page 1 when filters change (client-side and server-side).
  // Depend on the serialized *value* of activeFilters, not the object
  // reference: in server-side mode activeFilters is derived straight from
  // the caller's `filters` prop, and callers commonly build that object
  // inline in render (a new reference every render) whether or not its
  // contents actually changed. Comparing by reference made this effect -
  // and the page reset it causes - fire on every unrelated parent
  // re-render (e.g. new page data arriving), not just on real filter
  // changes.
  const activeFiltersKey = useMemo(() => JSON.stringify(activeFilters), [activeFilters]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFiltersKey]);

  // Reset to page 1 when client-side sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [internalSort]);

  // ── Pinned columns: measure th widths and compute sticky offsets ───────────
  // Mirrors the exact pattern used in Table.component.tsx.
  // System columns (sel, drag, rownum, actions) contribute to the offset
  // accumulator but are not themselves sticky-positioned.
  useLayoutEffect(() => {
    const hasPinned = columns.some((c) => c.pin);
    if (!hasPinned || !theadRef.current) {
      setPinnedOffsets((prev) => (prev.size > 0 ? new Map() : prev));
      return;
    }

    const headerRow = theadRef.current.querySelector('tr');
    if (!headerRow) return;

    const cells = Array.from(headerRow.querySelectorAll<HTMLTableCellElement>('th[data-col-key]'));
    const newOffsets = new Map<string, { side: 'left' | 'right'; offset: number }>();

    // Left-pinned: scan left-to-right
    // When any data column is pin:'left', auto-pin the system columns too so
    // the entire frozen-left group moves as a coherent unit.
    const hasLeftPin = columns.some((c) => c.pin === 'left');
    let leftAccum = 0;
    for (const cell of cells) {
      const key = cell.dataset.colKey!;
      if (key === '__expand__' || key === '__sel__' || key === '__drag__' || key === '__rownum__') {
        if (hasLeftPin) {
          newOffsets.set(key, { side: 'left', offset: leftAccum });
        }
        leftAccum += cell.offsetWidth;
      } else {
        const col = columns.find((c) => c.key === key);
        if (col?.pin === 'left') {
          newOffsets.set(key, { side: 'left', offset: leftAccum });
          leftAccum += cell.offsetWidth;
        }
      }
    }

    // Right-pinned: scan right-to-left
    let rightAccum = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i];
      const key = cell.dataset.colKey!;
      if (key === '__actions__') {
        rightAccum += cell.offsetWidth;
      } else {
        const col = columns.find((c) => c.key === key);
        if (col?.pin === 'right') {
          newOffsets.set(key, { side: 'right', offset: rightAccum });
          rightAccum += cell.offsetWidth;
        }
      }
    }

    setPinnedOffsets(newOffsets);
  }, [columns, selectable, draggableRows, showRowNumbers, expandable]);

  // ── Sticky-column helpers ──────────────────────────────────────────────────
  const getCellPinnedProps = useCallback(
    (colKey: string): { style: React.CSSProperties; className: string } => {
      const info = pinnedOffsets.get(colKey);
      if (!info) return { style: {}, className: '' };
      return {
        style: { position: 'sticky', [info.side]: info.offset, zIndex: 1 },
        className:
          info.side === 'left'
            ? 'eidos-datagrid-cell--pinned-left'
            : 'eidos-datagrid-cell--pinned-right',
      };
    },
    [pinnedOffsets],
  );

  const getHeaderPinnedProps = useCallback(
    (colKey: string): { style: React.CSSProperties; className: string } => {
      const info = pinnedOffsets.get(colKey);
      if (!info) return { style: {}, className: '' };
      return {
        // z-index 3: above both body sticky cells (1) and non-sticky header (1 from SCSS)
        style: { position: 'sticky', [info.side]: info.offset, zIndex: 3 },
        className:
          info.side === 'left'
            ? 'eidos-datagrid-header-cell--pinned-left'
            : 'eidos-datagrid-header-cell--pinned-right',
      };
    },
    [pinnedOffsets],
  );

  // ── Editing helpers (preserved exactly) ────────────────────────────────────
  const isCellEditable = useCallback(
    (col: InternalColumn<T>): boolean => {
      if (!editable) return false;
      if (col.type === 'readonly' || col.type === 'actions') return false;
      if (col.editable === false) return false;
      return true;
    },
    [editable],
  );

  const validateCell = useCallback((col: InternalColumn<T>, value: unknown): string | null => {
    if (col.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }
    if (col.validate) {
      const result = col.validate(value);
      if (result !== true) return result as string;
    }
    return null;
  }, []);

  const cellErrorKey = (rowIndex: number, colKey: string) => `${rowIndex}:${colKey}`;

  // Cells with a validation error, keyed by `${rowIndex}:${colKey}` - derived
  // directly from the actual data rather than tracked as its own state, so a
  // cell that starts out invalid (e.g. seeded with an empty required field)
  // is flagged immediately on render instead of only after the user has
  // focused and committed it at least once. Recomputes whenever the data
  // actually changes, which already covers every case that needs it: typing
  // a fix and committing, an external `data` prop update, a row being added,
  // etc. Painted as a background tint on every render (see
  // `eidos-data-grid-cell--has-error` below); the more prominent border +
  // text (`eidos-data-grid-cell--error`) only shows while that specific cell
  // is the one being edited, via `editError` (see `startEdit`).
  const cellErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    localData.forEach((row, rowIndex) => {
      for (const col of columns) {
        if (!isCellEditable(col)) continue;
        const error = validateCell(col, cellOf(row, col.key));
        if (error) errors[cellErrorKey(rowIndex, col.key)] = error;
      }
    });
    return errors;
  }, [localData, columns, isCellEditable, validateCell]);

  // ── Commit / discard ────────────────────────────────────────────────────────
  /**
   * Validates a cell's value and always persists it (even if invalid - see
   * `commitEdit` below for why). `cellErrors` above picks the result up
   * automatically once `localData` updates. Returns the validation error, if any.
   */
  const commitValue = useCallback(
    (rowIndex: number, colKey: string, value: unknown): string | null => {
      const col = columns.find((c) => c.key === colKey);
      if (!col) return null;

      const error = validateCell(col, value);

      const newData = localDataRef.current.map<T>((row, idx) =>
        idx === rowIndex ? ({ ...row, [colKey]: value } as T) : row,
      );
      setLocalData(newData);
      onChange?.(newData);

      return error;
    },
    [columns, onChange, setLocalData, validateCell],
  );

  /**
   * Commits the currently-editing cell and exits edit mode. Never blocks: an
   * invalid value is still saved and flagged via `cellErrors` (see above)
   * rather than trapping the user in the cell - a required field going empty
   * is exactly the case validation is there to catch and surface, not a
   * reason to freeze every other interaction with the grid until it's fixed.
   */
  const commitEdit = useCallback(() => {
    const cell = editingCellRef.current;
    if (!cell) return;

    const col = columns.find((c) => c.key === cell.colKey);
    if (!col) {
      setEditingCell(null);
      return;
    }

    commitValue(cell.rowIndex, cell.colKey, editValueRef.current);
    setEditingCell(null);
    setEditError(null);
  }, [columns, commitValue, setEditingCell]);

  const discardEdit = useCallback(() => {
    setEditingCell(null);
    setEditError(null);
  }, [setEditingCell]);

  // Keep a ref to the latest commit so the global handler never captures
  // a stale version, without having the effect re-run on every re-render.
  const commitEditRef = useRef(commitEdit);
  useEffect(() => {
    commitEditRef.current = commitEdit;
  }, [commitEdit]);

  // ── Global mousedown: commit on blur - i.e. any click that isn't on the
  // active editor itself ──────────────────────────────────────────────────
  // Using mousedown (fires before blur/click) lets us finalize the active
  // cell before a click elsewhere starts a new edit or does anything else.
  //
  // Deliberately NOT scoped to "outside the grid container" - a click on
  // another cell already commits via that cell's own `handleCellClick`
  // (which commits any in-flight edit before starting its own), but a grid
  // has plenty of space that isn't a cell at all: toolbar buttons, sort
  // headers, pagination, row actions, and - especially in card view - the
  // card's own padding, gaps, and labels. None of those have a handler that
  // commits the edit, so scoping this to "outside the grid" left the editor
  // stuck open for any click that landed inside the grid but outside an
  // actual cell. The only clicks that should NOT commit are ones still
  // interacting with the editor being edited (identified by its own
  // `--editing` class, shared by both the <td> and card versions) or its
  // portaled dropdown content (eidos-dropdown-content) - e.g. opening a
  // Select's own options list.
  useEffect(() => {
    if (!editingCell) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;

      if (
        target.closest?.(
          '.eidos-data-grid-cell--editing, .eidos-datagrid-card-value--editing, .eidos-dropdown-content',
        )
      ) {
        return;
      }

      commitEditRef.current();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [editingCell]);

  // ── Start editing ────────────────────────────────────────────────────────
  const startEdit = useCallback(
    (rowIndex: number, colKey: string, currentValue: unknown) => {
      const col = columns.find((c) => c.key === colKey);
      if (!col || !isCellEditable(col)) return;
      setEditingCell({ rowIndex, colKey });
      setEditValue(currentValue);
      // Re-focusing a cell that's already flagged shows its error
      // immediately, without needing to retype/re-trigger validation first.
      setEditError(cellErrors[cellErrorKey(rowIndex, colKey)] ?? null);
    },
    [columns, isCellEditable, setEditingCell, setEditValue, cellErrors],
  );

  // ── Cell click handler (preserved) ─────────────────────────────────────────
  const handleCellClick = useCallback(
    (rowIndex: number, col: InternalColumn<T>) => {
      const row = localDataRef.current[rowIndex];
      const value = row === undefined ? undefined : cellOf(row, col.key);

      // Checkbox cells: toggle immediately - no "edit mode" UI needed
      if (col.type === 'checkbox') {
        if (!editable || col.editable === false) return;
        const newData = localDataRef.current.map<T>((row, idx) =>
          idx === rowIndex ? ({ ...row, [col.key]: !value } as T) : row,
        );
        setLocalData(newData);
        onChange?.(newData);
        return;
      }

      if (!isCellEditable(col)) return;

      // Already editing this exact cell - do nothing
      const cell = editingCellRef.current;
      if (cell?.rowIndex === rowIndex && cell?.colKey === col.key) return;

      // Commit any in-flight edit first - never blocks navigation, see commitEdit.
      if (cell) commitEdit();

      startEdit(rowIndex, col.key, value);
    },
    [editable, isCellEditable, commitEdit, startEdit, setLocalData, onChange],
  );

  // ── Keyboard navigation inside an editing cell (preserved) ─────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, colKey: string) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        discardEdit();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();

        // Flat list of editable cells in DOM order (over the full dataset)
        const editableCells: Array<{ rowIndex: number; colKey: string }> = [];
        for (let ri = 0; ri < localDataRef.current.length; ri++) {
          for (const c of columns) {
            if (isCellEditable(c)) {
              editableCells.push({ rowIndex: ri, colKey: c.key });
            }
          }
        }

        const idx = editableCells.findIndex((c) => c.rowIndex === rowIndex && c.colKey === colKey);
        const next = e.shiftKey ? editableCells[idx - 1] : editableCells[idx + 1];

        // Commit the current cell - never blocks navigation, see commitEdit.
        commitValue(rowIndex, colKey, editValueRef.current);

        if (next) {
          setEditingCell(next);
          setEditValue(cellOf(localDataRef.current[next.rowIndex], next.colKey));
          setEditError(cellErrors[cellErrorKey(next.rowIndex, next.colKey)] ?? null);
        } else {
          setEditingCell(null);
          setEditError(null);
        }
      }
    },
    [
      columns,
      isCellEditable,
      commitEdit,
      commitValue,
      discardEdit,
      cellErrors,
      setEditingCell,
      setEditValue,
    ],
  );

  const handleRowAdd = useCallback(() => {
    if (!onRowAdd) return;
    const newRow = onRowAdd();
    const newData = [newRow, ...localDataRef.current];
    setLocalData(newData);
    onChange?.(newData);
    setCurrentPage(1);
  }, [onRowAdd, onChange, setLocalData]);

  // ── Selection handlers ──────────────────────────────────────────────────────
  const commitSelection = useCallback(
    (keys: string[]) => {
      if (!isControlledSelection) setInternalSelectedKeys(new Set(keys));
      onSelectionChange?.(keys, rowsForKeys(keys));
    },
    [isControlledSelection, onSelectionChange, rowsForKeys],
  );

  const toggleRow = useCallback(
    (key: string) => {
      const next = selectedSet.has(key)
        ? [...selectedSet].filter((k) => k !== key)
        : [...selectedSet, key];
      commitSelection(next);
    },
    [selectedSet, commitSelection],
  );

  // ── "Select all N matching" (see `onSelectAllMatching`) ───────────────────
  // The grid can only enumerate the keys it has been given, so selecting
  // everything behind a server-side query has to come from the caller.
  const [isSelectingAllMatching, setIsSelectingAllMatching] = useState(false);

  const holdsEveryRow = totalItemCount <= localData.length;
  const hasSelectedAllMatching = !holdsEveryRow && selectedSet.size >= totalItemCount;
  // Offered once everything the grid holds is selected, so the select-all
  // checkbox has nothing left to give - but not once every matching row is
  // already selected, where it would be a no-op sitting next to "Clear
  // selection".
  const canSelectAllMatching =
    !!onSelectAllMatching && selectable && !holdsEveryRow && allSelected && !hasSelectedAllMatching;

  const selectAllMatching = useCallback(async () => {
    if (!onSelectAllMatching) return;
    setIsSelectingAllMatching(true);
    try {
      // Replaces rather than merges: the caller is returning the full
      // matching set, so anything not in it is by definition not a match.
      commitSelection(await onSelectAllMatching());
    } catch (error) {
      devWarn(
        'datagrid-select-all-matching-failed',
        `DataGrid: onSelectAllMatching() rejected, so the selection was left untouched. ${String(error)}`,
      );
    } finally {
      setIsSelectingAllMatching(false);
    }
  }, [onSelectAllMatching, commitSelection]);

  // Adds or removes only the keys in scope, so a selection made on another
  // page (or outside `'page'` scope) is never silently dropped by toggling
  // the select-all control.
  const toggleAll = useCallback(() => {
    const inScope = new Set(selectAllKeys);
    commitSelection(
      allSelected
        ? [...selectedSet].filter((key) => !inScope.has(key))
        : [...new Set([...selectedSet, ...selectAllKeys])],
    );
  }, [allSelected, selectAllKeys, selectedSet, commitSelection]);

  // Only reachable from the "all N matching" state below - the select-all
  // checkbox is what clears an ordinary selection.
  const clearSelection = useCallback(() => commitSelection([]), [commitSelection]);

  // ── Row expansion handlers ───────────────────────────────────────────────────
  const commitExpanded = useCallback(
    (keys: string[]) => {
      if (!isControlledExpansion) setInternalExpandedKeys(new Set(keys));
      onExpandedRowsChange?.(keys);
    },
    [isControlledExpansion, onExpandedRowsChange],
  );

  const toggleExpanded = useCallback(
    (key: string) => {
      const isOpen = expandedSet.has(key);
      const next = expandMultiple
        ? isOpen
          ? [...expandedSet].filter((k) => k !== key)
          : [...expandedSet, key]
        : isOpen
          ? []
          : [key];
      commitExpanded(next);
    },
    [expandedSet, expandMultiple, commitExpanded],
  );

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSortClick = useCallback(
    (colKey: string) => {
      if (onSortChange) {
        // Server-side: delegate to parent
        const newDir =
          currentSort?.key === colKey && currentSort?.direction === 'asc' ? 'desc' : 'asc';
        // `colKey` came from a rendered column, so it is a field of `T` by
        // construction - the public callback is narrowed for the caller's
        // benefit, which this internal string can't prove on its own.
        onSortChange(colKey as RowKey<T>, newDir);
      } else {
        // Client-side: cycle asc → desc → unsorted (null)
        setInternalSort((prev) => {
          if (prev?.key === colKey) {
            return prev.direction === 'asc' ? { key: colKey, direction: 'desc' } : null;
          }
          return { key: colKey, direction: 'asc' };
        });
      }
    },
    [onSortChange, currentSort],
  );

  // ── Filter handlers ──────────────────────────────────────────────────────────
  const commitFilters = useCallback(
    (newFilters: TableFilters) => {
      setCurrentPage(1);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      } else {
        setInternalFilters(newFilters);
      }
    },
    [onFiltersChange],
  );

  // The dropdown's writer. It emits its complete cleaned set, covering only
  // the keys it owns, so everything else in the filter state - quick filters
  // included - has to be merged back in rather than replaced. This is also
  // what makes its "Clear All" clear only the dropdown's own filters.
  const handleFiltersChange = useCallback(
    (newFilters: TableFilters) => {
      const preserved = Object.entries(activeFilters).filter(
        ([key]) => !dropdownFilterKeys.has(key),
      );
      commitFilters({ ...Object.fromEntries(preserved), ...newFilters });
    },
    [activeFilters, dropdownFilterKeys, commitFilters],
  );

  // A quick filter's writer. Empty values delete the key instead of storing
  // '' / [] - see `hasFilterValue`.
  const handleQuickFilterChange = useCallback(
    (key: string, value: FilterValue) => {
      const next = { ...activeFilters };
      if (hasFilterValue(value)) {
        next[key] = value;
      } else {
        delete next[key];
      }
      commitFilters(next);
    },
    [activeFilters, commitFilters],
  );

  // Resets every filter, whichever control owns it - what the "no results"
  // empty state offers, unlike the dropdown's own scoped "Clear All".
  const clearAllFilters = useCallback(() => commitFilters({}), [commitFilters]);

  // ── Page handlers ────────────────────────────────────────────────────────────
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page, currentPageSize);
    },
    [currentPageSize, onPageChange],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1);
      onPageChange?.(1, newPageSize);
    },
    [onPageChange],
  );

  // ── dnd-kit: sensors + drag-end handler (preserved) ───────────────────────
  // Sensors are always initialised (hook rules) - PointerSensor's distance
  // constraint prevents accidental drags on normal cell clicks.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!draggableRows) return; // belt-and-suspenders
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = localDataRef.current.findIndex(
        (row, i) => String(cellOf(row, rowKeyField) ?? i) === String(active.id),
      );
      const newIndex = localDataRef.current.findIndex(
        (row, i) => String(cellOf(row, rowKeyField) ?? i) === String(over.id),
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const newData = arrayMove(localDataRef.current, oldIndex, newIndex);
      setLocalData(newData);
      onChange?.(newData);
      onRowReorder?.(newData);
    },
    [draggableRows, rowKeyField, setLocalData, onChange, onRowReorder],
  );

  // ── Cell content renderers (preserved exactly) ─────────────────────────────
  const renderViewCell = (
    col: InternalColumn<T>,
    value: unknown,
    row: T,
    rowIndex: number,
  ): React.ReactNode => {
    if (col.renderCell) return col.renderCell(value, row, rowIndex);

    switch (col.type) {
      case 'checkbox':
        // The <td> onClick handles toggling; onChange is a no-op here so that
        // the controlled Checkbox doesn't re-toggle via its own handler.
        return (
          <Checkbox
            checked={Boolean(value)}
            onChange={() => {
              /* handled by td onClick */
            }}
            size="sm"
          />
        );

      case 'select': {
        const option = col.options?.find((o) => o.value === String(value ?? ''));
        return <span>{option ? option.label : String(value ?? '')}</span>;
      }

      case 'readonly':
      case 'text':
      case 'number':
      case 'date':
      default:
        return <span>{String(value ?? '')}</span>;
    }
  };

  // `variant`/`size` default to the table cell's look: 'bare' has no border/
  // background/radius of its own so the surrounding <td>'s own inset ring
  // (`.eidos-data-grid-cell--editing`) reads as the field's border, and
  // 'sm' keeps the editor from growing the row's height. A card field isn't
  // sitting inside that ring - it's a standalone field in a stack, so it
  // should just look like any other standalone Input/Select in the design
  // system (their own component defaults), not the table's cell-shaped
  // variant. Passing `undefined` here (rather than omitting the prop) is
  // equivalent to omitting it - falls back to each component's own default.
  const renderEditCell = (
    col: InternalColumn<T>,
    value: unknown,
    row: T,
    rowIndex: number,
    context: 'table' | 'card' = 'table',
  ): React.ReactNode => {
    if (col.renderEditor) {
      return col.renderEditor(value, (v) => setEditValue(v), row);
    }

    const variant = context === 'table' ? 'bare' : undefined;
    const size = context === 'table' ? 'sm' : undefined;

    switch (col.type) {
      case 'number':
        return (
          <Input
            type="number"
            variant={variant}
            size={size}
            value={String(value ?? '')}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            fullWidth
            clearable={false}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            variant={variant}
            size={size}
            value={String(value ?? '')}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            fullWidth
            clearable={false}
          />
        );

      case 'select': {
        // Auto-commit as soon as the user picks an option; the Dropdown's portal
        // means we can't rely on a simple onBlur for this cell type.
        // autoOpen=true so the dropdown opens on the same click that entered
        // edit mode - no second click needed.
        const selectOptions = (col.options ?? []).map((o) => ({
          id: o.value,
          value: o.value,
          label: o.label,
        }));

        return (
          <Select
            options={selectOptions}
            value={String(value ?? '')}
            autoOpen
            fullWidth
            inputProps={{ variant, size }}
            onChange={(v) => {
              const selected = Array.isArray(v) ? (v[0] ?? '') : v;
              const newData = localDataRef.current.map<T>((r, i) =>
                i === rowIndex ? ({ ...r, [col.key]: selected } as T) : r,
              );
              setLocalData(newData);
              onChange?.(newData);
              setEditingCell(null);
            }}
            clearable={false}
          />
        );
      }

      default:
        return (
          <Input
            type="text"
            variant={variant}
            size={size}
            value={String(value ?? '')}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            fullWidth
            clearable={false}
          />
        );
    }
  };

  // ── Card view cell value ─────────────────────────────────────────────────
  // Mirrors the <td> cell's click/edit/error-state wiring in `renderViewCell`/
  // `renderEditCell` above, just wrapped in a plain <div> so it can sit
  // either in a card's label:value field row or its header/subheader - both
  // stay just as editable as any table cell.
  const renderCardValue = (
    col: InternalColumn<T>,
    row: T,
    localIndex: number,
    baseClassName: string,
  ): React.ReactNode => {
    const value = cellOf(row, col.key);
    const isEditing = editingCell?.rowIndex === localIndex && editingCell?.colKey === col.key;
    const canEdit = isCellEditable(col);
    const isFlagged = cellErrorKey(localIndex, col.key) in cellErrors;
    const hasError = isEditing && Boolean(editError);

    const valueCls = [
      baseClassName,
      // Deliberately NOT `eidos-data-grid-cell--editing` (unlike the <td>
      // version of this same state) - that class's whole job is forcing the
      // editor into `position: absolute; inset: 0` so it fills a <td>
      // without changing the table row's height. A card field has no row
      // to preserve the height of, so it just needs its own "is editing"
      // hook for spacing - the editor itself renders normally, with each
      // component's own default (non-`bare`) look (see `renderEditCell`).
      isEditing && 'eidos-datagrid-card-value--editing',
      hasError && 'eidos-data-grid-cell--error',
      isFlagged && !hasError && 'eidos-data-grid-cell--has-error',
      canEdit && !isEditing && 'eidos-data-grid-cell--editable',
      col.type === 'readonly' && 'eidos-data-grid-cell--readonly',
      // Checkbox glyph is intrinsically narrow - without this the value
      // wrapper stretches to the card's full width (block layout), making
      // the whole row clickable/toggleable instead of just the checkbox.
      col.type === 'checkbox' && 'eidos-datagrid-card-value--checkbox',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={
          hasError ? (errorTooltipAnchorRef as React.RefObject<HTMLDivElement | null>) : undefined
        }
        className={valueCls}
        onClick={() => handleCellClick(localIndex, col)}
        onKeyDown={isEditing ? (e) => handleKeyDown(e, localIndex, col.key) : undefined}
        tabIndex={isEditing ? -1 : undefined}
      >
        {isEditing
          ? renderEditCell(col, editValue, row, localIndex, 'card')
          : renderViewCell(col, value, row, localIndex)}
      </div>
    );
  };

  // Label-above-value field, stacked - used for every column that isn't the
  // card's header/subheader.
  const renderCardField = (col: InternalColumn<T>, row: T, localIndex: number): React.ReactNode => (
    <div key={col.key} className="eidos-datagrid-card-field">
      <span className="eidos-datagrid-card-field-label">{col.header}</span>
      {renderCardValue(col, row, localIndex, 'eidos-datagrid-card-field-value')}
    </div>
  );

  // ── Row-actions menu (type: 'actions' column) ──────────────────────────────
  // Shared between the table's dedicated actions <td> and the card's
  // top-right toolbar slot - see `actionsColumn`/`DataGridColumn.actions`.
  // Renders nothing if there's no actions column, or it has no actions.
  const renderActionsMenu = (row: T, localIndex: number): React.ReactNode => {
    if (!actionsColumn) return null;

    const items: MenuItemType[] = actionsColumn.renderActions
      ? actionsColumn.renderActions(row, localIndex)
      : (actionsColumn.actions ?? []).flatMap((action, index) => {
          const id = action.id ?? `${action.label}-${index}`;
          const isDisabled =
            typeof action.disabled === 'function' ? action.disabled(row) : Boolean(action.disabled);

          const item: MenuItemType = {
            id,
            type: 'item',
            label: action.label,
            icon: action.icon,
            disabled: isDisabled,
            color: action.danger ? 'danger' : undefined,
            onClick: () => action.onClick(row, localIndex),
          };

          return action.divider
            ? [{ id: `${id}-divider`, type: 'separator' as const }, item]
            : [item];
        });

    if (!items.length) return null;

    return (
      <Menu
        trigger={
          <button type="button" className="eidos-datagrid-actions-trigger" aria-label="Row actions">
            {actionsColumn.actionsIcon ? (
              renderIcon(actionsColumn.actionsIcon, 'eidos-datagrid-actions-trigger-icon')
            ) : (
              <MoreVertical size={16} />
            )}
          </button>
        }
        items={items}
      />
    );
  };

  // Columns sorted for rendering: pin:left → unpinned → pin:right. Excludes
  // the actions column (see `dataColumns`) - it's never a normal, sortable/
  // pinnable data column, always rendered in its own dedicated slot instead.
  // This ensures a pinned column defined in the middle of the columns array
  // is always displayed at the correct edge regardless of its original position.
  // The original `columns` prop is still used for key-based lookups above.
  const sortedColumns = useMemo(
    () => [
      ...dataColumns.filter((c) => c.pin === 'left'),
      ...dataColumns.filter((c) => !c.pin),
      ...dataColumns.filter((c) => c.pin === 'right'),
    ],
    [dataColumns],
  );

  const totalCols =
    dataColumns.length +
    (showRowNumbers ? 1 : 0) +
    (actionsColumn ? 1 : 0) +
    (draggableRows ? 1 : 0) +
    (selectable ? 1 : 0) +
    (expandable ? 1 : 0);

  // Row IDs for SortableContext - must be the displayed rows (not full dataset)
  // so dnd-kit knows which items are currently rendered.
  const rowIds = displayData.map((row, i) => String(cellOf(row, rowKeyField) ?? i));

  const containerStyle: React.CSSProperties = {};
  if (stickyHeader && maxHeight) {
    containerStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  }

  // Toolbar visibility: show whenever filters, quick filters, density picker,
  // selectable, or add-row are active.
  const showToolbar =
    !!showFilters || quickFilters.length > 0 || !!showDensity || !!selectable || !!onRowAdd;

  // Quick filters share the toolbar's left zone with the selection count and
  // bulk actions, which take it over entirely while rows are selected.
  const showQuickFilters = quickFilters.length > 0 && !(selectable && hasSelection);

  const renderQuickFilter = (quickFilter: DataGridQuickFilter): React.ReactElement => {
    const { key, label, disabled, width } = quickFilter;
    const value = activeFilters[key];
    // Only set inline when supplied - the default lives in the stylesheet, so
    // the common case emits no style attribute at all.
    const style =
      width === undefined
        ? undefined
        : ({
            '--eidos-datagrid-quick-filter-width': typeof width === 'number' ? `${width}px` : width,
          } as React.CSSProperties);

    const control = (() => {
      switch (quickFilter.type) {
        case 'segmented':
          return (
            <SegmentedControl
              size="sm"
              color={quickFilter.color}
              disabled={disabled}
              // Select/Combobox are already `fullWidth` and just fill their
              // box; a SegmentedControl sizes itself to its segments, so it
              // needs telling to fill the row once quick filters stack.
              fullWidth={isCompactToolbar}
              // The reset segment is always prepended: a SegmentedControl
              // always has exactly one segment selected, so without it the
              // filter could never be cleared.
              options={[
                { value: QUICK_FILTER_RESET_VALUE, label: quickFilter.allLabel ?? 'All' },
                ...quickFilter.options,
              ]}
              value={typeof value === 'string' ? value : QUICK_FILTER_RESET_VALUE}
              onChange={(next) => handleQuickFilterChange(key, next)}
            />
          );
        case 'combobox':
          return (
            <Combobox
              size="sm"
              fullWidth
              disabled={disabled}
              placeholder={quickFilter.placeholder ?? label}
              clearable={quickFilter.clearable ?? true}
              emptyText={quickFilter.emptyText}
              loading={quickFilter.loading}
              loadingText={quickFilter.loadingText}
              onSearch={quickFilter.onSearch}
              options={(quickFilter.options ?? []).map((option) => ({
                ...option,
                id: option.value,
              }))}
              value={typeof value === 'string' ? value : ''}
              onChange={(next) => handleQuickFilterChange(key, next)}
            />
          );
        case 'select':
        default:
          return (
            <Select
              fullWidth
              inputProps={{ size: 'sm' }}
              disabled={disabled}
              placeholder={quickFilter.placeholder ?? label}
              clearable={quickFilter.clearable ?? true}
              multiple={quickFilter.multiple}
              options={quickFilter.options.map((option) => ({ ...option, id: option.value }))}
              // Never `undefined` - Select and Combobox both treat that as
              // "uncontrolled" and would then keep showing a value the
              // filter state no longer holds after a clear.
              value={
                quickFilter.multiple
                  ? Array.isArray(value)
                    ? value
                    : []
                  : typeof value === 'string'
                    ? value
                    : ''
              }
              onChange={(next) => handleQuickFilterChange(key, next)}
            />
          );
      }
    })();

    return (
      <div
        key={key}
        className={`eidos-datagrid-quick-filter eidos-datagrid-quick-filter--${quickFilter.type}`}
        style={style}
        // No visible field label fits in the toolbar, so the group carries the
        // accessible name for whichever control it wraps.
        role="group"
        aria-label={label}
      >
        {control}
      </div>
    );
  };

  // Density modifier class (comfortable = default = no extra class)
  const densityClass =
    effectiveDensity !== 'comfortable' ? `eidos-datagrid--${effectiveDensity}` : '';

  // Always include the current page size in the options so the Select is never blank.
  const effectivePageSizeOptions = useMemo(() => {
    const opts = pageSizeOptions ?? [10, 25, 50, 100];
    return opts.includes(pageSize) ? opts : [...opts, pageSize].sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  // ── Loading state (preserved) ───────────────────────────────────────────────
  // `ref={setContainerRef}` here too (not just the main return below) - a
  // consumer whose `loading` prop starts `true` on mount renders this
  // branch first, and without it `hasCardView` would never get a container
  // to measure until some unrelated re-render happened to remount it - see
  // `setContainerRef`'s comment above for the full explanation.
  if (loading) {
    return (
      <div
        ref={setContainerRef}
        className={['eidos-data-grid-container', className].filter(Boolean).join(' ')}
      >
        <div className="eidos-data-grid-loading">
          <Spinner size="md" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  // Pre-compute sticky props for system columns so we can spread them on
  // header <th>s and body <td>s without calling the helpers multiple times.
  const expandHeaderPin = getHeaderPinnedProps('__expand__');
  const selHeaderPin = getHeaderPinnedProps('__sel__');
  const dragHeaderPin = getHeaderPinnedProps('__drag__');
  const rownumHeaderPin = getHeaderPinnedProps('__rownum__');
  const expandCellPin = getCellPinnedProps('__expand__');
  const selCellPin = getCellPinnedProps('__sel__');
  const dragCellPin = getCellPinnedProps('__drag__');
  const rownumCellPin = getCellPinnedProps('__rownum__');

  return (
    <div
      ref={setContainerRef}
      className={[
        'eidos-data-grid-container',
        stickyHeader && 'eidos-data-grid-container--sticky-header',
        densityClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={containerStyle}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {showToolbar && (
        <div className="eidos-datagrid-toolbar">
          {/* Left zone: quick filters, or selection count + bulk actions */}
          <div className="eidos-datagrid-toolbar-left">
            {/* Card view's stand-in for the header checkbox, which doesn't
                exist without a header row. Also the way out of selection mode
                there: clicking it while checked clears the selection, exactly
                as the header checkbox does in table mode. */}
            {selectable && isCardView && (
              <Checkbox
                size="sm"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                // Labelled even in the compact toolbar, unlike the buttons
                // beside it: those keep a recognisable icon, whereas a bare
                // checkbox floating in a toolbar says nothing about what it
                // selects - and a tooltip is no help on touch.
                label="Select all"
                aria-label="Select all rows"
              />
            )}

            {showQuickFilters && (
              <div
                className={[
                  'eidos-datagrid-quick-filters',
                  isCompactToolbar && 'eidos-datagrid-quick-filters--compact',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {quickFilters.map(renderQuickFilter)}
              </div>
            )}

            {selectable && hasSelection && (
              <>
                <span className="eidos-datagrid-selection-count">{selectedSet.size} selected</span>

                {/* The select-all checkbox can only reach the loaded rows, so
                    reaching past them is an explicit action - and undoing it
                    has to be explicit too: with more rows selected than the
                    checkbox's own scope, toggling it would strip the page and
                    leave the rest selected, which reads as a no-op. */}
                {canSelectAllMatching && (
                  <Button
                    variant="text"
                    size="sm"
                    loading={isSelectingAllMatching}
                    onClick={() => void selectAllMatching()}
                  >
                    {`Select all ${totalItemCount}`}
                  </Button>
                )}

                {hasSelectedAllMatching && (
                  <Button variant="text" size="sm" color="secondary" onClick={clearSelection}>
                    Clear selection
                  </Button>
                )}

                {bulkActions && bulkActions.length > 0 && (
                  <div className="eidos-datagrid-bulk-actions">
                    {bulkActions.map((action) => {
                      const isDisabled =
                        typeof action.disabled === 'function'
                          ? action.disabled(selectedItems)
                          : (action.disabled ?? false);

                      if (action.type === 'split-button') {
                        return (
                          <SplitButton
                            key={action.id}
                            size="sm"
                            variant={action.variant ?? 'outlined'}
                            color={action.color ?? 'secondary'}
                            preIcon={action.icon}
                            disabled={isDisabled}
                            label={action.label}
                            onClick={() => action.onClick(selectedItems)}
                            options={action.options.map((option) => ({
                              id: option.id,
                              label: option.label,
                              icon: option.icon,
                              disabled: option.disabled,
                              onClick: () => option.onClick(selectedItems),
                            }))}
                          />
                        );
                      }

                      return action.label ? (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={action.variant ?? 'outlined'}
                          color={action.color ?? 'secondary'}
                          preIcon={action.icon}
                          posIcon={action.posIcon}
                          disabled={isDisabled}
                          onClick={() => action.onClick(selectedItems)}
                        >
                          {action.label}
                        </Button>
                      ) : action.icon ? (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={action.variant ?? 'outlined'}
                          color={action.color ?? 'secondary'}
                          icon={action.icon}
                          disabled={isDisabled}
                          onClick={() => action.onClick(selectedItems)}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right zone: density picker + filter button + add-row button */}
          <div className="eidos-datagrid-toolbar-right">
            {/* Icon-only below `COMPACT_TOOLBAR_WIDTH_PX`, with the label moved
                into a tooltip so the control stays identifiable. */}
            {showDensity && (
              <Dropdown
                placement="bottom"
                align="end"
                autoWidth={false}
                trigger={
                  isCompactToolbar ? (
                    <Button variant="text" size="sm" icon={AlignJustify} tooltip="Density" />
                  ) : (
                    <Button variant="text" size="sm" preIcon={AlignJustify}>
                      Density
                    </Button>
                  )
                }
                content={
                  <div className="eidos-table-menu-panel">
                    {(
                      [
                        { value: 'compact', label: 'Compact' },
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'spacious', label: 'Spacious' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        className={[
                          'eidos-table-menu-item',
                          effectiveDensity === option.value ? 'eidos-table-menu-item--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setInternalDensity(option.value)}
                      >
                        <span className="eidos-table-menu-item-check">
                          {effectiveDensity === option.value && <Check size={14} />}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                }
              />
            )}

            {showFilters && filterDropdownColumns.length > 0 && (
              <TableFiltersDropdown<T>
                columns={filterDropdownColumns}
                filters={dropdownFilters}
                onFiltersChange={handleFiltersChange}
              />
            )}

            {onRowAdd &&
              (isCompactToolbar ? (
                <Button
                  variant="outlined"
                  size="sm"
                  icon={Plus}
                  tooltip="Add row"
                  onClick={handleRowAdd}
                />
              ) : (
                <Button variant="outlined" size="sm" preIcon={Plus} onClick={handleRowAdd}>
                  Add row
                </Button>
              ))}
          </div>
        </div>
      )}

      {isCardView ? (
        /* ── Card view ────────────────────────────────────────────────── */
        <div
          className="eidos-datagrid-cards"
          style={{ '--eidos-datagrid-card-min-width': `${cardMinWidth}px` } as React.CSSProperties}
        >
          {displayData.length > 0 ? (
            displayData.map((row, displayIndex) => {
              const localIndex = localData.indexOf(row);
              const rowKeyValue = String(cellOf(row, rowKeyField) ?? displayIndex);
              const isRowSelected = selectable && selectedSet.has(rowKeyValue);
              const isRowExpanded = expandable && expandedSet.has(rowKeyValue);
              const canExpandRow = !isRowExpandable || isRowExpandable(row);

              return (
                <div
                  key={rowKeyValue}
                  className={[
                    'eidos-datagrid-card',
                    isRowSelected && 'eidos-datagrid-card--selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {/* stopPropagation so the checkbox/actions menu never bubble
                      into a consumer's own row-click handler (e.g. opening a
                      details drawer) - mirrors the selection/drag-handle <td>s'
                      own `onClick={(e) => e.stopPropagation()}` in table mode. */}
                  {hasCardToolbar && (
                    <div
                      className="eidos-datagrid-card-toolbar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="eidos-datagrid-card-toolbar-left">
                        {expandable && canExpandRow && (
                          <button
                            type="button"
                            className={[
                              'eidos-datagrid-expand-toggle',
                              isRowExpanded && 'eidos-datagrid-expand-toggle--open',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => toggleExpanded(rowKeyValue)}
                            aria-expanded={isRowExpanded}
                            aria-label={isRowExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                        {selectable && (
                          <Checkbox
                            checked={isRowSelected}
                            onChange={() => toggleRow(rowKeyValue)}
                            size="sm"
                          />
                        )}
                        {showRowNumbers && (
                          <span className="eidos-datagrid-card-row-number">#{localIndex + 1}</span>
                        )}
                      </div>

                      {/* Always rendered (even empty) so it occupies the toolbar's
                        middle grid column - conditionally omitting the element
                        itself would shift `eidos-datagrid-card-toolbar-right`
                        into this column instead of the third one. */}
                      <div className="eidos-datagrid-card-heading">
                        {cardHeaderColumn &&
                          renderCardValue(
                            cardHeaderColumn,
                            row,
                            localIndex,
                            'eidos-datagrid-card-heading-title',
                          )}
                        {cardSubheaderColumn &&
                          renderCardValue(
                            cardSubheaderColumn,
                            row,
                            localIndex,
                            'eidos-datagrid-card-heading-subtitle',
                          )}
                      </div>

                      <div className="eidos-datagrid-card-toolbar-right">
                        {renderActionsMenu(row, localIndex)}
                      </div>
                    </div>
                  )}

                  <div className="eidos-datagrid-card-fields">
                    {cardFieldColumns.map((col) => renderCardField(col, row, localIndex))}
                  </div>

                  {expandable && renderExpandedContent && (
                    <ExpandedCardPanel
                      isOpen={isRowExpanded}
                      render={() => renderExpandedContent(row, localIndex)}
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="eidos-datagrid-card-empty">
              {Object.keys(activeFilters).length > 0 ? (
                <EmptyState
                  icon={<SearchX />}
                  title="No results found"
                  description="Try adjusting your filters or search terms."
                  action={
                    <Button size="sm" variant="outlined" color="primary" onClick={clearAllFilters}>
                      Clear filters
                    </Button>
                  }
                  size="sm"
                />
              ) : (
                <EmptyState
                  icon={<FolderOpen />}
                  title={emptyText}
                  description={
                    onRowAdd ? 'Add a row to get started.' : 'There are no records to display.'
                  }
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Table (wrapped for horizontal scroll) ───────────────────────── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleRowDragEnd}
          >
            <div className="eidos-data-grid-scroll">
              <table className={['eidos-data-grid', densityClass].filter(Boolean).join(' ')}>
                <thead ref={theadRef}>
                  <tr>
                    {/* Drag-handle column - must come before every other system column */}
                    {draggableRows && (
                      <th
                        className={[
                          'eidos-data-grid-header-cell',
                          'eidos-datagrid-drag-handle-cell',
                          dragHeaderPin.className,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={dragHeaderPin.style}
                        data-col-key="__drag__"
                      />
                    )}

                    {/* Expand-toggle column */}
                    {expandable && (
                      <th
                        className={[
                          'eidos-data-grid-header-cell',
                          'eidos-datagrid-expand-cell',
                          expandHeaderPin.className,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={expandHeaderPin.style}
                        data-col-key="__expand__"
                      />
                    )}

                    {/* Selection checkbox column - must come before row numbers */}
                    {selectable && (
                      <th
                        className={[
                          'eidos-data-grid-header-cell',
                          'eidos-datagrid-checkbox-cell',
                          selHeaderPin.className,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={selHeaderPin.style}
                        data-col-key="__sel__"
                      >
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={toggleAll}
                          size="sm"
                        />
                      </th>
                    )}

                    {showRowNumbers && (
                      <th
                        className={[
                          'eidos-data-grid-header-cell',
                          'eidos-data-grid-row-number-col',
                          rownumHeaderPin.className,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={rownumHeaderPin.style}
                        data-col-key="__rownum__"
                      >
                        #
                      </th>
                    )}

                    {sortedColumns.map((col) => {
                      const colKey = col.key;
                      const isSortable = !!col.sortable;
                      const isCurrentlySorted = activeSort?.key === colKey;
                      const sortDir = isCurrentlySorted ? activeSort!.direction : null;
                      const alignClass = `eidos-datagrid-align-${col.align ?? 'left'}`;
                      const { style: pinnedStyle, className: pinnedClass } =
                        getHeaderPinnedProps(colKey);

                      return (
                        <th
                          key={colKey}
                          className={[
                            'eidos-data-grid-header-cell',
                            isSortable && 'eidos-datagrid-header-cell--sortable',
                            isCurrentlySorted && 'eidos-datagrid-header-cell--sorted',
                            alignClass,
                            pinnedClass,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{
                            width:
                              col.width != null
                                ? typeof col.width === 'number'
                                  ? `${col.width}px`
                                  : col.width
                                : undefined,
                            minWidth:
                              col.minWidth != null
                                ? typeof col.minWidth === 'number'
                                  ? `${col.minWidth}px`
                                  : col.minWidth
                                : undefined,
                            ...pinnedStyle,
                          }}
                          data-col-key={colKey}
                          onClick={isSortable ? () => handleSortClick(colKey) : undefined}
                        >
                          <div className={`eidos-datagrid-header-content ${alignClass}`}>
                            <span className="eidos-datagrid-header-label">{col.header}</span>
                            {isSortable && (
                              <span className="eidos-datagrid-sort-icon">
                                {sortDir === 'asc' && <ArrowUp size={14} />}
                                {sortDir === 'desc' && <ArrowDown size={14} />}
                                {!sortDir && <ChevronsUpDown size={14} />}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}

                    {actionsColumn && (
                      <th
                        className="eidos-data-grid-header-cell eidos-data-grid-actions-col"
                        data-col-key="__actions__"
                      />
                    )}
                  </tr>
                </thead>

                <tbody>
                  <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                    {displayData.length > 0 ? (
                      displayData.map((row, displayIndex) => {
                        // Find this row's position in the full localData array.
                        // displayData rows are the same object references as in localData
                        // (filter/sort/slice never clone row objects), so indexOf is O(n)
                        // but always accurate - even after edits that produce new row objects.
                        const localIndex = localData.indexOf(row);
                        const rowKeyValue = String(cellOf(row, rowKeyField) ?? displayIndex);
                        const isRowSelected = selectable && selectedSet.has(rowKeyValue);
                        const isRowExpanded = expandable && expandedSet.has(rowKeyValue);
                        const canExpandRow = !isRowExpandable || isRowExpandable(row);

                        return (
                          // React.Fragment (rather than SortableTableRow taking the
                          // `key` directly) so an expanded row's detail <tr> - see
                          // ExpandedTableRow below - can sit right underneath it as
                          // a sibling, keyed together as one reconciliation unit.
                          <React.Fragment key={rowKeyValue}>
                            {/* SortableTableRow is always rendered (hooks unconditional);
                            disabled={true} when draggableRows is off so dnd-kit is a no-op. */}
                            <SortableTableRow
                              id={rowKeyValue}
                              disabled={!draggableRows}
                              className={[
                                'eidos-data-grid-row',
                                isRowSelected && 'eidos-datagrid-row--selected',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {(dragHandleProps, isDragging) => (
                                <>
                                  {draggableRows && (
                                    <td
                                      className={[
                                        'eidos-datagrid-drag-handle-cell',
                                        dragCellPin.className,
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                      style={dragCellPin.style}
                                      // Prevent a click on the handle from triggering cell editing
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span
                                        {...(dragHandleProps as React.HTMLAttributes<HTMLSpanElement>)}
                                        className={[
                                          'eidos-datagrid-drag-handle',
                                          isDragging && 'eidos-datagrid-drag-handle--dragging',
                                        ]
                                          .filter(Boolean)
                                          .join(' ')}
                                        title="Drag to reorder"
                                      >
                                        <GripVertical size={14} />
                                      </span>
                                    </td>
                                  )}

                                  {expandable && (
                                    <td
                                      className={[
                                        'eidos-data-grid-cell',
                                        'eidos-datagrid-expand-cell',
                                        expandCellPin.className,
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                      style={expandCellPin.style}
                                      // Prevent a click on the toggle from triggering cell editing
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {canExpandRow && (
                                        <button
                                          type="button"
                                          className={[
                                            'eidos-datagrid-expand-toggle',
                                            isRowExpanded && 'eidos-datagrid-expand-toggle--open',
                                          ]
                                            .filter(Boolean)
                                            .join(' ')}
                                          onClick={() => toggleExpanded(rowKeyValue)}
                                          aria-expanded={isRowExpanded}
                                          aria-label={isRowExpanded ? 'Collapse row' : 'Expand row'}
                                        >
                                          <ChevronRight size={14} />
                                        </button>
                                      )}
                                    </td>
                                  )}

                                  {selectable && (
                                    <td
                                      className={[
                                        'eidos-data-grid-cell',
                                        'eidos-datagrid-checkbox-cell',
                                        selCellPin.className,
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                      style={selCellPin.style}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Checkbox
                                        checked={isRowSelected}
                                        onChange={() => toggleRow(rowKeyValue)}
                                        size="sm"
                                      />
                                    </td>
                                  )}

                                  {showRowNumbers && (
                                    <td
                                      className={[
                                        'eidos-data-grid-cell',
                                        'eidos-data-grid-row-number',
                                        rownumCellPin.className,
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                      style={rownumCellPin.style}
                                    >
                                      {localIndex + 1}
                                    </td>
                                  )}

                                  {sortedColumns.map((col) => {
                                    const value = cellOf(row, col.key);
                                    const isEditing =
                                      editingCell?.rowIndex === localIndex &&
                                      editingCell?.colKey === col.key;
                                    const canEdit = isCellEditable(col);
                                    // Persists for a cell regardless of focus (background tint only);
                                    // the border + message only show once this exact cell is
                                    // focused again, via `hasError` below.
                                    const isFlagged =
                                      cellErrorKey(localIndex, col.key) in cellErrors;
                                    const hasError = isEditing && Boolean(editError);
                                    const { style: pinnedStyle, className: pinnedClass } =
                                      getCellPinnedProps(col.key);

                                    const cellCls = [
                                      'eidos-data-grid-cell',
                                      isEditing && 'eidos-data-grid-cell--editing',
                                      hasError && 'eidos-data-grid-cell--error',
                                      isFlagged && !hasError && 'eidos-data-grid-cell--has-error',
                                      canEdit && !isEditing && 'eidos-data-grid-cell--editable',
                                      col.type === 'readonly' && 'eidos-data-grid-cell--readonly',
                                      `eidos-datagrid-align-${col.align ?? 'left'}`,
                                      pinnedClass,
                                    ]
                                      .filter(Boolean)
                                      .join(' ');

                                    return (
                                      <td
                                        key={col.key}
                                        ref={
                                          hasError
                                            ? (errorTooltipAnchorRef as React.RefObject<HTMLTableDataCellElement | null>)
                                            : undefined
                                        }
                                        className={cellCls}
                                        style={pinnedStyle}
                                        onClick={() => handleCellClick(localIndex, col)}
                                        onKeyDown={
                                          isEditing
                                            ? (e) => handleKeyDown(e, localIndex, col.key)
                                            : undefined
                                        }
                                        // Make editing cells focusable so keydown events register
                                        tabIndex={isEditing ? -1 : undefined}
                                      >
                                        {isEditing
                                          ? renderEditCell(col, editValue, row, localIndex)
                                          : renderViewCell(col, value, row, localIndex)}
                                      </td>
                                    );
                                  })}

                                  {actionsColumn && (
                                    <td
                                      className="eidos-data-grid-cell eidos-data-grid-actions-col"
                                      // Prevent a click on the actions menu from bubbling into a
                                      // consumer's own row-click handler (e.g. opening a details
                                      // drawer) - mirrors the selection/drag-handle <td>s above.
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {renderActionsMenu(row, localIndex)}
                                    </td>
                                  )}
                                </>
                              )}
                            </SortableTableRow>

                            {expandable && renderExpandedContent && (
                              <ExpandedTableRow
                                isOpen={isRowExpanded}
                                colSpan={totalCols}
                                render={() => renderExpandedContent(row, localIndex)}
                              />
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr className="eidos-data-grid-empty-row">
                        <td
                          colSpan={totalCols}
                          className="eidos-data-grid-cell eidos-data-grid-empty-cell"
                        >
                          {Object.keys(activeFilters).length > 0 ? (
                            <EmptyState
                              icon={<SearchX />}
                              title="No results found"
                              description="Try adjusting your filters or search terms."
                              action={
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  color="primary"
                                  onClick={clearAllFilters}
                                >
                                  Clear filters
                                </Button>
                              }
                              size="sm"
                            />
                          ) : (
                            <EmptyState
                              icon={<FolderOpen />}
                              title={emptyText}
                              description={
                                onRowAdd
                                  ? 'Add a row to get started.'
                                  : 'There are no records to display.'
                              }
                              size="sm"
                            />
                          )}
                        </td>
                      </tr>
                    )}
                  </SortableContext>
                </tbody>
              </table>
            </div>
          </DndContext>
        </>
      )}

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      {showPagination && (
        <div className="eidos-datagrid-footer">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={handlePageChange}
            totalItems={totalItemCount}
            pageSize={currentPageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={effectivePageSizeOptions}
          />
        </div>
      )}

      {/* Portaled rather than a child of the erroring cell - see errorTooltipPosition above */}
      {activeCellError &&
        errorTooltipPosition &&
        createPortal(
          <div
            className="eidos-data-grid-cell-error"
            style={{ top: errorTooltipPosition.top, left: errorTooltipPosition.left }}
          >
            {activeCellError}
          </div>,
          document.body,
        )}
    </div>
  );
}

// Assign displayName cleanly without losing the generic signature
export const DataGrid = Object.assign(DataGridInner, { displayName: 'DataGrid' });
