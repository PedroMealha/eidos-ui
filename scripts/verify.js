/**
 * One command for "is this repo healthy?" - run it while working, and before
 * cutting a release.
 *
 * Output is suppressed unless a step fails. tsup and Storybook between them
 * print ~3000 lines of asset tables on success, which is exactly how a real
 * warning goes unnoticed. On failure the captured output is dumped in full, so
 * nothing is lost. Pass --verbose to stream everything live.
 *
 * Deliberately separate from `release:preflight`, which gates the *published
 * artifact*. This gates the *repository*: a mis-formatted file or a broken
 * Storybook page affects neither dist/ nor consumers, so it must not be able to
 * block a release on its own.
 */
import { execFileSync, execSync } from 'node:child_process';

const verbose = process.argv.includes('--verbose');
const gitArgs = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const secs = (from) => `${((Date.now() - from) / 1000).toFixed(1)}s`;

function step(label, command) {
  const started = Date.now();
  process.stdout.write(`  ${label.padEnd(18)}`);
  if (verbose) process.stdout.write('\n');

  try {
    execSync(command, verbose ? { stdio: 'inherit' } : { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(verbose ? `  ${label.padEnd(18)}ok  ${secs(started)}` : `ok  ${secs(started)}`);
  } catch (error) {
    console.log('FAILED');
    const output = [error.stdout?.toString(), error.stderr?.toString()]
      .filter(Boolean)
      .join('\n')
      .trim();
    if (output) console.error(`\n${output}\n`);
    console.error(`✖ ${label} failed.\n`);
    process.exit(1);
  }
}

/**
 * Anything that changes the built Storybook since the last release, whether
 * committed, staged or just edited: `src/` (components, stories and the `.mdx`
 * guide pages) and `.storybook/`.
 *
 * This used to match `*.mdx` only, on the reasoning that Storybook is the one
 * thing in the toolchain that parses `.mdx` - tsc and eslint both ignore it.
 * That reasoning covers `build-storybook`, but the step behind the same gate is
 * the axe ratchet, and the ratchet audits *rendered components*. So a `.tsx`
 * change was never accessibility-audited unless a docs page happened to change
 * alongside it: precisely the regression the ratchet exists to catch, invisible
 * to the gate that decides whether to run it.
 *
 * The two steps now cost ~50s together rather than ~250s, which is what makes
 * running them on nearly every change affordable.
 */
function storybookAffected() {
  const paths = ['src', '.storybook'];
  let lastTag;
  try {
    lastTag = gitArgs(['describe', '--tags', '--abbrev=0']);
  } catch {
    return { changed: true, reason: 'no tags to compare against' };
  }

  const files = new Set([
    ...gitArgs(['diff', '--name-only', lastTag, '--', ...paths])
      .split('\n')
      .filter(Boolean),
    ...gitArgs(['status', '--porcelain', '--', ...paths])
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3)),
  ]);

  return files.size > 0
    ? { changed: true, reason: `${files.size} file(s) changed since ${lastTag}` }
    : { changed: false, reason: `no src/ or .storybook/ changes since ${lastTag}` };
}

const started = Date.now();
console.log('');
step('lint', 'npm run lint');
// The `dev/` app imports `eidos-ui/fonts` the way a consumer would, and that
// specifier only resolves through the `exports` map to `dist/fonts.css.d.ts`.
// So `typecheck` needs the stylesheet build to have happened at least once.
// It always had; nobody noticed because `dist/` was left over from a previous
// run, and `verify` therefore could not pass on a fresh clone. A second's
// worth of Sass here keeps the cheap checks in front of the expensive ones.
step('styles', 'npm run build:styles');
step('typecheck', 'npm run typecheck');
step('prettier', 'npm run prettier:check');
// README/GETTING_STARTED duplicate the component list and the token names, and
// nothing else in the toolchain reads prose. Cheap, so it runs before the build.
step('docs', 'node scripts/check-docs.js');
// Unit tests plus every story rendered in a real browser. Runs before the
// build: a broken component should fail here, not 90 seconds later in tsup.
step('test', 'npm test');
step('build', 'npm run build');
// Renders the built package with no DOM at all. Guards two things nothing else
// can see: that an overlay opened on its first render defers its portal rather
// than throwing, and that no component serialises a `style` attribute into an
// SSR payload - which is the claim `ContentSecurityPolicy.mdx` makes.
step('ssr', 'node scripts/check-ssr.js');

const storybook = storybookAffected();
if (storybook.changed) {
  step('build-storybook', 'npm run build-storybook');
  // Reads `storybook-static`, so it can only run when that was just rebuilt -
  // auditing a stale build would report yesterday's accessibility.
  step('a11y', 'node scripts/check-a11y-baseline.js');
} else {
  console.log(`  ${'build-storybook'.padEnd(18)}skipped  (${storybook.reason})`);
  console.log(`  ${'a11y'.padEnd(18)}skipped  (needs a fresh storybook-static)`);
}

console.log(`\n✓ All checks passed in ${secs(started)}.\n`);
