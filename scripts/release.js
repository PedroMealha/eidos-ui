/**
 * Single entry point for cutting a release:
 *
 *   npm run release -- patch | minor | major
 *   npm run release              # tells you which bump your changelog implies
 *   npm run release -- approve   # publish the version CI staged (prompts 2FA)
 *
 * Replaces three near-identical `release:patch|minor|major` scripts, and checks
 * the requested bump against the changelog BEFORE running anything. That check
 * previously only happened in `promote-changelog.js` - after ~2 minutes of
 * preflight and after `package.json` had been rewritten. That guard is still
 * authoritative; this just means you rarely reach it.
 *
 * Then: `release:preflight`, `npm version <bump>`, whose `postversion` hook
 * pushes the tag, which triggers `publish.yml` to stage the release.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { BUMPS, impliedBump, rank, unreleasedContent } from './changelog-bump.js';

const fail = (title, ...lines) => {
  console.error(`\n✖ ${title}\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error('');
  process.exit(1);
};

const requested = process.argv[2];

/**
 * Publishes the version CI staged, without copy-pasting a UUID by hand. The id
 * can't come from the release run itself - that finishes when the tag is
 * pushed, and the stage is created ~45s later by the publish workflow.
 *
 * Resolves the id and hands off; the 2FA prompt stays interactive, because that
 * prompt IS the security control behind stage-only publishing.
 */
if (requested === 'approve') {
  const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));

  let staged;
  try {
    staged = JSON.parse(execSync(`npm stage list ${name} --json`, { encoding: 'utf8' }));
  } catch (error) {
    const detail = String(error.stderr || error.message);
    // npm CLI sessions are short-lived, and approving is the only step in the
    // whole release that needs npm auth at all - so an expired login shows up
    // here and nowhere else. Say so plainly rather than relaying npm's wall.
    if (/E401|Unable to authenticate/i.test(detail)) {
      fail(
        'Your npm session has expired.',
        'Approving is the only step that needs npm auth, so this is the only',
        'place it surfaces. Log in and re-run:',
        '',
        '  npm login',
        '  npm run release -- approve',
      );
    }
    fail('Could not read the stage queue.', detail.trim());
  }

  if (!Array.isArray(staged) || staged.length === 0) {
    fail(
      `Nothing is staged for ${name}.`,
      'Either the publish workflow has not finished yet (it takes ~45s after the',
      'tag is pushed), or this version was already approved. Check with:',
      '',
      `  npm view ${name} version`,
    );
  }

  const match = staged.find((entry) => entry.version === version);
  if (!match) {
    fail(
      `Nothing staged matches package.json's version (${version}).`,
      'Staged instead:',
      '',
      ...staged.map((e) => `  ${e.version}  id ${e.id}`),
      '',
      'Approve one explicitly with `npm stage approve <stage-id>` if that is intended.',
    );
  }

  console.log(`\n▶ Approving ${name}@${match.version} (staged ${match.date_staged ?? 'recently'})`);
  console.log(`  id ${match.id}\n`);

  try {
    execSync(`npm stage approve ${match.id}`, { stdio: 'inherit' });
  } catch {
    // stdio is inherited so npm's 2FA prompt stays interactive, which means its
    // error text can't be captured and inspected here - hence guidance rather
    // than a parsed message. The common case by far is E409: npm runs an
    // automated review on every staged package and refuses approval until it
    // finishes, which takes a few minutes.
    fail(
      'npm refused the approval.',
      'If it mentioned "automated review hasn\'t finished" (E409), nothing is',
      'wrong - npm scans every staged package first. Wait a few minutes and',
      're-run; the stage is untouched either way.',
      '',
      '  npm run release -- approve',
      `  npm stage view ${match.id}     # inspect what is queued`,
    );
  }

  process.exit(0);
}
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
