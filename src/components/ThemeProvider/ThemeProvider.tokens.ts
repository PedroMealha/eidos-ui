import { devWarn } from '../../utils';
import {
  DARK_SURFACE,
  DARK_SURFACE_RAISED,
  RAMP_STEPS,
  buildDarkRamp,
  buildRamp,
  contrastRatio,
  deriveDark,
  deriveDarkBase,
  deriveDarkHover,
  deriveDarkLight,
  deriveLight,
  hexToRgbTriple,
  isValidHex,
  isRampViable,
  pickContrast,
} from './ThemeProvider.color';
import type {
  ResolvedColorScheme,
  ResolvedTheme,
  ThemeColorKey,
  ThemeColorValue,
  ThemeConfig,
} from './ThemeProvider.types';

export const THEME_COLOR_KEYS: readonly ThemeColorKey[] = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'hyperlink',
] as const;

/**
 * `hyperlink` is link text on a surface, never a fill, so it has no
 * `--hyperlink-contrast` token - nothing in the library would read it.
 */
const FILL_COLOR_KEYS: readonly ThemeColorKey[] = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
] as const;

/** Only `primary` has a 50-900 ramp in `variables.scss`. */
const RAMP_COLOR_KEY: ThemeColorKey = 'primary';

/** The eight preset `--font-size-*` values, in declaration order. */
const FONT_SIZE_STEPS: readonly [string, number][] = [
  ['xs', 0.75],
  ['sm', 0.875],
  ['base', 1],
  ['md', 1.1],
  ['lg', 1.125],
  ['xl', 1.25],
  ['2xl', 1.5],
  ['3xl', 1.875],
] as const;

/**
 * The shipped values from `src/styles/variables.scss`.
 *
 * This is a literal copy, not something derived: the ramp is hand-tuned and no
 * generator reproduces it byte for byte. Keeping it literal means a theme equal
 * to the preset writes no CSS properties at all, so default rendering is
 * identical to `dist/index.css`.
 *
 * Must be kept in sync with `variables.scss` by hand. The bases are all chosen
 * to clear WCAG AA against white text; see the comment at the top of that file.
 */
export const defaultTheme: Required<ThemeConfig> = {
  colors: {
    primary: '#5c5de8',
    secondary: '#617087',
    success: '#007f57',
    danger: '#d6272f',
    warning: '#9c6300',
    info: '#007a90',
    hyperlink: '#007b84',
  },
  typography: {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    monoFamily:
      "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace",
    fontScale: 1,
  },
  // Empty on purpose: the preset's dark colours are *derived* from `colors`
  // (see `_color-schemes.scss`), exactly as a consumer's are.
  dark: {},
};

/** The preset `--primary-*` ramp, needed so an unthemed primary emits nothing. */
const DEFAULT_PRIMARY_RAMP: Record<number, string> = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#5c5de8',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
};

export const FONT_SCALE_MIN = 0.875;
export const FONT_SCALE_MAX = 1.25;

const normalizeColor = (value: ThemeColorValue): { base: string; contrast?: string } =>
  typeof value === 'string' ? { base: value } : value;

type ResolvedColor = { base: string; contrast?: string };

/**
 * Validates one supplied colour. `undefined` means "use the fallback" - either
 * nothing was supplied or the base was invalid (which warns).
 */
const resolveColor = (
  supplied: ThemeColorValue | undefined,
  path: string,
): ResolvedColor | undefined => {
  if (supplied === undefined) return undefined;
  const { base, contrast } = normalizeColor(supplied);
  if (!isValidHex(base)) {
    devWarn(
      `theme-color-${path}`,
      `ThemeProvider: ${path} is not a valid hex colour (received ${JSON.stringify(base)}). Falling back to the preset.`,
    );
    return undefined;
  }
  if (contrast !== undefined && !isValidHex(contrast)) {
    devWarn(
      `theme-contrast-${path}`,
      `ThemeProvider: ${path}.contrast is not a valid hex colour (received ${JSON.stringify(contrast)}). It will be computed instead.`,
    );
    return { base };
  }
  return contrast === undefined ? { base } : { base, contrast };
};

/** Fills every absent field from the preset. */
export const resolveTheme = (theme: ThemeConfig): ResolvedTheme => {
  const colors = {} as ResolvedTheme['colors'];
  const darkColors = {} as ResolvedTheme['colors'];

  for (const key of THEME_COLOR_KEYS) {
    colors[key] =
      resolveColor(theme.colors?.[key], `colors.${key}`) ??
      normalizeColor(defaultTheme.colors[key]!);

    // The dark colour: an explicit `dark.colors` entry wins; otherwise the
    // light colour is tone-shifted, exactly as the preset's was. A pinned
    // light `contrast` does not carry over - it was chosen for the light fill.
    const explicitDark = resolveColor(theme.dark?.colors?.[key], `dark.colors.${key}`);
    if (explicitDark) {
      const worst = Math.min(
        contrastRatio(explicitDark.base, DARK_SURFACE),
        contrastRatio(explicitDark.base, DARK_SURFACE_RAISED),
      );
      if (worst < 4.5) {
        devWarn(
          `theme-dark-contrast-${key}`,
          `ThemeProvider: dark.colors.${key} (${explicitDark.base}) is ${worst.toFixed(2)}:1 against the dark surfaces, below the 4.5:1 text needs. It is used as given, but text in it will fail WCAG AA in the dark scheme - omit it to have a compliant tone derived from colors.${key}.`,
        );
      }
      darkColors[key] = explicitDark;
    } else {
      darkColors[key] = { base: deriveDarkBase(colors[key].base) };
    }
  }

  const scale = theme.typography?.fontScale;
  let fontScale = defaultTheme.typography.fontScale!;
  if (scale !== undefined) {
    if (!Number.isFinite(scale) || scale < FONT_SCALE_MIN || scale > FONT_SCALE_MAX) {
      devWarn(
        'theme-font-scale',
        `ThemeProvider: typography.fontScale must be between ${FONT_SCALE_MIN} and ${FONT_SCALE_MAX} (received ${String(scale)}). Falling back to ${fontScale}.`,
      );
    } else {
      fontScale = scale;
    }
  }

  return {
    colors,
    typography: {
      fontFamily: theme.typography?.fontFamily || defaultTheme.typography.fontFamily!,
      monoFamily: theme.typography?.monoFamily || defaultTheme.typography.monoFamily!,
      fontScale,
    },
    dark: { colors: darkColors },
  };
};

/**
 * Expands a resolved theme into the flat `--token: value` map to apply.
 *
 * Every family contributes `--x-color`, `--x-rgb`, `--x-dark` and `--x-light`;
 * the six fill families also get `--x-contrast`, and `primary` additionally
 * gets the full `--primary-50…900` ramp.
 */
export const buildTokens = (
  resolved: ResolvedTheme,
  scheme: ResolvedColorScheme = 'light',
): Record<string, string> => {
  if (scheme === 'dark') return buildDarkTokens(resolved);
  const tokens: Record<string, string> = {};

  for (const key of THEME_COLOR_KEYS) {
    const { base, contrast } = resolved.colors[key];
    tokens[`--${key}-color`] = base;
    tokens[`--${key}-rgb`] = hexToRgbTriple(base);
    tokens[`--${key}-dark`] = deriveDark(base);
    tokens[`--${key}-light`] = deriveLight(base);

    if (FILL_COLOR_KEYS.includes(key)) {
      tokens[`--${key}-contrast`] = contrast ?? pickContrast(base);
    }

    if (key === RAMP_COLOR_KEY) {
      const isPreset = base === normalizeColor(defaultTheme.colors[key]!).base;
      // The preset ramp is hand-tuned, so reuse it verbatim rather than
      // regenerating a near-identical one.
      const ramp = isPreset ? DEFAULT_PRIMARY_RAMP : buildRamp(base);
      if (!isPreset && !isRampViable(base)) {
        devWarn(
          `theme-ramp-${key}`,
          `ThemeProvider: colors.${key} (${base}) is too light or too dark to generate a usable --${key}-50…900 scale; several steps will be identical. Pick a colour with more headroom.`,
        );
      }
      for (const step of RAMP_STEPS) {
        tokens[`--${key}-${step}`] = ramp[step];
      }
    }
  }

  Object.assign(tokens, typographyTokens(resolved));
  return tokens;
};

const typographyTokens = (resolved: ResolvedTheme): Record<string, string> => {
  const tokens: Record<string, string> = {};
  const { fontFamily, monoFamily, fontScale } = resolved.typography;
  tokens['--font-family-primary'] = fontFamily;
  tokens['--font-family-mono'] = monoFamily;
  for (const [name, rem] of FONT_SIZE_STEPS) {
    // Trailing zeros trimmed so 1 * 0.75 reads as `0.75rem`, not `0.750rem`.
    tokens[`--font-size-${name}`] = `${parseFloat((rem * fontScale).toFixed(4))}rem`;
  }
  return tokens;
};

/**
 * The dark scheme's colour tokens, from `resolved.dark` - by the same
 * functions that generated the preset dark palette in `_color-schemes.scss`,
 * so an unthemed dark provider reproduces it exactly and writes nothing.
 */
const buildDarkTokens = (resolved: ResolvedTheme): Record<string, string> => {
  const tokens: Record<string, string> = {};
  for (const key of THEME_COLOR_KEYS) {
    const { base, contrast } = resolved.dark.colors[key];
    tokens[`--${key}-color`] = base;
    tokens[`--${key}-rgb`] = hexToRgbTriple(base);
    tokens[`--${key}-dark`] = deriveDarkHover(base);
    tokens[`--${key}-light`] = deriveDarkLight(base);
    if (FILL_COLOR_KEYS.includes(key)) {
      tokens[`--${key}-contrast`] = contrast ?? pickContrast(base);
    }
    if (key === RAMP_COLOR_KEY) {
      const ramp = buildDarkRamp(base);
      for (const step of RAMP_STEPS) tokens[`--${key}-${step}`] = ramp[step];
    }
  }
  Object.assign(tokens, typographyTokens(resolved));
  return tokens;
};

/** Tokens for the preset in each scheme, used to tell which are overrides. */
const DEFAULT_TOKENS: Record<ResolvedColorScheme, Record<string, string>> = {
  light: buildTokens(resolveTheme(defaultTheme), 'light'),
  dark: buildTokens(resolveTheme(defaultTheme), 'dark'),
};

/**
 * Only the tokens that differ from the preset *in the same scheme*.
 *
 * This is what makes an unthemed `ThemeProvider` a no-op in both schemes: it
 * writes nothing, so `dist/index.css` stays authoritative - including its dark
 * and `system` blocks, which inline styles would otherwise override.
 */
export const diffFromDefault = (
  tokens: Record<string, string>,
  scheme: ResolvedColorScheme = 'light',
): Record<string, string> => {
  const diff: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (DEFAULT_TOKENS[scheme][name] !== value) diff[name] = value;
  }
  return diff;
};

const block = (selector: string, tokens: Record<string, string>, indent = '') =>
  `${indent}${selector} {\n` +
  Object.entries(tokens)
    .map(([name, value]) => `${indent}  ${name}: ${value};`)
    .join('\n') +
  `\n${indent}}`;

/**
 * The resolved theme as CSS: `:root` for the light scheme, plus the dark
 * scheme's colours under `[data-color-scheme='dark']` and, inside a
 * `prefers-color-scheme` query, `[data-color-scheme='system']` - the same
 * selectors `dist/index.css` uses, so the pasted theme follows the scheme
 * exactly as the preset does.
 *
 * Paste it into your own stylesheet to bake a theme in at build time - that
 * avoids the brief flash of the preset that any runtime theme has when the
 * value arrives after first paint, and needs no JavaScript at all.
 */
export const themeToCss = (resolved: ResolvedTheme): string => {
  const light = buildTokens(resolved, 'light');
  // Typography is scheme-independent, so it is only written once.
  const dark = Object.fromEntries(
    Object.entries(buildTokens(resolved, 'dark')).filter(([name]) => !name.startsWith('--font-')),
  );
  return [
    block(':root', light),
    block(":root[data-color-scheme='dark']", dark),
    `@media (prefers-color-scheme: dark) {\n${block(":root[data-color-scheme='system']", dark, '  ')}\n}`,
  ].join('\n\n');
};
