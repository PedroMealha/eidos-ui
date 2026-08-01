import React from 'react';

export type TimelineColor = 'primary' | 'secondary' | 'success' | 'danger' | 'default';

export interface TimelineItem {
  id: string;
  /** Main label / event title. */
  title: React.ReactNode;
  /** Supporting text. */
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
  className?: string;
}
