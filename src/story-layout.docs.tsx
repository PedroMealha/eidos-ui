import type { CSSProperties, ReactNode } from 'react';

/**
 * Shared layout scaffolding for Storybook stories.
 *
 * Storybook-only: never exported from the library, not a tsup entry point
 * (tsup discovers entries from `src/components/*\/` only), and never reaches
 * `dist/`. The `.docs.tsx` suffix is load-bearing rather than decorative -
 * `release-needed.js` and `check-changelog.js` both exclude `*.docs.tsx` at
 * any depth, so editing this file correctly does not flag a release.
 *
 * Why it exists: the same `label` / `row` / `col` style objects had been
 * copy-pasted into a dozen story files, each carrying hardcoded hex values
 * (`#94a3b8`, `#666`, `#e2e8f0`) that were really just token values written
 * out by hand. Two problems followed. They drifted from the tokens whenever a
 * token changed, and `#94a3b8` (`--gray-400`) measures **2.8:1** against a
 * white canvas - below WCAG 1.4.3's 4.5:1 for the small uppercase text it was
 * used for. Labels here use `--gray-600` (~7.5:1) instead.
 *
 * Unlike a top-level guide page's JSX (`Releases.docs.tsx`), everything here
 * renders inside a `<Canvas>`, which the skill file's "fixed px, not rem"
 * rule explicitly exempts - story content gets `global.scss`'s root font-size
 * like any other component, so tokens are correct to use here.
 */

const GAP: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
};

interface LayoutProps {
  children: ReactNode;
  /** Spacing between children. Defaults to `md`. */
  gap?: 'sm' | 'md' | 'lg';
  /** Cross-axis alignment. Defaults to `center` for rows, `stretch` for stacks. */
  align?: CSSProperties['alignItems'];
  className?: string;
}

/**
 * A horizontal, wrapping run of sibling examples - the default shape for
 * showing a component's variants, colours or sizes next to each other.
 */
export const StoryRow = ({ children, gap = 'md', align = 'center', className }: LayoutProps) => (
  <div
    className={className}
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: align,
      gap: GAP[gap],
    }}
  >
    {children}
  </div>
);

/**
 * A vertical stack. Use for components that are full-width by nature (inputs,
 * alerts, cards) where a row would squash them.
 */
export const StoryStack = ({ children, gap = 'md', align = 'stretch', className }: LayoutProps) => (
  <div
    className={className}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      gap: GAP[gap],
    }}
  >
    {children}
  </div>
);

/**
 * The small uppercase caption above a group of examples.
 *
 * Only needed when a single story deliberately shows more than one axis at
 * once (a colour x variant matrix, say). A focused story whose name already
 * says what it shows does not need one - prefer adding a story over adding a
 * label.
 */
export const StoryLabel = ({ children }: { children: ReactNode }) => (
  <p
    style={{
      margin: '0 0 var(--spacing-sm)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: 'var(--gray-600)',
    }}
  >
    {children}
  </p>
);

/** A labelled group: `StoryLabel` over arbitrary content. */
export const StoryGroup = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div>
    <StoryLabel>{label}</StoryLabel>
    {children}
  </div>
);

/**
 * A responsive grid of `StoryGroup`s, for the rare story that genuinely has
 * several independent axes to show at once.
 */
export const StoryGrid = ({
  children,
  minColumnWidth = '220px',
  gap = 'lg',
}: {
  children: ReactNode;
  /** Columns wrap below this width. Defaults to `220px`. */
  minColumnWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
      gap: GAP[gap],
    }}
  >
    {children}
  </div>
);

/**
 * A neutral bounded surface for stories whose component needs a constrained
 * parent to be meaningful (virtualised lists, drawers, sticky layouts).
 * Replaces the ad-hoc `border: 1px dashed #e2e8f0` decorators.
 */
export const StoryFrame = ({
  children,
  height,
  width,
}: {
  children: ReactNode;
  height?: number | string;
  width?: number | string;
}) => (
  <div
    style={{
      height,
      width,
      border: '1px dashed var(--gray-200)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-md)',
      position: 'relative',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

/**
 * Renders the live value of a controlled story's state, so a reader can see
 * that `value`/`onChange` are actually wired. Replaces the several hand-rolled
 * `<div style={{ fontSize: '14px', color: '#666' }}>Selected: ...</div>`
 * variations.
 */
export const StoryValue = ({ label, value }: { label: string; value: ReactNode }) => (
  <p
    style={{
      margin: 0,
      fontSize: 'var(--font-size-sm)',
      color: 'var(--gray-600)',
    }}
  >
    {label}: <strong style={{ color: 'var(--gray-800)' }}>{value}</strong>
  </p>
);
