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
import { c, token } from './ansi.js';
import { BOILERPLATE, impliedBump, rank, unreleasedContent } from './changelog-bump.js';

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
 * `` `Foo` `` needs `<Code>`.
 *
 * `{`, `}`, `<` and `>` are all special in JSX children and must be escaped to
 * their literal-text form, or MDX fails to parse the pasted card:
 *
 *   - braces open an expression container, so `` `hasCardView={false}` ``
 *     would be evaluated as JS;
 *   - angle brackets open a tag, so a generic like `` `RowKey<T>` `` reads as
 *     an opening `<T>` element. This broke `Releases.mdx` on the 2.0.0 card,
 *     with Storybook reporting only "Could not parse expression with acorn".
 *
 * Escaping runs FIRST, in one combined pass, and the order matters twice over:
 * a second global replace would re-match the braces of the escapes it just
 * inserted (`{'{'}` itself contains `{`/`}`), and escaping after tag insertion
 * would mangle the `<strong>`/`<Code>` tags this function adds itself.
 *
 * The rest of a bullet is plain enough prose that no further conversion has
 * proven necessary; this is a starting point to paste and review, not a
 * guaranteed-correct output. */
const toJsx = (text) =>
  text
    .replace(/[{}<>]/g, (ch) => `{'${ch}'}`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
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
const content = unreleasedContent(changelog);

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
// The rule itself lives in `changelog-bump.js`, shared with `release.js` so a
// too-small bump is normally rejected before preflight even runs. This remains
// the authoritative check: it is the only one that sees the bump `npm version`
// actually applied, rather than the one that was requested.
const implied = impliedBump(content);

if (rank(bump) < rank(implied)) {
  const why =
    implied === 'major'
      ? 'a literal "**Breaking**" entry requires major'
      : 'an "### Added" entry requires at least minor';
  console.error(
    `${c.red('✖')} [Unreleased] requires a ${implied} bump, but this run is ${bump} - ${why}.\n` +
      `  Re-run as ${token(`npm run release -- ${implied}`)}.`,
  );
  process.exit(1);
}

const promoted = changelog.replace(
  /## \[Unreleased\]\n[\s\S]*?(?=\n## \[|$)/,
  `## [Unreleased]\n\n${BOILERPLATE}\n\n## [${newVersion}] - ${date}\n\n${content}\n`,
);
writeFileSync('./CHANGELOG.md', promoted);
execSync('git add CHANGELOG.md');

console.log(`${c.green('✓')} CHANGELOG.md: [Unreleased] → [${newVersion}] - ${date}`);

// No separator element to prepend: each card renders as its own single-item
// `Accordion` and supplies its own rule (see `ReleaseCard` in
// `src/Releases.docs.tsx`), so the card is the whole paste.
const snippet = `${buildSnippet(newVersion, date, bump, sections)}\n`;

// Also written to disk, not just printed: a long bullet wraps at the terminal
// width, and copying a wrapped line out of scrollback silently breaks a word in
// half (this nearly shipped "new-fea\nture" once). The file is gitignored - it's
// a clipboard staging area, not an artifact.
const SNIPPET_PATH = './.release-snippet.mdx';
writeFileSync(SNIPPET_PATH, snippet);

// Format with the repo's own prettier config, so what you paste is already
// compliant and `npm run verify` passes without a separate `prettier:fix` run.
//
// `--ignore-path .prettierignore` is required, not cosmetic: prettier 3
// defaults its ignore path to BOTH .gitignore and .prettierignore, and this
// file is gitignored - so without the override prettier silently skips it and
// reports success.
//
// Best-effort by design. This runs inside `npm version`, after package.json has
// already been rewritten, so a formatting hiccup must never be what aborts a
// release.
let formatted = false;
try {
  execSync(`npx prettier --write --ignore-path .prettierignore ${SNIPPET_PATH}`, {
    stdio: 'ignore',
  });
  formatted = true;
} catch {
  // Falls through to the hint below.
}

console.log(`\nRelease card written to ${token(SNIPPET_PATH)}`);
console.log(
  `Copy it from there into ${token('src/Releases.mdx')} (adjust wording/placement as needed),`,
);
if (formatted) {
  console.log(`then ${token('npm run verify')} - it is the only thing that parses .mdx.`);
} else {
  console.log(
    `then ${token('npm run prettier:fix')} (auto-format failed) and ${token('npm run verify')}.`,
  );
}
// console.log(snippet);
