import type React from 'react';

export interface VirtualListProps<T = unknown> {
  /** Array of items to render. */
  data: T[];
  /** Renders a single row. Called with the item and its absolute index. */
  renderRow: (item: T, index: number) => React.ReactNode;
  /**
   * Row height in pixels.
   * Pass a number for a uniform fixed height, or a function for variable
   * per-row heights. The function receives the row index and must return a
   * positive number of pixels.
   */
  rowHeight: number | ((index: number) => number);
  /** Viewport (scroll-container) height. Accepts a pixel number or any CSS string (e.g. '60vh'). */
  height: number | string;
  /** Scroll-container width. Accepts a pixel number or any CSS string. Default: '100%'. */
  width?: number | string;
  /**
   * Number of extra rows rendered above and below the visible window.
   * Higher values reduce blank-row flashes during fast scrolling at the cost
   * of more DOM nodes. Default: 3.
   */
  overscan?: number;
  /** When true, renders skeleton placeholder rows instead of real data. */
  loading?: boolean;
  /** Number of skeleton rows to show while loading. Default: 10. */
  loadingRowCount?: number;
  /** Content rendered when `data` is empty (and `loading` is false). */
  emptyContent?: React.ReactNode;
  /** Additional CSS class applied to the scroll container. */
  className?: string;
  /** Called on every scroll event with the current `scrollTop` value (in px). */
  onScroll?: (scrollTop: number) => void;
  /**
   * Fired once when the user scrolls within `endReachedThreshold` px of the
   * bottom. Resets automatically when the user scrolls back above the
   * threshold, enabling repeated infinite-scroll fetches.
   */
  onEndReached?: () => void;
  /**
   * Distance from the bottom (in px) at which `onEndReached` is fired.
   * Default: 100.
   */
  endReachedThreshold?: number;
  /**
   * Returns a stable key for each row. Receives the item and its absolute
   * index. Defaults to the numeric index when omitted.
   */
  getRowKey?: (item: T, index: number) => string | number;
}
