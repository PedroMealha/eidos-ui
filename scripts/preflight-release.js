/**
 * Pre-flight checks that run BEFORE `npm version` bumps anything.
 *
 * Why this exists: the release scripts are `npm version <bump> && npm publish`.
 * `npm version` creates a commit and a tag immediately, and nothing rolls them
 * back if `npm publish` then fails. A failed publish therefore strands a
 * version that exists in git but never reached the registry.
 *
 * Everything that can be checked cheaply up front is checked here, so the
 * version commit is only created once a publish is very likely to succeed.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { checkBarrelExports } from './check-barrel-exports.js';

const run = (command) =>
  execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const fail = (title, ...lines) => {
  console.error(`\n✖ ${title}\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error('');
  process.exit(1);
};

// ── 1. npm authentication ───────────────────────────────────────────────────
// An expired or missing token makes `npm publish` fail with a misleading
// "404 Not Found" for scoped packages, because npm will not reveal whether a
// private/scoped package exists to an unauthenticated caller.
let user;
try {
  user = run('npm whoami');
} catch {
  fail(
    'Not authenticated with npm.',
    'Run: npm login',
    '',
    'Note: publishing while logged out fails with a confusing "404 Not Found"',
    'rather than a permission error.',
  );
}

// ── 2. Clean working tree ───────────────────────────────────────────────────
// `npm version` refuses to run on a dirty tree, but failing here gives a much
// clearer message than npm's.
let status;
try {
  status = run('git status --porcelain');
} catch {
  fail('Not a git repository, or git is unavailable.');
}

if (status) {
  const files = status
    .split('\n')
    .slice(0, 10)
    .map((l) => l.trim());
  fail(
    'Working tree is not clean.',
    'Commit or stash these before releasing:',
    '',
    ...files,
    status.split('\n').length > 10 ? `…and ${status.split('\n').length - 10} more` : '',
  );
}

// ── 3. Root barrel export completeness ──────────────────────────────────────
// Every type/value a component's own index.ts exports must also be reachable
// from the root barrel (src/index.ts) - otherwise consumers importing from
// `@pmealha/eidos-ui` hit a type they can see in the deep entry point but not
// import from the package root. This exact gap shipped in 3.0.0
// (`ComboboxOption` was missing) and went unnoticed until 3.2.0.
const missingExports = checkBarrelExports();
if (missingExports.length > 0) {
  fail(
    `Root barrel is missing ${missingExports.length} export(s).`,
    'Add these to src/index.ts:',
    '',
    ...missingExports.map(
      ({ component, kind, name }) =>
        `  ${name} (${kind}) — from src/components/${component}/index.ts`,
    ),
  );
}

// ── 4. Publish rights on this package ───────────────────────────────────────
// Being logged in is not the same as being allowed to publish this name.
const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));

try {
  const owners = run(`npm owner ls ${name}`);
  if (!owners.includes(user)) {
    fail(
      `"${user}" is not listed as an owner of ${name}.`,
      'Owners:',
      ...owners.split('\n').map((o) => `  ${o}`),
    );
  }
} catch (error) {
  // A brand-new package that has never been published has no owners yet -
  // that is fine, so only fail on an explicit ownership mismatch above.
  if (error?.status === 1 && !String(error.stderr || '').includes('404')) {
    fail('Could not verify package ownership.', String(error.stderr || error.message).trim());
  }
}

console.log(`✓ Pre-flight passed - authenticated as "${user}", releasing from ${name}@${version}`);
