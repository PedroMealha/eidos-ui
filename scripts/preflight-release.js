/**
 * Pre-flight checks that run BEFORE `npm version` bumps anything.
 *
 * Why this exists: the release scripts are `npm version <bump>`, whose tag push
 * triggers `.github/workflows/publish.yml`. `npm version` creates a commit and
 * a tag immediately, and nothing rolls them back if the publish then fails. A
 * failed publish therefore strands a version that exists in git but never
 * reached the registry.
 *
 * Everything that can be checked cheaply up front is checked here, so the
 * version commit is only created once a publish is very likely to succeed.
 *
 * Deliberately does NOT check npm authentication or package ownership any more.
 * Publishing moved into CI and authenticates with npm trusted publishing
 * (OIDC), so there is no npm credential on this machine to validate - a
 * `npm whoami` check here would fail for a perfectly releasable tree. The
 * equivalent failure now surfaces in the publish workflow, which is the only
 * place that actually needs publish rights.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { checkBarrelExports } from './check-barrel-exports.js';
import { checkChangelogUpToDate } from './check-changelog.js';

const run = (command) =>
  execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const fail = (title, ...lines) => {
  console.error(`\n✖ ${title}\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error('');
  process.exit(1);
};

// ── 1. Clean working tree ───────────────────────────────────────────────────
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

// ── 2. Root barrel export completeness ──────────────────────────────────────
// Every type/value a component's own index.ts exports must also be reachable
// from the root barrel (src/index.ts) - otherwise consumers importing from
// `eidos-ui` hit a type they can see in the deep entry point but not
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

// ── 3. Changelog is up to date ───────────────────────────────────────────────
// Enforces the "Changelog discipline" convention in
// `.devin/skills/eidos-ui-rules/SKILL.md` - entries should land as work
// happens, not get written retroactively right before a release.
const changelogCheck = checkChangelogUpToDate();
if (!changelogCheck.ok) {
  fail(changelogCheck.reason, 'Changed since the last release:', '', ...changelogCheck.changed);
}

const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));

console.log(`✓ Pre-flight passed - releasing from ${name}@${version}`);
