import { useState, useMemo, useLayoutEffect, useRef } from 'react';
import React from 'react';
import {
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Download,
  Columns3,
  AlignJustify,
  GripVertical,
  FolderOpen,
  SearchX,
} from 'lucide-react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RowKey } from '../../utils';
import type { TableColumn, TableProps, TableFilters, FilterValue } from './Table.types';

// `TableColumn<T>` is a discriminated union, so `render` is a union of
// function types and its parameter type is their intersection. The table
// walks columns generically and looks values up by a runtime string key, so
// it widens the renderer once here rather than narrowing the union at the
// call site - the union is enforced where it matters, at the consumer's.
type TableCellRenderer<T> = (value: unknown, item: T) => React.ReactNode;

export type { TableColumn, TableProps, TableFilters, FilterValue };
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Dropdown } from '../Dropdown';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { SplitButton } from '../SplitButton';
import { Spinner } from '../Spinner';
import { TableFiltersDropdown } from './TableFiltersDropdown.component';

// ── Types ─────────────────────────────────────────────────────────────────────

type Density = 'compact' | 'comfortable' | 'spacious';

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

// ── CSV helpers ───────────────────────────────────────────────────────────────

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ── SortableColumnHeader ──────────────────────────────────────────────────────
// Defined as a standalone component so it can legally call useSortable().
// Only rendered when draggableColumns=true (inside a DndContext + SortableContext).

interface SortableThProps {
  id: string;
  column: { label: string };
  isSortable: boolean;
  isCurrentlySorted: boolean;
  sortDirection: 'asc' | 'desc' | null;
  alignment: string;
  columnType: string;
  columnWidth: string | undefined;
  pinnedClass: string;
  stickyStyle: React.CSSProperties;
  onSortClick: () => void;
}

function SortableColumnHeader({
  id,
  column,
  isSortable,
  isCurrentlySorted,
  sortDirection,
  alignment,
  columnType,
  columnWidth,
  pinnedClass,
  stickyStyle,
  onSortClick,
}: SortableThProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const transformStr = CSS.Transform.toString(transform);

  const thClassName = [
    'eidos-table-header-cell',
    `eidos-table-header-cell-${columnType}`,
    isSortable ? 'eidos-table-sortable' : '',
    isCurrentlySorted ? 'eidos-table-sorted' : '',
    `eidos-table-align-${alignment}`,
    pinnedClass,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <th
      ref={setNodeRef as React.LegacyRef<HTMLTableCellElement>}
      className={thClassName}
      style={{
        width: columnWidth,
        ...stickyStyle,
        ...(transformStr ? { transform: transformStr } : {}),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      data-col-key={id}
      onClick={() => isSortable && onSortClick()}
      {...attributes}
    >
      {/* Grip - absolutely positioned in the left padding zone so it never
          displaces the column label or causes layout shift on hover. */}
      <span
        className="eidos-table-drag-handle"
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical size={12} />
      </span>
      <div className={`eidos-table-header-content eidos-table-align-${alignment}`}>
        <span className="eidos-table-header-label">{column.label}</span>
        {isSortable && (
          <div className="eidos-table-sort-indicator">
            {sortDirection === 'asc' && <ArrowUp size={14} />}
            {sortDirection === 'desc' && <ArrowDown size={14} />}
            {!sortDirection && <ChevronsUpDown size={14} />}
          </div>
        )}
      </div>
    </th>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export const Table = <T extends object>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
  showFooter = false,
  totalItems,
  showPagination = false,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  onSortChange,
  currentSort,
  filters = {},
  onFiltersChange,
  defaultFilters,
  showFilters = false,
  // Selection
  selectable = false,
  rowKey,
  selectedRows: controlledSelected,
  defaultSelectedRows = [],
  onSelectionChange,
  bulkActions = [],
  // New features
  density = 'comfortable',
  showDensity = false,
  showColumnVisibility = false,
  showExport = false,
  draggableColumns = false,
  onColumnReorder,
}: TableProps<T>) => {
  // ── Column ordering (drag-reorder) ────────────────────────────────────────
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((c) => String(c.key)));

  // Derived-state reset: when the set of column keys changes, reset the order.
  // Calling setState during render is the React-idiomatic way to do this.
  const columnKeysSignature = columns.map((c) => String(c.key)).join('\0');
  const prevKeysRef = useRef(columnKeysSignature);
  if (prevKeysRef.current !== columnKeysSignature) {
    prevKeysRef.current = columnKeysSignature;
    setColumnOrder(columns.map((c) => String(c.key)));
  }

  const orderedColumns = useMemo(() => {
    const orderMap = new Map(columnOrder.map((key, idx) => [key, idx]));
    return [...columns].sort((a, b) => {
      const ai = orderMap.get(String(a.key)) ?? Infinity;
      const bi = orderMap.get(String(b.key)) ?? Infinity;
      return ai - bi;
    });
  }, [columns, columnOrder]);

  // ── Density (internal state when showDensity=true) ────────────────────────
  const [internalDensity, setInternalDensity] = useState<Density>(density as Density);
  // When showDensity is true the table owns density; otherwise respect the prop.
  const effectiveDensity: Density = showDensity ? internalDensity : (density as Density);

  // ── Column visibility ─────────────────────────────────────────────────────
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(() => new Set<string>());

  const visibleColumns = useMemo(
    () => orderedColumns.filter((c) => !hiddenColumnKeys.has(String(c.key))),
    [orderedColumns, hiddenColumnKeys],
  );

  // ── Pinned / sticky columns ────────────────────────────────────────────────
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [pinnedOffsets, setPinnedOffsets] = useState<
    Map<string, { side: 'left' | 'right'; offset: number }>
  >(new Map());

  useLayoutEffect(() => {
    const hasPinned = visibleColumns.some((c) => c.pin);
    if (!hasPinned || !theadRef.current) {
      setPinnedOffsets(new Map());
      return;
    }

    const headerRow = theadRef.current.querySelector('tr');
    if (!headerRow) return;

    const cells = Array.from(headerRow.querySelectorAll<HTMLTableCellElement>('th[data-col-key]'));

    const newOffsets = new Map<string, { side: 'left' | 'right'; offset: number }>();

    // Left-pinned: scan left-to-right.
    // Checkbox (when selectable) counts as a left-pinned element.
    let leftAccum = 0;
    for (const cell of cells) {
      const key = cell.dataset.colKey!;
      if (key === '__checkbox__') {
        newOffsets.set(key, { side: 'left', offset: leftAccum });
        leftAccum += cell.offsetWidth;
      } else {
        const col = visibleColumns.find((c) => String(c.key) === key);
        if (col?.pin === 'left') {
          newOffsets.set(key, { side: 'left', offset: leftAccum });
          leftAccum += cell.offsetWidth;
        }
      }
    }

    // Right-pinned: scan right-to-left.
    let rightAccum = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i];
      const key = cell.dataset.colKey!;
      const col = visibleColumns.find((c) => String(c.key) === key);
      if (col?.pin === 'right') {
        newOffsets.set(key, { side: 'right', offset: rightAccum });
        rightAccum += cell.offsetWidth;
      }
    }

    setPinnedOffsets(newOffsets);
  }, [visibleColumns, selectable]);

  // ── Selection state (controlled / uncontrolled) ──────────────────────────
  const isControlledSelection = controlledSelected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedRows);
  const selectedSet = useMemo(
    () => new Set(isControlledSelection ? controlledSelected : internalSelected),
    [isControlledSelection, controlledSelected, internalSelected],
  );

  /** Stable string key for a row - uses `rowKey` prop, then "id", then index. */
  const getRowKey = (item: T, index: number): string => {
    if (rowKey) return String(item[rowKey]);
    if ('id' in item) return String(item.id);
    return String(index);
  };

  const commitSelection = (keys: string[]) => {
    if (!isControlledSelection) setInternalSelected(keys);
    const rows = data.filter((item, idx) => keys.includes(getRowKey(item, idx)));
    onSelectionChange?.(keys, rows);
  };

  const toggleRow = (key: string) => {
    const next = selectedSet.has(key)
      ? [...selectedSet].filter((k) => k !== key)
      : [...selectedSet, key];
    commitSelection(next);
  };

  const allKeys = useMemo(
    () => data.map((item, idx) => getRowKey(item, idx)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, rowKey],
  );

  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedSet.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selectedSet.has(k));

  const toggleAll = () => {
    commitSelection(allSelected ? [] : allKeys);
  };

  const clearSelection = () => commitSelection([]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const displayData = useMemo(() => {
    if (!showPagination) return data;
    const startIndex = (currentPage - 1) * currentPageSize;
    return data.slice(startIndex, startIndex + currentPageSize);
  }, [data, showPagination, currentPage, currentPageSize]);

  const totalPages = Math.ceil(data.length / currentPageSize);

  const handleSort = (key: string) => {
    const newDirection =
      currentSort?.key === key && currentSort?.direction === 'asc' ? 'desc' : 'asc';
    // `key` came from a rendered column, so it is a field of `T` by
    // construction - the public callback is narrowed for the caller's benefit,
    // which this internal string can't prove on its own.
    onSortChange?.(key as RowKey<T>, newDirection);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  };

  // ── Derived UI state ──────────────────────────────────────────────────────
  const hasSelection = selectedSet.size > 0;
  const showToolbar =
    (showFilters && !!onFiltersChange) ||
    showColumnVisibility ||
    showExport ||
    showDensity ||
    (selectable && hasSelection);

  const selectedItems = useMemo(
    () => data.filter((item, idx) => selectedSet.has(getRowKey(item, idx))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, selectedSet, rowKey],
  );

  // ── CSV Export ────────────────────────────────────────────────────────────
  const getRawValue = (item: T, column: TableColumn<T>): string => {
    const value =
      typeof column.key === 'string' && column.key.includes('.')
        ? (column.key as string)
            .split('.')
            .reduce(
              (obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k],
              item as unknown,
            )
        : item[column.key as keyof T];
    return String(value ?? '');
  };

  const handleExportCsv = () => {
    const headers = visibleColumns.map((c) => escapeCsvValue(c.label)).join(',');
    const rows = data.map((item) =>
      visibleColumns.map((col) => escapeCsvValue(getRawValue(item, col))).join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── DnD setup ─────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = columnOrder.indexOf(activeId);
    const newIndex = columnOrder.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);

    if (onColumnReorder) {
      const orderMap = new Map(newOrder.map((key, idx) => [key, idx]));
      const reordered = [...columns].sort((a, b) => {
        const ai = orderMap.get(String(a.key)) ?? Infinity;
        const bi = orderMap.get(String(b.key)) ?? Infinity;
        return ai - bi;
      });
      onColumnReorder(reordered);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns sticky style + className for body <td> cells (zIndex: 1). */
  const getCellPinnedProps = (
    colKey: string,
  ): { style: React.CSSProperties; className: string } => {
    const pinInfo = pinnedOffsets.get(colKey);
    if (!pinInfo) return { style: {}, className: '' };
    return {
      style: {
        position: 'sticky',
        [pinInfo.side]: pinInfo.offset,
        zIndex: 1,
      },
      className:
        pinInfo.side === 'left'
          ? 'eidos-table-cell--pinned-left'
          : 'eidos-table-cell--pinned-right',
    };
  };

  /** Returns sticky style + className for header <th> cells (zIndex: 3). */
  const getHeaderPinnedProps = (
    colKey: string,
  ): { style: React.CSSProperties; className: string } => {
    const pinInfo = pinnedOffsets.get(colKey);
    if (!pinInfo) return { style: {}, className: '' };
    return {
      style: {
        position: 'sticky',
        [pinInfo.side]: pinInfo.offset,
        zIndex: 3,
      },
      className:
        pinInfo.side === 'left'
          ? 'eidos-table-header-cell--pinned-left'
          : 'eidos-table-header-cell--pinned-right',
    };
  };

  // ── Density class ─────────────────────────────────────────────────────────
  const densityClass = effectiveDensity !== 'comfortable' ? `eidos-table--${effectiveDensity}` : '';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`eidos-table-container ${className || ''}`}>
        <div className="eidos-table-loading">
          <Spinner size="md" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Density panel (Dropdown content) ──────────────────────────────────────
  const densityPanel = (
    <div className="eidos-table-menu-panel">
      {DENSITY_OPTIONS.map((option) => (
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
  );

  // ── Column visibility panel (Dropdown content) ────────────────────────────
  const columnVisibilityPanel = (
    <div className="eidos-table-menu-panel">
      {/* Use orderedColumns so list order mirrors current column order */}
      {orderedColumns.map((col) => {
        const key = String(col.key);
        const isVisible = !hiddenColumnKeys.has(key);
        const isLastVisible = visibleColumns.length === 1 && isVisible;
        return (
          <button
            key={key}
            className={['eidos-table-menu-item', isVisible ? 'eidos-table-menu-item--active' : '']
              .filter(Boolean)
              .join(' ')}
            disabled={isLastVisible}
            onClick={() => {
              setHiddenColumnKeys((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
              });
            }}
          >
            <Checkbox
              checked={isVisible}
              disabled={isLastVisible}
              size="sm"
              onChange={() => {
                /* click handled by parent button */
              }}
            />
            <span>{col.label}</span>
          </button>
        );
      })}
    </div>
  );

  // ── SortableContext items: visible column keys only ───────────────────────
  const sortableItems = visibleColumns.map((c) => String(c.key));

  // ── Main JSX ──────────────────────────────────────────────────────────────
  const tableContent = (
    <div className={`eidos-table-container ${className || ''}`}>
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      {showToolbar && (
        <div className="eidos-table-toolbar">
          {/* Left - bulk actions / selection info */}
          <div className="eidos-table-toolbar-left">
            {selectable && hasSelection && (
              <>
                <span className="eidos-table-selection-count">{selectedSet.size} selected</span>

                {bulkActions.length > 0 && (
                  <div className="eidos-table-bulk-actions">
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

                <button
                  className="eidos-table-clear-selection"
                  onClick={clearSelection}
                  aria-label="Clear selection"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>

          {/* Right - density, column visibility, export, filter */}
          <div className="eidos-table-toolbar-right">
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
                content={densityPanel}
              />
            )}

            {showColumnVisibility && (
              <Dropdown
                placement="bottom"
                align="end"
                autoWidth={false}
                trigger={
                  <Button variant="text" size="sm" preIcon={Columns3}>
                    Columns
                  </Button>
                }
                content={columnVisibilityPanel}
              />
            )}

            {showExport && (
              <Button
                variant="text"
                size="sm"
                icon={Download}
                onClick={handleExportCsv}
                tooltip="Export CSV"
              />
            )}

            {showFilters && onFiltersChange && (
              <TableFiltersDropdown
                columns={columns}
                filters={filters}
                onFiltersChange={onFiltersChange}
                defaultFilters={defaultFilters}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Table (wrapped for horizontal scroll) ─────────────────────────── */}
      <div className="eidos-table-scroll">
        <table
          className={[
            'eidos-table',
            densityClass,
            draggableColumns ? 'eidos-table--draggable-columns' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <thead ref={theadRef}>
            <tr>
              {selectable && (
                <th
                  className={[
                    'eidos-table-header-cell',
                    'eidos-table-checkbox-cell',
                    getHeaderPinnedProps('__checkbox__').className,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={getHeaderPinnedProps('__checkbox__').style}
                  data-col-key="__checkbox__"
                >
                  <Checkbox
                    size="sm"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* ── Headers: draggable or plain ──────────────────────────── */}
              {draggableColumns
                ? visibleColumns.map((column) => {
                    const colKey = String(column.key);
                    const columnType = column.type || 'data';
                    const columnWidth =
                      column.type === 'icon' ? 'var(--component-size-lg)' : column.width;
                    const isSortable = !!column.sortable;
                    const isCurrentlySorted = currentSort?.key === colKey;
                    const sortDirection = isCurrentlySorted
                      ? (currentSort!.direction as 'asc' | 'desc')
                      : null;
                    const alignment = column.align || 'left';
                    const { style: pinnedStyle, className: pinnedClass } =
                      getHeaderPinnedProps(colKey);

                    return (
                      <SortableColumnHeader
                        key={colKey}
                        id={colKey}
                        column={column}
                        isSortable={isSortable}
                        isCurrentlySorted={!!isCurrentlySorted}
                        sortDirection={sortDirection}
                        alignment={alignment}
                        columnType={columnType}
                        columnWidth={columnWidth}
                        pinnedClass={pinnedClass}
                        stickyStyle={pinnedStyle}
                        onSortClick={() => handleSort(colKey)}
                      />
                    );
                  })
                : visibleColumns.map((column, index) => {
                    const colKey = String(column.key);
                    const columnType = column.type || 'data';
                    const columnWidth =
                      column.type === 'icon' ? 'var(--component-size-lg)' : column.width;
                    const isSortable = column.sortable;
                    const isCurrentlySorted = currentSort?.key === colKey;
                    const sortDirection = isCurrentlySorted ? currentSort!.direction : null;
                    const alignment = column.align || 'left';
                    const alignmentClass = `eidos-table-align-${alignment}`;
                    const { style: pinnedStyle, className: pinnedClass } =
                      getHeaderPinnedProps(colKey);

                    return (
                      <th
                        key={index}
                        className={[
                          'eidos-table-header-cell',
                          `eidos-table-header-cell-${columnType}`,
                          isSortable ? 'eidos-table-sortable' : '',
                          isCurrentlySorted ? 'eidos-table-sorted' : '',
                          alignmentClass,
                          pinnedClass,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ width: columnWidth, ...pinnedStyle }}
                        data-col-key={colKey}
                        onClick={() => isSortable && handleSort(colKey)}
                      >
                        <div className={`eidos-table-header-content ${alignmentClass}`}>
                          <span>{column.label}</span>
                          {isSortable && (
                            <div className="eidos-table-sort-indicator">
                              {sortDirection === 'asc' && <ArrowUp size={14} />}
                              {sortDirection === 'desc' && <ArrowDown size={14} />}
                              {!sortDirection && <ChevronsUpDown size={14} />}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((item, rowIndex) => {
                const globalIndex = showPagination
                  ? (currentPage - 1) * currentPageSize + rowIndex
                  : rowIndex;
                const key = getRowKey(item, globalIndex);
                const isSelected = selectedSet.has(key);

                return (
                  <tr
                    key={key}
                    className={[
                      'eidos-table-row',
                      onRowClick ? 'eidos-table-clickable' : '',
                      isSelected ? 'eidos-table-row--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td
                        className={[
                          'eidos-table-cell',
                          'eidos-table-checkbox-cell',
                          getCellPinnedProps('__checkbox__').className,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={getCellPinnedProps('__checkbox__').style}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(key);
                        }}
                      >
                        {/* Wrap in a span so Checkbox click-events don't
                            bubble to the <td> and cause a double-toggle.
                            The <td> onClick handles toggling when the user
                            clicks the cell margin outside the checkbox. */}
                        <span onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="sm"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                            aria-label={`Select row ${globalIndex + 1}`}
                          />
                        </span>
                      </td>
                    )}
                    {visibleColumns.map((column, colIndex) => {
                      const colKey = String(column.key);
                      const value =
                        typeof column.key === 'string' && column.key.includes('.')
                          ? (column.key as string)
                              .split('.')
                              .reduce(
                                (obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k],
                                item as unknown,
                              )
                          : item[column.key as keyof T];

                      const columnType = column.type || 'data';
                      const columnWidth =
                        column.type === 'icon' ? 'var(--component-size-lg)' : column.width;
                      const alignment = column.align || 'left';
                      const alignmentClass = `eidos-table-align-${alignment}`;
                      const { style: pinnedStyle, className: pinnedClass } =
                        getCellPinnedProps(colKey);

                      return (
                        <td
                          key={colIndex}
                          className={[
                            'eidos-table-cell',
                            `eidos-table-cell-${columnType}`,
                            alignmentClass,
                            pinnedClass,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{ width: columnWidth, ...pinnedStyle }}
                          // `type: 'action'` cells exist specifically to hold
                          // interactive controls (a row-actions Menu/button,
                          // typically) - without this, clicking them bubbles
                          // straight into `onRowClick` on the <tr> below,
                          // e.g. opening a details drawer at the same time as
                          // (or instead of) the action itself. Mirrors the
                          // selectable checkbox cell's own stopPropagation
                          // above, for the same reason.
                          onClick={columnType === 'action' ? (e) => e.stopPropagation() : undefined}
                        >
                          {column.render
                            ? (column.render as TableCellRenderer<T>)(value, item)
                            : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr className="eidos-table-empty-row">
                <td
                  colSpan={selectable ? visibleColumns.length + 1 : visibleColumns.length}
                  className="eidos-table-cell eidos-table-empty-cell"
                >
                  {Object.keys(filters).length > 0 ? (
                    <EmptyState
                      icon={<SearchX />}
                      title="No results found"
                      description="Try adjusting your filters or search terms."
                      action={
                        onFiltersChange ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            onClick={() => onFiltersChange({})}
                          >
                            Clear filters
                          </Button>
                        ) : undefined
                      }
                      size="sm"
                    />
                  ) : (
                    <EmptyState
                      icon={<FolderOpen />}
                      title={emptyMessage}
                      description="There are no records to display."
                      size="sm"
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ───────────────────────────────────────────── */}
      {showFooter && (
        <div className="eidos-table-footer">
          <div className="eidos-table-footer-content">
            {showPagination && data.length > 0 ? (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
                totalItems={totalItems ?? data.length}
                pageSize={currentPageSize}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={pageSizeOptions}
                size="sm"
              />
            ) : (
              <span className="eidos-table-results-info">
                Showing {data.length} of {totalItems ?? data.length} results
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ── Wrap with DnD context when draggableColumns=true ─────────────────────
  if (draggableColumns) {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableItems} strategy={horizontalListSortingStrategy}>
          {tableContent}
        </SortableContext>
      </DndContext>
    );
  }

  return tableContent;
};
