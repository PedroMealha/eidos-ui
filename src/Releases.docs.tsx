import type { ReactNode } from 'react';
import pkg from '../package.json';
import { Divider } from './components/Divider';

/**
 * Presentational pieces for the "Releases" Storybook guide page
 * (`src/Releases.mdx`). Storybook-only - never exported from the library, not
 * an entry point, and never reaches `dist/`.
 *
 * They live here rather than as `export const`s inside `Releases.mdx` for one
 * concrete reason: the MDX language server recovers from a half-written file
 * by re-parsing a document's top-level import/export block with `acorn-loose`,
 * and `acorn-loose` cannot be extended with `acorn-jsx`
 * (`LooseParser.extend(jsx())` throws `this.curContext is not a function`, see
 * mdx-js/mdx-analyzer#267). Any JSX in that block therefore reports
 * "Could not parse import/exports with acorn-loose", which in turn leaves the
 * block's own imports unresolved - even though Storybook's Vite/MDX pipeline
 * compiles the exact same file without complaint. Keeping every `.mdx` ESM
 * block to plain imports sidesteps that entirely, and moves this JSX into a
 * file `tsc`/ESLint actually check.
 *
 * Every size below is a fixed px value, not rem/em - deliberately, not a style
 * preference. Storybook renders a Docs page's own JSX in the manager frame,
 * not the preview iframe where `global.scss`'s `html { font-size: 14px }`
 * reset applies, so rem/em resolve against whatever the manager frame's root
 * happens to be instead. Fixed px has no root dependency at all, which is the
 * only way to make this page render identically in both frames. It is also why
 * the tags below don't reuse `Chip`/`Pill`: a shared component can't opt out of
 * the library's rem-based sizing without changing it for every other consumer.
 *
 * Colours reuse the same semantic palette every component already uses
 * (primary/secondary/danger/success/warning/info), so a reader who knows the
 * rest of the system already knows what these mean here.
 */

type BumpKind = 'major' | 'minor' | 'patch' | 'initial';
type ReleaseCategory = 'added' | 'changed' | 'fixed' | 'removed';

interface ReleaseSection {
  category: ReleaseCategory;
  items: readonly ReactNode[];
}

const BUMP_META: Record<BumpKind, { label: string; color: string }> = {
  major: { label: 'Major', color: 'var(--danger-color)' },
  minor: { label: 'Minor', color: 'var(--primary-color)' },
  patch: { label: 'Patch', color: 'var(--secondary-color)' },
  initial: { label: 'Initial', color: 'var(--secondary-color)' },
};

const CATEGORY_META: Record<ReleaseCategory, { label: string; color: string }> = {
  added: { label: 'Added', color: 'var(--success-color)' },
  changed: { label: 'Changed', color: 'var(--warning-dark)' },
  fixed: { label: 'Fixed', color: 'var(--info-color)' },
  removed: { label: 'Removed', color: 'var(--danger-color)' },
};

export const packageVersion: string = pkg.version;

/**
 * The separator between two release cards. Wrapping `Divider` here rather than
 * using it directly in `Releases.mdx` keeps the page's spacing identical at
 * every separator, and keeps the `.mdx` free of a directory import
 * (`./components/Divider` resolves through that folder's `index.ts`, which the
 * MDX language server doesn't resolve because it doesn't apply this project's
 * `moduleResolution: bundler`).
 */
export const ReleaseDivider = () => <Divider style={{ margin: '24px 0' }} />;

export const Code = ({ children }: { children: ReactNode }) => {
  return (
    <code
      style={{
        fontSize: '13px',
        background: 'var(--gray-100)',
        padding: '1px 5px',
        borderRadius: 'var(--border-radius-sm)',
      }}
    >
      {children}
    </code>
  );
};

export const BumpTag = ({ bump }: { bump: BumpKind }) => {
  const meta = BUMP_META[bump];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${meta.color}`,
        color: meta.color,
        fontFamily: 'monospace',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: '4px',
      }}
    >
      {meta.label}
    </span>
  );
};

export const VersionTag = ({ children }: { children: ReactNode }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--primary-color)',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        padding: '3px 8px',
        borderRadius: '4px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
};

export const CategoryLabel = ({ category }: { category: ReleaseCategory }) => {
  const meta = CATEGORY_META[category];
  return (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
};

export const ReleaseCard = ({
  version,
  date,
  bump,
  sections,
}: {
  version: string;
  date?: string;
  bump: BumpKind;
  sections: readonly ReleaseSection[];
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dark-color)' }}>
          v{version}
        </span>
        <BumpTag bump={bump} />
        {date && <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{date}</span>}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((section) => (
          <div key={section.category}>
            <CategoryLabel category={section.category} />
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
              {section.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '14px',
                    color: 'var(--gray-600)',
                    lineHeight: 1.6,
                    marginBottom: '4px',
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { BumpKind, ReleaseCategory, ReleaseSection };
