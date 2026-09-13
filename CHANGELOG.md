# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/): **patch** for bug fixes, **minor**
for backward-compatible additions, **major** for breaking changes.

This file is mirrored (in summary form) in Storybook's "Releases" page for
anyone browsing the component docs - keep both in sync when cutting a release.

## [Unreleased]

Entries land here as work happens, not written retroactively at release time
- see the "Changelog discipline" section in
`.devin/skills/eidos-ui-rules/SKILL.md` for the convention this follows.

## [0.1.0] - Fresh start

This package was previously published as `@pmealha/eidos-ui` (versions
`0.1.1` through `5.0.0`). That version history does not reflect real semantic
versioning - major/minor bumps went out without the corresponding
breaking/additive-only guarantees semver implies, and `5.x` was reached long
before the API was actually stable. Rather than carry that misleading history
forward under a new name, `eidos-ui` restarts at `0.1.0`: pre-1.0, meaning
breaking changes may still happen between minor versions, exactly as semver
intends for a library that hasn't yet committed to a stable public API.

`@pmealha/eidos-ui` is deprecated on npm and will not receive further
updates - install `eidos-ui` instead.

**What's included as of this release**: `Navigation` (collapsible sidebar
rail with responsive auto-collapse), `Footer`, inline trigger support for
`CommandPalette`, and responsive layout improvements to `PageLayout`,
`Header`, and `Toolbar` - alongside the full existing component set (49
components as of this writing).
