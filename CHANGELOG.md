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

### Removed

- **Breaking**: string icon names no longer resolve against the whole Lucide set - pass the component, `registerIcons({ ... })`, or `import 'eidos-ui/lucide-icons'`.
- **Breaking**: `Popover`'s `isOpen` prop - use `open`.
- **Breaking**: the camelCase modifier classes `--fullWidth` and `--hideScrollbar` - target `--full-width` and `--hide-scrollbar`.

### Changed

- `import { Button } from 'eidos-ui'` bundles to 10 KB minified instead of 604 KB, since Lucide's full icon set is no longer referenced.
- An unregistered single-word icon name logs a development warning, as it is usually a Lucide icon that was never registered.

## [3.8.1] - 2026-09-24

### Fixed

- `PageLayout.scrollRestorationKey` records a scroll made immediately after the layout mounts, instead of restoring that page to the top.

## [3.8.0] - 2026-09-24

### Added

- `Button`, `Chip`, `Header` actions and `Toolbar` actions render as links when given `href`.
- `LinkProvider` component - renders every library link through your router's link component.
- `Header` `titleAs` prop sets the title's heading level (`h1`-`h6`) without changing its look.
- `Avatar` `xl` (64px) and `2xl` (96px) sizes, for profile and account headers.
- `IdentityHeader`'s `avatar` shorthand accepts `size`.
- `Timeline` `warning` and `info` colours.
- `Timeline` `ariaLabel` and `aria-labelledby` props.
- `registerIcons()` makes chosen icons available to every icon prop by string name.
- `eidos-ui/lucide-icons` entry point registers every Lucide icon by name.

### Deprecated

- Resolving an unregistered Lucide icon by string name, removed in 4.0 - pass the component or register it.

### Changed

- `Breadcrumb` crumbs with `href` render through `LinkProvider`'s component when one is set.
- `Chat` wraps its scroll region's contents in `.eidos-chat-scroll-content`, so custom CSS targeting `.eidos-chat-scroll > *` should target that element's children instead.
- `Timeline` no longer names every list "Timeline" - pass `ariaLabel` or `aria-labelledby` if yours needs an accessible name.
- `Popover` logs a development warning when given its deprecated `isOpen` prop.

### Fixed

- `Chat` stays pinned to the newest text while a message grows in place, such as a streamed reply.
- `Timeline` titles and descriptions accept block content (lists, chips) as valid HTML.
- `Timeline`'s fallback dot stays visible on a pale themed colour.
- `Chip` labels no longer clip the descenders of g, j, p, q and y.
- `Drawer` side panels no longer run off-screen on viewports narrower than their size.

## [3.7.0] - 2026-09-24

### Added

- `SplitChip` component - one chip split into independently styled, optionally clickable segments.

### Fixed

- A `Chip` without `onClick` no longer shows hover feedback, having never been clickable.

## [3.6.3] - 2026-09-23

### Changed

- `Chat` shows every message's time at the foot of its bubble, instead of in the
  header for the first message of a group and in the bubble for the rest.
- `CommentThread` aligns a comment's time to the right of its header.

### Fixed

- Message attachment chips are legible against the bubble behind them; the
  border was effectively invisible at 1.10:1.
- An attachment without a `url` no longer shows hover feedback, having never
  been clickable.

## [3.6.2] - 2026-09-23

### Fixed

- `PageLayout.scrollRestorationKey` no longer loses a page's stored scroll
  offset when navigating away from it.

## [3.6.1] - 2026-09-23

### Fixed

- `Chat` and `CommentThread` draw one focus ring around the composer instead of
  two concentric ones, matching `Input` and `Textarea`.

### Changed

- `PageLayout.scrollRestorationKey` also accepts a number.

## [3.6.0] - 2026-09-23

### Added

- `PageLayout.scrollRestorationKey` - remembers the content region's scroll
  offset per page and applies it when the key changes.
- `PageLayout.contentRef` - ref to the `main` content region, the layout's only
  scroll container, for driving its scroll position.

### Fixed

- `PageLayout`'s content region is focusable, so a page whose body holds
  nothing focusable can still be scrolled by keyboard.

## [3.5.1] - 2026-09-22

### Fixed

- `Accordion` keeps an open panel at its content's height instead of the height
  measured when it opened, so content that reflows afterwards - a narrower
  viewport, a late-loading font, a nested collapsible - is no longer silently
  clipped.

## [3.5.0] - 2026-09-22

### Added

- `Dropdown.role` - ARIA role for the portaled content, for panels that own
  their own semantics.
- `Dropdown.open` / `Dropdown.onOpenChange` - controlled open state, alongside
  the existing uncontrolled `defaultOpen`.
- `Select.label` and `DatePicker.label` - visible labels, matching `Input`,
  `Combobox`, `TagInput`, `Checkbox`, `Radio`, `Switch` and `Textarea`.
- `Popover.open` - canonical name for the controlled open state, matching
  `Dropdown` and `CommandPalette`. `isOpen` still works and is deprecated.
- `MenuPanel.onRequestClose` - lets a submenu ask the panel that owns it to
  close, which is what `ArrowLeft` needs.
- `Select` and `DatePicker` warn in development when they have no accessible
  name.

### Changed

- `Dropdown`'s content no longer defaults to `role="menu"`; it has no role
  unless one is passed. Pass `role="menu"` if you were relying on it.
- `Menu` items are keyboard-operable: the menu is a single tab stop with
  arrow-key navigation, `Home`/`End`, `Enter`/`Space` to activate and
  `ArrowRight` to open a submenu.
- `Menu` moves focus into itself when it opens and back to the trigger when it
  closes.
- `Select`, `Combobox`, `TagInput`, `DatePicker`, `TableFiltersDropdown` and
  `Menu` no longer remount their dropdown to close it, so the panel's DOM is
  preserved across open and close.

### Fixed

- `Dropdown`, `Popover` and `Tooltip` now stay anchored to their trigger when
  the scroll container is an ancestor element rather than the page - which
  includes every dropdown inside `PageLayout`.
- `Toolbar` now correctly displays elements on the right side when `breadcrumbs`
  are absent.
- `Menu`, `ContextMenu` and `SplitButton` expose their items as `menuitem`s of a
  `menu` instead of a plain list, so assistive technology can present them.
- `Select`, `Combobox`, `TagInput`, `DatePicker`, `ColorPicker` and the
  `Table`/`DataGrid` toolbar panels no longer nest their content inside a
  `role="menu"` element.
- `Modal`, `Drawer`, `CommandPalette`, `Dropdown`, `Popover` and `Select`
  (`autoOpen`) no longer throw during server rendering when they are open on
  their first render; the portal is deferred to the client.
- `Select` can be opened from the keyboard: `ArrowDown`, `ArrowUp`, `Enter` and
  `Space` open the listbox, `Escape` closes it, and focus stays on the field
  after a selection instead of being dropped onto `<body>`.
- `Select`'s options carry the ids its `aria-activedescendant` references, so
  focusing or hovering one no longer points that attribute at a missing element.
- `Select` only sets `aria-controls` while its listbox is rendered.
- `Menu` items paint a focus ring.
- `Menu` nested items honour `disabled`, which was accepted and ignored.
- `Menu` and `SplitButton` triggers advertise `aria-haspopup="menu"`, and
  `Menu`'s trigger now also reports `aria-expanded`.
- Activating a `Menu` item no longer closes unrelated open dropdowns: it used to
  fake a click outside by dispatching `mousedown` at `document`, which a
  keyboard user never made.
- `TableFiltersDropdown`'s trigger reports `aria-expanded`.
- `DatePicker`'s calendar navigation buttons have accessible names instead of
  being announced as just "button", and its month and year selects are labelled.
- `TableFiltersDropdown`'s column and value pickers, and `DataGrid`'s quick
  filters, have accessible names instead of relying on a placeholder.
- `DatePicker` can be opened from the keyboard: `ArrowDown`, `Enter` and `Space`
  open the calendar and move focus into it, `Escape` closes it and returns focus
  to the field. Its field is exposed as a `combobox` with `aria-expanded`.
- `Menu`'s submenu triggers report `aria-expanded`, and `ArrowLeft` closes a
  submenu and returns focus to the item that opened it.
- `CommandPalette`'s custom trigger is operable by keyboard: a non-interactive
  one becomes a real control, and an interactive one is no longer wrapped in a
  second, nameless tab stop.

## [3.4.0] - 2026-09-21

### Added

- `Input.posIconLabel` - accessible name for the `posIconButton`. Optional
  only to avoid a breaking change; omitting it logs a dev warning and falls
  back to a generic name.
- `h5`, `h6` and `small` are styled. The browser's defaults for `h5` and
  `h6` are `0.83em` and `0.67em`, which against this library's 14px body
  resolve to roughly 11.6px and 9.4px - both **smaller than the paragraph
  beneath them**. Any document using a six-level outline had two heading
  levels that read as fine print. `small` covers captions and metadata.
- `ACCESSIBILITY.md` - what is tested against WCAG 2.2 AA and how, the seven
  documented SC 1.4.3 exemptions, what remains the consuming application's
  responsibility, and what has not been done. It deliberately does not claim
  a conformance level.
- `ColorPicker.ariaLabel` - names the trigger when the label is rendered
  outside the component, as `ThemeEditor` does. Without it every picker on
  that page was announced as "Open colour picker".

### Changed

- `h4` is `semibold` rather than `medium`. Heading weight descends from `h1`
  to `h3` and now floors at `h4`: below `h3` the size steps are small (20px,
  18px, 16px against a 14px body), so weight carries most of the "this is a
  heading" signal, and a `medium` `h4` would otherwise have rendered lighter
  than the new `h5` and `h6`.
- Links are underlined by default. In a paragraph they were distinguished
  from the surrounding text by colour alone, and that colour difference is
  2.90:1 - under the 3:1 that SC 1.4.1 requires when colour is the only cue.
  Only bare anchors are affected; `Breadcrumb` and `Conversation` already set
  their own `text-decoration`.

### Fixed

- `Tooltip` satisfies SC 1.4.13. Escape now dismisses it for every trigger
  type rather than only `click` (`hover` is the default, so the failing case
  was the common one), and the panel is no longer `pointer-events: none`, so
  the pointer can rest on it to read or select its content.
- `Pagination` shows a focus ring on every page button. The ring was nested
  inside the `--active` rule, so tabbing across the other pages showed
  nothing at all while `outline: none` suppressed the browser default.
- `CommandPalette`'s search field, `MessageComposer`'s textarea and
  `ColorPicker`'s hue and alpha sliders have visible focus indicators. All
  four cleared the outline via a reset and painted nothing in its place.
- `Pagination` wraps its page buttons, so a long pager reflows at 320px
  instead of forcing horizontal scrolling (SC 1.4.10).
- `InlineEdit` and `FileUpload` include their visible text in the accessible
  name (SC 2.5.3). `InlineEdit` was announced as "Click to edit" regardless
  of its content, so every instance on a page sounded identical and speech
  input had nothing to match.
- Targets meet the 24x24 minimum of WCAG 2.2 SC 2.5.8. `ColorPicker`'s
  preset swatches (20x20), its hue and alpha sliders (20px tall),
  `SplitButton`'s chevron half (20.4px wide) and `NumberInput`'s spinbutton
  (only 15.6px of it reachable between its own buttons). The sliders are
  unchanged visually - their hit area grew, the painted track did not.
- `MessageComposer` and `ThemeEditor` no longer put their hidden file inputs
  in the tab order. Both are proxies for a visible button, but were hidden
  with `visually-hidden`, which deliberately keeps an element focusable - so
  keyboard users landed on an invisible control and met the same action
  twice. They now match `FileUpload`, which already did this correctly.
- Every field with an `error` now says so programmatically. `Input`,
  `Textarea`, `Checkbox`, `RadioGroup`, `NumberInput`, `Combobox`, `TagInput`
  and `OTPInput` set `aria-invalid` and point `aria-describedby` at the
  message. Not one of the eight set `aria-invalid` before, and most left the
  message unassociated - the error was conveyed by colour and proximity
  alone (WCAG 3.3.1, Level A).
- `RadioGroup` is a `radiogroup`. Its options were announced as a run of
  unrelated radios, and there was nothing for its error to attach to.
- `Snackbar` pauses its auto-dismiss on hover and on focus, resuming with the
  remaining time. Auto-dismiss was a fixed `setTimeout` that nothing could
  stop - a time limit the user could neither turn off, adjust nor extend
  (WCAG 2.2.1, Level A) - which also meant a snackbar's `action` ("Undo")
  could disappear mid-reach.
- `DataGrid` rows are rows again. dnd-kit's `attributes` were spread onto
  every `<tr>`, giving it `role="button"` and erasing the table's structure
  for assistive technology - even with `draggableRows` off, since
  `useSortable` returns them regardless. Moving them to the drag handle also
  made the handle focusable, so the keyboard alternative to dragging
  (SC 2.5.7) can actually be started; it previously had no activator.
- `Combobox` and `TagInput` follow the ARIA 1.2 combobox pattern. The
  wrapper `<div>` carried `aria-expanded`/`aria-haspopup` with no role at
  all, the input had no `combobox` role, and `aria-controls` named a listbox
  that does not exist until the menu opens.
- `Popover` puts `aria-expanded`/`aria-haspopup` on its trigger element
  rather than on a roleless wrapper.
- `Chip` renders its action and its remove button as siblings when it is
  both clickable and removable. It previously nested one button inside
  another via `role="button"`.
- `Tooltip` only makes its wrapper a control when the trigger does not
  already contain one - `Button` wraps itself in a `Tooltip`, so the
  `click` trigger reliably produced a button inside a button.
- `VirtualList` scopes `role="list"` to the element holding the rows, so the
  loading and empty states are no longer invalid list children; drops an
  `aria-label` that is prohibited on a roleless element; and makes the scroll
  viewport focusable so it can be scrolled by keyboard.
- `Chat`'s outgoing message bubble was the worst contrast surface in the
  library. Its attachment chip tinted the bubble with white (3.83:1 for the
  preset, 3.79-4.15:1 across the palette) and now tints with black
  (6.79-6.87:1); the attachment size label no longer uses `--text-muted`, a
  dark grey meant for light surfaces, on a saturated fill (1.97:1); and the
  timestamp is no longer faded to 0.75 opacity (3.57:1).
- `Alert` titles and icons use `--x-dark` rather than `--x-color`. Each
  variant tints its background with 8% of its own hue, leaving the title at
  4.44-4.52:1 - two variants failing AA and three passing by a hundredth.
  Now 6.10-6.22:1 across the set.
- **`tooltip` now names an icon-only `Button`.** `<IconButton icon={Plus}
tooltip="Add item" />` - the pattern in `IconButton`'s own documentation -
  produced a button announced as just "button", because `Tooltip` adds no
  naming attributes to its child. An explicit `aria-label` still wins.
  `SegmentedControl` had the identical problem for icon-only segments.
- `Button` and `SegmentedControl` warn in development when an icon-only
  control has no accessible name at all.
- `DataGrid` labels the checkboxes it renders itself: row selection, select
  all, and boolean cells (which are named by their column and row). 194
  unlabelled checkboxes.
- `Input`'s clear, password-toggle and `posIcon` buttons have accessible
  names, and are no longer `tabIndex={-1}` - they were unreachable by
  keyboard entirely (WCAG 2.1.1). This propagated to `Combobox`, `Select`,
  `DatePicker` and anything else built on `Input`.
- `Combobox`, `Select` and `DatePicker` name their clear/expand buttons.
- `Pagination`'s rows-per-page control is associated with its visible
  "Show:" label, which was a `<label>` with no `htmlFor`.
- `DataGrid` and `Table` name their inline-edit and filter inputs from the
  column header; `ThemeEditor` and `MessageComposer` name their file inputs.
- `Modal`, `Drawer` and `CommandPalette` now trap keyboard focus while open,
  move focus into the dialog, and return it to the control that opened them.
  All three declared `aria-modal="true"` - a promise that the rest of the page
  is inert - while Tab moved straight out to the page behind the scrim
  (WCAG 2.4.3 Focus Order, Level A).
- `Drawer` no longer drops focus onto `<body>` when it closes, which returned
  keyboard users to the top of the document.
- `Popover` moves focus into its panel and back to the trigger. Its panel is
  portaled, so its controls were previously unreachable by keyboard. Tab is
  deliberately **not** trapped - it is a non-modal dialog.
- `CommandPalette` no longer remounts its trigger when opening. The root
  element changed shape between the closed and open states, so React
  destroyed and recreated the button the user had just clicked, losing focus
  with it.

## [3.3.0] - 2026-09-21

### Added

- `--text-muted` and `--text-disabled` tokens for text colour, so a raw
  `--gray-N` surface step is never picked for a label again.

### Fixed

- Muted text meets WCAG 1.4.3 AA. 99 declarations across 39 components painted
  placeholders, hints, timestamps, counts and empty-state copy in
  `--gray-400`, which is 2.56:1 on white against the required 4.5:1.
- `Dropdown`'s trigger wrapper no longer sets `role="button"`, which wrapped
  the real control in a second, non-keyboard-operable one - invalid ARIA
  across `Select`, `Combobox`, `Menu`, `Popover`, `ContextMenu`, `ColorPicker`
  and `TagInput`.
- `Skeleton` and `VirtualList` accept a unitless numeric string for `width`
  and `height`; `'240'` previously produced an invalid CSS declaration that
  browsers dropped silently, leaving the element unsized.

## [3.2.1] - 2026-09-20

### Fixed

- A clickable `Chip` and a `Chip`'s remove control have a visible keyboard
  focus indicator. Both suppressed the outline with no replacement, which the
  3.2.0 focus sweep did not reach because they suppressed `:focus-visible`
  explicitly. The remove control's ring is inset, since an outward one is
  clipped by the chip's rounded edge. Affects `TagInput` and
  `MessageComposer` attachments, where the remove control is the only way to
  delete an entry.
- A `Chip`'s remove control shows a hover tint on the `outlined` and `text`
  variants. It was a hardcoded `rgba(255, 255, 255, 0.2)`, and both variants
  are `background: transparent` - white on white, so those two had no hover
  feedback at all. `filled` keeps the white tint; the others use a neutral
  dark one.
- `focus-ring()` binds `:focus-visible` instead of `:focus`, so `Avatar`,
  `Navigation` items and `Snackbar`'s close button no longer show a focus ring
  on a mouse press - matching every other control in the library. Text inputs
  are unaffected: `Input` keeps ringing on click, which is correct for a field
  you are about to type into.
- `Input`'s base and error focus rings are written directly rather than through
  `focus-ring()`. Nested in `&:focus-within`, the mixin composed to
  `.eidos-input-wrapper:focus-within:focus`, which a wrapper `<div>` can never
  match - dead since the mixin was introduced, and masked by the per-variant
  rules that painted the real ring.
- **Focus indicators now meet WCAG 1.4.11 (3:1).** Every ring in the library
  was an alpha tint of its colour, measuring **1.47-1.62:1** against a white
  page across all seven families - all failing. Raising the alpha cannot fix
  it (0.6 still only reaches 2.3-2.76:1), so rings are now a solid base colour
  with a white gap: ≥4.76:1 against the page _and_ against a filled control.
  The gap is what makes a ring visible around a checked `Switch`, `Checkbox`
  or `Radio`, whose track is already the ring's own colour.
- A clickable `Avatar` inside an `AvatarGroup` has a focus ring. The group's
  white separator and the focus ring set `box-shadow` at identical specificity
  (0,2,0), and the separator is later in the stylesheet, so it silently won.
- `TagInput` and `OTPInput` focus rings were the weakest in the library at
  `0.15` alpha; they are covered by the same change. Their state is driven by a
  `--focused` class rather than `:focus`, which is why earlier sweeps missed
  them.

### Changed

- Focus-ring geometry lives in one place: `focus-ring-shadow()` /
  `focus-ring-shadow-inset()` in `mixins.scss`, with the `focus-ring()` /
  `focus-ring-inset()` mixins built on them. All 98 call sites consume it,
  including the ones that cannot use a mixin - `Input`/`Textarea` paint on a
  `:focus-within` wrapper and compose the ring with elevation shadows, and
  `SegmentedControl` composes it with its chip shadow. Previously the ring was
  copied by hand in 75 places, which is exactly why every copy was failing
  contrast in the same way.
- Focus rings are a uniform width. Call sites passed 2px or 3px arbitrarily,
  rendering 4px and 5px bands side by side; they all take the shared default
  now. `Slider`, which already used a correct two-tone ring, keeps its wider
  gap through the same function.

### Removed

- Two unreferenced `@keyframes` blocks (`snackbarEnter`, `snackbarExit`) that
  shipped in `dist/index.css`. `Snackbar`'s motion comes from transitions;
  these were also unprefixed, so a consumer defining the same name would have
  collided with them.

## [3.2.0] - 2026-09-19

### Added

- `Chat` component - bottom-anchored conversation with a composer, author
  grouping, date separators, typing indicator and an unread divider.
- `CommentThread` component - comment section in document flow, with one level
  of replies and an inline reply composer.
- `MessageComposer` component - the shared authoring field, exported on its own
  for consumers building a bespoke message list.
- `ConversationMessage` model shared by `Chat` and `CommentThread` -
  deliberately free of React nodes and functions, so a stored history is
  JSON-serialisable and renders in either component.
- `readOnly` / `readOnlyMessage` on `Chat` and `CommentThread` - removes the
  authoring affordances rather than disabling them. Per-message permissions go
  through `messageActions(message)` returning an empty array.
- Optimistic send support: a promise-returning `onSend` gets a pending state,
  clears the draft on resolve and preserves it on reject; `sending` / `failed`
  message statuses with a retry affordance.
- `reduced-motion` SCSS mixin, wrapping `prefers-reduced-motion: reduce` for
  decorative motion only - loading indicators deliberately keep animating.
- `IdentityHeader` component - `Header` preconfigured for account and profile
  pages, with an avatar beside the name and a metadata row below it.
- `Header` takes `media` for leading content (an `Avatar`, a logo, an icon
  block) before the title stack.
- `Header` takes `meta` for a row of supporting facts below the subtitle.
- `Header` takes `variant="hero"`, raising its prominence with a larger title.
- `xs` (480px) breakpoint, for the point where a component's horizontal
  arrangement has to stack on a phone - `Header` moves its leading media onto
  its own row there.
- `Header` folds surplus actions into an overflow popover on a narrow header,
  controlled by `collapseActionsBelow` (default `640`) and
  `actionsVisibleWhenCollapsed` (default `1`).
- `container-up` / `container-down` SCSS mixins, the element-relative
  counterparts of `media-up` / `media-down`, reading the same breakpoint map.
- `SegmentedControl` scrolls an overflowing track with chevron buttons at
  either end, matching `Tabs`, controlled by `scrollButtons` (default
  `'auto'`, `'none'` to keep the native scrollbar).
- `SegmentedControl` segments have a visible focus ring, drawn inset so the
  scrolling track cannot clip it.
- `SegmentedControl` supports the WAI-ARIA radiogroup keyboard pattern: a
  single tab stop, with arrow keys, `Home` and `End` moving the selection and
  skipping disabled segments.

### Fixed

- **Keyboard focus is visible again across the library.** `global.scss` applied
  `button-reset` to the bare `button` element, and that mixin carried
  `&:focus { outline: none }` - so importing `eidos-ui/styles` removed the
  keyboard focus ring from every button on the page, including a consumer's own.
  Nothing replaced it, leaving `Button`, `SplitButton`, `Menu` items, `Modal`'s
  close control and ~20 other components with no focus affordance at all
  (WCAG 2.4.7). The resets no longer suppress the focus outline, and a
  `:focus-visible` fallback fills the gaps.
- Decorative motion now respects `prefers-reduced-motion: reduce`: `Skeleton`'s
  pulse and wave, `Snackbar`'s slide, `Drawer`'s panel and scrim, `Modal`'s
  zoom, `CommandPalette`'s entrance and `Table`'s filter-row slide. Loading
  indicators (`Spinner`, `Progress`, the `Button`/`SplitButton`/`Combobox`
  spinners) deliberately keep animating - freezing them would remove the state
  they exist to communicate.
- `FileUpload`'s drop zone has a real keyboard focus indicator. Focus shared a
  rule with hover, so a keyboard user saw only the hover border tint, and an
  unconditional `outline: none` suppressed any ring.
- `FileUpload`'s hover and drag tints follow `--primary-rgb` instead of a
  hardcoded `rgba(99, 102, 241, …)` - the indigo replaced in 3.0.0 - so they
  now respond to `ThemeProvider` like every other tint.
- `Footer`'s `component` slot fills the footer's width instead of collapsing to
  its content width, so a `space-between` footer bar no longer needs a
  `width: 100%` of its own.
- `PageLayout` no longer paints a stray 1px rule down the page edge when
  `navigation` is omitted; the empty rail column now really collapses to
  nothing.
- `SegmentedControl` no longer pushes the page sideways when its segments are
  wider than their container.
- `Tabs` and `SegmentedControl` scroll buttons no longer take focus when
  clicked, which the browser reported as focus trapped inside an
  `aria-hidden` subtree.
- `Textarea` can actually be resized by dragging its grabber; the element was
  a `flex: 1` item of a column wrapper, so the height the browser sets while
  dragging was ignored in favour of the flex base size.
- `Navigation` honours `defaultCollapsed` (and a controlled `collapsed`) on a
  viewport wider than `collapseBelow`; the breakpoint used to apply its own
  answer on mount, so a rail asked to start collapsed sprang open immediately.
- `Navigation`'s `collapseBelow={0}` now really opts out - it previously still
  forced the rail expanded on mount.
- `Navigation` no longer re-applies the breakpoint on every render when
  `onCollapsedChange` is an inline function, which overrode manual toggles
  made in between crossings.
- `PageLayout`'s toolbar, header, body and footer share one horizontal gutter
  at every breakpoint; the toolbar previously kept a fixed inset and the
  footer's was pinned by a more specific rule, leaving them 42px and 36.75px
  against the body's 7px on a narrow viewport.

### Changed

- `SegmentedControl` renders its track inside a new `.eidos-segmented-bar`
  wrapper, which is also where `className` now lands - target
  `.eidos-segmented` to style the track itself.
- `SegmentedControl` is a single tab stop instead of one per segment, so Tab
  now steps over the whole group - use the arrow keys to move within it.
- Modifier class names are normalised to kebab-case (`--full-width`,
  `--hide-scrollbar`); the camelCase spellings (`--fullWidth`,
  `--hideScrollbar`) are still emitted alongside them, so existing CSS
  targeting either keeps working. Prefer kebab-case in new code - the aliases
  go away at the next major.
- `Header` reflows against its own width rather than the viewport, so it lays
  out correctly beside `PageLayout`'s navigation rail and in any narrow column.
- `Header`'s action row stacks full-width at 640px and under, and its surplus
  actions now collapse by default - mobile rendering differs from 3.1.1 without
  any prop change, though nothing needs updating on the consumer side. Pass
  `collapseActionsBelow={0}` to keep every action inline.

## [3.1.1] - 2026-09-18

### Changed

- `Navigation`'s item hover uses the `--primary-50` tint rather than a fixed
  `--gray-100`, so the rail responds to the theme.

### Fixed

- `Navigation`'s active item is legible on any theme colour: it is now a filled
  `--primary-color`/`--primary-contrast` pill instead of a `--primary-50` tint
  behind `--primary-color` text, which was 4.49:1 - under AA - even for the
  preset palette.
- `Navigation`'s active item keeps its own styling on hover; the inactive hover
  rule was more specific and repainted it.
- `ThemeProvider` generates real tints for a dark base colour: the ramp's ends
  were positioned relative to the base, so a dark navy primary produced
  `--primary-50: #8a8a8c` - a mid grey - and every component painting that
  token turned muddy. The ends are now absolute, and the preset ramp is
  unchanged.

> Both `Navigation` fixes change how it looks, so visual snapshots will differ -
> but no API, token name or class name changed, and nothing needs updating on
> the consumer side.

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
