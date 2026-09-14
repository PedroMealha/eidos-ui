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

## [0.1.1] - 2026-09-14

### Fixed

- `Chip` now sizes to its content instead of stretching full-width
  (`inline-flex`, matching `Pill`).

## [0.1.0] - Fresh start

### Added

- `Navigation` - collapsible sidebar rail with responsive auto-collapse.
- `Footer` - a `copyright` string or a fully custom `component`.
- `CommandPalette` - inline `trigger` support.

### Changed

- `PageLayout`, `Header`, and `Toolbar` now wrap gracefully on narrow
  viewports instead of overflowing.
- Renamed from `@pmealha/eidos-ui` and reset to `0.1.0` - the old package's
  version history predates real semver discipline. `@pmealha/eidos-ui` is
  deprecated; install `eidos-ui` instead.
