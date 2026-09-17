/**
 * Blocks a release if there are code changes that reach dist/ since the last
 * tag, but CHANGELOG.md's `## [Unreleased]` section is still empty.
 *
 * Why this exists: the "Changelog discipline" convention in
 * `.devin/skills/eidos-ui-rules/SKILL.md` asks for entries to be added as
 * work happens, not written retroactively at release time - but nothing
 * enforced that before this script. Run from `scripts/preflight-release.js`
 * before every publish, same as `check-barrel-exports.js`.
 *
 * Deliberately does NOT check wording/length/quality - only that something
 * real was written. Keeping entries short is a human judgment call (see the
 * skill doc), not something worth a brittle heuristic here.
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const git = (command) => execSync(`git ${command}`, { encoding: 'utf8' }).trim();
const gitArgs = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

// Mirrors release-needed.js's own list - keep the two in sync if this ever changes.
const BUILD_INPUTS = [
  'src',
  ':(exclude)*.mdx',
  ':(exclude)*.stories.tsx',
  ':(exclude)*.test.tsx',
  ':(exclude)*.docs.tsx',
  'tsup.config.ts',
  'scripts/build-styles.js',
  'scripts/build.js',
];

/**
 * Everything between the `## [Unreleased]` heading and the next `## [`
 * heading, with the standing explanatory note (present even when there are
 * no real entries yet) stripped out.
 */
function unreleasedSectionContent(changelog) {
  const match = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/);
  if (!match) return '';

  const boilerplate =
    /Entries land here as work happens, not written retroactively at release time\s*-\s*see the "Changelog discipline" section in\s*`\.devin\/skills\/eidos-ui-rules\/SKILL\.md` for the convention this follows\./;

  return match[1].replace(boilerplate, '').trim();
}

export function checkChangelogUpToDate() {
  let lastTag;
  try {
    lastTag = git('describe --tags --abbrev=0');
  } catch {
    return { ok: true }; // no tags yet - nothing to compare against
  }

  const changed = gitArgs(['diff', '--name-only', lastTag, '--', ...BUILD_INPUTS])
    .split('\n')
    .filter(Boolean);

  if (changed.length === 0) {
    return { ok: true }; // nothing reaches dist/ - no changelog entry required
  }

  const changelog = readFileSync('./CHANGELOG.md', 'utf8');
  const unreleased = unreleasedSectionContent(changelog);

  if (unreleased.length === 0) {
    return {
      ok: false,
      reason:
        `${changed.length} change(s) since ${lastTag} reach dist/, but CHANGELOG.md's ` +
        `[Unreleased] section is empty. Add a short entry before releasing.`,
      changed,
    };
  }

  return { ok: true };
}

// Allow running directly: `node scripts/check-changelog.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkChangelogUpToDate();
  if (result.ok) {
    console.log('✓ CHANGELOG.md is up to date with unreleased changes.');
  } else {
    console.error(`✖ ${result.reason}\n`);
    for (const f of result.changed.slice(0, 12)) console.error(`  ${f}`);
    if (result.changed.length > 12) console.error(`  …and ${result.changed.length - 12} more`);
    process.exit(1);
  }
}
