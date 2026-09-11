import type React from 'react';

interface BaseFooterProps {
  className?: string;
}

export interface FooterCopyrightProps extends BaseFooterProps {
  /** Copyright text, centered in the footer. */
  copyright: string;
  component?: never;
}

export interface FooterComponentProps extends BaseFooterProps {
  /** Custom content that fully replaces the default centered copyright text. */
  component: React.ReactNode;
  copyright?: never;
}

/**
 * Discriminated union - pass exactly one of `copyright` or `component`, never
 * both. Mirrors the `TextButtonProps | IconButtonProps` pattern used by
 * `Button`: picking one variant's required prop forbids the other's via
 * `?: never`.
 */
export type FooterProps = FooterCopyrightProps | FooterComponentProps;
