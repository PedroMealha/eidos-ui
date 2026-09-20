import type { ReactNode } from 'react';
import pkg from '../package.json';

/**
 * The banner at the top of a top-level guide page (`Welcome.mdx`,
 * `Introduction.mdx`). Storybook-only - `*.docs.tsx` is excluded from
 * `release-needed.js` and `check-changelog.js`, so editing it cannot flag a
 * release.
 *
 * It exists because `Welcome` and `Getting Started` had each grown their own
 * copy of the same banner - same gradient, same decorative circles, same
 * version chip - and the copies had already drifted:
 *
 * | | Getting Started | Welcome |
 * | --- | --- | --- |
 * | title | `2.5rem` -> **35px** | `40px` |
 * | subtitle | `1.0625rem` -> ~15px | `17px` |
 * | padding | `2.5rem 2.5rem 2rem` | `40px 40px 36px` |
 *
 * Two banners that are meant to read as the same component rendering at two
 * different scales, purely because one was written in `rem` and the other in
 * `px`. One implementation makes that impossible.
 *
 * On `rem` vs `px` here: the skill file's "guide pages must use fixed px"
 * rule is based on the Docs page rendering in Storybook's *manager* frame at
 * a 16px root. Measured against Storybook 10.6, that is not what happens -
 * a Docs page renders in the **preview iframe**, where `global.scss`'s
 * `html { font-size: 14px }` applies and `1rem` resolves to `14px`, the same
 * as any story. Fixed px is kept anyway: it is what the rule says, it is
 * unambiguous, and it costs nothing here. See the note in SKILL.md.
 */

const TEXT = 'rgba(255,255,255,0.85)';

export const GuideHero = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
      borderRadius: 16,
      padding: '35px 35px 28px',
      marginBottom: 35,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* decorative circles */}
    <div
      style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: -30,
        right: 80,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }}
    />

    <div style={{ position: 'relative' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          padding: '4px 10px',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#a78bfa',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: TEXT,
            WebkitTextFillColor: TEXT,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          eidos-ui
        </span>
        <span
          style={{
            width: 1,
            height: 10,
            background: 'rgba(255,255,255,0.25)',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: TEXT,
            WebkitTextFillColor: TEXT,
            letterSpacing: '0.02em',
          }}
        >
          v{pkg.version}
        </span>
      </span>

      <div
        style={{
          fontSize: 35,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#fff',
          WebkitTextFillColor: '#fff',
          margin: '0 0 11px',
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 15,
          color: TEXT,
          WebkitTextFillColor: TEXT,
          lineHeight: 1.65,
          margin: 0,
          maxWidth: 480,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);
