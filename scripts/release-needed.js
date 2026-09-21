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
import { readFileSync } from 'node:fs';
import { BUILD_INPUTS } from './build-inputs.js';

const git = (command) => execSync(`git ${command}`, { encoding: 'utf8' }).trim();

/**
 * Shell-free variant. Required for `BUILD_INPUTS`'s exclude pathspecs, which
 * contain glob characters a shell would try to expand before git sees them.
 */
const gitArgs = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/**
 * `@fontsource-variable/*` are devDependencies whose `.woff2` files are copied
 * into `dist/fonts/` at build time, so bumping one DOES change the tarball even
 * though it is a devDependency. This is the sole exception to the rule below
 * that devDependencies are inert for consumers.
 */
const FONT_DEPENDENCIES = /^@fontsource-variable\//;

/** The subset of devDependencies whose versions reach `dist/`. */
const fontDeps = (manifest) =>
  Object.fromEntries(
    Object.entries(manifest.devDependencies ?? {}).filter(([name]) => FONT_DEPENDENCIES.test(name)),
  );

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

/**
 * Compare the tag against the WORKING TREE, not `tag..HEAD`.
 *
 * The question being answered is "does what I have now differ from the last
 * release?", and that has to include work which is edited or staged but not yet
 * committed. Omitting `..HEAD` makes git diff the commit against the files on
 * disk, so committed, staged and unstaged changes are all counted.
 */
const changed = gitArgs(['diff', '--name-only', lastTag, '--', ...BUILD_INPUTS])
  .split('\n')
  .filter(Boolean);

// Compare only the consumer-facing package.json fields, again against disk.
const manifestAt = (ref) => {
  try {
    return JSON.parse(git(`show ${ref}:package.json`));
  } catch {
    return {};
  }
};
const before = manifestAt(lastTag);
const after = JSON.parse(readFileSync('./package.json', 'utf8'));
const fieldChanges = CONSUMER_FIELDS.filter(
  (f) => JSON.stringify(before[f]) !== JSON.stringify(after[f]),
);

if (JSON.stringify(fontDeps(before)) !== JSON.stringify(fontDeps(after))) {
  fieldChanges.push('devDependencies (@fontsource-variable → dist/fonts)');
}

const commits = git(`log --oneline ${lastTag}..HEAD`).split('\n').filter(Boolean);
const uncommitted = gitArgs(['status', '--porcelain', '--', ...BUILD_INPUTS])
  .split('\n')
  .filter(Boolean);

console.log(
  `\nComparing ${lastTag} against the working tree ` +
    `(${commits.length} commit(s)${uncommitted.length ? `, ${uncommitted.length} uncommitted` : ''})\n`,
);

if (uncommitted.length) {
  console.log(`  Note: ${uncommitted.length} build-input change(s) are not committed yet -`);
  console.log('  they ARE counted below, but must be committed before releasing.\n');
}

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
console.log('\n  Then: npm run release -- patch | minor | major\n');
