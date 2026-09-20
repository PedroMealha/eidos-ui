import type { ReactNode } from 'react';
import stats from 'virtual:eidos-stats';

/**
 * Presentational pieces for the "Welcome" Storybook guide page
 * (`src/Welcome.mdx`). Storybook-only - never exported from the library, not
 * a tsup entry point, and never reaches `dist/`. `release-needed.js` and
 * `check-changelog.js` both exclude `*.docs.tsx`, so editing this cannot flag
 * a release.
 *
 * Two constraints inherited from `Releases.docs.tsx`, for the same reasons:
 *
 * - **Every size is a fixed px value, not rem/em.** Storybook renders a guide
 *   page's own JSX where `global.scss`'s `html { font-size: 14px }` reset does
 *   not apply, so anything sized off the `rem`-based `--font-size-*` tokens
 *   renders ~14% larger here than everywhere else in the library. This is also
 *   why the cards below don't reuse `Card`/`Pill`: a shared component can't
 *   opt out of rem sizing without changing it for every other consumer.
 * - **Colours still come from the palette**, so a reader who knows the rest of
 *   the system recognises them.
 *
 * Every number comes from `virtual:eidos-stats`, computed from the source tree
 * at Vite config time - see `.storybook/stats-plugin.ts` for why.
 */

const INK = '#0f172a';
const MUTED = '#475569';
const LINE = '#e2e8f0';

export const welcomeStats = stats;

const formatBytes = (bytes: number) =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} kB` : `${bytes} B`;

// ── Stat cards ────────────────────────────────────────────────────────────────

const StatCard = ({ value, label, note }: { value: ReactNode; label: string; note?: string }) => (
  <div
    style={{
      border: `1px solid ${LINE}`,
      borderRadius: 12,
      padding: '18px 20px',
      background: '#fff',
    }}
  >
    <div
      style={{
        fontSize: 30,
        fontWeight: 800,
        color: INK,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 6 }}>{label}</div>
    {note ? (
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{note}</div>
    ) : null}
  </div>
);

export const StatGrid = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: 14,
      marginBottom: 32,
    }}
  >
    <StatCard
      value={stats.componentCount}
      label="Components"
      note={`Across ${stats.categories.length} sidebar groups`}
    />
    <StatCard
      value={stats.storyCount}
      label="Stories"
      note={`In ${stats.storyFileCount} story files, every one shown in its docs page`}
    />
    <StatCard
      value={stats.tokenCount}
      label="Design tokens"
      note="CSS custom properties you can override"
    />
    <StatCard
      value={stats.cssGzipBytes === null ? '—' : formatBytes(stats.cssGzipBytes)}
      label="Stylesheet"
      note={
        stats.cssGzipBytes === null
          ? 'Build dist/ to measure'
          : 'Gzipped, the whole library, no subresources'
      }
    />
  </div>
);

// ── Capability cards ──────────────────────────────────────────────────────────

const Feature = ({ title, children }: { title: string; children: ReactNode }) => (
  <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 18px' }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{children}</div>
  </div>
);

export const Features = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 14,
      marginBottom: 32,
    }}
  >
    <Feature title="One vocabulary, everywhere">
      The same <code style={{ fontSize: 12 }}>variant</code> (
      <code style={{ fontSize: 12 }}>filled</code> / <code style={{ fontSize: 12 }}>outlined</code>{' '}
      / <code style={{ fontSize: 12 }}>text</code>), <code style={{ fontSize: 12 }}>size</code> (
      <code style={{ fontSize: 12 }}>sm</code> / <code style={{ fontSize: 12 }}>md</code> /{' '}
      <code style={{ fontSize: 12 }}>lg</code>) and six colour names on every component that has
      them. Learn one, and the rest follow.
    </Feature>
    <Feature title="Themeable at runtime">
      {stats.tokenCount} CSS custom properties. Give{' '}
      <code style={{ fontSize: 12 }}>ThemeProvider</code> a single base colour and the whole ramp,
      its hover shades and its contrast pairs are derived for you.
    </Feature>
    <Feature title="Typed, and tree-shaken">
      Every prop and public type ships with the package. Import from the root barrel, or pull one
      component's chunk with a deep import like{' '}
      <code style={{ fontSize: 12 }}>eidos-ui/data-grid</code>.
    </Feature>
    <Feature title="Responsive by container, not viewport">
      {stats.breakpoints.length} breakpoints ({stats.breakpoints.map((b) => b.name).join(', ')}).
      Data-heavy components measure their own container, so a table adapts correctly inside a narrow
      sidebar on an otherwise wide screen.
    </Feature>
    <Feature title="Accessibility, specifically">
      Palette bases clear 4.5:1 on white as text, and muted text clears AA on every surface the
      library paints. Every interactive control has a visible focus ring, and decorative motion
      stops under <code style={{ fontSize: 12 }}>prefers-reduced-motion</code> while spinners and
      progress bars keep running.
    </Feature>
    <Feature title="One runtime dependency">
      Only <code style={{ fontSize: 12 }}>{stats.runtimeDependencies.join(', ')}</code>, installed
      with the package. Everything else - dates, drag-and-drop, virtualisation - is bundled.
    </Feature>
  </div>
);

// ── Category breakdown ────────────────────────────────────────────────────────

export const Categories = () => {
  const max = Math.max(...stats.categories.map((c) => c.count));
  return (
    <div style={{ marginBottom: 32 }}>
      {stats.categories.map(({ name, count }) => (
        <div
          key={name}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}
        >
          <div style={{ width: 96, fontSize: 13, fontWeight: 600, color: INK, flexShrink: 0 }}>
            {name}
          </div>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 999, height: 8 }}>
            <div
              style={{
                width: `${(count / max) * 100}%`,
                background: 'linear-gradient(90deg, #6d28d9, #7c3aed)',
                borderRadius: 999,
                height: 8,
              }}
            />
          </div>
          <div style={{ width: 64, fontSize: 12, color: MUTED, textAlign: 'right', flexShrink: 0 }}>
            {count} {count === 1 ? 'story' : 'stories'}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Honest accessibility note ─────────────────────────────────────────────────

export const AccessibilityNote = () => (
  <div
    style={{
      border: '1px solid #ddd6fe',
      background: '#faf5ff',
      borderRadius: 12,
      padding: '16px 18px',
      marginBottom: 32,
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>
      No conformance claim - here's what is actually true
    </div>
    <div style={{ fontSize: 13, color: '#5b21b6', lineHeight: 1.65 }}>
      axe-core runs against all {stats.storyCount} stories, and you can see its findings for any
      component in the <strong>Accessibility</strong> panel beside its Controls. But axe covers only
      about a third of the WCAG success criteria, so passing it proves much less than it appears to
      - <strong>this library does not claim a WCAG conformance level</strong>, and you should not
      inherit one from using it. The properties listed above are the ones that have been measured
      and fixed; known gaps remain, and the panel is the honest place to check before you rely on
      any given component.
    </div>
  </div>
);
