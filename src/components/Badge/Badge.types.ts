import React from 'react';

export interface BadgeProps {
  /** The element the badge is attached to */
  children: React.ReactNode;
  /** Content shown inside the badge, e.g. a notification count. Omit (with `dot`) for a dot-only indicator. */
  content?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  /** When content is a number, clamp display to `max+` if exceeded */
  max?: number;
  /** Render a small dot instead of `content` */
  dot?: boolean;
  /** Show the badge when `content` is `0` (ignored when `dot` is set) */
  showZero?: boolean;
  /** Pull the badge in slightly to follow the curve of a circular child (e.g. Avatar) */
  overlap?: 'circular' | 'rectangular';
  /** Corner of the wrapped element the badge is anchored to */
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Force-hide the badge without unmounting it */
  invisible?: boolean;
  className?: string;
}
