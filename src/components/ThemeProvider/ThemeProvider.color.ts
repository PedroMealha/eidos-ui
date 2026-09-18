/**
 * Colour maths for the theme system.
 *
 * All conversions are done in JS and emitted as `#rrggbb`, so browser support
 * for `oklch()` is irrelevant here - nothing in the generated CSS uses a modern
 * colour function.
 *
 * OKLab is used rather than HSL for every interpolation. HSL lightness
 * interpolation is ~40 lines shorter but produces muddy, desaturated ramps for
 * exactly the saturated brand hues this feature exists to support, because its
 * "lightness" is not perceptual.
 */

// ============================================================================
// sRGB <-> OKLab
// ============================================================================

export interface Oklch {
  /** Perceptual lightness, 0-1. */
  l: number;
  /** Chroma (colourfulness), 0 to ~0.4 in sRGB. */
  c: number;
  /** Hue angle in radians. */
  h: number;
}

const srgbToLinear = (v: number): number =>
  v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

const linearToSrgb = (v: number): number =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Parses `#rgb` / `#rrggbb` into 0-1 sRGB channels. Returns null if unparseable. */
export const parseHex = (hex: string): [number, number, number] | null => {
  if (typeof hex !== 'string') return null;
  const raw = hex.trim().replace(/^#/, '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const isValidHex = (hex: string): boolean => parseHex(hex) !== null;

const toHex = ([r, g, b]: [number, number, number]): string =>
  '#' +
  [r, g, b]
    .map((v) =>
      Math.round(clamp01(v) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** `#rrggbb` -> the comma-separated triple the `--x-rgb` tokens use. */
export const hexToRgbTriple = (hex: string): string => {
  const rgb = parseHex(hex);
  if (!rgb) return '0, 0, 0';
  return rgb.map((v) => Math.round(v * 255)).join(', ');
};

const linearToOklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabToLinear = ([L, A, B]: [number, number, number]): [number, number, number] => {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

export const hexToOklch = (hex: string): Oklch => {
  const rgb = parseHex(hex) ?? [0, 0, 0];
  const [l, a, b] = linearToOklab(rgb.map(srgbToLinear) as [number, number, number]);
  return { l, c: Math.hypot(a, b), h: Math.atan2(b, a) };
};

const inGamut = ([r, g, b]: [number, number, number]): boolean =>
  [r, g, b].every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/**
 * Largest chroma that still fits in sRGB at this lightness and hue.
 *
 * Needed because OKLab is a much larger space than sRGB: naively keeping a
 * colour's chroma while changing its lightness frequently lands outside the
 * gamut, where channels clip and the hue visibly shifts.
 */
const maxChroma = (l: number, h: number): number => {
  let lo = 0;
  let hi = 0.45;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToLinear([l, mid * Math.cos(h), mid * Math.sin(h)]))) lo = mid;
    else hi = mid;
  }
  return lo;
};

export const oklchToHex = ({ l, c, h }: Oklch): string => {
  const lc = clamp01(l);
  const cc = Math.min(Math.max(c, 0), maxChroma(lc, h));
  return toHex(
    oklabToLinear([lc, cc * Math.cos(h), cc * Math.sin(h)]).map(linearToSrgb) as [
      number,
      number,
      number,
    ],
  );
};

// ============================================================================
// WCAG 2.1 contrast
// ============================================================================

/**
 * WCAG 2.1 is used rather than APCA. APCA models perception better but is
 * still a draft (targeted at WCAG 3), while WCAG 2 is what consumers are
 * actually audited against. Its known weakness - mis-ranking some mid-tone
 * blues and greens - is accepted for that reason.
 */
export const relativeLuminance = (hex: string): number => {
  const [r, g, b] = (parseHex(hex) ?? [0, 0, 0]).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export const contrastRatio = (a: string, b: string): number => {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** The two foreground candidates, matching `--white` and `--gray-900`. */
export const CONTRAST_LIGHT = '#ffffff';
export const CONTRAST_DARK = '#0f172a';

/**
 * Foreground to place on `fill`.
 *
 * White wins unless it drops below 3:1, at which point the better of the two
 * candidates is used. The threshold is deliberately 3:1 rather than "whichever
 * scores higher": on mid-tone reds the dark candidate often scores marginally
 * better while looking plainly wrong, and every preset base clears 4.5:1
 * against white anyway.
 */
export const pickContrast = (fill: string): string => {
  const onLight = contrastRatio(fill, CONTRAST_LIGHT);
  if (onLight >= 3) return CONTRAST_LIGHT;
  return onLight >= contrastRatio(fill, CONTRAST_DARK) ? CONTRAST_LIGHT : CONTRAST_DARK;
};

// ============================================================================
// Ramp generation
// ============================================================================

/** The ramp steps, in the order `--x-50` … `--x-900` are declared. */
export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type RampStep = (typeof RAMP_STEPS)[number];

/** The step the supplied base colour occupies; the ramp is built around it. */
const BASE_STEP = 500;

/**
 * Target lightness per step, and how much of the base's chroma to keep.
 *
 * Measured from the preset indigo ramp, so feeding the preset primary through
 * `buildRamp` lands close to the shipped `--primary-*` values rather than
 * something arbitrary. It is deliberately not an exact reproduction - see the
 * note on `buildRamp`.
 */
const RAMP_CURVE: Record<RampStep, { l: number; chroma: number }> = {
  50: { l: 0.962, chroma: 0.09 },
  100: { l: 0.93, chroma: 0.16 },
  200: { l: 0.87, chroma: 0.3 },
  300: { l: 0.785, chroma: 0.51 },
  400: { l: 0.68, chroma: 0.77 },
  500: { l: 0.558, chroma: 1.0 },
  600: { l: 0.511, chroma: 1.12 },
  700: { l: 0.457, chroma: 1.05 },
  800: { l: 0.398, chroma: 0.87 },
  900: { l: 0.359, chroma: 0.66 },
};

/** Ceiling/floor the generated ends aim for, leaving the base itself untouched. */
const LIGHT_CEILING = 0.985;
const DARK_FLOOR = 0.22;

/** Minimum lightness gap between adjacent steps, so none can collapse together. */
const MIN_STEP_DELTA = 0.012;

/**
 * Generates a 50-900 ramp around `base`, which is placed at the 500 step.
 *
 * The base's own hue is always preserved, and `--x-500` is returned as the base
 * hex verbatim, so the colour a consumer picked is never silently replaced.
 *
 * The curve above is *rescaled* to whatever lightness headroom the base leaves,
 * rather than being applied absolutely or simply shifted:
 *
 * - Applying it absolutely would reassign the base - pick a pale yellow and
 *   `--x-500` would come back a mid-olive, contradicting `--x-color`.
 * - Shifting it so 500 sits at the base's lightness pushes the light end past
 *   `l = 1`, where it clips and 50/100/200/300 all come out pure white.
 *
 * The ends are **absolute**, not relative to the base: step 50 lands near-white
 * and step 900 near-dark whatever lightness the base has, with the remaining
 * steps interpolated between the base and those anchors. Only a base that is
 * already past an anchor compresses that side into what headroom is left.
 *
 * Getting this wrong is subtle. An earlier version offset every step *from the
 * base* by the curve's own distances, capped so the preset reproduced exactly.
 * That looks right - and reproduces the preset ramp perfectly - but it makes the
 * tints relative: a dark navy base (`#1a1a2e`) returned `--primary-50: #8a8a8c`,
 * a mid grey rather than a tint, because 50 sits only 0.404 lightness above 500
 * on the curve. Every consumer of the tint end broke visibly - `Navigation`'s
 * active item paints `--primary-50` and turned into a charcoal pill.
 *
 * Two inputs are genuinely degenerate and are handled rather than solved: a
 * base at or above `LIGHT_CEILING` has no room for tints, and one with zero
 * chroma (pure white, black, any gray) has no saturation to separate them with
 * either. For those the light end converges, and `isRampViable` reports it so
 * the caller can warn. Realistic light picks are fine - `#fde047` still yields
 * five distinct tints.
 */
export const buildRamp = (base: string): Record<RampStep, string> => {
  const { l: baseL, c: baseC, h } = hexToOklch(base);
  const anchor = RAMP_CURVE[BASE_STEP].l;

  // Where the ends of the scale sit, independent of the base. A base already
  // lighter than the curve's own 50 (or darker than its 900) has nowhere left
  // to go, so that side compresses into the remaining headroom instead.
  const curveLight = RAMP_CURVE[50].l;
  const curveDark = RAMP_CURVE[900].l;
  const lightTarget = baseL >= curveLight ? Math.min(LIGHT_CEILING, baseL + 0.02) : curveLight;
  const darkTarget = baseL <= curveDark ? Math.max(DARK_FLOOR * 0.2, baseL - 0.02) : curveDark;

  const lightSpan = curveLight - anchor;
  const darkSpan = anchor - curveDark;

  const out = {} as Record<RampStep, string>;
  for (const step of RAMP_STEPS) {
    if (step === BASE_STEP) {
      out[step] = base;
      continue;
    }
    const { l: curveL, chroma } = RAMP_CURVE[step];
    const offset = curveL - anchor;
    // How far along its half of the curve this step sits: 0 at the base, 1 at
    // the end. Interpolating that fraction between the base and the target
    // keeps the curve's shape while pinning where it ends up.
    const t = offset > 0 ? offset / lightSpan : -offset / darkSpan;
    const l = offset > 0 ? baseL + t * (lightTarget - baseL) : baseL - t * (baseL - darkTarget);
    out[step] = oklchToHex({ l, c: baseC * chroma, h });
  }

  return enforceSeparation(out, h, baseC);
};

/**
 * Walks outward from the base step, pushing any step that ended up too close to
 * its neighbour further away. Only bites for extreme inputs (near-white,
 * near-black, zero-chroma), where the rescale above has almost no room left.
 */
const enforceSeparation = (
  ramp: Record<RampStep, string>,
  h: number,
  baseC: number,
): Record<RampStep, string> => {
  const baseIndex = RAMP_STEPS.indexOf(BASE_STEP);
  const lightness = RAMP_STEPS.map((s) => hexToOklch(ramp[s]).l);

  // Lighter steps: walk from the base toward 50, each must be lighter.
  for (let i = baseIndex - 1; i >= 0; i--) {
    const limit = lightness[i + 1] + MIN_STEP_DELTA;
    if (lightness[i] < limit) lightness[i] = Math.min(1, limit);
  }
  // Darker steps: walk from the base toward 900, each must be darker.
  for (let i = baseIndex + 1; i < RAMP_STEPS.length; i++) {
    const limit = lightness[i - 1] - MIN_STEP_DELTA;
    if (lightness[i] > limit) lightness[i] = Math.max(0, limit);
  }

  const out = {} as Record<RampStep, string>;
  RAMP_STEPS.forEach((step, i) => {
    if (step === BASE_STEP) {
      out[step] = ramp[step];
      return;
    }
    out[step] = oklchToHex({
      l: lightness[i],
      c: baseC * RAMP_CURVE[step].chroma,
      h,
    });
  });
  return out;
};

/** How far `--x-dark` / `--x-light` sit from the base, in OKLab lightness. */
const DARK_DELTA = 0.086;
const LIGHT_DELTA = 0.169;

/** Below this lightness there is no room left to darken, so the hover lightens. */
const HOVER_INVERT_BELOW = DARK_DELTA * 1.5;

/**
 * The hover/active colour. Must differ *visibly* from the base and stay legible
 * as text on white, since `--x-dark` is used both as a fill (Button, Chip
 * hovers) and as text (Snackbar, link hover in `global.scss`).
 *
 * A fixed ramp step is not good enough: for a near-white base the 600 step
 * lands barely darker than the base and the hover reads as no change at all.
 * Hence a guaranteed delta.
 *
 * For a base that is already near-black the delta is applied *upwards* instead.
 * Clamping to a floor would return a colour lighter than the base while still
 * being named "dark", and returning the base unchanged would leave the control
 * with no hover affordance at all; lightening is what dark-surface design
 * systems do anyway.
 */
export const deriveDark = (base: string): string => {
  const { l, c, h } = hexToOklch(base);
  const target = l < HOVER_INVERT_BELOW ? l + DARK_DELTA : l - DARK_DELTA;
  return oklchToHex({ l: target, c, h });
};

/**
 * The light companion. Lightening has a hard ceiling, so for an already-pale
 * base this lands very close to it - acceptable, as `--x-light` is a public
 * token that nothing inside the library currently consumes.
 */
export const deriveLight = (base: string): string => {
  const { l, c, h } = hexToOklch(base);
  return oklchToHex({ l: Math.min(LIGHT_CEILING, l + LIGHT_DELTA), c, h });
};

/**
 * Whether `base` leaves enough lightness headroom to generate a usable 50-900
 * ramp. False only for near-white and near-black, where the tint or shade end
 * necessarily converges - the caller surfaces that as a developer warning
 * rather than silently shipping identical tokens.
 *
 * Deliberately does not test chroma: an unsaturated gray separates perfectly
 * well by lightness alone, and a saturated light colour like `#fde047` still
 * produces five distinct tints. Only the extremes genuinely fail.
 */
export const isRampViable = (base: string): boolean => {
  const { l } = hexToOklch(base);
  return l < 0.95 && l > 0.12;
};
