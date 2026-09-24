#!/usr/bin/env node
/**
 * Enforces one shape for every component docs page.
 *
 * A reader moving between two components should not have to relearn the
 * layout, and the sidebar should agree with the page it describes. Both were
 * true only by habit before this existed: the sidebar sorted alphabetically
 * (so `Custom Footer` preceded the primary story) while each `.mdx` ordered
 * its sections narratively, basic-to-advanced. Neither order matched the
 * other, and 60 of 62 pages disagreed with the convention their own template
 * describes.
 *
 * The rule is deliberately mechanical rather than editorial. "Well-paced" is
 * not checkable, so it rots; "`Playground` first, then alphabetical" is, so it
 * cannot. Section order therefore carries no meaning and needs no judgement -
 * anything that genuinely has to be read in order is prose, and prose sections
 * all sit ahead of the stories.
 *
 * The shape:
 *
 *     # Component            intro
 *     ## Usage               prose
 *     ## <concept>           prose - any number, all before the stories
 *     ## Playground          the args-driven story, the only one with <Controls>
 *     ## <Story>             one story per section, alphabetical from here
 *     ### <edge case>        bound to the story above it
 *
 * Containment is by heading level: a story owns everything up to the next
 * `##`. That is deliberately not a JSX wrapper - MDX re-parses a multi-line
 * JSX element's children as markdown, which has broken these pages three
 * times, and `prettier --write` has silently reintroduced it. Heading levels
 * cannot fail that way.
 *
 * Runs from `npm run verify`, not `release:preflight`: `.mdx` never reaches
 * `dist/`, so a misordered docs page must not be able to block a release.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const COMPONENTS = './src/components';
const PRIMARY = 'Playground';

const problems = [];
const note = (file, message) => problems.push({ file, message });

/** Storybook's sidebar label for an export: `WithIcons` -> `With Icons`. */
const display = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();

const mdxFiles = () => {
  const found = [];
  for (const dir of readdirSync(COMPONENTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const dirPath = join(COMPONENTS, dir.name);
    for (const file of readdirSync(dirPath)) {
      if (file.endsWith('.mdx')) found.push(join(dirPath, file));
    }
  }
  return found.sort();
};

/**
 * Splits on `##` headings only. A `###` stays inside its parent section,
 * which is what makes an edge-case subsection part of the story it documents.
 */
const sections = (source) => {
  const parts = source.split(/^## (?!#)/m);
  return parts.slice(1).map((part) => ({
    heading: part.split('\n', 1)[0].trim(),
    canvases: [...part.matchAll(/<Canvas\s+of=\{[A-Za-z0-9_]+\.([A-Za-z0-9_]+)\}/g)].map(
      (m) => m[1],
    ),
    controls: [...part.matchAll(/<Controls\s+of=\{[A-Za-z0-9_]+\.([A-Za-z0-9_]+)\}/g)].map(
      (m) => m[1],
    ),
  }));
};

for (const file of mdxFiles()) {
  const all = sections(readFileSync(file, 'utf8'));
  const storySections = all.filter((s) => s.canvases.length > 0);

  // A page with no stories at all is a guide, not a component page.
  if (storySections.length === 0) continue;

  // 1. One story per section - otherwise "the order of the stories" is not
  //    even well defined, and a reader cannot tell which prose belongs to
  //    which canvas.
  for (const section of all) {
    if (section.canvases.length > 1) {
      note(
        file,
        `section "${section.heading}" shows ${section.canvases.length} stories ` +
          `(${section.canvases.join(', ')}) - give each its own section`,
      );
    }
  }

  // 2. Prose sections all sit ahead of the stories, so the story sequence is
  //    uninterrupted and matches the sidebar exactly.
  const firstStoryIndex = all.findIndex((s) => s.canvases.length > 0);
  const strayProse = all
    .slice(firstStoryIndex)
    .filter((s) => s.canvases.length === 0)
    .map((s) => s.heading);
  if (strayProse.length) {
    note(
      file,
      `prose section(s) sit among the stories: ${strayProse.join(', ')} - ` +
        `move them above "## ${PRIMARY}", or fold them into the story they describe as "###"`,
    );
  }

  // 3. `Playground` leads, and it is the only story with a Controls table.
  const order = storySections.map((s) => s.canvases[0]);
  if (order[0] !== PRIMARY) {
    note(
      file,
      order.includes(PRIMARY)
        ? `"${PRIMARY}" must be the first story section, not "${display(order[0])}"`
        : `no "## ${PRIMARY}" section - every component page leads with its args-driven story`,
    );
  }

  const withControls = all.filter((s) => s.controls.length > 0);
  for (const section of withControls) {
    if (section.controls.some((name) => name !== PRIMARY)) {
      note(
        file,
        `<Controls> is attached to ${section.controls.join(', ')} - it belongs only on ${PRIMARY}, ` +
          `which is the one args-driven story`,
      );
    }
  }
  if (withControls.length > 1) {
    note(file, `${withControls.length} sections render <Controls> - there must be exactly one`);
  }

  // 4. Everything after `Playground` is alphabetical by the label the sidebar
  //    shows, so the page and the sidebar cannot disagree.
  const rest = order.slice(1).map(display);
  const sorted = [...rest].sort((a, b) => a.localeCompare(b));
  if (rest.join('\u0000') !== sorted.join('\u0000')) {
    const firstWrong = rest.findIndex((name, index) => name !== sorted[index]);
    note(
      file,
      `stories after ${PRIMARY} are not alphabetical - ` +
        `expected "${sorted[firstWrong]}" where "${rest[firstWrong]}" is\n` +
        `      got:      ${rest.join(' > ')}\n` +
        `      expected: ${sorted.join(' > ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Deprecation - see `src/deprecation.docs.ts` for the convention.
//
// Each fact has exactly one reader: the `deprecated` tag badges the sidebar,
// `parameters.deprecation` fills the docs banner, and a prop's JSDoc
// `@deprecated` strikes it through in an editor. Nothing else connects them,
// so without this a component could be badged in the sidebar with no banner
// explaining what to use instead, or a prop could be deprecated in the types
// and still sit in the Controls table looking current.
// ---------------------------------------------------------------------------

/** The `const meta = { ... } satisfies Meta` block of a stories file. */
const metaBlock = (source) => {
  const start = source.indexOf('const meta = {');
  if (start === -1) return '';
  const end = source.indexOf('} satisfies Meta', start);
  return end === -1 ? '' : source.slice(start, end);
};

/** Props preceded by a JSDoc block containing `@deprecated`. */
const deprecatedProps = (typesSource) =>
  [...typesSource.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*'?([A-Za-z0-9_-]+)'?\??:/g)]
    .filter((match) => /@deprecated\b/.test(match[1]))
    .map((match) => match[2]);

/** The body of a top-level `argTypes` entry for `prop`, or `null`. */
const argTypeEntry = (meta, prop) => {
  const key = new RegExp(`\\n {4}'?${prop}'?: \\{`);
  const match = key.exec(meta);
  if (!match) return null;
  const end = meta.indexOf('\n    },', match.index);
  return meta.slice(match.index, end === -1 ? undefined : end);
};

for (const file of mdxFiles()) {
  const mdx = readFileSync(file, 'utf8');
  const importMatch = mdx.match(/import \* as (\w+) from '\.\/([\w.]+)';/);
  if (!importMatch) continue;
  const [, storiesVar, storiesModule] = importMatch;
  const storiesPath = join(dirname(file), `${storiesModule.replace(/\.tsx?$/, '')}.tsx`);
  if (!existsSync(storiesPath)) continue;
  const meta = metaBlock(readFileSync(storiesPath, 'utf8'));
  const stories = relative('.', storiesPath);

  const tagged = /tags:\s*\[[^\]]*'deprecated'/.test(meta);
  const hasInfo = /\bdeprecation:\s*\{/.test(meta);

  if (tagged && !hasInfo) {
    note(
      stories,
      "meta is tagged 'deprecated' but has no `parameters.deprecation` - add { since, removeIn?, use?, reason? } so the docs banner can say what to use instead",
    );
  }
  if (hasInfo && !tagged) {
    note(
      stories,
      "meta has `parameters.deprecation` but no 'deprecated' tag - add it to `tags` so the sidebar shows the badge",
    );
  }
  if (tagged) {
    const afterTitle = mdx.split(/^# .*$/m)[1] ?? '';
    const firstBlock = afterTitle.trimStart().split('\n', 1)[0];
    if (!new RegExp(`^<DeprecationNotice\\s+of=\\{${storiesVar}\\}\\s*/>`).test(firstBlock)) {
      note(
        file,
        `deprecated component - put <DeprecationNotice of={${storiesVar}} /> directly under the "# " title`,
      );
    }
  }

  // Props: every `@deprecated` prop in this component's types is grouped
  // under "Deprecated" in the Controls table. Scoped to the types file named
  // after the stories file (`Header.stories.tsx` -> `Header.types.ts`), since
  // a folder can hold several components.
  const typesPath = storiesPath.replace(/\.stories\.tsx$/, '.types.ts');
  if (!existsSync(typesPath)) continue;
  for (const prop of deprecatedProps(readFileSync(typesPath, 'utf8'))) {
    const entry = argTypeEntry(meta, prop);
    if (!entry || !/category:\s*'Deprecated'/.test(entry)) {
      note(
        stories,
        `\`${prop}\` is @deprecated in ${relative('.', typesPath)} - give its argTypes entry ` +
          `\`table: { category: 'Deprecated' }\` and a description starting "**Deprecated.**"`,
      );
    }
  }
}

if (problems.length === 0) {
  console.log(`✓ component docs pages follow the ${PRIMARY}-first structure`);
  process.exit(0);
}

console.error(`\n✖ ${problems.length} docs structure problem(s)\n`);
let current = null;
for (const { file, message } of problems) {
  if (file !== current) {
    console.error(`  ${file}`);
    current = file;
  }
  console.error(`    - ${message}`);
}
console.error('');
process.exit(1);
