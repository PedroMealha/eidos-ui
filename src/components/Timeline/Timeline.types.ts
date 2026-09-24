import React from 'react';

/**
 * The library's six colour names, plus `default` - a neutral gray dot for
 * entries that carry no status.
 */
export type TimelineColor =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default';

export interface TimelineItem {
  id: string;
  /** Main label / event title. Rendered in a `div`, so it may hold any content. */
  title: React.ReactNode;
  /**
   * Supporting content. Rendered in a `div`, so block content - a bullet list,
   * a row of chips, several paragraphs - is valid here.
   */
  description?: React.ReactNode;
  /** Timestamp or any secondary info shown opposite the dot (or below title in mobile). */
  timestamp?: React.ReactNode;
  /** Icon rendered inside the dot. Falls back to a filled circle. */
  icon?: React.ReactNode;
  /** Color of this item's dot. Default: 'default' (gray). */
  color?: TimelineColor;
}

export interface TimelineProps {
  items: TimelineItem[];
  /**
   * Accessible name for the list - e.g. "Order history". Omit it when a
   * visible heading already introduces the timeline (point `aria-labelledby`
   * at that heading instead), or when the context makes it obvious.
   */
  ariaLabel?: string;
  /** Id of a visible element naming the list, usually its heading. */
  'aria-labelledby'?: string;
  className?: string;
}
