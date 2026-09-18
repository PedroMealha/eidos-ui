/**
 * Emits a BEM modifier in both its canonical kebab-case spelling and a legacy
 * camelCase one.
 *
 * The library shipped two conventions for the same idea: eight components
 * used `--fullWidth` while four used `--full-width`, and `Tabs` had
 * `--hideScrollbar`. Kebab-case is the canonical form - every block name
 * (`eidos-date-picker-trigger`) and every design token (`--font-size-sm`) is
 * already kebab, so a camelCase modifier was inconsistent with the very
 * selector it hung off.
 *
 * Renaming outright would be a **breaking** change: `README.md` presents the
 * `eidos-*` class names as things consumers may target, so a stylesheet out
 * there is matching the old spelling. Emitting both keeps every existing
 * selector working while new code has one spelling to learn.
 *
 * Deliberately a helper rather than a duplicated string literal at each call
 * site: two near-identical classes in a `className` read as a copy-paste slip
 * and invite exactly the "tidy up" that would silently break those consumer
 * stylesheets. It also makes dropping the aliases at the next major a change
 * to this one file rather than an edit in every component.
 *
 * Internal only - deliberately not re-exported from `src/index.ts`.
 *
 * @example
 * dualModifier('eidos-input', 'full-width', 'fullWidth');
 * // 'eidos-input--full-width eidos-input--fullWidth'
 */
export const dualModifier = (block: string, canonical: string, legacy: string): string =>
  `${block}--${canonical} ${block}--${legacy}`;

/** `dualModifier` preset for the library's most widespread split modifier. */
export const fullWidthModifier = (block: string): string =>
  dualModifier(block, 'full-width', 'fullWidth');
