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
  /** Accessible alt text. Falls back to the brand `name` if omitted. */
  alt?: string;
}

export interface NavigationBrandProps {
  /**
   * Brand / product name. Rendered next to the mark, and used to build the
   * fallback initials `Avatar` when `logo` is omitted.
   */
  name: string;
  /**
   * Custom logo image (svg, png, or jpg). Rendered at a fixed height with
   * its aspect ratio preserved - vertical, horizontal, and square logos all
   * render correctly with no distortion or cropping. Omit to render an
   * initials `Avatar` built from `name` instead.
   */
  logo?: NavigationLogo;
  onClick?: () => void;
}

export interface NavigationProps {
  /** Brand mark (logo or initials avatar) and name, rendered above the item list. */
  brand: NavigationBrandProps;
  items: NavigationItem[];
  /** Rendered at the bottom of the rail - a role badge, plan indicator, upgrade CTA, etc. */
  footer?: React.ReactNode;
  className?: string;
}
