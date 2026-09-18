import type React from 'react';
import type { IconType } from '../../utils';

export interface NavigationItem {
  /** Unique id, used as the React key. */
  id: string;
  /** Label rendered next to the icon. */
  label: string;
  icon?: IconType;
  /**
   * Highlights the item as the current page. Fully controlled by the
   * consumer - `Navigation` has no routing knowledge of its own, so pass
   * `active: currentPath === item.path` (or however your app tracks the
   * current page) at the call site.
   */
  active?: boolean;
  disabled?: boolean;
  /** Called when the item is clicked. */
  onClick?: () => void;
}

export interface NavigationLogo {
  /** Image source - svg, png, or jpg. */
  src: string;
  /**
   * Accessible alt text. Required - unlike the `name` variant, there's no
   * other text this could fall back to once a logo is in play.
   */
  alt: string;
}

export interface NavigationBrandNameProps {
  /** Brand / product name, rendered next to an initials `Avatar` built from it. */
  name: string;
  logo?: never;
  onClick?: () => void;
}

export interface NavigationBrandLogoProps {
  /**
   * Custom logo image (svg, png, or jpg), rendered alone - no separate
   * `name` text alongside it. Rendered at a fixed height with its aspect
   * ratio preserved - vertical, horizontal, and square logos all render
   * correctly with no distortion or cropping.
   */
  logo: NavigationLogo;
  name?: never;
  onClick?: () => void;
}

/**
 * Discriminated union - pass exactly one of `name` (an initials `Avatar` +
 * text) or `logo` (rendered alone), never both. A logo typically already
 * bakes the brand name into the image itself, so pairing it with a separate
 * `name` label would just repeat it. Mirrors the `copyright` / `component`
 * split on `Footer`.
 */
export type NavigationBrandProps = NavigationBrandNameProps | NavigationBrandLogoProps;

export interface NavigationProps {
  /** Brand mark (logo or initials avatar) and name, rendered above the item list. */
  brand: NavigationBrandProps;
  items: NavigationItem[];
  /**
   * Rendered at the bottom of the rail - a role badge, plan indicator,
   * upgrade CTA, etc. Hidden while collapsed, since arbitrary content can't
   * reliably adapt to an icon-only width.
   */
  footer?: React.ReactNode;
  /**
   * Controlled collapsed (icon-only) state. Omit it (along with
   * `defaultCollapsed`) to let `Navigation` manage its own collapsed state
   * internally.
   */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled (`collapsed` omitted). @default false */
  defaultCollapsed?: boolean;
  /** Called whenever the collapsed state changes, in both controlled and uncontrolled modes. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * On by default: automatically collapses (and re-expands) `Navigation`
   * when the viewport crosses this width, in pixels - e.g.
   * `collapseBelow={1024}` collapses it on any viewport narrower than that,
   * and expands it again above. Uses `window.matchMedia` internally; does
   * nothing until mounted client-side, so it's SSR-safe. Works the same way
   * in both controlled and uncontrolled modes: uncontrolled, it drives
   * Navigation's own state directly; controlled, it calls
   * `onCollapsedChange` at the crossing point, exactly as if the built-in
   * toggle button had been clicked - your own state stays in charge either
   * way. A manual toggle in between crossings (e.g. expanding back while
   * still narrower than this) is respected until the viewport crosses the
   * breakpoint again. Pass `collapseBelow={0}` to opt out entirely (no
   * viewport is ever narrower than `0px`).
   *
   * **On mount it can only collapse, never expand.** Loading on a viewport
   * narrower than this collapses the rail; loading on a wider one leaves
   * `defaultCollapsed` (or a controlled `collapsed`) exactly as given. The
   * re-expansion above only happens on an actual crossing - applying the
   * breakpoint's answer on mount instead made `defaultCollapsed` useless on
   * any wide viewport, since the rail sprang open one commit after the
   * first paint.
   * @default 768
   */
  collapseBelow?: number;
  /** Renders the built-in collapse/expand toggle button. @default true */
  collapsible?: boolean;
  className?: string;
}
