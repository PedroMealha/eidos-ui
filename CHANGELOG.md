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

### Changed

- **Breaking**: `DataGrid` and `Table` now check every field-addressing member
  against the row type `T` - `columns[].key`, `filterConfig[].key`,
  `quickFilters[].key`, `rowKey`, and the `currentSort`/`onSortChange` keys.
  A key that isn't a field of `T` is now a compile error instead of a control
  that silently matches nothing.
- **Breaking**: a column's `key` and its value type are now correlated, so
  `renderCell`, `renderEditor` and `validate` (and `Table`'s `render`) receive
  `T[key]` instead of `unknown`. Existing `value as X` casts on a mismatched
  type will now fail to compile; delete the cast.
- **Breaking**: `TableColumn.key` was `keyof T | string`, which collapsed to
  `string` and checked nothing. It is now `RowKey<T>`.
- **Breaking**: columns that address no row field must declare it -
  `type: 'custom'` on `DataGridColumn` (also `'icon' | 'action' | 'custom'` on
  `TableColumn`), which is what permits a free-form `key`. Pointing a normal
  column's `key` at a non-existent field no longer compiles.
- `DataGrid` and `Table` constrain `T extends object` rather than
  `T extends Record<string, unknown>`, so a plain `interface` row type is
  accepted. Row types written as `interface Row extends Record<string,
  unknown>` to satisfy the old constraint should drop the `extends`: an index
  signature widens `keyof T` to `string` and silently disables all of the
  checking above.

### Added

- `type: 'actions'` columns no longer require a placeholder `key`; it is now
  optional on that variant.
- `RowKey<T>` is exported - the row-field-name type shared by both components.
- `DataGridValueColumn`, `DataGridCustomColumn`, `DataGridActionsColumn`,
  `DataGridValueCellType`, `TableValueColumn` and `TableCustomColumn` are
  exported for consumers that need to name a single column variant.

## [1.2.0] - 2026-09-16

### Added

- `DataGridColumn` gains `align` (`'left' | 'center' | 'right'`), matching
  `TableColumn.align`, to align a column's header and cells together.
- `Table` and `DataGrid` show a badge with the number of applied filters on the
  toolbar's filter button; `DataGrid`'s counts its dropdown filters only, not
  quick filters.

### Changed

- `Pill` no longer forces a bold label, inheriting the surrounding font weight
  instead.

### Fixed

- The filter button's active-filter highlight now actually renders - it was
  being overridden by `Button`'s own `text` variant styles.

## [1.1.0] - 2026-09-15

### Added

- `DataGrid` gains `quickFilters` - always-visible Select, Combobox, or
  SegmentedControl filter controls in the toolbar, sharing filter state with
  the existing filter dropdown.

### Fixed

- `DataGrid`'s filter dropdown no longer renders a blank, un-removable filter
  row for a filter whose key isn't in `filterConfig`, nor discards that
  filter's value when applying.
- `Combobox` no longer reserves ~20px of phantom height below its input, which
  de-centred it in any flex row and read as stray spacing in a form.
- `Combobox` no longer restores a stale label when a controlled `value` is
  cleared externally while its input has focus.

## [1.0.2] - 2026-09-15

### Fixed

- Storybook's "Releases" page linked to a non-existent repository for
  `CHANGELOG.md`.
- Release tooling now detects the version bump correctly whatever the
  configured git tag prefix is; it previously labelled every release `major`
  and skipped the breaking-change and new-feature bump guards.

### Changed

- Release tags use git's default `v` prefix again (e.g. `v1.0.2`).
- Releases are now published from CI via npm trusted publishing, so each version
  carries a verifiable provenance attestation on npm.

## [1.0.1] - 2026-09-14

### Changed

- Rewrote README to remove emoji-heavy sections, align component groupings with
  Storybook's sidebar, and include real package badges.
- Fixed package metadata on npm (`repository`, `homepage`, `bugs`) so the
  package page links to the correct GitHub repository and issue tracker.

## [1.0.0] - 2026-09-14

### Changed

- **Breaking**: `DataGrid`'s `hasCardView` now defaults to `true` - pass
  `hasCardView={false}` to keep a table-only layout.
- `DataGrid` card view now also auto-activates once the container can't fit
  every column at a 100px minimum width, not just below `cardViewBreakpoint`.
- `DataGrid` card fields now lay out in a responsive auto-fit grid instead of
  one per line.
- **Breaking**: `Navigation`'s `collapseBelow` now defaults to `768` (was
  opt-in/`undefined`) - pass `collapseBelow={0}` to opt out entirely.

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
