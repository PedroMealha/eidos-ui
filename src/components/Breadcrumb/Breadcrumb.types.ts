import React from 'react';

export interface BreadcrumbItem {
  /** Display text for this step. */
  label: string;
  /**
   * If provided, renders as a link - through `LinkProvider`'s component when
   * one is set, so a router's link keeps navigation client-side.
   */
  href?: string;
  /** Click handler - useful for SPA routing without full page navigations. */
  onClick?: (e: React.MouseEvent) => void;
  /** Icon to show before the label (optional). */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Separator between items. Default: '/'. */
  separator?: React.ReactNode;
  className?: string;
}
