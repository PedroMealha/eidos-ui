import React from 'react';
import type { SkeletonProps } from './Skeleton.types';
import './Skeleton.scss';

// ============================================================================
// Helpers
// ============================================================================

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
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
