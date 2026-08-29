/**
 * Answers one question: does anything since the last release actually change
 * what consumers install?
 *
 * `files: ["dist"]` means only `dist/` is published, so a release is warranted
 * only when a change reaches the build output. Docs, the `dev/` example app,
 * Storybook and CI config never do.
 *
 * Always exits 0 - this is advisory, and a non-zero exit would render as a
 * script failure for the perfectly normal "nothing to release" answer.
 */
import { execFileSync, execSync } from 'node:child_process';

const git = (command) => execSync(`git ${command}`, { encoding: 'utf8' }).trim();

/**
 * Shell-free variant. Required for the exclude pathspecs below, which contain
 * glob characters a shell would try to expand before git ever sees them.
 */
const gitArgs = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/**
 * Sources that end up in dist/.
 *
 * `.mdx` and `.stories.tsx` live under src/ but are Storybook-only - tsup builds
 * from each component's `index.ts`, so they never reach the tarball. Counting
 * them would flag doc-only edits as releasable, which is the exact
 * over-publishing this script exists to prevent.
 */
const BUILD_INPUTS = [
  'src',
  // Bare `*` patterns match at any depth, unlike `src/**/*.mdx`, which misses
  // files sitting directly in src/ (e.g. src/Introduction.mdx).
  ':(exclude)*.mdx',
  ':(exclude)*.stories.tsx',
  ':(exclude)*.test.tsx',
  'tsup.config.ts',
  'scripts/build-styles.js',
];

/**
 * package.json is always in the tarball, but only these fields affect how the
 * package resolves or installs. `scripts`, `devDependencies` and friends are
 * inert for consumers.
 */
const CONSUMER_FIELDS = [
  'name',
  'main',
  'module',
  'types',
  'exports',
  'files',
  'sideEffects',
  'dependencies',
  'peerDependencies',
  'engines',
];

// Defaults to the most recent tag; override with e.g. `npm run release:needed -- v3.0.0`.
let lastTag = process.argv[2];
if (!lastTag) {
  try {
    lastTag = git('describe --tags --abbrev=0');
  } catch {
    console.log('No tags found - nothing to compare against. Treating as releasable.');
    process.exit(0);
  }
}

const changed = gitArgs(['diff', '--name-only', `${lastTag}..HEAD`, '--', ...BUILD_INPUTS])
  .split('\n')
  .filter(Boolean);

// Compare only the consumer-facing package.json fields.
const readManifest = (ref) => {
  try {
    return JSON.parse(git(`show ${ref}:package.json`));
  } catch {
    return {};
  }
};
const before = readManifest(lastTag);
const after = readManifest('HEAD');
const fieldChanges = CONSUMER_FIELDS.filter(
  (f) => JSON.stringify(before[f]) !== JSON.stringify(after[f]),
);

const commits = git(`log --oneline ${lastTag}..HEAD`).split('\n').filter(Boolean);

console.log(`\nComparing ${lastTag}..HEAD  (${commits.length} commit(s))\n`);

if (changed.length === 0 && fieldChanges.length === 0) {
  const touched = git(`diff --name-only ${lastTag}..HEAD`).split('\n').filter(Boolean);
  console.log('  Nothing reaches dist/ - PUSH ONLY, no release needed.\n');
  if (touched.length) {
    console.log('  Changed, but not published:');
    for (const f of touched.slice(0, 12)) console.log(`    ${f}`);
    if (touched.length > 12) console.log(`    …and ${touched.length - 12} more`);
    console.log('');
  }
  process.exit(0);
}

console.log('  RELEASE NEEDED - these change what consumers install:\n');
for (const f of changed) console.log(`    ${f}`);
for (const f of fieldChanges) console.log(`    package.json → "${f}"`);
console.log('\n  Then: npm run release:patch | release:minor | release:major\n');
