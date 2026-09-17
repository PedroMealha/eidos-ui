/**
 * Runtime font registration for the theme system.
 *
 * `--font-family-primary` only *names* families - it cannot make a font
 * available. Selecting "Plus Jakarta Sans" on a machine that doesn't have it
 * installed silently falls through to the next stack entry, which is why a
 * theme needs a way to supply the font data itself.
 *
 * ## Why this is CSP-safe
 *
 * Fonts are registered with the CSS Font Loading API from an `ArrayBuffer`:
 *
 * ```ts
 * document.fonts.add(new FontFace(family, buffer));
 * ```
 *
 * CSP's `font-src` directive governs *fetching* a font resource by URL - it is
 * what gates `@font-face { src: url(...) }` and the string form of the
 * `FontFace` constructor. The binary form performs no fetch at all, so there is
 * no request for `font-src` to check and no allowance to configure. Notably
 * this also avoids `blob:` URLs, which *would* require `font-src blob:`.
 *
 * No `<style>` element is created either, so nothing here needs a nonce - the
 * same position as the rest of the theme system.
 */

/** A font registered at runtime, as listed by the editor. */
export interface RegisteredFont {
  /** The family name to reference in a font stack. */
  family: string;
  /** Where it came from, so the UI can distinguish uploads from built-ins. */
  source: 'upload';
}

/**
 * Turns a filename into a usable CSS family name.
 *
 * Deliberately conservative: the real family name lives in the font's internal
 * `name` table, and parsing SFNT tables to read it would be a disproportionate
 * amount of binary handling for a label. The filename is what the user
 * recognises anyway.
 */
export const familyNameFromFile = (filename: string): string => {
  const base = filename.replace(/\.[^.]+$/, '');
  const cleaned = base
    // Strip the weight/style suffixes font vendors append.
    .replace(/[-_](regular|normal|book|roman)$/i, '')
    .replace(/[-_]+/g, ' ')
    // A quoted family name may contain spaces but not quotes or control chars.
    .replace(/["'\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Custom Font';
};

/** Wraps a family name for use in a CSS font stack if it needs quoting. */
export const quoteFamily = (family: string): string =>
  /^[a-zA-Z][a-zA-Z0-9-]*$/.test(family) ? family : `'${family}'`;

/**
 * Builds a full stack from a custom family, keeping sensible fallbacks so the
 * page stays readable if the font is ever unavailable.
 */
export const toFontStack = (family: string, mono = false): string =>
  mono
    ? `${quoteFamily(family)}, 'SF Mono', Monaco, monospace`
    : `${quoteFamily(family)}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

/** Font formats accepted for upload, as an `accept` attribute value. */
export const FONT_ACCEPT = '.woff2,.woff,.ttf,.otf';

const SUPPORTED_EXTENSIONS = /\.(woff2|woff|ttf|otf)$/i;

export const isSupportedFontFile = (filename: string): boolean =>
  SUPPORTED_EXTENSIONS.test(filename);

/**
 * Registers font data with the document so a theme can reference its family.
 *
 * Resolves with the family name actually registered. Rejects if the data is not
 * a font the browser can parse, or if the Font Loading API is unavailable
 * (notably during SSR, where there is no `document` to register against).
 */
export const registerFontFace = async (family: string, data: ArrayBuffer): Promise<string> => {
  if (typeof document === 'undefined' || !document.fonts) {
    throw new Error('registerFontFace requires a document with the CSS Font Loading API.');
  }

  // ArrayBuffer source - no URL is fetched, so CSP's font-src never applies.
  const face = new FontFace(family, data);
  await face.load();
  document.fonts.add(face);
  // No cache invalidation needed: only positive results are cached, and this
  // family could not have been cached positive while it was still unavailable.
  // `document.fonts.add` also fires `loadingdone`, which wakes subscribers.
  return family;
};

/** Reads a File and registers it, returning the family name it was given. */
export const registerFontFile = async (file: File, family?: string): Promise<string> => {
  if (!isSupportedFontFile(file.name)) {
    throw new Error(`Unsupported font format: ${file.name}. Use ${FONT_ACCEPT}.`);
  }
  const buffer = await file.arrayBuffer();
  return registerFontFace(family ?? familyNameFromFile(file.name), buffer);
};

/**
 * CSS generic families, which always resolve and must never be reported
 * missing. They also cannot be probed by the method below, since asking for
 * `monospace, monospace` measures identically to `monospace` alone.
 */
const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong',
  'inherit',
  'initial',
  'unset',
]);

/**
 * Mixed-width glyphs, so a real font is very unlikely to measure identically
 * to a fallback by coincidence.
 */
const PROBE_TEXT = 'mmmmmmmmmmlliI0OWw@';

/** Two structurally different fallbacks - a font need only differ from one. */
const PROBE_FALLBACKS = ['monospace', 'serif'] as const;

/**
 * Cached per family - **positive results only**.
 *
 * A negative answer is not stable: web fonts load asynchronously (always, with
 * `font-display: swap`), so a family probed during the first render is
 * legitimately unavailable and becomes available moments later. Caching that
 * `false` pinned the answer forever, which showed a permanent "not installed"
 * warning for fonts that had in fact loaded.
 *
 * A positive answer cannot go stale the same way - a loaded font is not
 * unloaded - so those are worth keeping. Re-probing the misses costs one canvas
 * measurement each.
 */
const availabilityCache = new Map<string, true>();

/**
 * Notifies when the set of usable fonts changes, so a caller rendering an
 * availability state can re-check.
 *
 * Both signals are needed: `loadingdone` covers fonts that begin loading after
 * subscription, while `ready` covers those already in flight when the listener
 * was attached - which is the common case for a stylesheet's `@font-face`
 * rules, since they start loading before any component mounts.
 */
export const subscribeToFontLoads = (onChange: () => void): (() => void) => {
  if (typeof document === 'undefined' || !document.fonts) return () => {};

  let active = true;
  const handler = () => {
    if (active) onChange();
  };

  document.fonts.addEventListener('loadingdone', handler);
  void document.fonts.ready.then(handler);

  return () => {
    active = false;
    document.fonts.removeEventListener('loadingdone', handler);
  };
};

/**
 * Whether a font family will actually render, rather than silently falling
 * through to the next entry in the stack.
 *
 * **`document.fonts.check` cannot answer this.** Per spec it reports whether
 * the faces *in the FontFaceSet* matching the query are loaded, so with no
 * matching face it returns `true` vacuously. Verified in a real browser: it
 * answers `true` for `'Totally Not A Real Font 12345'`, and therefore for every
 * uninstalled system font too. Using it here produced a check that could never
 * fail.
 *
 * Instead the family is measured on a canvas against two fallbacks. If it
 * resolves to anything real, the text measures differently from at least one
 * fallback alone; if it does not resolve, the browser renders that fallback and
 * the widths match exactly.
 */
export const isFontAvailable = (family: string): boolean => {
  const name = family.trim().replace(/^['"]|['"]$/g, '');
  if (!name) return true;
  if (GENERIC_FAMILIES.has(name.toLowerCase())) return true;
  if (typeof document === 'undefined') return true;

  if (availabilityCache.get(name)) return true;

  try {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return true;

    const available = PROBE_FALLBACKS.some((fallback) => {
      context.font = `100px ${fallback}`;
      const baseline = context.measureText(PROBE_TEXT).width;
      context.font = `100px ${quoteFamily(name)}, ${fallback}`;
      // An invalid font shorthand leaves `font` untouched, which measures as
      // the baseline and correctly reports the family as unavailable.
      return Math.abs(context.measureText(PROBE_TEXT).width - baseline) > 0.5;
    });

    if (available) availabilityCache.set(name, true);
    return available;
  } catch {
    // Never report a font missing because probing itself failed - and don't
    // cache a failure, so a later call can still get a real answer.
    return true;
  }
};

/** Whether the first family in a stack will render. */
export const isFontStackAvailable = (stack: string): boolean =>
  isFontAvailable(stack.split(',')[0] ?? '');
