import type { ReactNode } from 'react';
import pkg from '../package.json';
import { Accordion, AccordionItem } from './components/Accordion';

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
type ReleaseCategory = 'added' | 'changed' | 'deprecated' | 'fixed' | 'removed';

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
  // Neutral rather than a warning hue: a deprecation asks for nothing yet -
  // the code still works - and `removed` already owns the danger colour for
  // the release where it stops working.
  deprecated: { label: 'Deprecated', color: 'var(--secondary-color)' },
  fixed: { label: 'Fixed', color: 'var(--info-color)' },
  removed: { label: 'Removed', color: 'var(--danger-color)' },
};

export const packageVersion: string = pkg.version;

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

/**
 * One release, collapsed to its version header until opened.
 *
 * **Each card is its own single-item `Accordion`, deliberately** - not one
 * shared `Accordion` wrapping every card. The alternative would nest eighteen
 * `<ReleaseCard/>` children inside a JSX element in `Releases.mdx`, which is
 * the precise construct this page has repeatedly been broken by (see the
 * header comment above, and the MDX notes in the project rules): children of a
 * multi-line JSX element are re-parsed as markdown flow content, and an
 * indentation change from a formatter is enough to turn them into something
 * else. Per-card accordions keep the `.mdx` a flat list of self-contained
 * elements, which also means the snippet `scripts/promote-changelog.js`
 * generates at release time can be pasted anywhere in the file as-is.
 *
 * The trade-off accepted: with one item per accordion there is no
 * single-open-at-a-time coordination between releases. That is the behaviour
 * you want here anyway - two versions can be compared side by side.
 *
 * Which card starts open is **derived**, not passed in: the one matching the
 * installed version, which is always the newest. A `defaultOpen` prop would
 * have to be moved from the previous card to the new one by hand at every
 * release, and nothing would fail if it were forgotten.
 */
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
    <Accordion
      // See `.storybook/preview-docs.scss` - the class drops the bottom border
      // `default` gives an item that is also a `:first-child`, which every
      // single-item accordion's item is.
      className="eidos-releases-release"
      defaultValue={version === packageVersion ? version : undefined}
    >
      <AccordionItem
        value={version}
        label={
          // `white-space: normal` resets the `text-truncate` the trigger's
          // label span carries, so this row wraps on a narrow viewport instead
          // of being clipped by the span's `overflow: hidden`.
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              whiteSpace: 'normal',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 700 }}>v{version}</span>
            <BumpTag bump={bump} />
            {date && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{date}</span>}
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      </AccordionItem>
    </Accordion>
  );
};

export type { BumpKind, ReleaseCategory, ReleaseSection };
