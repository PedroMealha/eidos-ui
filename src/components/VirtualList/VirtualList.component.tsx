import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '../Skeleton';
import type { VirtualListProps } from './VirtualList.types';
import './VirtualList.scss';

// ============================================================================
// Helpers
// ============================================================================

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Binary search: returns the largest index `i` in [0, offsets.length - 2] such
 * that `offsets[i] <= target`. Used to locate the first visible row for
 * variable-height mode.
 */
function findRowIndexForOffset(offsets: number[], target: number): number {
  let lo = 0;
  let hi = offsets.length - 2; // last valid row index

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((offsets[mid] as number) <= target) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

// ============================================================================
// Component
// ============================================================================

function VirtualListInner<T = unknown>({
  data,
  renderRow,
  rowHeight,
  height,
  width = '100%',
  overscan = 3,
  loading = false,
  loadingRowCount = 10,
  emptyContent,
  className,
  onScroll,
  onEndReached,
  endReachedThreshold = 100,
  getRowKey,
}: VirtualListProps<T>): React.ReactElement | null {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  /**
   * Guards against firing `onEndReached` repeatedly while the user remains at
   * the bottom. Resets when they scroll back above the threshold, so
   * subsequent page fetches work correctly.
   */
  const endReachedFiredRef = useRef(false);

  // ─── Measure actual container pixel height ────────────────────────────────
  // We use ResizeObserver so string heights like '60vh' are correctly resolved
  // to pixel values needed by the windowing algorithm.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    // Capture the initial height synchronously (ResizeObserver is async on first fire)
    setContainerHeight(el.clientHeight);

    return () => observer.disconnect();
  }, []);

  // ─── Pre-compute cumulative row offsets (variable-height mode only) ───────
  // Stored as `offsets[i] = sum of rowHeight(j) for j in [0, i)`.
  // The sentinel `offsets[data.length]` equals total content height.
  // Only depends on the height function and item count — NOT on scroll position.
  const offsets = useMemo<number[] | null>(() => {
    if (typeof rowHeight !== 'function') return null;

    const rhFn = rowHeight;
    const arr = new Array<number>(data.length + 1);
    arr[0] = 0;
    for (let i = 0; i < data.length; i++) {
      arr[i + 1] = (arr[i] as number) + rhFn(i);
    }
    return arr;
  }, [data.length, rowHeight]);

  // ─── Windowing: compute the visible slice ─────────────────────────────────
  const { startIndex, endIndex, totalHeight, getOffset, getRowH } = useMemo(() => {
    if (data.length === 0) {
      return {
        startIndex: 0,
        endIndex: -1,
        totalHeight: 0,
        getOffset: (_i: number) => 0,
        getRowH: (_i: number) => 0,
      };
    }

    // ── Fixed height ──────────────────────────────────────────────────────
    if (typeof rowHeight === 'number') {
      const rh = rowHeight;
      const totalH = data.length * rh;
      const visibleCount = containerHeight > 0 ? Math.ceil(containerHeight / rh) : 0;
      const si = Math.max(0, Math.floor(scrollTop / rh) - overscan);
      const ei = Math.min(data.length - 1, si + visibleCount + overscan * 2);

      return {
        startIndex: si,
        endIndex: ei,
        totalHeight: totalH,
        getOffset: (i: number) => i * rh,
        getRowH: (_i: number) => rh,
      };
    }

    // ── Variable height ───────────────────────────────────────────────────
    if (!offsets) {
      // Safety guard: offsets is computed whenever rowHeight is a function.
      // This branch is unreachable in practice.
      return {
        startIndex: 0,
        endIndex: -1,
        totalHeight: 0,
        getOffset: (_i: number) => 0,
        getRowH: (_i: number) => 0,
      };
    }

    const rhFn = rowHeight;
    const totalH = (offsets[data.length] as number);

    // Binary-search for the first row that intersects the scroll viewport
    const rawFirst = findRowIndexForOffset(offsets, scrollTop);
    const si = Math.max(0, rawFirst - overscan);

    // Linear scan: advance until the row starts beyond the visible bottom
    let lastVisible = si;
    while (
      lastVisible < data.length - 1 &&
      (offsets[lastVisible] as number) < scrollTop + containerHeight
    ) {
      lastVisible++;
    }
    const ei = Math.min(data.length - 1, lastVisible + overscan);

    return {
      startIndex: si,
      endIndex: ei,
      totalHeight: totalH,
      getOffset: (i: number) => offsets[i] as number,
      getRowH: (i: number) => rhFn(i),
    };
  }, [scrollTop, containerHeight, data.length, rowHeight, offsets, overscan]);

  // ─── Scroll handler ───────────────────────────────────────────────────────
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop: st, clientHeight: ch, scrollHeight: sh } = e.currentTarget;
      setScrollTop(st);
      onScroll?.(st);

      if (onEndReached) {
        const nearEnd = st + ch >= sh - endReachedThreshold;
        if (nearEnd && !endReachedFiredRef.current) {
          endReachedFiredRef.current = true;
          onEndReached();
        } else if (!nearEnd) {
          // Reset so the next time the user reaches the bottom it fires again
          endReachedFiredRef.current = false;
        }
      }
    },
    [onScroll, onEndReached, endReachedThreshold],
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    height: toCssSize(height),
    width: toCssSize(width),
  };

  // Use the numeric rowHeight for skeleton rows; fall back to a sensible default
  // when rowHeight is a function (we don't have real data to compute from).
  const skeletonRowHeight = typeof rowHeight === 'number' ? rowHeight : 56;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={scrollRef}
      className={['eidos-virtual-list', className].filter(Boolean).join(' ')}
      style={containerStyle}
      onScroll={loading ? undefined : handleScroll}
      role="list"
      aria-busy={loading}
    >
      {/* ── Loading state ─────────────────────────────────────────────── */}
      {loading && (
        <div className="eidos-virtual-list-loading" aria-label="Loading content">
          {Array.from({ length: loadingRowCount }, (_, idx) => (
            <div
              key={idx}
              className="eidos-virtual-list-skeleton-row"
              style={{ height: skeletonRowHeight }}
            >
              <Skeleton
                variant="circular"
                width={skeletonRowHeight - 20}
                height={skeletonRowHeight - 20}
              />
              <div className="eidos-virtual-list-skeleton-row-content">
                <Skeleton variant="rounded" width="55%" height={12} />
                <Skeleton variant="rounded" width="38%" height={12} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!loading && data.length === 0 && (
        <div className="eidos-virtual-list-empty" role="status">
          {emptyContent}
        </div>
      )}

      {/* ── Virtualized content ───────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="eidos-virtual-list-inner" style={{ height: totalHeight }}>
          {Array.from({ length: Math.max(0, endIndex - startIndex + 1) }, (_, k) => {
            const i = startIndex + k;
            const item = data[i] as T;
            const key = getRowKey ? getRowKey(item, i) : i;
            return (
              <div
                key={key}
                className="eidos-virtual-list-row"
                style={{ top: getOffset(i), height: getRowH(i) }}
                role="listitem"
              >
                {renderRow(item, i)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const VirtualList = Object.assign(VirtualListInner, {
  displayName: 'VirtualList',
});
