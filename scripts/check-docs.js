#!/usr/bin/env node
/**
 * Catches prose that has drifted out of date.
 *
 * `README.md` and `GETTING_STARTED.md` both duplicate information that really
 * lives somewhere else - the component list and the design tokens - and
 * duplicated facts rot silently. Two real cases motivated this:
 *
 * - The component inventory claimed "49 components across 9 categories" when
 *   there were 57 directories, and omitted Footer, Header, Navigation,
 *   PageLayout, Pill, Toolbar and the whole Theming group.
 * - The theming example set `--primary-color: #6366f1`, the palette value
 *   replaced in 3.0.0, so anyone copying it would silently install the old
 *   failing-contrast colour.
 *
 * Neither is caught by lint, typecheck, tsc or Storybook: the files are prose.
 *
 * Runs from `npm run verify`, not `release:preflight`, for the same reason
 * prettier does - these files never reach `dist/`, so a stale sentence must not
 * be able to block a release on its own.
 */
import { readFileSync, readdirSync } from 'node:fs';

const problems = [];
const note = (file, message) => problems.push({ file, message });

// ---------------------------------------------------------------------------
// Source of truth: the Storybook sidebar, i.e. each story's `title`
// ---------------------------------------------------------------------------

const STORY_TITLE = /title:\s*'([^']+)'/;

/** `Layout/Components/Header` -> { group: 'Layout', name: 'Header' } */
const componentsByGroup = () => {
  const groups = new Map();

  for (const dir of readdirSync('./src/components', { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;

    const files = readdirSync(`./src/components/${dir.name}`).filter((f) =>
      f.endsWith('.stories.tsx'),
    );

    for (const file of files) {
      const source = readFileSync(`./src/components/${dir.name}/${file}`, 'utf8');
      const title = source.match(STORY_TITLE)?.[1];
      if (!title || !title.includes('/')) continue;

      const segments = title.split('/');
      const group = segments[0];
      // The name is the last segment, which skips nesting like
      // `Layout/Components/Header`.
      const name = segments[segments.length - 1];
      if (!groups.has(group)) groups.set(group, new Set());
      groups.get(group).add(name);
    }
  }

  return groups;
};

const groups = componentsByGroup();
const allComponents = new Set([...groups.values()].flatMap((set) => [...set]));

// ---------------------------------------------------------------------------
// 1. Every component appears in both docs; nothing listed that doesn't exist
// ---------------------------------------------------------------------------

/**
 * Matched loosely on purpose - as a bullet, a table cell or comma-separated -
 * because the two files present the list differently and this check is about
 * completeness, not formatting.
 */
const mentions = (text, name) =>
  new RegExp(`(^|[\\s,|>*\`-])${name}([\\s,|<*\`.]|$)`, 'm').test(text);

for (const file of ['README.md', 'GETTING_STARTED.md']) {
  const text = readFileSync(`./${file}`, 'utf8');

  const missing = [...allComponents].filter((name) => !mentions(text, name)).sort();
  if (missing.length) {
    note(
      file,
      `does not list ${missing.length} component(s) that have stories: ${missing.join(', ')}`,
    );
  }

  for (const [group] of groups) {
    if (!mentions(text, group)) {
      note(file, `does not mention the "${group}" Storybook group`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Hard-coded component counts
// ---------------------------------------------------------------------------

const componentDirs = readdirSync('./src/components', { withFileTypes: true }).filter((d) =>
  d.isDirectory(),
).length;

for (const file of ['README.md', 'GETTING_STARTED.md']) {
  const text = readFileSync(`./${file}`, 'utf8');
  // e.g. "57 component directories", "49 components across 9 categories"
  for (const [, count] of text.matchAll(/(\d+)\s+component(?:s| directories| dirs)/g)) {
    if (Number(count) !== componentDirs) {
      note(file, `claims ${count} components but src/components has ${componentDirs} directories`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Every token the docs name must still exist
// ---------------------------------------------------------------------------
//
// Catches tokens that were renamed or removed - the docs would otherwise keep
// telling people to set a property nothing reads.
//
// Note what this deliberately does NOT check: whether a hex *value* in the docs
// matches the preset. That sounds like the more useful test, and it was the
// first thing tried, but it cannot be made precise. Both of these are `:root`
// blocks assigning real token names:
//
//   /* "here are the defaults" */     --primary-color: #5c5de8;
//   /* "override with your brand" */  --primary-color: #0ea5e9;
//
// Nothing structural separates them, so comparing values flags every legitimate
// override example. The stale-value case (README quoted `#6366f1` for a year
// after the palette moved on) is covered by a convention instead - see the
// "Documentation freshness" section in the eidos-ui-rules skill: when a palette
// value changes, grep the docs for the old hex.

const variables = readFileSync('./src/styles/variables.scss', 'utf8');
const declaredTokens = new Set(
  [...variables.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((match) => match[1]),
);

// Tokens generated from the Sass breakpoint map rather than written literally.
const GENERATED_TOKEN = /^breakpoint-/;

/**
 * First segment of every declared token, e.g. `primary`, `spacing`, `z`.
 *
 * Only tokens in a family the library actually owns are checked. The docs
 * legitimately define consumer-side tokens too - the z-index guidance shows
 * `--app-header: 1100` to demonstrate slotting your own chrome below the
 * library's layers - and those must not be reported as unknown. Checking by
 * family flags a renamed or misspelled library token while ignoring one the
 * reader is meant to invent.
 */
const knownFamilies = new Set([...declaredTokens].map((token) => token.split('-')[0]));

for (const file of ['README.md', 'GETTING_STARTED.md']) {
  const text = readFileSync(`./${file}`, 'utf8');

  const referenced = new Set([...text.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1]));

  const unknown = [...referenced]
    .filter(
      (token) =>
        knownFamilies.has(token.split('-')[0]) &&
        !declaredTokens.has(token) &&
        !GENERATED_TOKEN.test(token),
    )
    .sort();

  if (unknown.length) {
    note(
      file,
      `sets token(s) that variables.scss does not define: ${unknown.map((t) => `--${t}`).join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------

if (problems.length === 0) {
  console.log('✓ README.md and GETTING_STARTED.md are consistent with the source.');
  process.exit(0);
}

console.error('\n✖ Documentation is out of date:\n');
for (const { file, message } of problems) {
  console.error(`  ${file} ${message}`);
}
console.error(
  '\n  These files duplicate the component list and the design tokens, so they\n' +
    '  go stale silently. Update them, or update the source they describe.\n',
);
process.exit(1);
