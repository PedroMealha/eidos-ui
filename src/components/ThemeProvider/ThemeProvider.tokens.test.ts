import { describe, expect, it, vi } from 'vitest';
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  THEME_COLOR_KEYS,
  buildTokens,
  defaultTheme,
  diffFromDefault,
  resolveTheme,
  themeToCss,
} from './ThemeProvider.tokens';
import {
  DARK_SURFACE,
  DARK_SURFACE_RAISED,
  contrastRatio,
  isValidHex,
} from './ThemeProvider.color';

/**
 * Theme resolution and token emission.
 *
 * The properties worth pinning here are the ones a story cannot show: that an
 * unthemed provider writes *nothing*, that one bad prop falls back instead of
 * throwing, and that the emitted CSS carries nothing a strict CSP would
 * reject.
 */

describe('resolveTheme', () => {
  it('fills every colour family from the preset when nothing is supplied', () => {
    const resolved = resolveTheme({});
    for (const key of THEME_COLOR_KEYS) {
      expect(resolved.colors[key].base, `${key} missing`).toBeDefined();
      expect(isValidHex(resolved.colors[key].base), `${key} is not a hex`).toBe(true);
    }
  });

  it('keeps a supplied colour', () => {
    const resolved = resolveTheme({ colors: { primary: '#ff0000' } });
    expect(resolved.colors.primary.base).toBe('#ff0000');
    // Untouched families still come from the preset.
    expect(resolved.colors.success.base).toBe(defaultTheme.colors.success);
  });

  it('falls back to the preset for an invalid hex rather than throwing', () => {
    // A bad colour prop must not take down the whole provider - and therefore
    // the whole app - at render time.
    const resolved = resolveTheme({ colors: { primary: 'rebeccapurple' } });
    expect(resolved.colors.primary.base).toBe(defaultTheme.colors.primary);
  });

  it('keeps the base but drops an invalid pinned contrast', () => {
    const resolved = resolveTheme({
      colors: { primary: { base: '#123456', contrast: 'not-a-colour' } },
    });
    expect(resolved.colors.primary.base).toBe('#123456');
    expect(resolved.colors.primary.contrast).toBeUndefined();
  });

  it('honours a valid pinned contrast', () => {
    const resolved = resolveTheme({
      colors: { primary: { base: '#fde047', contrast: '#ffffff' } },
    });
    expect(resolved.colors.primary.contrast).toBe('#ffffff');
  });

  it('rejects an out-of-range font scale and falls back, rather than clamping', () => {
    // Deliberately *not* clamped. Silently turning a requested 2.0 into 1.25
    // gives the caller a layout they did not ask for and no signal; falling
    // back to the preset plus a `devWarn` matches how an invalid hex is
    // handled, so the whole config has one failure mode.
    const preset = defaultTheme.typography.fontScale;
    expect(resolveTheme({ typography: { fontScale: 99 } }).typography.fontScale).toBe(preset);
    expect(resolveTheme({ typography: { fontScale: 0 } }).typography.fontScale).toBe(preset);
    expect(resolveTheme({ typography: { fontScale: NaN } }).typography.fontScale).toBe(preset);
    expect(resolveTheme({ typography: { fontScale: Infinity } }).typography.fontScale).toBe(preset);
  });

  it('accepts the range inclusive of both bounds', () => {
    expect(resolveTheme({ typography: { fontScale: FONT_SCALE_MIN } }).typography.fontScale).toBe(
      FONT_SCALE_MIN,
    );
    expect(resolveTheme({ typography: { fontScale: FONT_SCALE_MAX } }).typography.fontScale).toBe(
      FONT_SCALE_MAX,
    );
    expect(resolveTheme({ typography: { fontScale: 1.1 } }).typography.fontScale).toBe(1.1);
  });
});

describe('buildTokens', () => {
  const tokens = buildTokens(resolveTheme({}));

  it('emits the four core tokens for every colour family', () => {
    for (const key of THEME_COLOR_KEYS) {
      for (const suffix of ['color', 'rgb', 'dark', 'light']) {
        expect(tokens[`--${key}-${suffix}`], `--${key}-${suffix} missing`).toBeDefined();
      }
    }
  });

  it('emits the full 50-900 ramp for primary only', () => {
    expect(tokens['--primary-500']).toBeDefined();
    expect(tokens['--primary-50']).toBeDefined();
    expect(tokens['--primary-900']).toBeDefined();
    expect(tokens['--success-500']).toBeUndefined();
  });

  it('reuses the hand-tuned preset ramp when primary is the preset colour', () => {
    // Documented: regenerating a near-identical ramp would make an unthemed
    // provider emit overrides for values that already match the stylesheet.
    expect(tokens['--primary-500']).toBe('#5c5de8');
    expect(tokens['--primary-50']).toBe('#eef2ff');
    expect(tokens['--primary-900']).toBe('#312e81');
  });

  it('trims trailing zeros from generated font sizes', () => {
    // `0.750rem` is valid CSS but reads as a bug in devtools.
    for (const [name, value] of Object.entries(tokens)) {
      if (!name.startsWith('--font-size-')) continue;
      expect(value, `${name} has a trailing zero`).not.toMatch(/\.\d*0rem$/);
    }
  });

  it('scales font sizes by fontScale', () => {
    const scaled = buildTokens(resolveTheme({ typography: { fontScale: 1.25 } }));
    expect(scaled['--font-size-md']).not.toBe(tokens['--font-size-md']);
  });
});

describe('diffFromDefault', () => {
  it('emits nothing at all for a theme equal to the preset', () => {
    // The property that makes an unthemed `ThemeProvider` a genuine no-op:
    // no inline-style churn on documentElement, and `dist/index.css` stays
    // authoritative. If this ever returns entries, every consumer silently
    // gains a pile of inline custom properties that shadow their stylesheet.
    expect(diffFromDefault(buildTokens(resolveTheme({})))).toEqual({});
    expect(diffFromDefault(buildTokens(resolveTheme(defaultTheme)))).toEqual({});
  });

  it('emits only what actually changed', () => {
    const diff = diffFromDefault(buildTokens(resolveTheme({ colors: { danger: '#b91c1c' } })));
    expect(diff['--danger-color']).toBe('#b91c1c');
    // Nothing from an untouched family leaks in.
    expect(Object.keys(diff).every((name) => name.startsWith('--danger-'))).toBe(true);
  });
});

describe('themeToCss', () => {
  const css = themeToCss(resolveTheme({ colors: { primary: '#ff0000' } }));

  it('produces a :root block', () => {
    expect(css.startsWith(':root {')).toBe(true);
    expect(css.trimEnd().endsWith('}')).toBe(true);
    expect(css).toContain('--primary-color: #ff0000;');
  });

  it('contains nothing a strict CSP would reject', () => {
    // `url()` in a custom property is the classic way a "theme" turns into a
    // remote fetch; the CSP page promises this never happens.
    expect(css).not.toMatch(/url\(/i);
    expect(css).not.toMatch(/@import/i);
    expect(css).not.toMatch(/expression\(/i);
  });

  it('never emits an empty or malformed declaration', () => {
    // Several blocks now (light, dark, and dark inside a media query), so
    // selector, brace and blank lines are skipped and every other line - at
    // either indent - must be one well-formed declaration.
    const structural = /^(\s*$|\s*}$|\s*:root.* {$|@media .* {$)/;
    const declarations = css.split('\n').filter((line) => !structural.test(line));
    expect(declarations.length).toBeGreaterThan(0);
    for (const line of declarations) {
      expect(line, `malformed declaration: ${line}`).toMatch(/^ {2,4}--[\w-]+: .+;$/);
    }
  });
});

// ─── The dark scheme ─────────────────────────────────────────────────────────

describe('dark scheme tokens', () => {
  it('an unthemed provider writes nothing in dark either', () => {
    // The stylesheet's dark block is authoritative; an inline token would
    // override it (and the `system` block) for no reason.
    const tokens = buildTokens(resolveTheme({}), 'dark');
    expect(diffFromDefault(tokens, 'dark')).toEqual({});
  });

  // A spread of real brand colours, including the two failure shapes: a dark
  // navy with no light headroom and a saturated magenta that clears 4.5:1 on
  // white but reads poorly on a dark page.
  const BRANDS = ['#b5179e', '#0f766e', '#1a1a2e', '#fde047', '#e11d48', '#2563eb', '#16a34a'];

  it.each(BRANDS)('derives an accessible dark tone from %s', (brand) => {
    const tokens = buildTokens(resolveTheme({ colors: { primary: brand } }), 'dark');
    const base = tokens['--primary-color'];
    for (const surface of [DARK_SURFACE, DARK_SURFACE_RAISED]) {
      expect(contrastRatio(base, surface)).toBeGreaterThanOrEqual(5);
    }
    expect(contrastRatio(tokens['--primary-contrast'], base)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens['--primary-contrast'], tokens['--primary-dark']),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['--primary-700'], tokens['--primary-50'])).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('writes only the customised family in dark, like in light', () => {
    const resolved = resolveTheme({ colors: { success: '#16a34a' } });
    const diff = diffFromDefault(buildTokens(resolved, 'dark'), 'dark');
    expect(Object.keys(diff).every((name) => name.startsWith('--success-'))).toBe(true);
  });

  it('uses an explicit dark colour verbatim', () => {
    const resolved = resolveTheme({
      colors: { primary: '#0ea5e9' },
      dark: { colors: { primary: '#7dd3fc' } },
    });
    expect(buildTokens(resolved, 'dark')['--primary-color']).toBe('#7dd3fc');
    // The light scheme is untouched by a dark override.
    expect(buildTokens(resolved, 'light')['--primary-color']).toBe('#0ea5e9');
  });

  it('warns when an explicit dark colour fails text contrast, and still uses it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const resolved = resolveTheme({ dark: { colors: { danger: '#7f1d1d' } } });
    expect(resolved.dark.colors.danger.base).toBe('#7f1d1d');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dark.colors.danger'));
    warn.mockRestore();
  });
});

describe('themeToCss with schemes', () => {
  const css = themeToCss(resolveTheme({ colors: { primary: '#0ea5e9' } }));

  it('emits the light block and both dark selectors', () => {
    expect(css).toContain(':root {');
    expect(css).toContain(":root[data-color-scheme='dark'] {");
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(":root[data-color-scheme='system'] {");
  });

  it('writes typography once, in the light block only', () => {
    expect(css.match(/--font-family-primary/g)).toHaveLength(1);
  });
});
