/**
 * One command for "is this repo healthy?" - run it before committing, and
 * before cutting a release.
 *
 * Why this exists: the checks were previously a list of six commands to
 * remember and run by hand, four of which `release:preflight` already runs
 * anyway. That redundancy made the real gaps (`prettier:check` and
 * `build-storybook`) easy to skip, which is exactly how 14 files drifted out of
 * prettier compliance without anyone noticing.
 *
 * Deliberately separate from `release:preflight`, which gates the *published
 * artifact* (clean tree, barrel exports, changelog). This gates the
 * *repository* - a mis-formatted file or a broken Storybook page affects
 * neither `dist/` nor consumers, so it must not be able to block a release on
 * its own.
 *
 * `build-storybook` is conditional: it is the only thing in the toolchain that
 * actually parses `.mdx` (tsc and eslint both ignore it), but it costs ~60-90s,
 * so it runs only when an `.mdx` file has actually changed.
 */
import { execFileSync, execSync } from 'node:child_process';

const gitArgs = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** Runs a step, streaming its output, and exits on first failure. */
function step(label, command) {
  process.stdout.write(`\n▶ ${label}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error(`\n✖ ${label} failed - stopping here.\n`);
    process.exit(1);
  }
}

/**
 * Any `.mdx` touched since the last release, whether committed, staged or
 * merely edited on disk. Mirrors `release-needed.js` in comparing against the
 * last tag rather than a fixed number of commits, so the answer doesn't drift
 * as commits accumulate.
 */
function mdxChanged() {
  let lastTag;
  try {
    lastTag = gitArgs(['describe', '--tags', '--abbrev=0']);
  } catch {
    return { changed: true, reason: 'no tags yet, so nothing to compare against' };
  }

  const committed = gitArgs(['diff', '--name-only', lastTag, '--', '*.mdx'])
    .split('\n')
    .filter(Boolean);
  const dirty = gitArgs(['status', '--porcelain', '--', '*.mdx'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3));

  const files = [...new Set([...committed, ...dirty])];
  return files.length > 0
    ? { changed: true, reason: `${files.length} .mdx file(s) changed since ${lastTag}`, files }
    : { changed: false, reason: `no .mdx changes since ${lastTag}` };
}

step('lint', 'npm run lint');
step('typecheck', 'npm run typecheck');
step('prettier', 'npm run prettier:check');
step('build', 'npm run build');

const mdx = mdxChanged();
if (mdx.changed) {
  console.log(`\n  (${mdx.reason} - Storybook is the only .mdx validator, so building it)`);
  step('build-storybook', 'npm run build-storybook');
} else {
  console.log(`\n▶ build-storybook - SKIPPED (${mdx.reason})`);
}

console.log('\n✓ Everything passed.\n');
