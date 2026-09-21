import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Serves `virtual:eidos-stats` - the numbers the "Welcome" guide page shows.
 *
 * Every figure is derived from the source tree at Vite config time, never
 * written by hand. This repo has been bitten twice by hand-maintained counts
 * going stale (`GETTING_STARTED.md` claimed 49 components when there were 57;
 * `README.md`'s theming example still showed a palette value replaced two
 * majors earlier), and `scripts/check-docs.js` exists specifically because
 * prose duplicating facts from code rots. A landing page leading with "58
 * components" is the most visible possible place for that to happen.
 *
 * A virtual module rather than either of the two obvious alternatives:
 *
 * - **`import.meta.glob(..., { eager: true })` in the page itself** would work,
 *   and the story modules are already in the preview bundle so it adds no
 *   bytes - but eagerly importing all 62 of them forces the entire library to
 *   load when Welcome renders. Welcome is the first page anyone sees; it must
 *   not be the slowest.
 * - **A generated file committed to `src/`** costs nothing at runtime but can
 *   be stale the moment someone adds a component without re-running the
 *   generator, which is the exact failure mode this is meant to prevent.
 *
 * Computing here happens once per Vite start/build, costs a few filesystem
 * reads, and ships only the resulting numbers.
 */

const SRC = new URL('../src', import.meta.url).pathname;
const ROOT = new URL('..', import.meta.url).pathname;

/** One `// Heading` block of `variables.scss`, with the tokens beneath it. */
export interface TokenGroup {
  name: string;
  tokens: { name: string; value: string }[];
}

export interface EidosStats {
  version: string;
  componentCount: number;
  storyFileCount: number;
  storyCount: number;
  /** Storybook sidebar groups, by story count, largest first. */
  categories: { name: string; count: number }[];
  tokenCount: number;
  /**
   * Every custom property in `variables.scss`, grouped by its section
   * comment - what the Foundations pages render.
   *
   * Parsed rather than hand-listed for the same reason every other figure
   * here is derived: a palette table typed into a docs page is a second copy
   * of the palette, and this repo has already shipped a `README` example
   * showing a hex replaced two majors earlier.
   */
  tokenGroups: TokenGroup[];
  /**
   * The element-level type styles from `global.scss` - what an `<h2>` or a
   * paragraph actually renders as before any component gets involved.
   *
   * Parsed rather than restated because these are the numbers most likely to
   * be quoted from memory: they are *not* the `--font-size-*` tokens, they
   * are hardcoded `rem` values on the elements themselves.
   */
  typeStyles: {
    selector: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  }[];
  /**
   * The recorded axe baseline, so the Foundations page reports the same
   * figures the CI gate enforces rather than a prose copy of them. `null`
   * only if the file is missing, which `npm run verify` would already fail on.
   */
  a11y: {
    recordedAt: string;
    storiesAudited: number;
    totalNodes: number;
    tags: string[];
    rules: Record<string, number>;
  } | null;
  /**
   * `ACCESSIBILITY.md`, verbatim.
   *
   * Rendered by `Foundations/Accessibility` so the report can be read in
   * Storybook instead of sending people to the repository. Shipped raw, and
   * rendered by a small markdown component, rather than being restated in
   * JSX - the file stays the single source, and stays the thing a
   * procurement reviewer receives.
   */
  accessibilityDoc: string | null;
  breakpoints: { name: string; px: number }[];
  /** `dist/index.css`, gzipped. `null` when dist/ has not been built. */
  cssGzipBytes: number | null;
  runtimeDependencies: string[];
  peerDependencies: string[];
}

/**
 * Splits `variables.scss` into its commented sections.
 *
 * The file mixes two kinds of comment: short section titles
 * (`// Gray scale`) and long prose explaining a decision (the note on
 * `--text-muted` runs to fifteen lines). Only the first kind starts a group,
 * so a title is recognised as: short, sentence-cased, unpunctuated, preceded
 * by a blank line, and followed by a token rather than more prose.
 *
 * Getting that wrong is visible rather than silent - a prose paragraph would
 * appear as a heading on the Foundations page - which is the main reason
 * this is a parser and not a hand-maintained list.
 */
function parseTokenGroups(source: string): TokenGroup[] {
  const lines = source.split('\n');
  const groups: TokenGroup[] = [];
  let current: TokenGroup | null = null;
  let prevBlank = true;

  const nextMeaningfulIsToken = (from: number): boolean => {
    for (let j = from; j < lines.length; j++) {
      const n = (lines[j] as string).trim();
      if (n === '') return false;
      if (n.startsWith('//')) continue;
      return n.startsWith('--');
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] as string).trim();

    if (line === '') {
      prevBlank = true;
      continue;
    }

    if (line.startsWith('//')) {
      const text = line.slice(2).trim();
      const isHeading =
        prevBlank &&
        text.length > 0 &&
        text.length <= 40 &&
        /^[A-Z]/.test(text) &&
        !/[.,:;]$/.test(text) &&
        nextMeaningfulIsToken(i + 1);
      if (isHeading) {
        current = { name: text, tokens: [] };
        groups.push(current);
      }
      prevBlank = false;
      continue;
    }

    const match = line.match(/^(--[a-z0-9-]+):\s*(.*)$/);
    if (match) {
      // Font stacks wrap across several lines; read to the semicolon.
      let value = match[2] as string;
      while (!value.trimEnd().endsWith(';') && i + 1 < lines.length) {
        i++;
        value += ' ' + (lines[i] as string).trim();
      }
      if (!current) {
        current = { name: 'Other', tokens: [] };
        groups.push(current);
      }
      current.tokens.push({
        name: match[1] as string,
        value: value.replace(/;$/, '').replace(/\s+/g, ' ').trim(),
      });
    }
    prevBlank = false;
  }

  return groups;
}

/**
 * Reads the `h1`-`h6`, `body` and `small` rules out of `global.scss`.
 *
 * A flat top-level-selector scan is enough here because these rules are
 * declared once, unnested, at the top of the file. Anything more clever
 * would be pretending to be a CSS parser.
 */
function parseTypeStyles(source: string): EidosStats['typeStyles'] {
  const wanted = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'small'];
  const out: EidosStats['typeStyles'] = [];

  for (const selector of wanted) {
    const block = source.match(new RegExp(`^${selector} \\{([^}]*)\\}`, 'm'));
    if (!block) continue;
    const body = block[1] as string;
    const pick = (prop: string) =>
      (body.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1] ?? '').trim();
    out.push({
      selector,
      fontSize: pick('font-size'),
      fontWeight: pick('font-weight'),
      lineHeight: pick('line-height'),
    });
  }
  return out;
}

function collectStats(): EidosStats {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

  const componentDirs = readdirSync(join(SRC, 'components'), { withFileTypes: true }).filter((d) =>
    d.isDirectory(),
  );

  // Walk for story files rather than globbing, so a component with more than
  // one story file (Conversation has three, Header two) is counted correctly.
  const storyFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.stories.tsx')) storyFiles.push(full);
    }
  };
  walk(join(SRC, 'components'));

  let storyCount = 0;
  const byCategory = new Map<string, number>();

  for (const file of storyFiles) {
    const source = readFileSync(file, 'utf8');
    // Same source of truth `scripts/check-docs.js` uses: the `title` in each
    // story file is the string that builds the sidebar.
    const title = source.match(/title:\s*'([^']+)'/)?.[1];
    const exports = source.match(/^export const \w+/gm) ?? [];
    storyCount += exports.length;
    if (title) {
      const group = title.split('/')[0] as string;
      byCategory.set(group, (byCategory.get(group) ?? 0) + exports.length);
    }
  }

  const variables = readFileSync(join(SRC, 'styles/variables.scss'), 'utf8');
  const tokenGroups = parseTokenGroups(variables);

  const breakpointsSource = readFileSync(join(SRC, 'styles/_breakpoints.scss'), 'utf8');
  const breakpoints = [...breakpointsSource.matchAll(/'([a-z0-9]+)':\s*(\d+)px/g)].map((m) => ({
    name: m[1] as string,
    px: Number(m[2]),
  }));

  // Static declarations plus the `--breakpoint-*` set, which `variables.scss`
  // emits from a Sass `@each` rather than writing out. Counting only the
  // literal lines undercounted the shipped CSS by exactly the number of
  // breakpoints.
  const tokenCount = tokenGroups.reduce((n, g) => n + g.tokens.length, 0) + breakpoints.length;

  const typeStyles = parseTypeStyles(readFileSync(join(SRC, 'styles/global.scss'), 'utf8'));

  let accessibilityDoc: string | null = null;
  try {
    accessibilityDoc = readFileSync(join(ROOT, 'ACCESSIBILITY.md'), 'utf8');
  } catch {
    // Absent only if the file was deleted; the page falls back to a link.
  }

  let a11y: EidosStats['a11y'] = null;
  try {
    const recorded = JSON.parse(readFileSync(join(ROOT, 'scripts/a11y-baseline.json'), 'utf8'));
    a11y = {
      recordedAt: recorded.recordedAt,
      storiesAudited: recorded.storiesAudited,
      totalNodes: recorded.totalNodes,
      tags: recorded.tags,
      rules: recorded.rules,
    };
  } catch {
    // Absent only if the baseline has never been recorded; the page copes.
  }

  let cssGzipBytes: number | null = null;
  try {
    const cssPath = join(ROOT, 'dist/index.css');
    if (statSync(cssPath).isFile()) {
      cssGzipBytes = gzipSync(readFileSync(cssPath)).length;
    }
  } catch {
    // dist/ is gitignored and absent on a fresh clone - the page copes.
  }

  return {
    version: pkg.version,
    componentCount: componentDirs.length,
    storyFileCount: storyFiles.length,
    storyCount,
    categories: [...byCategory.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    tokenCount,
    tokenGroups,
    typeStyles,
    a11y,
    accessibilityDoc,
    breakpoints,
    cssGzipBytes,
    runtimeDependencies: Object.keys(pkg.dependencies ?? {}),
    peerDependencies: Object.keys(pkg.peerDependencies ?? {}),
  };
}

const VIRTUAL_ID = 'virtual:eidos-stats';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export function eidosStatsPlugin(): Plugin {
  return {
    name: 'eidos-stats',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(collectStats())};`;
    },
  };
}
