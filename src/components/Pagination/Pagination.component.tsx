import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../Button';
import { Select } from '../Select';
import type { PaginationProps } from './Pagination.types';

// ── Ellipsis range helper ─────────────────────────────────────────────────────

const ELLIPSIS = 'ellipsis' as const;
type PageItem = number | typeof ELLIPSIS;

function usePaginationRange(
  page: number,
  totalPages: number,
  siblingCount: number,
): PageItem[] {
  const totalShown = siblingCount * 2 + 5;

  if (totalPages <= totalShown) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling  = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis  = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: PageItem[] = [1];

  if (showLeftEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let i = 2; i < leftSibling; i++) items.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) items.push(i);
  }

  if (showRightEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) items.push(i);
  }

  items.push(totalPages);

  return items;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  siblingCount       = 1,
  showFirstLast      = false,
  color              = 'primary',
  size               = 'small',
  disabled           = false,
  className          = '',
  // Table-footer mode
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions    = [10, 25, 50, 100],
}) => {
  const items = usePaginationRange(page, totalPages, siblingCount);

  // ── Active-page editable input ─────────────────────────────────────────────
  const [inputValue, setInputValue] = useState(String(page));
  useEffect(() => { setInputValue(String(page)); }, [page]);

  const commitInput = (raw: string) => {
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages && val !== page) {
      onChange(val);
    } else {
      setInputValue(String(page)); // revert on invalid or same-page
    }
  };

  // ── Layout flags ───────────────────────────────────────────────────────────
  const hasResults  = totalItems !== undefined && pageSize !== undefined;
  const hasPageSize = !!onPageSizeChange && pageSize !== undefined;
  const tableMode   = hasResults || hasPageSize;

  const startItem = hasResults
    ? totalItems === 0 ? 0 : (page - 1) * pageSize! + 1
    : undefined;
  const endItem = hasResults ? Math.min(page * pageSize!, totalItems!) : undefined;

  const rootClasses = [
    'eidos-pagination',
    `eidos-pagination--${size}`,
    tableMode && 'eidos-pagination--table',
    className,
  ].filter(Boolean).join(' ');

  // ── Navigation block ───────────────────────────────────────────────────────
  const nav = (
    <nav aria-label="Pagination" className="eidos-pagination-nav">
      {showFirstLast && (
        <Button
          variant="text" size={size}
          icon={ChevronsLeft}
          disabled={page === 1 || disabled}
          onClick={() => onChange(1)}
          aria-label="First page"
        />
      )}

      <Button
        variant="text" size={size}
        icon={ChevronLeft}
        disabled={page === 1 || disabled}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      />

      {items.map((item, i) =>
        item === ELLIPSIS ? (
          <span
            key={`ellipsis-${i}`}
            className="eidos-pagination-ellipsis"
            aria-hidden="true"
          >
            …
          </span>

        ) : item === page ? (
          // Active page — styled as filled chip, editable via keyboard/click
          <input
            key="active-page"
            type="text"
            inputMode="numeric"
            className={[
              'eidos-pagination-page',
              'eidos-pagination-page--active',
              `eidos-pagination-page--${color}`,
            ].join(' ')}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={e => e.target.select()}
            onBlur={() => commitInput(inputValue)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                commitInput(inputValue);
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setInputValue(String(page));
                e.currentTarget.blur();
              }
            }}
            aria-label={`Page ${page} of ${totalPages}, editable`}
            aria-current="page"
            disabled={disabled}
          />

        ) : (
          <button
            key={item}
            type="button"
            className="eidos-pagination-page"
            onClick={() => onChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        )
      )}

      <Button
        variant="text" size={size}
        icon={ChevronRight}
        disabled={page === totalPages || disabled}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      />

      {showFirstLast && (
        <Button
          variant="text" size={size}
          icon={ChevronsRight}
          disabled={page === totalPages || disabled}
          onClick={() => onChange(totalPages)}
          aria-label="Last page"
        />
      )}
    </nav>
  );

  // ── Standalone mode ────────────────────────────────────────────────────────
  if (!tableMode) {
    return <div className={rootClasses}>{nav}</div>;
  }

  // ── Table-footer mode ──────────────────────────────────────────────────────
  return (
    <div className={rootClasses}>
      {hasResults && (
        <span className="eidos-pagination-info">
          Showing {startItem}-{endItem} of {totalItems} results
        </span>
      )}

      <div className="eidos-pagination-controls">
        {hasPageSize && (
          <div className="eidos-pagination-size">
            <label className="eidos-pagination-size-label">Show:</label>
            <Select
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((n) => ({
                id: String(n),
                value: String(n),
                label: String(n),
              }))}
              clearable={false}
              disabled={disabled}
              inputProps={{ size: 'small', width: '3ch' }}
            />
          </div>
        )}

        {totalPages > 1 && nav}
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
