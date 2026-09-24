import { describe, expect, it } from 'vitest';
import lightSource from '../../styles/variables.scss?raw';
import darkSource from '../../styles/_color-schemes.scss?raw';
import {
  DARK_SURFACE,
  DARK_SURFACE_RAISED,
  RAMP_STEPS,
  buildDarkRamp,
  contrastRatio,
  deriveDarkBase,
  deriveDarkHover,
  deriveDarkLight,
  hexToRgbTriple,
} from './ThemeProvider.color';
import { defaultTheme } from './ThemeProvider.tokens';

/**
 * The colour schemes, read from the stylesheets themselves.
 *
 * Every figure in `_color-schemes.scss` and in the conformance docs is a
 * claim; these tests are what make them true. They parse the shipped SCSS -
 * imported as text, since this project runs in a browser without `fs` - so a
 * token edited in the stylesheet is checked the moment it changes, with no
 * second copy to forget.
 */

type Tokens = Record<string, string>;

const stripComments = (scss: string) => scss.replace(/\/\/[^\n]*/g, '');

const parseDeclarations = (block: string): Tokens =>
  Object.fromEntries(
    [...stripComments(block).matchAll(/--([a-z0-9-]+):\s*([^;{}]+);/g)].map(([, name, value]) => [
      name,
      value.replace(/\s+/g, ' ').trim(),
    ]),
  );

const light = parseDeclarations(lightSource);
const darkBody = darkSource.slice(
  darkSource.indexOf('@mixin dark-tokens {'),
  darkSource.indexOf('\n}', darkSource.indexOf('@mixin dark-tokens {')),
);
const darkOverrides = parseDeclarations(darkBody);
/** The dark scheme is the light `:root` with the dark overrides on top. */
const dark: Tokens = { ...light, ...darkOverrides };

/** Resolves `var(--x)` references until a literal is reached. */
const resolve = (tokens: Tokens, name: string, seen = new Set<string>()): string => {
  const value = tokens[name];
  if (value === undefined) throw new Error(`--${name} is not defined`);
  const reference = /^var\(--([a-z0-9-]+)\)$/.exec(value);
  if (!reference) return value;
  if (seen.has(name)) throw new Error(`--${name} is circular`);
  seen.add(name);
  return resolve(tokens, reference[1], seen);
};

const FILL_FAMILIES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;
const ALL_FAMILIES = [...FILL_FAMILIES, 'hyperlink'] as const;

const schemes = { light, dark } as const;

// ─── The dark palette is generated, and must stay generated ──────────────────

describe('dark palette parity', () => {
  it('uses the surfaces the colour functions are tuned against', () => {
    expect(darkOverrides.surface).toBe(DARK_SURFACE);
    expect(darkOverrides['surface-raised']).toBe(DARK_SURFACE_RAISED);
  });

  it.each(ALL_FAMILIES)(
    '--%s-* is exactly what the functions derive from the light preset',
    (family) => {
      const lightBase = defaultTheme.colors[family] as string;
      const darkBase = deriveDarkBase(lightBase);
      expect(darkOverrides[`${family}-color`]).toBe(darkBase);
      expect(darkOverrides[`${family}-rgb`]).toBe(hexToRgbTriple(darkBase));
      expect(darkOverrides[`${family}-dark`]).toBe(deriveDarkHover(darkBase));
      expect(darkOverrides[`${family}-light`]).toBe(deriveDarkLight(darkBase));
    },
  );

  it('--primary-50…900 is exactly the generated dark ramp', () => {
    const ramp = buildDarkRamp(deriveDarkBase(defaultTheme.colors.primary as string));
    for (const step of RAMP_STEPS) expect(darkOverrides[`primary-${step}`]).toBe(ramp[step]);
  });

  it('overrides every token the light scheme defines for a colour family', () => {
    // A family token the dark block forgot would silently keep its light value.
    for (const family of ALL_FAMILIES) {
      for (const suffix of ['color', 'rgb', 'dark', 'light']) {
        expect(darkOverrides, `--${family}-${suffix}`).toHaveProperty(`${family}-${suffix}`);
      }
    }
    for (const family of FILL_FAMILIES) {
      expect(darkOverrides, `--${family}-contrast`).toHaveProperty(`${family}-contrast`);
    }
  });
});

describe('light palette parity', () => {
  it.each(ALL_FAMILIES)('variables.scss --%s-color matches defaultTheme', (family) => {
    expect(light[`${family}-color`]).toBe(defaultTheme.colors[family]);
  });
});

// ─── Contrast, in both schemes ───────────────────────────────────────────────

describe.each(Object.entries(schemes))('%s scheme contrast', (_scheme, tokens) => {
  const t = (name: string) => resolve(tokens, name);
  const surfaces = ['surface', 'surface-raised', 'gray-50', 'gray-100'] as const;

  it.each(FILL_FAMILIES)('--%s-color reads as text on both surfaces (>= 4.5:1)', (family) => {
    for (const surface of ['surface', 'surface-raised']) {
      expect(contrastRatio(t(`${family}-color`), t(surface))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(FILL_FAMILIES)(
    '--%s-contrast reads on its fill and on its hover (>= 4.5:1)',
    (family) => {
      expect(contrastRatio(t(`${family}-contrast`), t(`${family}-color`))).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(t(`${family}-contrast`), t(`${family}-dark`))).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );

  it.each(ALL_FAMILIES)('--%s-dark stays legible as text on the page (>= 4.5:1)', (family) => {
    // Snackbar, Alert titles and link hovers use the hover shade as text.
    expect(contrastRatio(t(`${family}-dark`), t('surface'))).toBeGreaterThanOrEqual(4.5);
  });

  it('body and muted text clear 4.5:1 on every surface the library paints', () => {
    for (const surface of surfaces) {
      expect(contrastRatio(t('text-default'), t(surface)), surface).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t('text-muted'), t(surface)), surface).toBeGreaterThanOrEqual(4.5);
    }
    // gray-200 is the strongest tint used behind text (a selected row, a chip).
    expect(contrastRatio(t('text-muted'), t('gray-200'))).toBeGreaterThanOrEqual(4.5);
  });

  it('a primary tint keeps its text legible: -700 on -50 and -100', () => {
    expect(contrastRatio(t('primary-700'), t('primary-50'))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t('primary-700'), t('primary-100'))).toBeGreaterThanOrEqual(4.5);
  });

  it('a focus ring separates from the page and from a filled control (>= 3:1)', () => {
    // Ring = solid base outside a `--surface` gap. The gap/ring edge covers a
    // control filled in the ring's own colour (a checked Switch).
    for (const family of FILL_FAMILIES) {
      expect(contrastRatio(t(`${family}-color`), t('surface'))).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(t(`${family}-color`), t('surface-raised'))).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps disabled text visibly lighter than muted text', () => {
    // Exempt from 4.5:1 (SC 1.4.3), but it must still read as a distinct,
    // de-emphasised role rather than collapsing into the muted colour.
    expect(contrastRatio(t('text-disabled'), t('surface'))).toBeLessThan(
      contrastRatio(t('text-muted'), t('surface')),
    );
  });
});
