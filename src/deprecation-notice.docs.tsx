import { useOf } from '@storybook/addon-docs/blocks';
import type { ModuleExports } from 'storybook/internal/types';
import { deprecationMessage, type DeprecationInfo } from './deprecation.docs';

/**
 * The banner a deprecated component's docs page shows directly under its
 * `# Title`:
 *
 * ```mdx
 * import { DeprecationNotice } from '../../deprecation-notice.docs';
 *
 * # OldThing
 *
 * <DeprecationNotice of={OldThingStories} />
 * ```
 *
 * It reads `parameters.deprecation` from the stories meta, so the details are
 * written once, next to the `deprecated` tag that badges the sidebar - see
 * `deprecation.docs.ts`. `check-story-docs.js` requires this block on every
 * tagged page.
 *
 * An explicit block rather than a custom `DocsContainer`: the container
 * renders before `<Meta of>` attaches the CSF file, so it would have to read
 * the tags through Storybook internals to know the page was deprecated.
 *
 * Written in a `.tsx` file, not inline in the `.mdx`, for the reason in
 * `guide-page.docs.tsx`: MDX would wrap multi-line children in a `<p>` and let
 * Storybook's docs CSS recolour them. Fixed px, per the guide-page rule.
 */
export const DeprecationNotice = ({ of }: { of: ModuleExports }) => {
  const resolved = useOf(of, ['meta']);
  const info = resolved.preparedMeta.parameters.deprecation as DeprecationInfo | undefined;
  if (!info) return null;

  return (
    <div
      role="note"
      style={{
        // `--danger-dark` on a 6% tint of itself: 6.9:1 for the preset, and
        // `-dark` rather than the base because text on a tint wants the
        // darker step (see "A --x-50 tint behind --x-color text" in SKILL.md).
        color: 'var(--danger-dark)',
        background: 'rgba(var(--danger-rgb), 0.06)',
        borderLeft: '4px solid var(--danger-dark)',
        borderRadius: 8,
        padding: '12px 16px',
        margin: '0 0 24px',
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {/* `use` is a component or prop name, so it is set in <code> here
          rather than left to the plain-text message - a backticked value
          would otherwise render its backticks literally. */}
      <strong>{deprecationMessage({ ...info, use: undefined })}</strong>
      {info.use && (
        <>
          {' '}
          Use <code>{info.use}</code> instead.
        </>
      )}
    </div>
  );
};
