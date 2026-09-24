import type { ReactNode } from 'react';
import stats from 'virtual:eidos-stats';
import {
  contrastRatio,
  isValidHex,
  CONTRAST_LIGHT,
  CONTRAST_DARK,
} from '../components/ThemeProvider/ThemeProvider.color';

/**
 * Rendering for the Foundations pages.
 *
 * Two rules shape this file, both learned the hard way elsewhere in the repo:
 *
 * 1. **Nothing here is hand-written data.** Every token, name and value comes
 *    from `virtual:eidos-stats`, which parses `src/styles/variables.scss` at
 *    Vite config time. A palette typed into a docs page is a second copy of
 *    the palette, and this repo has already shipped a `README` example
 *    quoting a hex that had been replaced two majors earlier.
 * 2. **All JSX lives in `.tsx`, never in `.mdx`.** MDX parses a multi-line
 *    JSX element's children as markdown and wraps them in a `<p>`, which
 *    Storybook's `.sbdocs p` rule then recolours - that is exactly how the
 *    guide pages ended up with 1.79:1 step markers. See the note at the top
 *    of `guide-page.docs.tsx`.
 *
 * Contrast figures are computed with the library's own `contrastRatio`, the
 * same function `ThemeProvider` uses to derive contrast pairs - so the
 * numbers on the page cannot disagree with the numbers the runtime enforces.
 */

const INK = '#1e293b';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

export const foundationStats = stats;

const group = (name: string) => stats.tokenGroups.find((g) => g.name === name);

/** Groups whose tokens are colours, in the order the palette is defined. */
const COLOUR_GROUPS = [
  'Primary brand colors',
  'Secondary colors',
  'Success colors',
  'Danger colors',
  'Warning colors',
  'Info colors',
  'Hyperlink colors',
  'Neutral colors',
  'Gray scale',
  'Primary color scale',
];

// ── Shared chrome ─────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section style={{ marginBottom: 34 }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 10px' }}>{title}</h3>
    {children}
  </section>
);

const Cell = ({ children, mono = false }: { children?: ReactNode; mono?: boolean }) => (
  <td
    style={{
      padding: '7px 10px',
      borderBottom: `1px solid ${BORDER}`,
      fontSize: 12.5,
      color: INK,
      fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
      verticalAlign: 'middle',
    }}
  >
    {children}
  </td>
);

const Head = ({ cols }: { cols: string[] }) => (
  <thead>
    <tr>
      {cols.map((c, i) => (
        <th
          // Column labels repeat across sections ('' for the swatch column
          // appears in every one), so the index is part of the key.
          key={`${c}-${i}`}
          style={{
            textAlign: 'left',
            padding: '0 10px 6px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

/**
 * Column widths, shared by every table of the same kind.
 *
 * Without these each table sizes itself to its own content, so the columns
 * step left and right from section to section - `--info-color` and
 * `--hyperlink-color` are different lengths, and the whole grid shifts with
 * them. Fixing the widths costs nothing and makes a page of eleven tables
 * read as one table.
 */
export const COLUMNS = {
  /** swatch · token · value · on white · on ink */
  colour: ['56px', '38%', '22%', '20%', '20%'],
  /** sample · token · resolves to · contrast */
  textRole: ['26%', '24%', '30%', '20%'],
  /** token · value · sample */
  scale: ['26%', '18%', 'auto'],
  /** token · value */
  pair: ['40%', 'auto'],
} as const;

const Table = ({ widths, children }: { widths?: readonly string[]; children: ReactNode }) => (
  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      margin: 0,
      // `fixed` is what makes the widths below authoritative; without it the
      // browser still reflows columns to fit the widest cell.
      tableLayout: widths ? 'fixed' : 'auto',
    }}
  >
    {widths ? (
      <colgroup>
        {widths.map((w, i) => (
          <col key={i} style={{ width: w }} />
        ))}
      </colgroup>
    ) : null}
    {children}
  </table>
);

// ── Colour ────────────────────────────────────────────────────────────────────

/**
 * Resolves `var(--x)` one level, so a token defined in terms of another
 * (`--text-muted: var(--gray-600)`) can still be shown as a colour.
 */
const resolve = (value: string): string => {
  const ref = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (!ref) return value;
  for (const g of stats.tokenGroups) {
    const hit = g.tokens.find((t) => t.name === ref[1]);
    if (hit) return hit.value;
  }
  return value;
};

const Ratio = ({ value }: { value: number }) => {
  // 4.5:1 is the SC 1.4.3 threshold for body text; 3:1 covers large text and
  // non-text contrast (SC 1.4.11).
  const pass = value >= 4.5;
  const near = !pass && value >= 3;
  return (
    <span
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        color: pass ? '#046847' : near ? '#7f5003' : '#ac2528',
      }}
    >
      {value.toFixed(2)}
    </span>
  );
};

export const ColourGroups = () => (
  <>
    {COLOUR_GROUPS.map((name) => {
      const g = group(name);
      if (!g) return null;
      const swatches = g.tokens.filter((t) => isValidHex(resolve(t.value)));
      if (swatches.length === 0) return null;

      return (
        <Section key={name} title={name}>
          <Table widths={COLUMNS.colour}>
            <Head cols={['', 'Token', 'Value', 'on white', 'on ink']} />
            <tbody>
              {swatches.map((t) => {
                const hex = resolve(t.value);
                return (
                  <tr key={t.name}>
                    <Cell>
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'block',
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: hex,
                          // Keeps a near-white swatch visible on a white page.
                          border: `1px solid ${BORDER}`,
                        }}
                      />
                    </Cell>
                    <Cell mono>{t.name}</Cell>
                    <Cell mono>{hex}</Cell>
                    <Cell>
                      <Ratio value={contrastRatio(hex, CONTRAST_LIGHT)} />
                    </Cell>
                    <Cell>
                      <Ratio value={contrastRatio(hex, CONTRAST_DARK)} />
                    </Cell>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Section>
      );
    })}
  </>
);

/**
 * The text roles, rendered as actual text on the surfaces they are allowed on
 * - the point being that `--text-disabled` visibly fails and is *supposed* to.
 */
export const TextRoles = () => {
  // `--text-default` is part of the group now, so body text needs no special
  // case. Values are the light scheme's - the page is rendered light.
  const all = group('Text roles')?.tokens ?? [];

  return (
    <Section title="Text roles on white">
      <Table widths={COLUMNS.textRole}>
        <Head cols={['Sample', 'Token', 'Resolves to', 'Contrast']} />
        <tbody>
          {all.map((t) => {
            const hex = resolve(t.value);
            return (
              <tr key={t.name}>
                <Cell>
                  <span style={{ color: hex, fontSize: 14 }}>The quick brown fox</span>
                </Cell>
                <Cell mono>{t.name}</Cell>
                <Cell mono>{t.value === hex ? hex : `${t.value} → ${hex}`}</Cell>
                <Cell>
                  <Ratio value={contrastRatio(hex, CONTRAST_LIGHT)} />
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Section>
  );
};

// ── Typography ────────────────────────────────────────────────────────────────

export const FontStacks = () => (
  <Section title="Font stacks">
    <Table widths={COLUMNS.pair}>
      <tbody>
        {(group('Typography')?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell>
              <span style={{ fontFamily: t.value, fontSize: 15 }}>The quick brown fox</span>
              <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>{t.value}</div>
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

export const TypeScale = () => (
  <Section title="Font sizes">
    <Table widths={COLUMNS.scale}>
      <Head cols={['Token', 'Value', 'Sample']} />
      <tbody>
        {(group('Font sizes')?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell mono>{t.value}</Cell>
            <Cell>
              <span style={{ fontSize: t.value }}>Almost before we knew it</span>
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

export const FontWeights = () => (
  <Section title="Font weights">
    <Table widths={COLUMNS.scale}>
      <Head cols={['Token', 'Value', 'Sample']} />
      <tbody>
        {(group('Font weights')?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell mono>{t.value}</Cell>
            <Cell>
              <span style={{ fontWeight: t.value, fontSize: 14 }}>Almost before we knew it</span>
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

// ── Spacing, radius, elevation ────────────────────────────────────────────────

/**
 * Spacing and radius are `em`-based, so a bar drawn at the raw value scales
 * with the surrounding font size - which is the behaviour, not a rendering
 * quirk, and worth seeing.
 */
export const ScaleBars = ({ groupName, title }: { groupName: string; title: string }) => (
  <Section title={title}>
    <Table widths={COLUMNS.scale}>
      <Head cols={['Token', 'Value', '']} />
      <tbody>
        {(group(groupName)?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell mono>{t.value}</Cell>
            <Cell>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: t.value,
                  height: 14,
                  minWidth: 2,
                  background: 'var(--primary-color, #5c5de8)',
                  borderRadius: 2,
                }}
              />
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

export const RadiusSwatches = () => (
  <Section title="Border radius">
    <Table widths={COLUMNS.scale}>
      <Head cols={['Token', 'Value', '']} />
      <tbody>
        {(group('Border radius')?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell mono>{t.value}</Cell>
            <Cell>
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: 56,
                  height: 26,
                  borderRadius: t.value,
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                }}
              />
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

export const ShadowSwatches = () => (
  <Section title="Box shadow">
    <Table widths={COLUMNS.pair}>
      <Head cols={['Token', '']} />
      <tbody>
        {(group('Box shadow')?.tokens ?? []).map((t) => (
          <tr key={t.name}>
            <Cell mono>{t.name}</Cell>
            <Cell>
              {/* The card is white and so is the page, so the faintest
                  shadows - `--box-shadow-xs` is `0 0 1px rgba(0,0,0,.05)` -
                  render as nothing at all. A tinted backdrop is what makes
                  the low end of the scale visible. */}
              <span
                style={{
                  display: 'block',
                  background: '#f1f5f9',
                  borderRadius: 8,
                  padding: '12px 16px',
                  margin: '4px 0',
                  width: 'fit-content',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    width: 90,
                    height: 30,
                    borderRadius: 6,
                    background: '#ffffff',
                    boxShadow: t.value,
                  }}
                />
              </span>
            </Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

export const Breakpoints = () => (
  <Section title="Breakpoints">
    <Table widths={COLUMNS.scale}>
      <Head cols={['Name', 'Min width', 'Token']} />
      <tbody>
        {stats.breakpoints.map((b) => (
          <tr key={b.name}>
            <Cell mono>{b.name}</Cell>
            <Cell mono>{b.px}px</Cell>
            <Cell mono>--breakpoint-{b.name}</Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  </Section>
);

/** Any group not given a bespoke renderer above, as a plain table. */
export const PlainGroup = ({ groupName }: { groupName: string }) => {
  const g = group(groupName);
  if (!g) return null;
  return (
    <Section title={g.name}>
      <Table widths={COLUMNS.pair}>
        <Head cols={['Token', 'Value']} />
        <tbody>
          {g.tokens.map((t) => (
            <tr key={t.name}>
              <Cell mono>{t.name}</Cell>
              <Cell mono>{t.value}</Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </Section>
  );
};

// ── Accessibility ─────────────────────────────────────────────────────────────

/**
 * The live audit result, read from `scripts/a11y-baseline.json` - the same
 * file `check-a11y-baseline.js` enforces on every `npm run verify`.
 *
 * Deliberately not a prose copy of `ACCESSIBILITY.md`. A number written into
 * a docs page is stale the first time someone fixes a violation; a number
 * read from the gate's own record cannot disagree with the gate.
 */
export const AuditSummary = () => {
  const a = stats.a11y;
  if (!a) return null;
  const rules = Object.entries(a.rules);

  return (
    <Section title={`Audited ${a.storiesAudited} stories · recorded ${a.recordedAt}`}>
      <Table widths={COLUMNS.scale}>
        <Head cols={['Rule', 'Nodes', 'Status']} />
        <tbody>
          {rules.length === 0 ? (
            <tr>
              <Cell>No outstanding violations.</Cell>
              <Cell mono>0</Cell>
              <Cell />
            </tr>
          ) : (
            rules.map(([rule, n]) => (
              <tr key={rule}>
                <Cell mono>{rule}</Cell>
                <Cell mono>{n}</Cell>
                <Cell>
                  <span style={{ color: MUTED, fontSize: 12 }}>
                    {rule === 'color-contrast'
                      ? 'all on disabled controls - exempt under SC 1.4.3'
                      : 'see ACCESSIBILITY.md'}
                  </span>
                </Cell>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8 }}>
        Tags audited: {a.tags.join(', ')}. Re-checked on every build; a release cannot be cut with
        more violations than the figure above.
      </div>
    </Section>
  );
};

/**
 * The element-level type scale - what a bare `<h2>`, paragraph or `<small>`
 * renders as before any component is involved.
 *
 * A row layout rather than a table on purpose: the whole value of a type
 * specimen is being able to compare the sizes down the left edge, and that
 * only works if every sample starts at the same x and none of them wrap.
 * `whiteSpace: nowrap` with `overflow: hidden` keeps h1 on one line at any
 * width instead of folding into two and destroying the rhythm.
 *
 * Samples are drawn with explicit styles rather than by rendering a real
 * `<h2>`, because Storybook's docs CSS restyles headings inside `.sbdocs`
 * and would show its own scale instead of the library's.
 */
const SAMPLE_TEXT: Record<string, string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  body: 'Body text for primary content and paragraphs.',
  small: 'Caption text for labels and metadata.',
};

/** `var(--font-weight-x)` -> the number, for display and for rendering. */
const weightValue = (raw: string): string => {
  if (!raw) return '400';
  const token = raw.match(/var\((--font-weight-[a-z]+)\)/)?.[1];
  if (!token) return raw;
  return group('Font weights')?.tokens.find((w) => w.name === token)?.value ?? raw;
};

/** `3rem` -> `48px`, so the column reads as one unit rather than two. */
const inPx = (size: string): string => {
  const rem = size.match(/^([\d.]+)rem$/);
  if (rem) return `${Math.round(parseFloat(rem[1] as string) * 16)}px`;
  const token = size.match(/var\((--font-size-[a-z0-9]+)\)/)?.[1];
  if (token) {
    const resolved = group('Font sizes')?.tokens.find((t) => t.name === token)?.value;
    if (resolved) return inPx(resolved);
  }
  return size;
};

export const ElementStyles = () => (
  <Section title="Type scale">
    <div>
      {stats.typeStyles.map((t) => {
        const weight = weightValue(t.fontWeight);
        return (
          <div
            key={t.selector}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              padding: '14px 0',
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <span
              style={{
                width: 72,
                flexShrink: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
                color: MUTED,
              }}
            >
              {t.selector}
            </span>

            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: t.fontSize,
                fontWeight: weight,
                lineHeight: t.lineHeight || 1.4,
                letterSpacing: t.selector.startsWith('h') ? '-0.02em' : undefined,
                color: t.selector === 'small' ? MUTED : INK,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {SAMPLE_TEXT[t.selector] ?? 'Almost before we knew it'}
            </span>

            <span
              style={{
                flexShrink: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 11.5,
                color: MUTED,
                textAlign: 'right',
              }}
            >
              {inPx(t.fontSize)} / {weight}
            </span>
          </div>
        );
      })}
    </div>
  </Section>
);

// ── Rendering ACCESSIBILITY.md ────────────────────────────────────────────────

/**
 * A deliberately small markdown renderer for one known file.
 *
 * `ACCESSIBILITY.md` is the standalone artefact - it is what someone reads on
 * GitHub, and what a procurement reviewer receives - so it stays the source.
 * Rendering it here means the report can be read without leaving Storybook,
 * and there is still exactly one copy of the prose.
 *
 * Pulling in a markdown library for this would be the obvious move and is not
 * worth it: the input is a single file in this repository, using eight
 * constructs, and a parser that only handles those is easier to reason about
 * than a dependency that handles four hundred. If the file ever needs
 * something this does not cover, it will be obvious on the page.
 */

const inline = (text: string, keyPrefix: string): ReactNode[] => {
  // Ordered so that `**bold**` is consumed before `*italic*`.
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith('`')) {
      out.push(
        <code
          key={key}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.92em',
            background: '#f1f5f9',
            borderRadius: 4,
            padding: '1px 5px',
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const [, label, href] = token.match(/\[([^\]]+)\]\(([^)]+)\)/) ?? [];
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>,
      );
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const splitRow = (line: string): string[] =>
  line
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());

export const AccessibilityReport = () => {
  const source = stats.accessibilityDoc;
  if (!source) return null;

  // Everything after the marker is written for someone working in the
  // repository - commands they can run, files they can open. A reader here
  // installed the package from npm and has none of that, so the render
  // stops rather than showing instructions that cannot be followed.
  const lines = source.split('<!-- storybook:end -->')[0]!.split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] as string;

    // The `# Accessibility` title and the lead section are already said by
    // this page's hero and live audit, so the render starts at the first
    // `##`. Skipping here rather than editing the file keeps the file
    // complete for anyone reading it on its own.
    if (/^# /.test(line)) {
      i++;
      while (i < lines.length && !/^## /.test(lines[i] as string)) i++;
      continue;
    }

    if (/^#{2,3} /.test(line)) {
      const depth = (line.match(/^#+/) as RegExpMatchArray)[0].length;
      const text = line.replace(/^#+\s*/, '');
      out.push(
        <div
          key={key++}
          style={{
            fontSize: depth === 2 ? 15 : 13.5,
            fontWeight: 700,
            color: INK,
            margin: depth === 2 ? '28px 0 10px' : '20px 0 8px',
            paddingBottom: depth === 2 ? 6 : 0,
            borderBottom: depth === 2 ? `1px solid ${BORDER}` : undefined,
          }}
        >
          {inline(text, `h${key}`)}
        </div>,
      );
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] as string).startsWith('```')) {
        body.push(lines[i] as string);
        i++;
      }
      i++;
      out.push(
        <pre
          key={key++}
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 12.5,
            overflowX: 'auto',
            margin: '10px 0',
          }}
        >
          {body.join('\n')}
        </pre>,
      );
      continue;
    }

    if (line.startsWith('> ')) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] as string).startsWith('>')) {
        body.push((lines[i] as string).replace(/^>\s?/, ''));
        i++;
      }
      out.push(
        <blockquote
          key={key++}
          style={{
            borderLeft: '3px solid #c7d2fe',
            background: '#f8fafc',
            margin: '10px 0',
            padding: '10px 14px',
            color: INK,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {inline(body.join(' ').trim(), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] as string).startsWith('|')) {
        const raw = lines[i] as string;
        // The `| --- | --- |` separator carries no content - but it has to
        // be told apart from a genuinely *empty* header row, which some
        // tables in the report use. Requiring a dash does that; matching on
        // `[\s|:-]+` alone swallowed the empty row and promoted the first
        // data row into the header.
        const isSeparator = /^\|[\s|:-]+\|$/.test(raw) && raw.includes('-');
        if (!isSeparator) rows.push(splitRow(raw));
        i++;
      }
      const [header, ...body] = rows;
      // A table whose header cells are all blank is headerless by design.
      // `body` excludes that first row either way, so the blank one is
      // simply dropped rather than rendered as an empty stripe.
      const hasHeader = (header ?? []).some((c) => c !== '');
      out.push(
        <table
          key={key++}
          style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0', fontSize: 12.5 }}
        >
          {hasHeader ? (
            <thead>
              <tr>
                {(header ?? []).map((c, n) => (
                  <th
                    key={n}
                    style={{
                      textAlign: 'left',
                      padding: '0 10px 6px',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: MUTED,
                    }}
                  >
                    {inline(c, `th${n}`)}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {body.map((r, n) => (
              <tr key={n}>
                {r.map((c, m) => (
                  <td
                    key={m}
                    style={{
                      padding: '7px 10px',
                      borderBottom: `1px solid ${BORDER}`,
                      color: INK,
                      verticalAlign: 'top',
                    }}
                  >
                    {inline(c, `td${n}-${m}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] |^\s{2,}\S/.test(lines[i] as string)) {
        const raw = lines[i] as string;
        // A wrapped continuation line belongs to the item above it.
        if (/^[-*] /.test(raw)) items.push(raw.replace(/^[-*]\s*/, ''));
        else if (items.length) items[items.length - 1] += ' ' + raw.trim();
        i++;
      }
      out.push(
        <ul key={key++} style={{ margin: '8px 0', paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
          {items.map((it, n) => (
            <li key={n} style={{ color: INK, marginBottom: 4 }}>
              {inline(it, `li${n}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: gather until a blank line, so hard-wrapped prose reflows.
    const para: string[] = [];
    while (i < lines.length && (lines[i] as string).trim() !== '') {
      const raw = lines[i] as string;
      if (/^[#>|]|^```|^[-*] /.test(raw)) break;
      para.push(raw.trim());
      i++;
    }
    if (para.length) {
      out.push(
        <p key={key++} style={{ fontSize: 13, lineHeight: 1.7, color: INK, margin: '8px 0' }}>
          {inline(para.join(' '), `p${key}`)}
        </p>,
      );
    }
  }

  return <div>{out}</div>;
};
