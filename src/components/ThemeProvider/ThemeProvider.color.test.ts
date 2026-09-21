import { describe, expect, it } from 'vitest';
import {
  CONTRAST_DARK,
  CONTRAST_LIGHT,
  buildRamp,
  contrastRatio,
  deriveDark,
  deriveLight,
  hexToOklch,
  hexToRgbTriple,
  isRampViable,
  isValidHex,
  oklchToHex,
  parseHex,
  pickContrast,
  RAMP_STEPS,
  relativeLuminance,
} from './ThemeProvider.color';
import { defaultTheme } from './ThemeProvider.tokens';

/**
 * The colour maths behind every theme token.
 *
 * Worth testing directly rather than through a story because these are the
 * claims the accessibility conformance report rests on, and none of them is
 * visible in a rendered component: a ramp that stops being monotonic, or a
 * preset base that drifts below 4.5:1, still *renders*. It just quietly stops
 * being accessible.
 */

/** WCAG relative-luminance contrast, computed independently of the module. */
const independentContrast = (a: string, b: string): number => {
  const channels = (hex: string) =>
    [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  const lum = (hex: string) => {
    const [r, g, b] = channels(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

describe('parseHex', () => {
  it('accepts 6-digit, 3-digit shorthand, and a missing leading #', () => {
    expect(parseHex('#ffffff')).toEqual([1, 1, 1]);
    expect(parseHex('#fff')).toEqual([1, 1, 1]);
    expect(parseHex('ffffff')).toEqual([1, 1, 1]);
    expect(parseHex('  #000000  ')).toEqual([0, 0, 0]);
  });

  it('returns null rather than throwing for anything unparseable', () => {
    // `resolveTheme` relies on null to fall back to the preset, so a throw
    // here would take down the whole ThemeProvider on one bad prop.
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('rebeccapurple')).toBeNull();
    expect(parseHex('rgb(0,0,0)')).toBeNull();
    expect(parseHex('#gggggg')).toBeNull();
    expect(parseHex('')).toBeNull();
    expect(parseHex(undefined as unknown as string)).toBeNull();
  });

  it('isValidHex agrees with parseHex', () => {
    expect(isValidHex('#abc')).toBe(true);
    expect(isValidHex('nope')).toBe(false);
  });
});

describe('hexToRgbTriple', () => {
  it('formats the triple the --x-rgb tokens consume', () => {
    expect(hexToRgbTriple('#5c5de8')).toBe('92, 93, 232');
  });

  it('degrades to black rather than emitting invalid CSS', () => {
    // These land inside `rgb(var(--x-rgb) / 0.1)`; a null here would produce
    // a declaration the browser drops silently.
    expect(hexToRgbTriple('not-a-colour')).toBe('0, 0, 0');
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG anchors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#5c5de8', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#5c5de8'),
      10,
    );
  });

  it('agrees with an independent implementation of the formula', () => {
    for (const hex of ['#5c5de8', '#d6272f', '#94a3b8', '#475569', '#007f57']) {
      expect(contrastRatio(hex, '#ffffff')).toBeCloseTo(independentContrast(hex, '#ffffff'), 6);
    }
  });

  it('reproduces the two ratios that drove the --text-muted change', () => {
    // `--gray-400` as body text was the systemic failure fixed in 3.3.0, and
    // `--gray-600` was chosen over `--gray-500` because gray-500 fails on
    // tinted surfaces. Pinning both keeps that decision from being undone.
    expect(contrastRatio('#94a3b8', '#ffffff')).toBeCloseTo(2.56, 1);
    expect(contrastRatio('#475569', '#ffffff')).toBeCloseTo(7.58, 1);
    expect(contrastRatio('#64748b', '#f1f5f9')).toBeLessThan(4.5);
  });
});

describe('relativeLuminance', () => {
  it('spans 0 to 1 for black to white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 6);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 6);
  });
});

describe('preset palette', () => {
  const bases = Object.entries(defaultTheme.colors) as [string, string][];

  it('has every base clearing WCAG AA as a fill behind white text', () => {
    // `ThemeProvider.tokens.ts` states this as a property of the palette, and
    // the conformance report repeats it. The measured worst case is `warning`
    // at 5.00, so there is only ~0.5 of headroom - a future palette tweak
    // could cross the line without anything else noticing.
    for (const [name, base] of bases) {
      expect(
        contrastRatio(base, CONTRAST_LIGHT),
        `${name} (${base}) on white is below AA`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('picks white as the foreground for every preset base', () => {
    for (const [name, base] of bases) {
      expect(pickContrast(base), `${name} (${base})`).toBe(CONTRAST_LIGHT);
    }
  });

  it('produces a viable ramp from every base', () => {
    for (const [name, base] of bases) {
      expect(isRampViable(base), `${name} (${base})`).toBe(true);
    }
  });
});

describe('pickContrast', () => {
  it('returns white while the fill stays at or above 3:1 against it', () => {
    expect(pickContrast('#5c5de8')).toBe(CONTRAST_LIGHT);
    expect(pickContrast('#000000')).toBe(CONTRAST_LIGHT);
  });

  it('falls back to the dark candidate only when white is genuinely worse', () => {
    // A pale yellow: white is ~1.3:1 on it, the dark candidate far better.
    expect(pickContrast('#fde047')).toBe(CONTRAST_DARK);
    expect(pickContrast('#ffffff')).toBe(CONTRAST_DARK);
  });

  it('prefers white on mid-tone fills even when dark scores marginally higher', () => {
    // The documented reason the threshold is 3:1 rather than "whichever
    // scores higher" - dark-on-red often wins numerically but looks wrong.
    const fill = '#d6272f';
    expect(contrastRatio(fill, CONTRAST_LIGHT)).toBeGreaterThanOrEqual(3);
    expect(pickContrast(fill)).toBe(CONTRAST_LIGHT);
  });
});

describe('oklch conversion', () => {
  it('round-trips a colour back to itself within one 8-bit step', () => {
    for (const hex of ['#5c5de8', '#007f57', '#d6272f', '#fde047', '#0f172a']) {
      const back = oklchToHex(hexToOklch(hex));
      const [a, b] = [parseHex(hex)!, parseHex(back)!];
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(a[i] - b[i]), `${hex} -> ${back} channel ${i}`).toBeLessThanOrEqual(
          1 / 255,
        );
      }
    }
  });

  it('clamps out-of-gamut requests to a valid hex instead of emitting NaN', () => {
    const out = oklchToHex({ l: 1.5, c: 0.4, h: 120 });
    expect(isValidHex(out)).toBe(true);
  });
});

describe('buildRamp', () => {
  const ramp = buildRamp('#5c5de8');

  it('emits every declared step as a valid hex', () => {
    expect(
      Object.keys(ramp)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual([...RAMP_STEPS]);
    for (const step of RAMP_STEPS) expect(isValidHex(ramp[step])).toBe(true);
  });

  it('runs monotonically from lightest at 50 to darkest at 900', () => {
    // The whole point of a ramp. A non-monotonic one still renders - it just
    // makes hover states jump the wrong way.
    const lums = RAMP_STEPS.map((step) => relativeLuminance(ramp[step]));
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i], `step ${RAMP_STEPS[i]} is not darker than ${RAMP_STEPS[i - 1]}`).toBeLessThan(
        lums[i - 1],
      );
    }
  });

  it('keeps the base hue across the whole ramp', () => {
    const baseHue = hexToOklch('#5c5de8').h;
    /** Shortest angular distance between two hues, 0-180. */
    const hueDelta = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };
    for (const step of RAMP_STEPS) {
      const { h, c } = hexToOklch(ramp[step]);
      if (c < 0.01) continue; // hue is meaningless once chroma collapses
      expect(hueDelta(h, baseHue), `step ${step} drifted hue`).toBeLessThan(12);
    }
  });

  it('lands near the shipped --primary-* ramp for the preset primary', () => {
    // `RAMP_CURVE` was measured from the shipped indigo ramp, so feeding the
    // preset back through it should approximate the real tokens. Loose on
    // purpose: the docs say it is deliberately not a byte-for-byte match.
    expect(contrastRatio(ramp[500], '#5c5de8')).toBeLessThan(1.1);
    expect(contrastRatio(ramp[50], '#eef2ff')).toBeLessThan(1.2);
  });

  it('still separates a saturated pale base into distinct steps', () => {
    // Documented: `#fde047` is viable even though it is light.
    const yellow = buildRamp('#fde047');
    const unique = new Set(RAMP_STEPS.map((s) => yellow[s]));
    expect(unique.size).toBe(RAMP_STEPS.length);
  });
});

describe('deriveDark / deriveLight', () => {
  it('makes a normal base darker', () => {
    const base = '#5c5de8';
    expect(hexToOklch(deriveDark(base)).l).toBeLessThan(hexToOklch(base).l);
  });

  it('LIGHTENS a near-black base instead of clamping', () => {
    // The documented inversion, and the least obvious behaviour here. Clamping
    // to a floor would return something lighter than the base while still
    // being called "dark"; returning the base unchanged would leave the
    // control with no hover affordance at all.
    //
    // The base is constructed at a known lightness rather than hard-coded:
    // the inversion threshold is `DARK_DELTA * 1.5` and is not exported, so a
    // hand-picked hex only tests the branch by luck. `#080b12` looks
    // near-black but sits at 0.150 - above the 0.129 threshold - and takes
    // the darkening branch.
    const nearBlack = oklchToHex({ l: 0.05, c: 0.02, h: 250 });
    const derived = deriveDark(nearBlack);
    expect(hexToOklch(derived).l).toBeGreaterThan(hexToOklch(nearBlack).l);
  });

  it('darkens a base that only looks near-black but is above the threshold', () => {
    // The other side of the same branch, pinned so the threshold cannot drift
    // without a test noticing.
    const base = '#080b12';
    expect(hexToOklch(base).l).toBeGreaterThan(0.129);
    expect(hexToOklch(deriveDark(base)).l).toBeLessThan(hexToOklch(base).l);
  });

  it('guarantees a visible delta rather than a fixed ramp step', () => {
    for (const base of ['#5c5de8', '#f8fafc', '#007f57']) {
      expect(contrastRatio(base, deriveDark(base)), `${base} hover is invisible`).toBeGreaterThan(
        1.1,
      );
    }
  });

  it('makes a base lighter, without exceeding the ceiling', () => {
    const base = '#5c5de8';
    expect(hexToOklch(deriveLight(base)).l).toBeGreaterThan(hexToOklch(base).l);
    expect(isValidHex(deriveLight('#fefefe'))).toBe(true);
  });
});

describe('isRampViable', () => {
  it('rejects only the extremes', () => {
    expect(isRampViable('#ffffff')).toBe(false);
    expect(isRampViable('#000000')).toBe(false);
    expect(isRampViable('#5c5de8')).toBe(true);
    // Documented: saturated-but-light is fine, unsaturated gray is fine.
    expect(isRampViable('#fde047')).toBe(true);
    expect(isRampViable('#808080')).toBe(true);
  });
});
