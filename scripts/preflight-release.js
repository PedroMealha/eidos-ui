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

// ── 2. Git can actually create the version commit ───────────────────────────
// `npm version` bumps package.json, runs the `version` hook (which promotes
// CHANGELOG.md and writes the release card), and only THEN commits. A commit
// that fails at that point strands the release: bumped and promoted but
// untagged, needing manual recovery.
//
// One cause has already done this three times: a GUI client (GitKraken)
// rewrites ~/.gitconfig and re-adds empty-valued signing keys. Git then
// hard-fails every commit with `invalid value for 'gpg.format'` - nothing to do
// with this repo, and invisible until the release is already half-done.
//
// Checked by reading the keys rather than by attempting a signature: git has no
// dry-run that exercises signing, and a real test commit here would be worse
// than the problem. This catches the observed failure; a key that is configured
// but missing from disk would still only surface at commit time.
//
// **`--get-all`, never `--get`.** `--get` returns only the winning value, so an
// empty entry that a later `includeIf` file overrides is invisible to it - and
// git rejects the empty entry anyway when it signs, naming the file and line:
//
//   fatal: bad config variable 'gpg.format' in file '~/.gitconfig' at line 8
//
// That is exactly how a release stranded on 3.6.2: this check ran, passed on
// `gpg.format` and `user.signingKey` because ~/.gitconfig-personal sets both
// after the include, and `npm version` then failed at the commit with the
// version already bumped and the changelog already promoted.
//
// Re-verify a change here against a config that reproduces that shape - an
// empty value followed by an include that sets a real one:
//
//   printf '[gpg]\n\tformat = \n[include]\n\tpath = %s/b\n' "$PWD" > a
//   printf '[gpg]\n\tformat = ssh\n' > b
//   GIT_CONFIG_GLOBAL=a git config --get gpg.format          # ssh  <- misses it
//   GIT_CONFIG_GLOBAL=a git config --get-all gpg.format      # '' then ssh
const EMPTY_BREAKS_COMMIT = [
  'gpg.format',
  'user.signingKey',
  'gpg.ssh.program',
  'gpg.ssh.allowedSignersFile',
];

// Deliberately not `run`, which trims: an empty value is a trailing tab on its
// line, and the whole point is to see it.
const runUntrimmed = (command) =>
  execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Every occurrence of `key` whose value is empty, with the file it came from. */
const emptyOccurrences = (key) => {
  let output;
  try {
    output = runUntrimmed(`git config --show-origin --get-all ${key}`);
  } catch {
    // Non-zero exit means the key is not set anywhere, which is fine.
    return [];
  }

  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      // `file:/path/to/config\tvalue`
      const [origin, ...value] = line.split('\t');
      return { key, origin: origin.replace(/^file:/, ''), value: value.join('\t') };
    })
    .filter(({ value }) => value.trim() === '');
};

const empties = EMPTY_BREAKS_COMMIT.flatMap(emptyOccurrences);

if (empties.length > 0) {
  fail(
    `${empties.length} git config entr(y/ies) are set but empty.`,
    'Git refuses to sign a commit in this state, so `npm version` would bump',
    'the version, promote the changelog, and only then fail - leaving the',
    'release half-done.',
    '',
    ...empties.map(({ key, origin }) => `  ${key}  in ${origin}`),
    '',
    'Remove them, then re-run. A GUI client (GitKraken) re-adds these when it',
    'rewrites ~/.gitconfig, so check its commit-signing preferences if this',
    'keeps coming back. These target the exact file, which `--global` would',
    'miss for anything pulled in by an `includeIf`:',
    '',
    ...empties.map(({ key, origin }) => `  git config --file ${origin} --unset ${key}`),
  );
}

// ── 3. Root barrel export completeness ──────────────────────────────────────
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

// ── 4. Changelog is up to date ───────────────────────────────────────────────
// Enforces the "Changelog discipline" convention in
// `.devin/skills/eidos-ui-rules/SKILL.md` - entries should land as work
// happens, not get written retroactively right before a release.
const changelogCheck = checkChangelogUpToDate();
if (!changelogCheck.ok) {
  fail(changelogCheck.reason, 'Changed since the last release:', '', ...changelogCheck.changed);
}

const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));

console.log(`✓ Pre-flight passed - releasing from ${name}@${version}`);
