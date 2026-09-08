export type PaginationColorProps =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface PaginationProps {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback when page changes. */
  onChange: (page: number) => void;
  /** How many page-number buttons to show around the current page. Default: 1. */
  siblingCount?: number;
  /** Show first/last page jump buttons. Default: false. */
  showFirstLast?: boolean;
  /** Color of the active page button. Default: 'primary'. */
  color?: PaginationColorProps;
  /** Size of page buttons. Default: 'sm'. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;

  // ── Table-footer mode ───────────────────────────────────────────────────────
  /** Total number of items - enables "Showing X–Y of Z results" text. */
  totalItems?: number;
  /** Current page size (items per page). Required for results-info text. */
  pageSize?: number;
  /** Callback when page size changes - enables the "Show: [N]" selector. */
  onPageSizeChange?: (size: number) => void;
  /** Options for the page-size selector. Default: [10, 25, 50, 100]. */
  pageSizeOptions?: number[];
}
