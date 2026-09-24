import type React from 'react';

/**
 * What every link the library renders passes to the link component: standard
 * anchor attributes with a required `href`. A router's link usually needs a
 * thin wrapper to fit - React Router's `Link` takes `to`, not `href`.
 */
export interface LinkComponentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}

/** A component that renders a navigable link from `LinkComponentProps`. */
export type LinkComponent = React.ElementType<LinkComponentProps>;

export interface LinkProviderProps {
  /**
   * Renders every enabled link inside the provider - `Button`, `Chip`,
   * `Header` and `Toolbar` actions, and `Breadcrumb` crumbs given an `href`.
   * Typically your router's link, so navigation stays client-side.
   *
   * A disabled or loading link never reaches it: it renders as a plain
   * `<a>` with no `href`, because a router link cannot be disabled.
   *
   * @default 'a'
   */
  component: LinkComponent;
  children: React.ReactNode;
}
