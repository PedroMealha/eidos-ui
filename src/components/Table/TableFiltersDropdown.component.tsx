import { useMemo, useState, useEffect, useRef } from 'react';
import { Plus, X, Check, RotateCcw, Funnel } from 'lucide-react';
import { Button } from '../Button';
import { DatePicker } from '../DatePicker';
import { Dropdown } from '../Dropdown';
import { Input } from '../Input';
import { Select } from '../Select';
import { FilterValue, TableColumn, TableFilters } from './Table.types';

export interface FilterRow {
  id: string;
  columnKey: string;
  value: FilterValue;
}

interface TableFiltersDropdownProps<T> {
  columns: TableColumn<T>[];
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  defaultFilters?: TableFilters;
  className?: string;
}

export const TableFiltersDropdown = <T extends Record<string, unknown>>({
  columns,
  filters,
  onFiltersChange,
  defaultFilters = {},
  className = '',
}: TableFiltersDropdownProps<T>) => {
  // State for forcing dropdown to close by remounting
  const [dropdownKey, setDropdownKey] = useState(0);

  // Local state for pending filters (before Apply is clicked)
  const [pendingFilters, setPendingFilters] = useState<TableFilters>(() => {
    // Initialize with filters or default filters, or ensure at least one empty filter
    const initialFilters = Object.keys(filters).length > 0 ? filters : defaultFilters;
    if (Object.keys(initialFilters).length === 0) {
      // Always show at least one empty filter
      return { [`__temp_${Date.now()}`]: '' };
    }
    return initialFilters;
  });

  // Update pending filters when external filters change. Skipped on the very
  // first run (mount) - the lazy useState initializer above already computed
  // the correct initial value, factoring in `defaultFilters` when `filters`
  // starts empty. This effect only knows about `filters`, so without the
  // skip it would immediately overwrite that pre-fill with a blank filter
  // the instant it fires after mount, since `defaultFilters` is a staged
  // value that's never actually reflected in `filters` until Apply is clicked.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (Object.keys(filters).length === 0) {
      // When filters are cleared externally, show one empty filter
      setPendingFilters({ [`__temp_${Date.now()}`]: '' });
    } else {
      setPendingFilters(filters);
    }
  }, [filters]);

  // Get filterable columns
  const filterableColumns = useMemo(() => columns.filter((col) => col.filterable), [columns]);

  // Convert pending filters object to filter rows for UI
  const filterRows = useMemo((): FilterRow[] => {
    return Object.entries(pendingFilters).map(([columnKey, value], index) => ({
      id: `filter-${index}`,
      columnKey,
      value,
    }));
  }, [pendingFilters]);

  // Check if there are unsaved changes (ignore temporary empty filters)
  const hasChanges = useMemo(() => {
    // Clean up pending filters for comparison (remove temp filters)
    const cleanedPendingFilters: TableFilters = {};
    Object.entries(pendingFilters).forEach(([key, value]) => {
      // Skip temporary filters
      if (key.startsWith('__temp_')) return;

      // Check if value is meaningful
      const hasValue = (() => {
        if (value === '' || value === undefined || value === null) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
          // Range date filter - check if at least one date is set
          return !!(value.start || value.end);
        }
        return true;
      })();

      if (hasValue) {
        cleanedPendingFilters[key] = value;
      }
    });

    // Compare cleaned pending filters with actual filters
    return JSON.stringify(filters) !== JSON.stringify(cleanedPendingFilters);
  }, [filters, pendingFilters]);

  // Check if there are any active filters
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  // Get all columns with disabled state for used ones
  const getAllColumnsWithDisabledState = (currentRowId?: string) => {
    const currentRow = filterRows.find((row) => row.id === currentRowId);
    const usedColumns = filterRows
      .filter((row) => row.id !== currentRowId && !row.columnKey.startsWith('__temp_'))
      .map((row) => row.columnKey);

    return filterableColumns.map((col) => {
      const columnKey = String(col.key);
      const isUsed = usedColumns.includes(columnKey);
      const isCurrent = currentRow?.columnKey === columnKey;

      return {
        id: columnKey,
        value: columnKey,
        label: col.label,
        disabled: isUsed && !isCurrent,
      };
    });
  };

  // Get column configuration by key
  const getColumnByKey = (columnKey: string) => {
    return filterableColumns.find((col) => String(col.key) === columnKey);
  };

  // Update a specific filter (locally)
  const updateFilter = (rowId: string, columnKey: string, value: FilterValue) => {
    const newFilters = { ...pendingFilters };

    // Remove old filter if column changed
    const oldRow = filterRows.find((row) => row.id === rowId);
    if (oldRow && oldRow.columnKey !== columnKey) {
      delete newFilters[oldRow.columnKey];
    }

    // Set new filter - always set even if empty for column selection
    newFilters[columnKey] = value;

    setPendingFilters(newFilters);
  };

  // Add a new filter row (locally) - start with no column selected
  const addFilter = () => {
    const availableColumns = getAllColumnsWithDisabledState();
    if (availableColumns.length === 0) return;

    // Create a unique temporary key for unselected filter
    const tempKey = `__temp_${Date.now()}`;
    const newFilters = { ...pendingFilters };
    newFilters[tempKey] = '';
    setPendingFilters(newFilters);
  };

  // Remove a filter row (locally)
  const removeFilter = (rowId: string) => {
    const row = filterRows.find((r) => r.id === rowId);
    if (!row) return;

    const newFilters = { ...pendingFilters };
    delete newFilters[row.columnKey];

    // Ensure at least one filter remains
    if (Object.keys(newFilters).length === 0) {
      newFilters[`__temp_${Date.now()}`] = '';
    }

    setPendingFilters(newFilters);
  };

  // Apply pending filters (clean up temporary filters)
  const applyFilters = () => {
    const cleanedFilters: TableFilters = {};
    Object.entries(pendingFilters).forEach(([key, value]) => {
      // Skip temporary filters
      if (key.startsWith('__temp_')) return;

      // Check if value is meaningful
      const hasValue = (() => {
        if (value === '' || value === undefined || value === null) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
          // Range date filter - check if at least one date is set
          return !!(value.start || value.end);
        }
        return true;
      })();

      if (hasValue) {
        cleanedFilters[key] = value;
      }
    });
    onFiltersChange(cleanedFilters);

    // Close dropdown after applying filters
    setDropdownKey((prev) => prev + 1);
  };

  // Reset to current filters (discard pending changes)
  const resetFilters = () => {
    if (Object.keys(filters).length === 0) {
      // If no active filters, ensure at least one empty filter row
      setPendingFilters({ [`__temp_${Date.now()}`]: '' });
    } else {
      // Reset to current active filters
      setPendingFilters(filters);
    }
  };

  // Clear all filters and apply immediately
  const clearAllFilters = () => {
    const emptyFilter = { [`__temp_${Date.now()}`]: '' };
    setPendingFilters(emptyFilter);
    onFiltersChange({}); // Apply the reset immediately (no temp filters)

    // Close dropdown after clearing filters
    setDropdownKey((prev) => prev + 1);
  };

  // Render filter input based on column type
  const renderFilterInput = (row: FilterRow, column: TableColumn<T>) => {
    const filterType = column.filterType || 'text';

    switch (filterType) {
      case 'select':
        return (
          <Select
            value={(row.value as string) || ''}
            onChange={(value) => updateFilter(row.id, row.columnKey, value)}
            options={column.filterOptions || []}
            placeholder="Select value"
            clearable={true}
            inputProps={{ size: 'sm' }}
          />
        );
      case 'boolean':
        return (
          <Select
            value={row.value === undefined ? '' : String(row.value)}
            onChange={(value) =>
              updateFilter(row.id, row.columnKey, value === '' ? undefined : value === 'true')
            }
            options={[
              { id: '', value: '', label: 'All' },
              { id: 'true', value: 'true', label: 'Yes' },
              { id: 'false', value: 'false', label: 'No' },
            ]}
            placeholder="Select value"
            clearable={false}
            inputProps={{ size: 'sm' }}
          />
        );
      case 'date': {
        const dateMode = column.dateFilterMode || 'single';

        // Prepare value for DatePicker - pass ISO strings directly
        const prepareValue = () => {
          if (!row.value) return undefined;

          switch (dateMode) {
            case 'single': {
              return row.value ? { date: row.value as string } : undefined;
            }
            case 'multiple': {
              const dates = Array.isArray(row.value) ? row.value : [];
              return dates.length > 0 ? { date: dates } : undefined;
            }
            case 'range': {
              const rangeValue = row.value as { start: string | null; end: string | null };
              return {
                date: {
                  start: rangeValue?.start || null,
                  end: rangeValue?.end || null,
                },
              };
            }
            default: {
              return row.value ? { date: row.value as string } : undefined;
            }
          }
        };

        // Handle change - DatePicker now returns ISO strings directly
        const handleDateChange = (value: {
          date: string | string[] | { start: string | null; end: string | null } | null;
        }) => {
          if (!value?.date) {
            updateFilter(row.id, row.columnKey, '');
            return;
          }

          // DatePicker returns ISO strings, pass them directly
          updateFilter(row.id, row.columnKey, value.date);
        };

        const getPlaceholder = () => {
          switch (dateMode) {
            case 'single':
              return 'Select date';
            case 'multiple':
              return 'Select dates';
            case 'range':
              return 'Select date range';
            default:
              return 'Select date';
          }
        };

        return (
          <DatePicker
            mode={dateMode}
            value={prepareValue()}
            onChange={handleDateChange}
            placeholder={getPlaceholder()}
            inputProps={{ size: 'sm' }}
            format={{
              displayFormat: 'MMM DD, YYYY',
              inputFormat: 'YYYY-MM-DD',
            }}
          />
        );
      }
      case 'text':
      default:
        return (
          <Input
            value={(row.value as string) || ''}
            onChange={(e) => updateFilter(row.id, row.columnKey, e.target.value)}
            placeholder="Enter value"
            size="sm"
          />
        );
    }
  };

  const canAddMore = filterRows.length < filterableColumns.length;

  const triggerButton = (
    <Button
      variant="text"
      size="sm"
      icon={Funnel}
      className={hasActiveFilters ? 'eidos-table-active-filter-button' : ''}
    />
  );

  const dropdownContent = (
    <div className={`eidos-table-filters-dropdown ${className}`}>
      <div className="eidos-table-filters-header">
        <h4 className="eidos-table-filters-title">Filters</h4>
      </div>

      {filterRows.length > 0 && (
        <div className="eidos-table-filter-rows">
          {filterRows.map((row) => {
            const column = getColumnByKey(row.columnKey);
            const allColumns = getAllColumnsWithDisabledState(row.id);
            const isTemporaryFilter = row.columnKey.startsWith('__temp_');

            return (
              <div key={row.id} className="eidos-table-filter-row">
                <div className="eidos-table-column-select">
                  <Select
                    value={isTemporaryFilter ? '' : row.columnKey}
                    onChange={(value) => {
                      const newColumn = getColumnByKey(value as string);
                      if (newColumn) {
                        updateFilter(row.id, value as string, '');
                      }
                    }}
                    options={allColumns}
                    placeholder="Select column"
                    clearable={false}
                    inputProps={{ size: 'sm' }}
                    fullWidth
                  />
                </div>

                <div className="eidos-table-value-input">
                  {column && !isTemporaryFilter ? (
                    renderFilterInput(row, column)
                  ) : (
                    <Input value="" disabled placeholder="Select column first" size="sm" />
                  )}
                </div>

                <Button
                  variant="text"
                  size="sm"
                  icon={X}
                  color="secondary"
                  onClick={() => removeFilter(row.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="eidos-table-filters-footer">
        <div className="eidos-table-filters-actions">
          <Button
            variant="text"
            size="sm"
            preIcon={Plus}
            disabled={!canAddMore}
            onClick={addFilter}
          >
            Add Filter
          </Button>

          {hasActiveFilters && (
            <Button variant="text" size="sm" color="secondary" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}

          {hasChanges && (
            <div className="eidos-table-filters-apply-actions">
              <Button
                variant="outlined"
                size="sm"
                color="secondary"
                preIcon={RotateCcw}
                onClick={resetFilters}
              >
                Discard Changes
              </Button>
              <Button
                variant="filled"
                size="sm"
                color="primary"
                preIcon={Check}
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
      key={dropdownKey}
      trigger={triggerButton}
      content={dropdownContent}
      placement="bottom"
      align="end"
      autoWidth={false}
      maxWidth={'auto'}
      maxHeight={'auto'}
      closeOnClickOutside={true}
    />
  );
};
