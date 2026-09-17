# eidos-ui - Agent Rules

## Skill

**Invoke the `eidos-ui-rules` skill at the start of every session that touches
this repo** - component code, Storybook docs, build/release scripts, or the
`dev/` example app. It has the full project conventions (API normalization,
`.mdx` structure, build/release workflow, changelog discipline, known
gotchas). This file only covers what must apply even if that skill somehow
isn't invoked.

## Changelog (do this even before invoking the skill)

Any change touching `src/**`, `tsup.config.ts`, `scripts/build-styles.js`, or
consumer-facing `package.json` fields needs a one-line bullet added to
`CHANGELOG.md`'s `## [Unreleased]` section (`### Added`/`### Changed`/
`### Fixed`/`### Removed`) **in the same session as the change**, not
retroactively. See the "Changelog discipline" section in
`.devin/skills/eidos-ui-rules/SKILL.md` for the full convention (one entry
per bullet, no walls of text) and `scripts/check-changelog.js` for the
automated gate that blocks a release if this was skipped.

## Don't leave stale docs behind

`README.md` and `GETTING_STARTED.md` duplicate the component list and the design
tokens, and both have silently rotted before (a "49 components" claim when there
were 57; a `--primary-color` example still showing a palette value replaced two
majors earlier). Nothing in lint, tsc or Storybook reads prose.

Run **`npm run check:docs`** after adding or renaming a component, or after
changing anything in `src/styles/variables.scss`. It is also a step in
`npm run verify`.

It cannot check token _values_ - a `:root` block showing defaults is
indistinguishable from one showing an override - so when a palette value
changes, grep the docs for the old hex by hand. See the "Documentation
freshness" section in `.devin/skills/eidos-ui-rules/SKILL.md` for the full list
of files that carry duplicated facts.

## Git

**NEVER run `git commit`, `git push`, or any command that writes to git history.**
Staging files with `git add` is allowed for inspection, but the commit itself
must always be performed by the user. If a task is complete, summarise what
changed and stop - do not commit on the user's behalf under any circumstances.
