import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { devWarn } from '../../utils';
import { ThemeContext } from './ThemeProvider.context';
import { buildTokens, diffFromDefault, resolveTheme, themeToCss } from './ThemeProvider.tokens';
import type { ThemeConfig, ThemeContextValue, ThemeProviderProps } from './ThemeProvider.types';

const EMPTY_THEME: ThemeConfig = {};

/**
 * Number of providers currently mounted.
 *
 * Because tokens are written to `document.documentElement` (see the component
 * comment for why), providers do not compose: two of them target the same
 * element, so whichever applied a given token last wins for the entire page -
 * including for the subtree of the other one. That looks like a broken theme
 * rather than a misuse, so it is worth saying out loud.
 */
let mountedProviders = 0;

/** Merges `patch` over `base` one level into `colors`/`typography`. */
const mergeTheme = (base: ThemeConfig, patch: ThemeConfig): ThemeConfig => ({
  colors: { ...base.colors, ...patch.colors },
  typography: { ...base.typography, ...patch.typography },
});

/**
 * Applies a theme by writing CSS custom properties to `document.documentElement`.
 *
 * Two deliberate choices worth knowing:
 *
 * **The target is `documentElement`, not a wrapper element.** Every overlay in
 * this library (`Dropdown`, `Modal`, `Drawer`, `Snackbar`, `Tooltip`, …) portals
 * to `document.body`, so tokens scoped to a wrapper `<div>` would leave every
 * popup rendering the preset instead.
 *
 * **Properties are set through the CSSOM** (`style.setProperty`), which no CSP
 * directive gates - `style-src` and `style-src-attr` only cover the `style`
 * HTML attribute and stylesheet loads. Nothing here needs a nonce, and no
 * `<style>` element is ever created. See `ContentSecurityPolicy.mdx`.
 *
 * Under SSR the server sends the preset from `dist/index.css` and the theme is
 * applied on hydration; use `toCss()` if you need a themed first paint.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: controlledTheme,
  defaultTheme: initialTheme,
  onThemeChange,
}) => {
  const isControlled = controlledTheme !== undefined;
  const [uncontrolledTheme, setUncontrolledTheme] = useState<ThemeConfig>(
    initialTheme ?? EMPTY_THEME,
  );
  const theme = isControlled ? controlledTheme : uncontrolledTheme;

  useEffect(() => {
    mountedProviders += 1;
    if (mountedProviders > 1) {
      devWarn(
        'theme-multiple-providers',
        `ThemeProvider: ${mountedProviders} providers are mounted at once. They all write to document.documentElement, so the last one to apply each token wins for the whole page - nested or sibling providers cannot theme separate subtrees. Use a single provider at your app root.`,
      );
    }
    return () => {
      mountedProviders -= 1;
    };
  }, []);

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const tokens = useMemo(() => diffFromDefault(buildTokens(resolvedTheme)), [resolvedTheme]);

  // Names written on the previous pass, so properties dropped from the theme
  // are removed rather than left behind at their last value.
  const appliedRef = useRef<string[]>([]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    for (const name of appliedRef.current) {
      if (!(name in tokens)) root.style.removeProperty(name);
    }
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value);
    }
    appliedRef.current = Object.keys(tokens);

    return () => {
      for (const name of appliedRef.current) {
        root.style.removeProperty(name);
      }
      appliedRef.current = [];
    };
  }, [tokens]);

  const commit = useCallback(
    (next: ThemeConfig) => {
      if (!isControlled) setUncontrolledTheme(next);
      onThemeChange?.(next);
    },
    [isControlled, onThemeChange],
  );

  const setTheme = useCallback((next: ThemeConfig) => commit(next), [commit]);

  const updateTheme = useCallback(
    (patch: ThemeConfig) => commit(mergeTheme(theme, patch)),
    [commit, theme],
  );

  const resetTheme = useCallback(() => commit(EMPTY_THEME), [commit]);

  const toCss = useCallback(() => themeToCss(resolvedTheme), [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      updateTheme,
      resetTheme,
      isDefault: Object.keys(tokens).length === 0,
      toCss,
    }),
    [theme, resolvedTheme, setTheme, updateTheme, resetTheme, tokens, toCss],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.displayName = 'ThemeProvider';
