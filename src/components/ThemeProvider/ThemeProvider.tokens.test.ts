import { describe, expect, it } from 'vitest';
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
import { isValidHex } from './ThemeProvider.color';

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
    for (const line of css.split('\n').slice(1, -1)) {
      expect(line, `malformed declaration: ${line}`).toMatch(/^ {2}--[\w-]+: .+;$/);
    }
  });
});
