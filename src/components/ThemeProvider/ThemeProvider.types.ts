import React from 'react';

/** The seven themeable colour families. */
export type ThemeColorKey =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'hyperlink';

/**
 * A themeable colour: either a bare hex string, or an object that also pins the
 * foreground to place on it.
 *
 * `contrast` exists because the provider writes tokens inline on
 * `document.documentElement`, and inline styles beat author stylesheets - a
 * consumer who must have a specific foreground could otherwise only override it
 * with `!important`. Leave it unset to have it computed (see `pickContrast`).
 */
export type ThemeColorValue = string | { base: string; contrast?: string };

export type ThemeColors = Partial<Record<ThemeColorKey, ThemeColorValue>>;

/** A selectable font stack, as offered by `ThemeEditor`. */
export interface ThemeFontOption {
  /** Display name, e.g. "Plus Jakarta Sans". */
  label: string;
  /** The full CSS font stack written to the token. */
  value: string;
}

export interface ThemeTypography {
  /** Replaces `--font-family-primary`. A full CSS font stack. */
  fontFamily?: string;
  /** Replaces `--font-family-mono`. A full CSS font stack. */
  monoFamily?: string;
  /**
   * Multiplier applied to all eight `--font-size-*` tokens. 1 is the preset.
   *
   * Note that `--spacing-*` is declared in `em`, so this scales most padding
   * and gaps along with the text rather than only the glyphs.
   */
  fontScale?: number;
}

/**
 * A theme. Every field is optional and anything omitted falls back to
 * `defaultTheme`, so a theme may be as small as one colour.
 *
 * Named `ThemeConfig` rather than `Theme` to avoid colliding with the `Theme`
 * exported by MUI, styled-components and others in a consumer's namespace.
 */
export interface ThemeConfig {
  colors?: ThemeColors;
  typography?: ThemeTypography;
}

/** A theme with every field populated - what the provider actually applies. */
export interface ResolvedTheme {
  colors: Record<ThemeColorKey, { base: string; contrast?: string }>;
  typography: Required<ThemeTypography>;
}

export interface ThemeContextValue {
  /** The theme as supplied, with omitted fields left absent. */
  theme: ThemeConfig;
  /** The same theme with every field filled in from the preset. */
  resolvedTheme: ResolvedTheme;
  /** Replaces the whole theme. */
  setTheme: (theme: ThemeConfig) => void;
  /** Deep-merges a partial theme into the current one. */
  updateTheme: (patch: ThemeConfig) => void;
  /** Returns to the preset. */
  resetTheme: () => void;
  /** True when nothing differs from the preset, so no tokens are being written. */
  isDefault: boolean;
  /** The resolved theme as a `:root { … }` CSS block. */
  toCss: () => string;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Controlled theme. Pair with `onThemeChange` and own persistence yourself -
   * this is the mode to use when the theme comes from a user record on your
   * server.
   */
  theme?: ThemeConfig;
  /** Initial theme for uncontrolled usage. Ignored when `theme` is supplied. */
  defaultTheme?: ThemeConfig;
  /** Fires whenever the theme changes, in both controlled and uncontrolled mode. */
  onThemeChange?: (theme: ThemeConfig) => void;
}
