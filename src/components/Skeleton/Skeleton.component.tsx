import React from 'react';
import type { SkeletonProps } from './Skeleton.types';
import './Skeleton.scss';

// ============================================================================
// Helpers
// ============================================================================

/**
 * A bare number means pixels. A numeric *string* means pixels too - `'240'`
 * is not valid CSS, so returning it unchanged set an invalid declaration that
 * every browser drops silently, leaving the element unsized with nothing
 * logged. The prop is typed `number | string`, so passing `'240'` is an
 * entirely reasonable reading of the API. Anything with a unit (`'60vh'`,
 * `'100%'`, `'calc(...)'`) is passed through untouched.
 */
function toCssSize(value: number | string): string {
  if (typeof value === 'number') return `${value}px`;
  return /^-?\d*\.?\d+$/.test(value.trim()) ? `${value.trim()}px` : value;
}

// ============================================================================
// Component
// ============================================================================

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'wave',
  className,
}) => {
  const widthStyle = width !== undefined ? toCssSize(width) : undefined;
  const heightStyle = height !== undefined ? toCssSize(height) : undefined;

  // Multi-line text variant
  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={['eidos-skeleton-text-group', className].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={`eidos-skeleton eidos-skeleton--text eidos-skeleton--${animation}`}
            style={{
              width: i === lines - 1 ? '60%' : (widthStyle ?? '100%'),
              height: heightStyle,
            }}
          />
        ))}
      </div>
    );
  }

  // Single element
  return (
    <span
      className={[
        'eidos-skeleton',
        `eidos-skeleton--${variant}`,
        `eidos-skeleton--${animation}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: widthStyle, height: heightStyle }}
      aria-hidden="true"
    />
  );
};
