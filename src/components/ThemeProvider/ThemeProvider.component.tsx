import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { devWarn } from '../../utils';
import { ThemeContext } from './ThemeProvider.context';
import { buildTokens, diffFromDefault, resolveTheme, themeToCss } from './ThemeProvider.tokens';
import type {
  ColorScheme,
  ResolvedColorScheme,
  ThemeConfig,
  ThemeContextValue,
  ThemeProviderProps,
} from './ThemeProvider.types';

/** The attribute `dist/index.css` keys the dark and `system` schemes on. */
const SCHEME_ATTRIBUTE = 'data-color-scheme';

const isColorScheme = (value: string | null): value is ColorScheme =>
  value === 'light' || value === 'dark' || value === 'system';

/** The scheme the page itself declares, for a provider not managing it. */
const readPageScheme = (): ColorScheme => {
  const value = document.documentElement.getAttribute(SCHEME_ATTRIBUTE);
  return isColorScheme(value) ? value : 'light';
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

const subscribeToPrefersDark = (onChange: () => void) => {
  const query = window.matchMedia?.(DARK_QUERY);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
};
const getPrefersDark = () => window.matchMedia?.(DARK_QUERY).matches ?? false;
// The server cannot know; `light` matches what `dist/index.css` renders for a
// page without the attribute, so hydration agrees.
const getServerPrefersDark = () => false;

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
  dark: { colors: { ...base.dark?.colors, ...patch.dark?.colors } },
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
  colorScheme: controlledScheme,
  defaultColorScheme,
  onColorSchemeChange,
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

  // ── Colour scheme ─────────────────────────────────────────────────────────
  //
  // "Managed" once a scheme has been given - by prop, by default, or through
  // `setColorScheme`. Until then the provider never touches the attribute: an
  // app that server-renders `data-color-scheme` to avoid a flash of the wrong
  // scheme must not have it overwritten by a client default. An unmanaged
  // provider follows whatever the page declares instead.
  const [uncontrolledScheme, setUncontrolledScheme] = useState<ColorScheme | undefined>(
    defaultColorScheme,
  );
  const managedScheme = controlledScheme ?? uncontrolledScheme;

  const [pageScheme, setPageScheme] = useState<ColorScheme>('light');
  useLayoutEffect(() => {
    if (managedScheme !== undefined) return;
    setPageScheme(readPageScheme());
    // The app owns the attribute in this mode and may change it at any time.
    const observer = new MutationObserver(() => setPageScheme(readPageScheme()));
    observer.observe(document.documentElement, { attributeFilter: [SCHEME_ATTRIBUTE] });
    return () => observer.disconnect();
  }, [managedScheme]);

  useLayoutEffect(() => {
    if (managedScheme === undefined) return;
    const root = document.documentElement;
    const previous = root.getAttribute(SCHEME_ATTRIBUTE);
    root.setAttribute(SCHEME_ATTRIBUTE, managedScheme);
    return () => {
      if (previous === null) root.removeAttribute(SCHEME_ATTRIBUTE);
      else root.setAttribute(SCHEME_ATTRIBUTE, previous);
    };
  }, [managedScheme]);

  const colorScheme = managedScheme ?? pageScheme;
  const prefersDark = useSyncExternalStore(
    subscribeToPrefersDark,
    getPrefersDark,
    getServerPrefersDark,
  );
  const resolvedColorScheme: ResolvedColorScheme =
    colorScheme === 'system' ? (prefersDark ? 'dark' : 'light') : colorScheme;

  const setColorScheme = useCallback(
    (next: ColorScheme) => {
      if (controlledScheme === undefined) setUncontrolledScheme(next);
      onColorSchemeChange?.(next);
    },
    [controlledScheme, onColorSchemeChange],
  );

  // ── Tokens ────────────────────────────────────────────────────────────────
  //
  // Written for the scheme *in effect*. They are inline styles on `<html>`,
  // which outrank every stylesheet rule - including the dark and `system`
  // blocks in `dist/index.css` - so a custom colour written for light would
  // pin the light value in dark mode. Hence the scheme-aware build, and the
  // diff against the same scheme's preset: an unthemed provider still writes
  // nothing, in either scheme.
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const tokens = useMemo(
    () => diffFromDefault(buildTokens(resolvedTheme, resolvedColorScheme), resolvedColorScheme),
    [resolvedTheme, resolvedColorScheme],
  );
  const isDefault = useMemo(
    () =>
      Object.keys(diffFromDefault(buildTokens(resolvedTheme, 'light'), 'light')).length === 0 &&
      Object.keys(diffFromDefault(buildTokens(resolvedTheme, 'dark'), 'dark')).length === 0,
    [resolvedTheme],
  );

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
      isDefault,
      toCss,
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      updateTheme,
      resetTheme,
      isDefault,
      toCss,
      colorScheme,
      resolvedColorScheme,
      setColorScheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.displayName = 'ThemeProvider';
