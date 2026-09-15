/**
 * Runs as npm's `version` lifecycle hook - after `package.json`'s version is
 * bumped, but before the version commit/tag is created (see `postversion` in
 * package.json, which pushes it). Automates the "at actual release time"
 * step of the "Changelog discipline" convention in
 * `.devin/skills/eidos-ui-rules/SKILL.md`:
 *
 *   1. Renames `## [Unreleased]`'s content to `## [x.y.z] - <today>`,
 *      leaving a fresh empty `## [Unreleased]` above it, and stages the
 *      result so it lands in the same commit as the version bump - not a
 *      separate manual commit afterward.
 *   2. Prints a ready-to-paste `<ReleaseCard>` JSX snippet for
 *      `src/Releases.mdx` to the terminal. Deliberately does NOT write to
 *      that file directly - it's JSX inside an MDX file, and generating
 *      that programmatically risks the exact class of fragile parsing bugs
 *      this project hit repeatedly while building `Releases.mdx` by hand.
 *      Copy-paste the snippet in, adjust wording if needed.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const BOILERPLATE =
  'Entries land here as work happens, not written retroactively at release time\n' +
  '- see the "Changelog discipline" section in\n' +
  '`.devin/skills/eidos-ui-rules/SKILL.md` for the convention this follows.';

const today = () => new Date().toISOString().slice(0, 10);

function detectBump(oldVersion, newVersion) {
  const [oMaj, oMin] = oldVersion.split('.').map(Number);
  const [nMaj, nMin] = newVersion.split('.').map(Number);
  if (nMaj !== oMaj) return 'major';
  if (nMin !== oMin) return 'minor';
  return 'patch';
}

/** Splits the (already boilerplate-stripped) Unreleased content into
 * `### Category` sections, joining each bullet's wrapped continuation
 * lines (2-space indented, per this file's own convention) into one. */
function parseSections(content) {
  const sections = [];
  let current = null;
  let itemLines = null;

  const flushItem = () => {
    if (itemLines) {
      current.items.push(itemLines.join(' ').trim());
      itemLines = null;
    }
  };
  const flushSection = () => {
    flushItem();
    if (current) sections.push(current);
    current = null;
  };

  for (const line of content.split('\n')) {
    const heading = line.match(/^### (\w+)/);
    if (heading) {
      flushSection();
      current = { category: heading[1].toLowerCase(), items: [] };
      continue;
    }
    if (!current) continue;
    const bullet = line.match(/^- (.*)/);
    if (bullet) {
      flushItem();
      itemLines = [bullet[1]];
      continue;
    }
    const continuation = line.match(/^ {2}(\S.*)/);
    if (continuation && itemLines) itemLines.push(continuation[1]);
  }
  flushSection();
  return sections;
}

/** The rendered `<ReleaseCard>` items are JSX, not markdown - `**Foo**` is
 * literal asterisk characters to React, not bold, unlike everywhere else in
 * this project (CHANGELOG.md, GitHub, editors) that renders markdown. So
 * `**Breaking**:` (the marker `promote-changelog.js` itself greps for - see
 * the abort check below) needs converting to real `<strong>` here, same as
 * `` `Foo` `` needs `<Code>`. `{`/`}` are special in JSX children (an
 * expression container) - escape them to their literal-text form too, so
 * prose like `` `hasCardView={false}` `` doesn't get parsed as a JS
 * expression when pasted. The rest of a bullet is plain enough prose that no
 * further conversion has proven necessary in practice; this is a starting
 * point to paste and review, not a guaranteed-correct output. */
const toJsx = (text) =>
  text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Single combined pass, not two sequential ones - two separate global
    // replaces would have the second one re-match braces the first one just
    // inserted (`{'{'}` itself contains `{`/`}`), corrupting the escape.
    .replace(/[{}]/g, (ch) => (ch === '{' ? "{'{'}" : "{'}'}"))
    .replace(/`([^`]+)`/g, '<Code>$1</Code>');

function buildSnippet(version, date, bump, sections) {
  const sectionsSrc = sections
    .map(({ category, items }) => {
      const itemsSrc = items
        .map((item) => `        <>\n          ${toJsx(item)}\n        </>,`)
        .join('\n');
      return `    {\n      category: '${category}',\n      items: [\n${itemsSrc}\n      ],\n    },`;
    })
    .join('\n');

  return [
    '<ReleaseCard',
    `  version="${version}"`,
    `  date="${date}"`,
    `  bump="${bump}"`,
    '  sections={[',
    sectionsSrc,
    '  ]}',
    '/>',
  ].join('\n');
}

const changelog = readFileSync('./CHANGELOG.md', 'utf8');
const match = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/);
const rawSection = match ? match[1] : '';
const content = rawSection.replace(BOILERPLATE, '').trim();

if (!content) {
  console.log('promote-changelog: [Unreleased] has no real entries - nothing to promote.');
  process.exit(0);
}

const { version: newVersion } = JSON.parse(readFileSync('./package.json', 'utf8'));

let oldVersion = '0.0.0';
try {
  // Strip ANY non-numeric prefix, not just a literal `v`. `npm version`'s
  // prefix is configurable (`tag-version-prefix`), and a prefix this regex
  // failed to match left the tag name itself in `oldVersion` - so
  // `detectBump` ran `Number('eidos-v1')`, got NaN, and returned 'major'
  // unconditionally, silently disabling both guards below.
  oldVersion = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' })
    .trim()
    .replace(/^\D*/, '');
} catch {
  // No tags yet - first release, `detectBump` falls back to comparing against 0.0.0.
}

const bump = detectBump(oldVersion, newVersion);
const date = today();
const sections = parseSections(content);

// The content implies its own minimum bump - if what was actually run is
// smaller than that, abort before the commit/tag are created. Exiting
// non-zero here makes `npm version` abort entirely (nothing is committed or
// tagged), so this is safe to run before the point of no return, unlike
// everything else `release:preflight` already checks.
//
// A literal `**Breaking**` marker (see the "Changelog discipline" section
// in `.devin/skills/eidos-ui-rules/SKILL.md`) requires major, checked first
// since it overrides everything else regardless of what else is queued. An
// `### Added` entry with no breaking marker requires at least minor.
const hasBreaking = /\*\*Breaking\*\*/i.test(content);
const hasAdded = sections.some((s) => s.category === 'added');

if (hasBreaking && bump !== 'major') {
  console.error(
    '✖ [Unreleased] has a "**Breaking**" entry, which needs a major bump.\n' +
      '  Re-run as `npm run release:major`.',
  );
  process.exit(1);
}

if (!hasBreaking && hasAdded && bump === 'patch') {
  console.error(
    '✖ [Unreleased] has an "Added" entry, which needs at least a minor bump.\n' +
      '  Re-run as `npm run release:minor` (or `release:major` if anything is breaking).',
  );
  process.exit(1);
}

const promoted = changelog.replace(
  /## \[Unreleased\]\n[\s\S]*?(?=\n## \[|$)/,
  `## [Unreleased]\n\n${BOILERPLATE}\n\n## [${newVersion}] - ${date}\n\n${content}\n`,
);
writeFileSync('./CHANGELOG.md', promoted);
execSync('git add CHANGELOG.md');

console.log(`✓ CHANGELOG.md: [Unreleased] → [${newVersion}] - ${date}`);
console.log('\nPaste this into src/Releases.mdx (adjust wording/placement as needed):\n');
console.log(
  `<Divider style={{ margin: '24px 0' }} />\n\n${buildSnippet(newVersion, date, bump, sections)}`,
);
