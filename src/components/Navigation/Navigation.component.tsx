import React, { useCallback, useEffect, useState } from 'react';
import { SquareChevronLeft, SquareChevronRight } from 'lucide-react';
import type { NavigationLogo, NavigationProps } from './Navigation.types';
import { Avatar } from '../Avatar';
import { IconButton } from '../Button';
import { Tooltip } from '../Tooltip';
import { renderIcon } from '../../utils';
import './Navigation.scss';

/**
 * Renders a custom brand logo, guaranteeing correct aspect-ratio rendering
 * regardless of whether the source image is vertical, horizontal, or square
 * - and regardless of how much width is actually available, expanded or
 * collapsed. Deliberately no JS sizing/measurement at all: a fixed `height`,
 * `width: auto` (derived from the image's own intrinsic ratio), a `max-width`
 * expressed as `min(72px, 100%)` (see `.eidos-navigation__brand-logo` in
 * Navigation.scss) so it never renders wider than whatever space its
 * container - the rail, expanded or collapsed - actually has, and
 * `object-fit: contain` so it's letterboxed rather than distorted if that
 * ever clamps it below its natural width-at-32px-tall. Centering is handled
 * separately, at the row level - see `&__brand--logo-only` in Navigation.scss.
 */
const NavigationBrandLogo: React.FC<{ logo: NavigationLogo }> = ({ logo }) => (
  <img src={logo.src} alt={logo.alt} className="eidos-navigation__brand-logo" />
);

export const Navigation: React.FC<NavigationProps> = ({
  brand,
  items,
  footer,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  collapseBelow = 768,
  collapsible = true,
  className = '',
}) => {
  // ── Controlled / uncontrolled collapsed state ─────────────────────────────
  // Mirrors CommandPalette's `open`/`defaultOpen` pattern - omitting
  // `collapsed` lets Navigation own its state entirely, while passing it
  // (+ `onCollapsedChange`) keeps full external control for consumers who
  // need to persist the preference or drive it from a responsive breakpoint.
  const isControlled = collapsedProp !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = isControlled ? collapsedProp : internalCollapsed;

  // Shared by the manual toggle button and `collapseBelow` below - uncontrolled
  // flips the internal state directly, controlled defers to `onCollapsedChange`
  // since Navigation can't change `collapsed` itself.
  const applyCollapsed = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalCollapsed(next);
      onCollapsedChange?.(next);
    },
    [isControlled, onCollapsedChange],
  );

  const toggleCollapsed = useCallback(() => {
    applyCollapsed(!collapsed);
  }, [applyCollapsed, collapsed]);

  // Auto-collapse/expand at a viewport breakpoint. `matchMedia`'s `change`
  // event only fires exactly at the crossing point, not on every resize
  // tick, so a manual toggle in between crossings is left alone until the
  // viewport actually crosses the breakpoint again.
  useEffect(() => {
    if (collapseBelow === undefined) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia(`(max-width: ${collapseBelow}px)`);

    applyCollapsed(query.matches);

    const handleChange = (e: MediaQueryListEvent) => applyCollapsed(e.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [collapseBelow, applyCollapsed]);

  const classes = ['eidos-navigation', collapsed && 'eidos-navigation--collapsed', className]
    .filter(Boolean)
    .join(' ');

  // A `logo` brand has no `name` text alongside it (see the discriminated
  // union in Navigation.types.ts), so there's never a second, variable-width
  // sibling competing for space - unlike the `name` variant, it's always
  // safe to just center it outright, in both expanded and collapsed states,
  // with nothing further to compute. See `&__brand--logo-only` in
  // Navigation.scss.
  const brandClasses = [
    'eidos-navigation__brand',
    brand.logo && 'eidos-navigation__brand--logo-only',
    brand.onClick && 'eidos-navigation__brand--clickable',
  ]
    .filter(Boolean)
    .join(' ');

  const brandAccessibleName = brand.logo ? brand.logo.alt : brand.name;

  return (
    <nav className={classes} aria-label="Main">
      <div
        className={brandClasses}
        onClick={brand.onClick}
        role={brand.onClick ? 'button' : undefined}
        tabIndex={brand.onClick ? 0 : undefined}
        // Only a real interactive control (role="button") reliably exposes
        // `aria-label` as its accessible name - a plain, non-interactive div
        // doesn't, so the visible (if currently faded) text remains the only
        // way assistive tech gets the brand name in that case.
        aria-label={brand.onClick ? brandAccessibleName : undefined}
        onKeyDown={
          brand.onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  brand.onClick?.();
                }
              }
            : undefined
        }
      >
        {brand.logo ? (
          <NavigationBrandLogo logo={brand.logo} />
        ) : (
          <>
            <Avatar name={brand.name} shape="square" size="sm" />
            {/* Only redundant with the wrapper's own `aria-label` when
                `brand.onClick` is set (see the note on it above) - otherwise
                this is the only accessible text for the brand at all. */}
            <span
              className="eidos-navigation__brand-name"
              aria-hidden={brand.onClick ? true : undefined}
            >
              {brand.name}
            </span>
          </>
        )}
      </div>

      <ul className="eidos-navigation__items">
        {items.map((item) => (
          <li key={item.id} className="eidos-navigation__item-wrapper">
            {/* Always wrapped (disabled rather than omitted while expanded)
                so the button underneath is never unmounted/remounted across
                a collapse toggle - that would otherwise reset its own CSS
                transitions (gap, padding, justify-content) partway through
                the rail's width animation, snapping instead of easing. */}
            <Tooltip message={item.label} placement="right" disabled={!collapsed}>
              <button
                type="button"
                className={[
                  'eidos-navigation__item',
                  item.active && 'eidos-navigation__item--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={item.disabled}
                onClick={item.onClick}
                aria-current={item.active ? 'page' : undefined}
                // The label fades out visually while collapsed (see
                // `.eidos-navigation__item-label` in Navigation.scss) but
                // isn't removed from the DOM, so it's given directly as the
                // accessible name here instead of relying on the (also
                // fading) visible text, and hidden from assistive tech below
                // to avoid it being announced twice alongside the `Tooltip`.
                aria-label={collapsed ? item.label : undefined}
              >
                {item.icon && renderIcon(item.icon, 'eidos-navigation__item-icon')}
                <span className="eidos-navigation__item-label" aria-hidden={collapsed || undefined}>
                  {item.label}
                </span>
              </button>
            </Tooltip>
          </li>
        ))}
      </ul>

      {footer && <div className="eidos-navigation__footer">{footer}</div>}

      {/* Floats half in/half out of the rail's right edge (see `&__toggle`
          in Navigation.scss) rather than sitting in its own row - a
          dedicated row reserved space in the flex column even when there
          were too few items to need it.

          The positioning has to live on this wrapping `<span>`, not on the
          `IconButton` itself: its `tooltip` prop makes `Button` wrap it in
          `Tooltip`'s own `.eidos-tooltip-trigger` div, which - not the
          button - is the actual flex child of `.eidos-navigation`. Removing
          only the inner button from flow left that outer wrapper still
          in-flow, still consuming space and still getting `gap` applied
          around it, which is exactly why a gap remained. */}
      {collapsible && (
        <span className="eidos-navigation__toggle">
          <IconButton
            icon={collapsed ? SquareChevronRight : SquareChevronLeft}
            variant="text"
            color="secondary"
            size="sm"
            tooltip={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={toggleCollapsed}
          />
        </span>
      )}
    </nav>
  );
};

Navigation.displayName = 'Navigation';
