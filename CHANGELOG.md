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

## [3.1.0] - 2026-09-18

### Added

- `--scrollbar-size` and `--scrollbar-thumb` tokens, which style every
  scrollbar via `global.scss` and can be overridden to opt out.
- `Tabs` gains `scrollButtons` (`'auto' | 'none'`, default `'auto'`) - previous/
  next buttons that appear only while the strip overflows, replacing the native
  scrollbar as the affordance.

### Changed

- `PageLayout` scrolls its whole `main` content area: the header and footer now
  scroll with the page body instead of staying fixed above and below it. The
  toolbar and navigation rail still stay put.
- `global.scss` no longer puts a `margin-bottom` on `body` - it gave any
  full-height layout a document-level scrollbar of exactly that size.
- `Tabs` renders its tab list inside a new `.eidos-tabs-bar` row, which also
  holds the scroll buttons.
- `Tabs`' `size` now sizes the tab strip rather than each tab, so all three
  variants are the same height for a given size: `enclosed` strips lose the 8px
  their padding used to add, and `pills` tabs hug their label (centred in the
  strip) instead of filling a 40px box.
- `Tabs`' scroll buttons float over the strip's edges instead of sitting beside
  it, and each one is shown only while its direction can still scroll rather
  than being rendered disabled at the end.

### Fixed

- `PageLayout` page content no longer overlaps the footer - its content area is
  a real scroll container instead of a fixed three-row grid whose body track
  could not grow past the scrollport.
- `PageLayout` no longer stretches the footer into the leftover vertical space
  when `header` is omitted.
- `Checkbox`, `Radio`, `Switch`, `NumberInput` and `ThemeEditor` no longer add
  a phantom scrollbar to the page. Their visually-hidden native inputs are
  `position: absolute` with no positioned ancestor, so they escaped every
  scroll container and were counted into the document's scrollable height -
  a long list of them produced a second scrollbar revealing only empty space.
- `Tabs` no longer shows a permanent vertical scrollbar on its tab strip - its
  horizontal scroll container also scrolls vertically per spec, and the `line`
  indicator hung 2px below the box.
- `Tabs`' `line` indicator is visible again instead of being clipped by that
  scroll container; the 2px rule is now an inset shadow with the indicator
  covering it.
- `Tabs`' keyboard focus ring is visible again - the outward ring was clipped
  away on all four sides by the scroll container, so focus was invisible in the
  `line` and `pills` variants.
- `Tabs` scrolls the active tab into view when it is selected outside the
  visible part of an overflowing strip.

## [3.0.0] - 2026-09-17

### Added

- `--breakpoint-2xl` (`1536px`) token, completing the breakpoint scale.
- `--primary-contrast`, `--secondary-contrast`, `--success-contrast`,
  `--danger-contrast`, `--warning-contrast` and `--info-contrast` - the
  foreground colour to pair with each themeable fill.
- `ThemeProvider` component - applies a runtime theme (7 colour bases, 2 font
  stacks, a font scale) by writing CSS custom properties via the CSSOM.
- `ThemeProvider` derives `-rgb`, `-dark`, `-light`, `-contrast` and the
  `--primary-50…900` ramp in OKLab from each base colour.
- `useTheme` hook and the `defaultTheme` preset object.
- `ThemeEditor` component - a settings panel for editing the active theme, with
  per-colour WCAG contrast and page-legibility diagnostics.
- `ThemeEditor` gains `fontOptions`, `monoFontOptions`, `allowFontUpload` and
  `onFontUpload`, and warns when the selected font stack won't actually render.
- `ThemeEditor` labels font options that aren't installed, rather than offering
  them as though a stack could guarantee a font.
- `eidos-ui/fonts` entry point - bundles Plus Jakarta Sans and JetBrains Mono
  (variable, latin + latin-ext, ~102 KB) so the theme's default families render
  everywhere rather than only where they happen to be installed.
- `registerFontFace`, `registerFontFile`, `isFontAvailable`,
  `isFontStackAvailable`, `familyNameFromFile` and `toFontStack` - register a
  font from an `ArrayBuffer` (no CSP `font-src` allowance needed) and detect
  whether a family resolves.

### Changed

- **Breaking**: every palette base colour is darkened so white text on it
  clears WCAG AA (4.5:1); six of the seven previously failed, `warning` at
  2.15:1.
- **Breaking**: `--warning-color` is consequently a dark gold rather than an
  amber - no yellow-ish hue can clear 4.5:1 against white.
- **Breaking**: every `--x-dark` is recomputed so it stays darker than its own
  base and is legible as text on white.
- Components painting a themeable fill now pair it with `var(--x-contrast)`
  instead of a hardcoded `var(--white)`.

### Fixed

- `PageLayout`'s responsive `header`/`body`/`footer` padding now actually
  applies - its media queries used `var(--breakpoint-*)`, which is invalid in a
  media query condition and was dropped by every browser.
- `Button`'s `primary` filled variant hovers to `--primary-dark` instead of
  `--secondary-dark`.
- `Radio`'s dot and `Switch`'s thumb follow their fill's contrast colour, so
  neither disappears against a light one.
- `Badge` and `Avatar` no longer carry a hand-written dark-text exception for
  `warning` only, which left `success` and `info` equally illegible.
- `ColorPicker` no longer shifts the colour it was given - it rounded its
  internal HSV state to whole percent, so `#5c5de8` displayed as `#5d5de8` and
  any interaction committed the drifted value.
- `ThemeProvider` logs a development warning when more than one is mounted -
  they all write to `document.documentElement`, so they cannot theme separate
  subtrees and the last to apply each token wins for the whole page.
- `ThemeEditor` no longer reports a web font as "not installed" after it has
  loaded - availability was probed once during the first render, before any
  `@font-face` had finished loading, and that negative result was cached.
- `ThemeEditor`'s middle contrast grade now reads "Too low for body text"
  instead of "AA large only", which implied a pass; WCAG's 3:1 tier only
  applies at 24px and this library's labels are ~12px.
- `ColorPicker`'s saturation/brightness canvas now renders in popover mode - it
  sized itself off an ancestor class that the portaled panel never had, so it
  collapsed to zero height and left only the hue slider, which cannot change a
  colour's lightness.

## [2.1.0] - 2026-09-17

### Added

- `Toolbar` gains `user` - the signed-in user's avatar (`name`, `src`, `color`).
- `Toolbar` gains `content`, a free-form slot for non-button app-bar content
  such as an environment badge or org switcher.
- `Toolbar`'s `breadcrumbs` and `userMenu` are now optional, so a bare
  `<Toolbar />` is valid.
- `title` accepts `React.ReactNode` on `Header`, `Alert`, `EmptyState`,
  `Modal`, `Drawer` and `Popover`, so a status indicator can sit inline
  beside the title text.
- `Table` gains `DataGrid`'s responsive card view - `hasCardView` (on by
  default), `cardViewBreakpoint`, `cardMinWidth`, and `cardHeader` /
  `cardSubheader` on columns.
- `Table`/`DataGrid` gain `selectAllScope` (`'all'` by default, or `'page'`)
  to control what the select-all checkbox acts on.
- `Table`/`DataGrid` card view gains a **Select all** checkbox in the toolbar,
  standing in for the header checkbox it has no header row for.
- `Table`/`DataGrid` gain `onSelectAllMatching` - resolves the keys of every
  matching row, so "Select all 1000" works when only one page is loaded.

### Changed

- `density` now also scales card view on `Table` and `DataGrid` - card
  padding and gaps, not just cell padding.
- `Table`/`DataGrid` select-all now only adds or removes the keys in its own
  scope, so a selection made on another page survives toggling it.

### Removed

- The clear-selection (×) button on `Table`/`DataGrid` toolbars - the
  select-all control clears the selection, as in MUI and AG Grid. A
  **Clear selection** action still appears while more rows are selected than
  that control can reach.

### Fixed

- The shared table/grid filter dropdown no longer leaves its value control
  narrower than its column select on small screens.
- `DatePicker`'s `fullWidth` now actually stretches the field, instead of
  stopping at the dropdown's trigger wrapper.
- `Table` no longer renders a blank page-size select when `pageSize` isn't
  one of `pageSizeOptions`.
- Card view's empty state now spans the full card grid instead of one column.
- Single-control columns (`Table`'s `type: 'icon'`/`'action'`, `DataGrid`'s
  actions/selection/drag/expand/row-number columns) now hold one control's
  width instead of stretching or being widened by `density`.
- `Table` no longer ignores `column.width` on `type: 'icon'`/`'action'`
  columns - a `type: 'action'` column was pinned at 120px regardless.
- `Table` now always centres `type: 'icon'`/`'action'` columns, so `align`
  can no longer sit their single control flush against the table's edge.
- The automatic card-view threshold now sums each column's real minimum width
  instead of charging every column 100px, so tables with icon or system
  columns no longer switch to cards while they still fit.
- `Table`/`DataGrid` card grids now shrink below `cardMinWidth` rather than
  overflowing a container narrower than it.
- `Input`'s `width` now sizes the whole field and lets it shrink inside a
  narrower parent, instead of pinning the inner `<input>` to a fixed width
  that overflowed both its own wrapper and the page.
- `Header` action rows now wrap onto extra lines instead of widening the
  layout when they don't fit beside the title.
- `Tabs` strips now scroll horizontally instead of overflowing their
  container.
- `Table`/`DataGrid` toolbars now wrap instead of letting the selection count
  and bulk actions overlap the density/columns/export/filter buttons.
- `Table`/`DataGrid` toolbar buttons go icon-only (with tooltips) below a
  560px container width, and `DataGrid`'s `quickFilters` stretch to one per
  row.
- `onSelectionChange` and `bulkActions` no longer receive fewer rows than the
  selection count claims - previously zero rows once the user paged away from
  a server-side selection.
- `Pagination`'s page-size select no longer collapses to just its chevron.

- `Toolbar` no longer renders a hardcoded "John Doe" avatar; it renders the
  `user` you pass, or no avatar at all.
- `PageLayout` now scrolls only its page body - tall content no longer
  scrolls the toolbar and navigation rail out of view, and wide content no
  longer stretches the layout horizontally.
- `Popover` names its panel via `aria-labelledby` pointing at the visible
  title instead of duplicating it into an `aria-label`.
- `PageLayout` forwards every `Toolbar` prop it is given, instead of only the
  four it listed explicitly.

## [2.0.0] - 2026-09-16

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
