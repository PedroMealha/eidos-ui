import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  X,
  Plus,
  AlignJustify,
  Check,
  FolderOpen,
  SearchX,
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
import { Input } from '../Input/Input.component';
import { Select } from '../Select/Select.component';
import { Checkbox } from '../Checkbox/Checkbox.component';
import { Spinner } from '../Spinner/Spinner.component';
import { Pagination } from '../Pagination';
import { EmptyState } from '../EmptyState';
import { Dropdown } from '../Dropdown';
import { TableFiltersDropdown } from '../Table/TableFiltersDropdown.component';
import type { TableColumn, TableFilters } from '../Table/Table.types';
import type { DataGridProps, DataGridColumn, EditingCell } from './DataGrid.types';
import './DataGrid.scss';

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
// Inner implementation (generic function so we can assign .displayName cleanly)
// ─────────────────────────────────────────────────────────────────────────────
function DataGridInner<T extends Record<string, unknown>>({
  // ── Existing props ─────────────────────────────────────────────────────────
  columns,
  data,
  rowKey = 'id',
  onChange,
  onRowAdd,
  onRowDelete,
  editable = true,
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
  filters,
  onFiltersChange,
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
  bulkActions,
  // ── Display ────────────────────────────────────────────────────────────────
  density = 'comfortable',
  showDensity = false,
  // ── Card view ────────────────────────────────────────────────────────────────
  hasCardView = false,
  cardViewBreakpoint = 640,
  cardMinWidth = 280,
}: DataGridProps<T>): React.ReactElement {
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

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Filtering (client-side internal state)
  const [internalFilters, setInternalFilters] = useState<TableFilters>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Selection
  const isControlledSelection = controlledSelectedRows !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(
    () => new Set(defaultSelectedRows ?? []),
  );

  // Card view: measured off the grid's own container width (not the
  // viewport) via ResizeObserver, so it responds correctly even when the
  // grid sits in a narrow sidebar/split-pane on an otherwise wide screen.
  // Starts `null` (unmeasured) rather than 0, so the table is what renders
  // for one frame on mount instead of briefly flashing cards.
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!hasCardView || !containerRef.current) return;

    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasCardView]);
  const isCardView = hasCardView && containerWidth !== null && containerWidth < cardViewBreakpoint;

  // Card view header/subheader: only the first matching column is honored
  // (see DataGridColumn.cardHeader/cardSubheader).
  const cardHeaderColumn = useMemo(() => columns.find((c) => c.cardHeader), [columns]);
  const cardSubheaderColumn = useMemo(() => columns.find((c) => c.cardSubheader), [columns]);
  // Remaining columns render as label:value field rows, in declaration order.
  const cardFieldColumns = useMemo(
    () => columns.filter((c) => c !== cardHeaderColumn && c !== cardSubheaderColumn),
    [columns, cardHeaderColumn, cardSubheaderColumn],
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

  const allKeys = useMemo(
    () => localData.map((row, idx) => String(row[rowKey as keyof T] ?? idx)),
    [localData, rowKey],
  );

  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedSet.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selectedSet.has(k));
  const hasSelection = selectedSet.size > 0;

  const selectedItems = useMemo(
    () => localData.filter((row, idx) => selectedSet.has(String(row[rowKey as keyof T] ?? idx))),
    [localData, selectedSet, rowKey],
  );

  // ── Filter dropdown adapter: DataGridColumn → TableColumn ─────────────────
  // TableFiltersDropdown expects TableColumn<T>[]; we project our columns down.
  const filterDropdownColumns = useMemo((): TableColumn<T>[] => {
    return columns
      .filter((col) => col.filterable)
      .map(
        (col) =>
          ({
            key: col.key,
            label: col.header,
            filterable: true,
            filterType: col.filterType,
            filterOptions: col.filterOptions,
            dateFilterMode: col.dateFilterMode,
          }) as TableColumn<T>,
      );
  }, [columns]);

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
        const cellValue = row[key];

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
      const aVal = a[activeSort.key];
      const bVal = b[activeSort.key];

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
      if (key === '__sel__' || key === '__drag__' || key === '__rownum__') {
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
  }, [columns, selectable, draggableRows, showRowNumbers, onRowDelete]);

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
    (col: DataGridColumn<T>): boolean => {
      if (!editable) return false;
      if (col.type === 'readonly') return false;
      if (col.editable === false) return false;
      return true;
    },
    [editable],
  );

  const validateCell = useCallback((col: DataGridColumn<T>, value: unknown): string | null => {
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
        const error = validateCell(col, row[col.key]);
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
    (rowIndex: number, col: DataGridColumn<T>) => {
      const value = localDataRef.current[rowIndex]?.[col.key];

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
          setEditValue(localDataRef.current[next.rowIndex][next.colKey]);
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

  // ── Row actions (preserved) ─────────────────────────────────────────────────
  const handleRowDelete = useCallback(
    (row: T, index: number) => {
      onRowDelete?.(row, index);
      const newData = localDataRef.current.filter((_, i) => i !== index);
      setLocalData(newData);
      onChange?.(newData);
    },
    [onRowDelete, onChange, setLocalData],
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
      const rows = localDataRef.current.filter((row, idx) =>
        keys.includes(String(row[rowKey as keyof T] ?? idx)),
      );
      onSelectionChange?.(keys, rows);
    },
    [isControlledSelection, rowKey, onSelectionChange],
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

  const toggleAll = useCallback(() => {
    commitSelection(allSelected ? [] : allKeys);
  }, [allSelected, allKeys, commitSelection]);

  const clearSelection = useCallback(() => commitSelection([]), [commitSelection]);

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSortClick = useCallback(
    (colKey: string) => {
      if (onSortChange) {
        // Server-side: delegate to parent
        const newDir =
          currentSort?.key === colKey && currentSort?.direction === 'asc' ? 'desc' : 'asc';
        onSortChange(colKey, newDir);
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

  // ── Filter handler ───────────────────────────────────────────────────────────
  const handleFiltersChange = useCallback(
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
        (row, i) => String(row[rowKey as keyof T] ?? i) === String(active.id),
      );
      const newIndex = localDataRef.current.findIndex(
        (row, i) => String(row[rowKey as keyof T] ?? i) === String(over.id),
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const newData = arrayMove(localDataRef.current, oldIndex, newIndex);
      setLocalData(newData);
      onChange?.(newData);
      onRowReorder?.(newData);
    },
    [draggableRows, rowKey, setLocalData, onChange, onRowReorder],
  );

  // ── Cell content renderers (preserved exactly) ─────────────────────────────
  const renderViewCell = (
    col: DataGridColumn<T>,
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
    col: DataGridColumn<T>,
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
    col: DataGridColumn<T>,
    row: T,
    localIndex: number,
    baseClassName: string,
  ): React.ReactNode => {
    const value = row[col.key];
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
        ref={hasError ? (errorTooltipAnchorRef as React.RefObject<HTMLDivElement | null>) : undefined}
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
  const renderCardField = (col: DataGridColumn<T>, row: T, localIndex: number): React.ReactNode => (
    <div key={col.key} className="eidos-datagrid-card-field">
      <span className="eidos-datagrid-card-field-label">{col.header}</span>
      {renderCardValue(col, row, localIndex, 'eidos-datagrid-card-field-value')}
    </div>
  );

  // ── Derived display values ─────────────────────────────────────────────────
  const hasDeleteCol = Boolean(onRowDelete);

  // Columns sorted for rendering: pin:left → unpinned → pin:right.
  // This ensures a pinned column defined in the middle of the columns array
  // is always displayed at the correct edge regardless of its original position.
  // The original `columns` prop is still used for key-based lookups above.
  const sortedColumns = useMemo(
    () => [
      ...columns.filter((c) => c.pin === 'left'),
      ...columns.filter((c) => !c.pin),
      ...columns.filter((c) => c.pin === 'right'),
    ],
    [columns],
  );

  const totalCols =
    columns.length +
    (showRowNumbers ? 1 : 0) +
    (hasDeleteCol ? 1 : 0) +
    (draggableRows ? 1 : 0) +
    (selectable ? 1 : 0);

  // Row IDs for SortableContext - must be the displayed rows (not full dataset)
  // so dnd-kit knows which items are currently rendered.
  const rowIds = displayData.map((row, i) => String(row[rowKey as keyof T] ?? i));

  const containerStyle: React.CSSProperties = {};
  if (stickyHeader && maxHeight) {
    containerStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  }

  // Toolbar visibility: show whenever filters, density picker, selectable, or add-row are active.
  const showToolbar = !!showFilters || !!showDensity || !!selectable || !!onRowAdd;

  // Density modifier class (comfortable = default = no extra class)
  const densityClass =
    effectiveDensity !== 'comfortable' ? `eidos-datagrid--${effectiveDensity}` : '';

  // Always include the current page size in the options so the Select is never blank.
  const effectivePageSizeOptions = useMemo(() => {
    const opts = pageSizeOptions ?? [10, 25, 50, 100];
    return opts.includes(pageSize) ? opts : [...opts, pageSize].sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  // ── Loading state (preserved) ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className={['eidos-data-grid-container', className].filter(Boolean).join(' ')}>
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
  const selHeaderPin = getHeaderPinnedProps('__sel__');
  const dragHeaderPin = getHeaderPinnedProps('__drag__');
  const rownumHeaderPin = getHeaderPinnedProps('__rownum__');
  const selCellPin = getCellPinnedProps('__sel__');
  const dragCellPin = getCellPinnedProps('__drag__');
  const rownumCellPin = getCellPinnedProps('__rownum__');

  return (
    <div
      ref={containerRef}
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
          {/* Left zone: selection count + bulk actions */}
          <div className="eidos-datagrid-toolbar-left">
            {selectable && hasSelection && (
              <>
                <span className="eidos-datagrid-selection-count">{selectedSet.size} selected</span>

                {bulkActions && bulkActions.length > 0 && (
                  <div className="eidos-datagrid-bulk-actions">
                    {bulkActions.map((action) => {
                      const isDisabled =
                        typeof action.disabled === 'function'
                          ? action.disabled(selectedItems)
                          : (action.disabled ?? false);
                      return (
                        <Button
                          key={action.id}
                          size="sm"
                          variant={action.variant ?? 'outlined'}
                          color={action.color ?? 'secondary'}
                          preIcon={action.icon}
                          disabled={isDisabled}
                          onClick={() => action.onClick(selectedItems)}
                        >
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  className="eidos-datagrid-clear-selection"
                  onClick={clearSelection}
                  aria-label="Clear selection"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>

          {/* Right zone: density picker + filter button + add-row button */}
          <div className="eidos-datagrid-toolbar-right">
            {showDensity && (
              <Dropdown
                placement="bottom"
                align="end"
                autoWidth={false}
                trigger={
                  <Button variant="text" size="sm" preIcon={AlignJustify}>
                    Density
                  </Button>
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
                filters={activeFilters}
                onFiltersChange={handleFiltersChange}
              />
            )}

            {onRowAdd && (
              <Button variant="outlined" size="sm" preIcon={Plus} onClick={handleRowAdd}>
                Add row
              </Button>
            )}
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
              const rowKeyValue = String(row[rowKey as keyof T] ?? displayIndex);
              const isRowSelected = selectable && selectedSet.has(rowKeyValue);

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
                  <div className="eidos-datagrid-card-toolbar">
                    <div className="eidos-datagrid-card-toolbar-left">
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
                      {hasDeleteCol && (
                        <button
                          type="button"
                          className="eidos-data-grid-delete-btn"
                          onClick={() => handleRowDelete(row, localIndex)}
                          aria-label="Delete row"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="eidos-datagrid-card-fields">
                    {cardFieldColumns.map((col) => renderCardField(col, row, localIndex))}
                  </div>
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
                    <Button
                      size="sm"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleFiltersChange({})}
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
                {/* Selection checkbox column */}
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

                {/* Drag-handle column - must come before row numbers */}
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
                  const { style: pinnedStyle, className: pinnedClass } =
                    getHeaderPinnedProps(colKey);

                  return (
                    <th
                      key={colKey}
                      className={[
                        'eidos-data-grid-header-cell',
                        isSortable && 'eidos-datagrid-header-cell--sortable',
                        isCurrentlySorted && 'eidos-datagrid-header-cell--sorted',
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
                      <div className="eidos-datagrid-header-content">
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

                {hasDeleteCol && (
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
                    const rowKeyValue = String(row[rowKey as keyof T] ?? displayIndex);
                    const isRowSelected = selectable && selectedSet.has(rowKeyValue);

                    return (
                      // SortableTableRow is always rendered (hooks unconditional);
                      // disabled={true} when draggableRows is off so dnd-kit is a no-op.
                      <SortableTableRow
                        key={rowKeyValue}
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
                              const value = row[col.key];
                              const isEditing =
                                editingCell?.rowIndex === localIndex &&
                                editingCell?.colKey === col.key;
                              const canEdit = isCellEditable(col);
                              // Persists for a cell regardless of focus (background tint only);
                              // the border + message only show once this exact cell is
                              // focused again, via `hasError` below.
                              const isFlagged = cellErrorKey(localIndex, col.key) in cellErrors;
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

                            {hasDeleteCol && (
                              <td className="eidos-data-grid-cell eidos-data-grid-actions-col">
                                <button
                                  type="button"
                                  className="eidos-data-grid-delete-btn"
                                  onClick={() => handleRowDelete(row, localIndex)}
                                  aria-label="Delete row"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </>
                        )}
                      </SortableTableRow>
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
                              onClick={() => handleFiltersChange({})}
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
