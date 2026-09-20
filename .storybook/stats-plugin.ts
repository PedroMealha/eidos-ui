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

export interface EidosStats {
  version: string;
  componentCount: number;
  storyFileCount: number;
  storyCount: number;
  /** Storybook sidebar groups, by story count, largest first. */
  categories: { name: string; count: number }[];
  tokenCount: number;
  breakpoints: { name: string; px: number }[];
  /** `dist/index.css`, gzipped. `null` when dist/ has not been built. */
  cssGzipBytes: number | null;
  runtimeDependencies: string[];
  peerDependencies: string[];
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
  const tokenCount = (variables.match(/^\s+--[a-z0-9-]+:/gm) ?? []).length;

  const breakpointsSource = readFileSync(join(SRC, 'styles/_breakpoints.scss'), 'utf8');
  const breakpoints = [...breakpointsSource.matchAll(/'([a-z0-9]+)':\s*(\d+)px/g)].map((m) => ({
    name: m[1] as string,
    px: Number(m[2]),
  }));

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
