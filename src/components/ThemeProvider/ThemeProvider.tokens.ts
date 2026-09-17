import { devWarn } from '../../utils';
import {
  RAMP_STEPS,
  buildRamp,
  deriveDark,
  deriveLight,
  hexToRgbTriple,
  isValidHex,
  isRampViable,
  pickContrast,
} from './ThemeProvider.color';
import type {
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

/** Fills every absent field from the preset. */
export const resolveTheme = (theme: ThemeConfig): ResolvedTheme => {
  const colors = {} as ResolvedTheme['colors'];

  for (const key of THEME_COLOR_KEYS) {
    const supplied = theme.colors?.[key];
    const fallback = normalizeColor(defaultTheme.colors[key]!);
    if (supplied === undefined) {
      colors[key] = fallback;
      continue;
    }
    const { base, contrast } = normalizeColor(supplied);
    if (!isValidHex(base)) {
      devWarn(
        `theme-color-${key}`,
        `ThemeProvider: colors.${key} is not a valid hex colour (received ${JSON.stringify(base)}). Falling back to the preset.`,
      );
      colors[key] = fallback;
      continue;
    }
    if (contrast !== undefined && !isValidHex(contrast)) {
      devWarn(
        `theme-contrast-${key}`,
        `ThemeProvider: colors.${key}.contrast is not a valid hex colour (received ${JSON.stringify(contrast)}). It will be computed instead.`,
      );
      colors[key] = { base };
      continue;
    }
    colors[key] = contrast === undefined ? { base } : { base, contrast };
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
  };
};

/**
 * Expands a resolved theme into the flat `--token: value` map to apply.
 *
 * Every family contributes `--x-color`, `--x-rgb`, `--x-dark` and `--x-light`;
 * the six fill families also get `--x-contrast`, and `primary` additionally
 * gets the full `--primary-50…900` ramp.
 */
export const buildTokens = (resolved: ResolvedTheme): Record<string, string> => {
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

  const { fontFamily, monoFamily, fontScale } = resolved.typography;
  tokens['--font-family-primary'] = fontFamily;
  tokens['--font-family-mono'] = monoFamily;
  for (const [name, rem] of FONT_SIZE_STEPS) {
    // Trailing zeros trimmed so 1 * 0.75 reads as `0.75rem`, not `0.750rem`.
    tokens[`--font-size-${name}`] = `${parseFloat((rem * fontScale).toFixed(4))}rem`;
  }

  return tokens;
};

/** Tokens for the preset, used to tell which of them are actually overrides. */
const DEFAULT_TOKENS = buildTokens(resolveTheme(defaultTheme));

/**
 * Only the tokens that differ from the preset.
 *
 * This is what makes an unthemed `ThemeProvider` a no-op: it writes nothing, so
 * `dist/index.css` stays authoritative and there is no inline-style churn on
 * `documentElement` for values that already match.
 */
export const diffFromDefault = (tokens: Record<string, string>): Record<string, string> => {
  const diff: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (DEFAULT_TOKENS[name] !== value) diff[name] = value;
  }
  return diff;
};

/**
 * The resolved theme as a `:root { … }` block.
 *
 * Paste the output into your own stylesheet to bake a theme in at build time -
 * that avoids the brief flash of the preset that any runtime theme has when the
 * value arrives after first paint, and needs no JavaScript at all.
 */
export const themeToCss = (resolved: ResolvedTheme): string => {
  const tokens = buildTokens(resolved);
  const body = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `:root {\n${body}\n}`;
};
