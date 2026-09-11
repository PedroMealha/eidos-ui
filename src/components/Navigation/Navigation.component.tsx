import React, { useCallback, useState } from 'react';
import type { NavigationLogo, NavigationProps } from './Navigation.types';
import { Avatar } from '../Avatar';
import { renderIcon } from '../../utils';
import './Navigation.scss';

// Target rendered height for the brand mark, in px. Matches Avatar's `sm`
// size (--component-size-sm) so a custom logo and the fallback initials
// avatar sit at the same height. Must stay in sync with the `height` set on
// `.eidos-navigation__brand-logo` in Navigation.scss.
const LOGO_HEIGHT = 32;
// Caps how wide a very wide/horizontal logo can render, so it can never
// overflow the navigation rail. Must stay in sync with the `max-width` on
// `.eidos-navigation__brand-logo` in Navigation.scss.
const LOGO_MAX_WIDTH = 160;

/**
 * Renders a custom brand logo, guaranteeing correct aspect-ratio rendering
 * regardless of whether the source image is vertical, horizontal, or square.
 *
 * `Navigation.scss`'s `.eidos-navigation__brand-logo` rule alone (fixed
 * height, `width: auto`, `max-width`, `object-fit: contain`) is already a
 * safe, distortion-free default with no JS at all. The `onLoad` handler
 * below only fine-tunes the precise rendered width once the image's real
 * dimensions are known, and clamps it to `LOGO_MAX_WIDTH`.
 *
 * CSP note: `width` here is only ever set inside `onLoad`, which is a DOM
 * event that can only fire client-side after the image has decoded - it
 * never runs during `renderToString`/`renderToPipeableStream`. This
 * component's very first render (the one SSR captures) never includes an
 * inline `style` at all, so this can't reach server-rendered markup under
 * any circumstance. See `ContentSecurityPolicy.mdx` > "Navigation logo".
 */
const NavigationBrandLogo: React.FC<{ logo: NavigationLogo; alt: string }> = ({ logo, alt }) => {
  const [width, setWidth] = useState<number | undefined>(undefined);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setWidth(Math.min(LOGO_HEIGHT * (naturalWidth / naturalHeight), LOGO_MAX_WIDTH));
  }, []);

  return (
    <img
      src={logo.src}
      alt={alt}
      className="eidos-navigation__brand-logo"
      onLoad={handleLoad}
      style={width !== undefined ? { width } : undefined}
    />
  );
};

export const Navigation: React.FC<NavigationProps> = ({ brand, items, footer, className = '' }) => {
  const classes = ['eidos-navigation', className].filter(Boolean).join(' ');

  const brandClasses = [
    'eidos-navigation__brand',
    brand.onClick && 'eidos-navigation__brand--clickable',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classes} aria-label="Main">
      <div
        className={brandClasses}
        onClick={brand.onClick}
        role={brand.onClick ? 'button' : undefined}
        tabIndex={brand.onClick ? 0 : undefined}
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
          <NavigationBrandLogo logo={brand.logo} alt={brand.logo.alt ?? brand.name} />
        ) : (
          <Avatar name={brand.name} shape="square" size="sm" />
        )}
        <span className="eidos-navigation__brand-name">{brand.name}</span>
      </div>

      <ul className="eidos-navigation__items">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={['eidos-navigation__item', item.active && 'eidos-navigation__item--active']
                .filter(Boolean)
                .join(' ')}
              disabled={item.disabled}
              onClick={item.onClick}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.icon && renderIcon(item.icon, 'eidos-navigation__item-icon')}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {footer && <div className="eidos-navigation__footer">{footer}</div>}
    </nav>
  );
};

Navigation.displayName = 'Navigation';
