import React, { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Skeleton } from '../Skeleton';
import type { VirtualListProps } from './VirtualList.types';
import './VirtualList.scss';

// ============================================================================
// Helpers
// ============================================================================

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
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

  /**
   * Guards against firing `onEndReached` repeatedly while the user remains at
   * the bottom. Resets when they scroll back above the threshold, so
   * subsequent page fetches work correctly.
   */
  const endReachedFiredRef = useRef(false);

  // Normalise both the fixed-number and per-index-function variants of
  // `rowHeight` into the single `(index: number) => number` signature that
  // `useVirtualizer` expects for `estimateSize`.
  const estimateSize = useCallback(
    (index: number): number => (typeof rowHeight === 'function' ? rowHeight(index) : rowHeight),
    [rowHeight],
  );

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    overscan,
  });

  // ─── Scroll handler ───────────────────────────────────────────────────────
  // `useVirtualizer` already subscribes to scroll events on `scrollRef`
  // internally. We attach our own handler purely to forward `onScroll` and
  // drive the `onEndReached` logic - both operate independently of the
  // virtualizer's own scroll bookkeeping.
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop: st, clientHeight: ch, scrollHeight: sh } = e.currentTarget;
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
        <div className="eidos-virtual-list-inner" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index] as T;
            // Prefer the consumer's stable key; fall back to the numeric index.
            // We intentionally avoid `virtualItem.key` here because its type
            // includes `bigint` (per @tanstack/virtual-core), which React's
            // `key` prop does not accept.
            const key = getRowKey ? getRowKey(item, virtualItem.index) : virtualItem.index;
            return (
              <div
                key={key}
                className="eidos-virtual-list-row"
                style={{
                  // `top: 0` anchors the absolutely-positioned row to the top
                  // of the inner spacer; `transform` then translates it into
                  // position. This is the recommended pattern for
                  // @tanstack/react-virtual and keeps compositing efficient.
                  top: 0,
                  height: virtualItem.size,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                role="listitem"
              >
                {renderRow(item, virtualItem.index)}
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
