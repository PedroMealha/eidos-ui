import { useState, useMemo } from "react";
import {
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type {
  TableColumn,
  TableProps,
  TableFilters,
  FilterValue,
} from "./Table.types";

export type { TableColumn, TableProps, TableFilters, FilterValue };
import { Pagination } from "../Pagination";
import { Spinner } from "../Spinner";
import { TableFiltersDropdown } from "./TableFiltersDropdown.component";

export const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
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
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // For backward compatibility, we'll just use the passed filters directly
  // The persistent logic should be handled by the parent component
  const effectiveFilters = filters;
  const effectiveOnFiltersChange = onFiltersChange;
  const effectiveDefaultFilters = defaultFilters;

  // Handle pagination - slice data for current page
  const displayData = useMemo(() => {
    if (!showPagination) return data;

    // Client-side pagination - slice the data
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return data.slice(startIndex, endIndex);
  }, [data, showPagination, currentPage, currentPageSize]);

  const totalPages = Math.ceil(data.length / currentPageSize);

  const handleSort = (key: string) => {
    const newDirection =
      currentSort?.key === key && currentSort?.direction === "asc"
        ? "desc"
        : "asc";

    if (onSortChange) {
      onSortChange(key, newDirection);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className={`eidos-table-container ${className || ""}`}>
        <div className="eidos-table-loading">
          <Spinner size="medium" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't return early for empty data - render the table structure with empty row

  return (
    <div className={`eidos-table-container ${className || ""}`}>
      {showFilters && effectiveOnFiltersChange && (
        <div className="eidos-table-toolbar">
          <div />
          <TableFiltersDropdown
            columns={columns}
            filters={effectiveFilters}
            onFiltersChange={effectiveOnFiltersChange}
            defaultFilters={effectiveDefaultFilters}
          />
        </div>
      )}
      <table className="eidos-table">
        <thead>
          <tr>
            {columns.map((column, index) => {
              const columnType = column.type || "data";
              const columnWidth =
                column.type === "icon"
                  ? "var(--component-size-lg)"
                  : column.width;
              const isSortable = column.sortable;
              const isCurrentlySorted = currentSort?.key === column.key;
              const sortDirection = isCurrentlySorted
                ? currentSort.direction
                : null;

              const alignment = column.align || "left";
              const alignmentClass = `eidos-table-align-${alignment}`;

              return (
                <th
                  key={index}
                  className={`eidos-table-header-cell eidos-table-header-cell-${columnType} ${
                    isSortable ? "eidos-table-sortable" : ""
                  } ${
                    isCurrentlySorted ? "eidos-table-sorted" : ""
                  } ${alignmentClass}`}
                  style={{ width: columnWidth }}
                  onClick={() => isSortable && handleSort(column.key as string)}
                >
                  <div
                    className={`eidos-table-header-content ${alignmentClass}`}
                  >
                    <span>{column.label}</span>
                    {isSortable && (
                      <div className="eidos-table-sort-indicator">
                        {sortDirection === "asc" && <ArrowUp size={14} />}
                        {sortDirection === "desc" && <ArrowDown size={14} />}
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
            displayData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`eidos-table-row ${
                  onRowClick ? "eidos-table-clickable" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => {
                  const value =
                    typeof column.key === "string" && column.key.includes(".")
                      ? column.key
                          .split(".")
                          .reduce(
                            (obj: unknown, key: string) =>
                              (obj as Record<string, unknown>)?.[key],
                            item as unknown
                          )
                      : item[column.key as keyof T];

                  const columnType = column.type || "data";
                  const columnWidth =
                    column.type === "icon"
                      ? "var(--component-size-lg)"
                      : column.width;
                  const alignment = column.align || "left";
                  const alignmentClass = `eidos-table-align-${alignment}`;

                  return (
                    <td
                      key={colIndex}
                      className={`eidos-table-cell eidos-table-cell-${columnType} ${alignmentClass}`}
                      style={{ width: columnWidth }}
                    >
                      {column.render
                        ? column.render(value, item)
                        : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr className="eidos-table-empty-row">
              <td
                colSpan={columns.length}
                className="eidos-table-cell eidos-table-empty-cell"
              >
                <div className="eidos-table-empty-message">
                  {emptyMessage}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showFooter && (
        <div className="eidos-table-footer">
          <div className="eidos-table-footer-content">
            {showPagination && data.length > 0 ? (
              // Pagination handles the full footer: results info + page-size
              // selector + page navigation — all in one component.
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
                totalItems={totalItems ?? data.length}
                pageSize={currentPageSize}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={pageSizeOptions}
                size="small"
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
};
