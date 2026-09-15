/**
 * Single entry point for cutting a release:
 *
 *   npm run release -- patch | minor | major
 *   npm run release              # tells you which bump your changelog implies
 *
 * Replaced three near-identical `release:patch|minor|major` scripts. The point
 * isn't brevity for its own sake - it's that this can check the requested bump
 * against the changelog BEFORE running anything. Previously a too-small bump
 * was only caught by `promote-changelog.js`, which runs after ~2 minutes of
 * preflight and after `package.json` has already been rewritten. That guard
 * still exists and remains authoritative; this just means you rarely reach it.
 *
 * Everything after the check is unchanged: `release:preflight` then
 * `npm version <bump>`, whose `postversion` hook pushes the tag, which triggers
 * `.github/workflows/publish.yml` to stage the release for approval.
 */
import { execSync } from 'node:child_process';
import { BUMPS, impliedBump, rank, unreleasedContent } from './changelog-bump.js';

const fail = (title, ...lines) => {
  console.error(`\n✖ ${title}\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error('');
  process.exit(1);
};

const requested = process.argv[2];
const content = unreleasedContent();

if (!content) {
  fail(
    'CHANGELOG.md has no entries under [Unreleased].',
    'Add what changed before releasing - see the "Changelog discipline"',
    'section in .devin/skills/eidos-ui-rules/SKILL.md.',
  );
}

const implied = impliedBump(content);

if (!requested) {
  console.log(`\nYour [Unreleased] entries imply a ${implied.toUpperCase()} release.\n`);
  console.log(`  npm run release -- ${implied}\n`);
  console.log(`Pass a larger bump deliberately if you want one (${BUMPS.join(' | ')}).\n`);
  process.exit(1);
}

if (rank(requested) === -1) {
  fail(`"${requested}" is not a valid bump.`, `Expected one of: ${BUMPS.join(', ')}`);
}

// Larger than implied is always allowed - deciding something is breaking, or
// worth a minor, is a judgement call the changelog can't make. Smaller is not.
if (rank(requested) < rank(implied)) {
  const why =
    implied === 'major'
      ? 'a literal "**Breaking**" marker requires major'
      : 'an "### Added" entry requires at least minor';
  fail(
    `[Unreleased] requires a ${implied} bump, but ${requested} was requested.`,
    why + '.',
    '',
    `Re-run as: npm run release -- ${implied}`,
  );
}

console.log(`\n▶ Releasing ${requested} (changelog implies ${implied})\n`);
execSync('npm run release:preflight', { stdio: 'inherit' });
execSync(`npm version ${requested}`, { stdio: 'inherit' });
