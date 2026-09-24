/**
 * The Storybook deprecation convention, in one place.
 *
 * A deprecated component carries two facts in its stories meta, and each is
 * read by exactly one consumer so they cannot drift:
 *
 * - `tags: ['deprecated']` - drives the sidebar badge (`.storybook/manager.tsx`)
 *   and Storybook's built-in tag filter. Tags are the only story metadata the
 *   manager can see; parameters never leave the preview iframe.
 * - `parameters.deprecation` - drives the docs-page banner
 *   (`DeprecationNotice`), which has room for the details a badge does not.
 *
 * `scripts/check-story-docs.js` fails the build when one is present without
 * the other. `.docs.ts` so the release and changelog gates ignore it, like
 * `story-layout.docs.tsx`.
 */

export const DEPRECATED_TAG = 'deprecated';

export interface DeprecationInfo {
  /** The version that deprecated it, e.g. `'3.8.0'`. */
  since: string;
  /** The version that will remove it, if decided. */
  removeIn?: string;
  /** What to use instead - a bare component or prop name, e.g. `'Select'`. Set in code type. */
  use?: string;
  /** One sentence on why, when it is not obvious from `use`. */
  reason?: string;
}

/**
 * Whether a sidebar entry should carry the badge.
 *
 * Only `component` entries are badged. Storybook gives a component node the
 * tags its stories share, and every story inherits its meta's tags - so
 * badging stories and docs too would repeat the badge on every row beneath a
 * deprecated component. The component row is where a reader decides whether
 * to open it at all.
 */
export const isDeprecatedEntry = (entry: { type?: string; tags?: readonly string[] }): boolean =>
  entry.type === 'component' && !!entry.tags?.includes(DEPRECATED_TAG);

/** The banner's sentence, e.g. "Deprecated since 3.8.0 and removed in 4.0.0. Use X instead." */
export const deprecationMessage = ({ since, removeIn, use, reason }: DeprecationInfo): string =>
  [
    removeIn
      ? `Deprecated since ${since} and removed in ${removeIn}.`
      : `Deprecated since ${since}.`,
    reason,
    use && `Use ${use} instead.`,
  ]
    .filter(Boolean)
    .join(' ');
