---
name: eidos-ui-rules
description: Core consistency and normalization rules for the eidos-ui component library
triggers:
  - model
---

# eidos-ui Project Rules

## Non-negotiable principles

**Normalization and consistency are the primary goals for this project.** Every decision - naming, API shape, documentation structure, showcase layout - must be consistent across all components. If something is inconsistent, fix it immediately and completely, not just for the component currently being worked on.

---

## Component API normalization

### Variant naming

All components that have a "subtle/low-prominence" third variant must use `text` (not `soft`, `ghost`, `subtle`, or any other term).
The standard variant set is: `filled | outlined | text` (plus `bare` on inputs for special editor cases).

These names describe a specific appearance, and it must be the same everywhere:

| Variant    | Resting appearance                                                |
| ---------- | ----------------------------------------------------------------- |
| `filled`   | solid `--x-color` background, white label                         |
| `outlined` | transparent background, 1px `--x-color` border, `--x-color` label |
| `text`     | **transparent background**, `--x-color` label, no border          |

`text` must never paint a resting background - that is what `filled` is for. On
interactive components (Button, Chip) a tint may appear on hover/active only, as
an affordance. This was previously violated: Chip's `text` variant painted
`--primary-100`, so `text` meant one thing on Button and another on Chip.

### Colour with opacity

Use the `bg-color-opacity` / `border-color-opacity` / `color-opacity` mixins, or
write `rgba(var(--x-rgb), 0.3)` directly.

**Never write `rgb(var(--x-rgb) / 0.3)`.** The `--*-rgb` tokens are
comma-separated triples, so the modern slash form expands to
`rgb(99, 102, 241 / 0.3)` - comma and slash syntax mixed, which is invalid CSS.
Browsers drop the declaration silently, so nothing renders and nothing warns.
This bug removed every Alert/Chip/Badge tint and **every focus ring in the
library** (an accessibility defect) until it was found in 2026-08.

Every colour needs a matching `--x-rgb` token in `variables.scss` for these
mixins to work - `--gray-rgb` was missing, which silently broke
`focus-ring(gray)` in Snackbar.

### Media queries: never `var(--breakpoint-*)`

Every media query goes through the `media-up($name)` / `media-down($name)`
mixins in `mixins.scss`, whose thresholds come from the `$breakpoints` Sass map
in `src/styles/_breakpoints.scss` - the single source of truth. The
`--breakpoint-*` custom properties are **generated from that map** and exist
only for JS reading a threshold via `getComputedStyle`.

**Never write `@media (max-width: var(--breakpoint-lg))`.** A media query
condition is evaluated before custom properties are substituted (substitution is
per-element; a media query has no element), so the condition is invalid and every
browser drops it. Sass passes it through untouched and nothing warns - the same
silent-failure shape as the `rgb(var(--x-rgb) / 0.3)` bug above. This one had
killed all of `PageLayout`'s responsive `header`/`body`/`footer` padding, and
Meridian's `.mrd-page` gap, until it was found in 2026-09.

`media-down` insets its threshold by `0.02px` (`max-width: 1023.98px`) so
`media-down('lg')` and `media-up('lg')` can never both match at exactly 1024px.

A consumer of the published package cannot use these mixins - only
`dist/index.css` ships - so `dev/app.scss` deliberately writes the px values out
with a comment, mirroring what a real consumer has to do.

### Size naming

Always: `sm | md | lg` - abbreviated forms that match the CSS variable convention (`--component-size-sm`, `--spacing-sm`, etc.).
Never use full words (`small`, `medium`, `large`) or other abbreviations.
Avatar is the one exception: `AvatarSize` is `sm | md | lg | xl | 2xl`. The first
three share `--component-size-*` with every control; `xl` (64px) and `2xl`
(96px) exist because a profile header's identity mark at 48px reads as a list
thumbnail, and consumers were hand-rolling larger avatars in `Header`'s `media`
slot. They live on Avatar-only tokens (`--avatar-size-xl/2xl`) on purpose -
adding `--component-size-xl` would imply every sized control has an xl. Do not
add `xl` to another component without a real consumer need of the same kind.

### Color naming

Always: `primary | secondary | success | danger | warning | info`

### Small inline elements must be `inline-flex`, not `flex`

`Pill`, `Chip`, and any similar small label/tag-style component must
explicitly set `display: inline-flex` (overriding whatever layout mixin it
uses, e.g. `flex-center-y`) - never leave it at the mixin's own
`display: flex`. A block-level flex element stretches to fill its parent's
full width the moment it's used anywhere other than inside another flex
row (a `<p>`, a `<div>` in prose, table cell, etc.), rendering as a
full-width bar instead of a compact tag. `Chip` had this exact bug (missing
the override `Pill` already had) until it was found via `Releases.mdx`.

### `rem`-based tokens don't survive being reused outside the library's own root font-size

Only the `--font-size-*` tokens are `rem` (root-relative); `--spacing-*` and
`--border-radius-*` are `em`/`px` and unaffected. Any component whose sizing
comes from `--font-size-*` will render inconsistently if used somewhere
that doesn't share the same document root font-size as `global.scss`'s
`html { font-size: 14px }` reset - see the `Releases.mdx` guide-page note
above for the concrete case (Storybook's Docs manager frame) this bit.

### `overflow-x: auto` scrolls both axes and clips everything inside

An element with `overflow-x: auto` is a scroll container on **both** axes -
`overflow-y: visible` computes to `auto` when the other axis isn't `visible` -
and it clips all descendant paint to its padding box. Two things follow for any
horizontally-scrollable strip (`Tabs`' tab list, `Table`/`DataGrid`'s scroll
wrappers):

- **Nothing may sit outside the padding box.** A decoration positioned below it
  (the classic `bottom: -2px` indicator overlapping a `border-bottom`) becomes
  _vertical scrollable overflow_: a permanent vertical scrollbar, and the
  decoration clipped out of view. Reserve the band with `padding-bottom`, paint
  the rule with `box-shadow: inset 0 -2px 0 …` (an inset shadow paints on the
  border box and, unlike content, doesn't scroll away), and put the decoration
  at `bottom: 0`.
- **Outward focus rings are clipped**, so keyboard focus can disappear entirely -
  a WCAG 2.4.7 failure, and an invisible one, since the CSS is perfectly valid.
  Use an inset ring (`box-shadow: inset 0 0 0 2px rgba(var(--x-rgb), 0.5)`) for
  controls that fill a scrollport's height, as `Tabs` and `DataGrid`'s cell
  editor do. `outline` is no escape - it is clipped identically.

This bit `Tabs` the moment the strip was made scrollable: the vertical scrollbar
and the missing `line` indicator were reported, the clipped focus ring went
unnoticed for a release.

Adding scroll buttons or drag-to-scroll does **not** avoid any of this - both
drive the same `scrollLeft`, and `overflow: hidden`/`clip` clip identically.

### A portaled element cannot be sized by an ancestor class

Anything rendered through `Dropdown` (so: `Select`, `Combobox`, `Menu`,
`Popover`, `ContextMenu`, `ColorPicker`'s panel, …) is portaled to
`document.body`. A rule shaped like this therefore matches nothing:

```scss
.eidos-color-picker-canvas {
  .eidos-color-picker--sm & {
    height: 120px;
  } // never matches once portaled
}
```

The size modifier sits on the trigger, which stays put; the panel has left the
subtree. This silently removed **the entire saturation/brightness canvas from
every popover `ColorPicker`** - it collapsed to `height: 0`, leaving only the
hue slider, which cannot change a colour's lightness at all. Only the `inline`
variant worked, which is why it went unnoticed.

Two rules follow:

- Put the modifier on the **portaled element itself** (`ColorPicker` now emits
  `eidos-color-picker-panel--{size}`) and scope inner rules to that.
- Give dimensions an **unconditional fallback** before the modifiers, so a
  selector that fails to match degrades to a usable size instead of to zero.

Same silent-failure family as `rgb(var(--x-rgb) / 0.3)` and
`@media (max-width: var(--breakpoint-lg))`: valid-looking CSS, no warning,
element just gone.

### An anchored overlay must listen for scroll on `document`, in the capture phase

`scroll` does not bubble from an element, so a listener on `window` or
`document.body` only ever sees the **page** scrolling. `Dropdown`, `Popover`
and `Tooltip` all had exactly that pair of listeners, which meant their
portaled, `position: fixed` content never repositioned when the scroller was
any other container - it stayed at its original viewport coordinates while the
trigger moved away.

This was not an edge case: `PageLayout`'s `&__content` is `overflow: auto` and
is the layout's only scrollport, so **inside `PageLayout` no dropdown followed
its trigger** - `Select`, `Combobox`, `DatePicker`, `Menu`, `DataGrid` row
actions, the pagination page-size picker, quick filters. Two of the library's
own components were mutually incompatible, and the drift is the full scroll
distance (measured: 220px of `scrollTop`, 220px of detachment).

```ts
document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
```

One listener replaces both - page-level scrolling still reaches it. `DataGrid`
and `ContextMenu` already did this; the three overlay components did not.

Two related gaps worth knowing rather than assuming fixed:

- **`resize` has the same shape of problem.** `window`'s `resize` does not fire
  when a scroll container changes size without the window changing (a sidebar
  collapsing, a panel splitter). A `ResizeObserver` on the trigger would cover
  it; the components currently only listen on `window`.
- **Repositioning is not the same as staying useful.** Once the trigger scrolls
  out of its clipping ancestor the content is still painted, now anchored to a
  trigger nobody can see. Closing on that transition (an
  `IntersectionObserver`) is the more complete behaviour.

Regression test: `Dropdown`'s `RepositionsOnAncestorScroll` story - it asserts
the 8px gap between trigger and content survives an ancestor's `scrollTop`
change, and fails by exactly the scroll distance without the capture listener.

### A role belongs on the element that owns it - and it is a promise about keys

`Dropdown` hardcoded `role="menu"` on its portaled content `<div>`. It is a
positioning primitive with no idea what it contains, so that was wrong nearly
everywhere: `Select`, `Combobox` and `TagInput` render a `role="listbox"`
inside it (a listbox is not a valid child of a menu), and `DatePicker`,
`ColorPicker`, `TableFiltersDropdown` and the `Table`/`DataGrid` toolbars are
plain panels that announced themselves as menus with no items. It now takes a
`role` prop and defaults to none.

The same mistake in the other direction sat one level in: `MenuPanel`'s items
were `<li onClick>` with **no role, no `tabIndex` and no key handler**, so every
menu in the library - `Menu`, `ContextMenu`, `SplitButton`, `Table` and
`DataGrid` row actions - was operable by mouse only. That is WCAG 2.1.1, Level
A.

Two rules, and they are inseparable:

- **The role goes on the element that directly contains the items.** For a menu
  that is the `<ul>`, not the overlay around it. One level out and the menu's
  only child is a list, which is `aria-required-children` and a structure no
  screen reader can present as a menu.
- **`role="menu"` is a promise that arrow keys work.** Adding the role without
  the keyboard model is the same trap as naming a button while leaving
  `tabIndex={-1}` on it - it advertises a control the user cannot operate. The
  model that ships: roving `tabIndex` (one tab stop per menu), Up/Down with
  wrapping, Home/End, Enter/Space to activate, ArrowRight to open a submenu,
  focus moved in on open and returned to the trigger on close via
  `useDialogFocus(…, { trapTab: false })`.

Why none of this was caught: **axe only sees what is rendered, and every menu
story rendered closed.** The library's own a11y gate reported 7 nodes while
this was live. Any component that is only auditable in an open state needs a
story that _stays_ open after its `play` function - `Menu`'s `OpenMenuAria`
holds one of every item type for exactly this reason.

A submenu trigger carries `aria-haspopup="menu"` and `aria-expanded`, and
`MenuPanel` owns which submenu is open so that both are true. That ownership is
also what makes `ArrowLeft` able to close one level (`onRequestClose`).

Known remaining gap: **Escape closes the whole menu stack, not just the
innermost submenu.** Every open `Dropdown` registers its own `document` listener,
so one keypress reaches all of them. The ARIA pattern asks for innermost-only.
Fixing it means moving Escape ownership out of `Dropdown`'s document listener for
every overlay, which is a dismissal-path change across the library for a
deviation that is not a WCAG failure - worth doing deliberately, not as a
by-product of something else.

### Dropdown viewport clamping

`Dropdown`'s `calculateOptimalPosition` must clamp its position against **both**
edges of the viewport on **both** axes, unconditionally - never gate clamping
on whether `minWidth`/`maxWidth`/`minHeight`/`maxHeight` were explicitly
passed. `autoWidth` consumers (`Combobox`, `Select`, `TagInput` suggestions,
`Menu`, ...) never set an explicit width/height constraint, so a clamp that
only applied "if a constraint is set" left the far edge (right/bottom)
completely unclamped for all of them - any dropdown anchored near the right
edge with content wider than its trigger silently overflowed off-screen. The
primary-axis flip (top↔bottom, left↔right when the preferred placement
doesn't fit) is not a substitute for this - it only reacts to the _anchor_
side, not to the _content_ size once positioned.

### `document.fonts.check` cannot tell you whether a font exists

It returns `true` when **no** matching face is present - vacuously, since all
zero matching faces are loaded. Verified in a browser: it answers `true` for
`'Totally Not A Real Font 12345'`, and therefore for every uninstalled system
font. A check built on it can never fail.

`isFontAvailable` measures the family on a canvas against two fallbacks
instead. Two details that matter:

- **Generic families must short-circuit.** Probing `monospace` would compare
  `monospace, monospace` against `monospace` and report it unavailable.
- **Cache positives only.** Web fonts load asynchronously - always, with
  `font-display: swap` - so the first render legitimately sees them as missing.
  Caching that negative pinned a permanent "not installed" warning on fonts
  that had loaded fine. A loaded font never becomes unloaded, so positives are
  safe to keep; misses are re-probed, and `subscribeToFontLoads` triggers the
  re-render.

### Inline styles and CSP

`style={{...}}` in component source must only carry values that are genuinely
per-render/per-instance dynamic (position, size, colour computed from props or
state). Static values and small fixed-value enums (an on/off toggle, a 3-value
prop like `resize`) must be CSS classes instead - not because of a style-guide
preference, but because of Content Security Policy: CSP's `style-src`/
`style-src-attr` directives gate the inline `style` HTML attribute (relevant
whenever a consumer server-renders a component), and every avoidable inline
style widens that surface for no reason. See `src/ContentSecurityPolicy.mdx`
for the full reasoning and the current, audited list of components that still
need genuinely dynamic inline styles (their values can't be finite CSS
classes - positions, arbitrary widths, computed colours) versus the ones that
are portal-gated and therefore never reach server-rendered markup at all.
Nonces/hashes do **not** apply to inline `style` attributes per the CSP spec -
only to `<style>`/`<script>` elements, which this library never generates at
runtime - so "add a nonce" is never the right instinct here; moving the value
out of the attribute (a CSS class, or accepting `style-src-attr
'unsafe-inline'` scoped narrowly) are the only two real options.

### A reset must never suppress the focus outline

`outline: none` belongs **with its replacement**, never in a reset. Put it
inside the same rule that paints the new ring - which is what `focus-ring()`
does on its own first line - and never in a mixin applied broadly.

`button-reset` used to carry `&:focus { outline: none }`, and `global.scss`
applies that mixin to the bare `button` element. One declaration therefore
removed the keyboard focus ring from **every button on the page**, including
buttons belonging to the consuming app, which this library has no business
restyling. Nothing put a ring back, so ~20 components shipped with no visible
keyboard focus at all - a WCAG 2.4.7 failure that is invisible to lint,
typecheck and every visual test, because nothing is wrong until you press Tab.

`global.scss` now ends with a `:focus-visible` fallback. Three things about it
matter when adding a component:

- **It is deliberately the weakest rule of its kind.** A bare pseudo-class is
  specificity (0,1,0), so any component that paints its own focus state wins.
  Don't raise its specificity to "make it work" somewhere - if it is losing,
  that component already has a ring.
- **`:focus-visible`, not `:focus`.** Keyboard and assistive technology get a
  ring; a mouse click does not.
- **Inside a scroll container, an outline is clipped exactly like a
  box-shadow.** The fallback is an outward outline, so a control that fills a
  scrollport's height must still define its own **inset** ring (`Tabs`,
  `DataGrid`'s cell editor, `Chat`'s scroll region). Setting `outline: none`
  alongside that inset ring is what keeps the fallback out of the way.

### Never hand-write a focus ring

Take it from `focus-ring-shadow()` / `focus-ring-shadow-inset()` in
`mixins.scss`, or the `focus-ring()` / `focus-ring-inset()` mixins built on
them. The functions exist for the call sites a mixin cannot serve:
`Input`/`Textarea` paint on a `:focus-within` **wrapper** and compose the ring
with elevation shadows; `SegmentedControl` composes it with `$chip-shadow`.

Two properties of the ring that are easy to undo by accident:

- **It is solid, not a tint.** Every ring in the library was once
  `rgba(var(--x-rgb), 0.3)`, which measures **1.47-1.62:1** against a white
  page for all seven families - every one failing WCAG 1.4.11's 3:1. Alpha
  cannot rescue it: 0.6 still only reaches 2.3-2.76:1. The solid base is ~5:1,
  which is by construction - the palette is tuned so each base clears 4.5:1 as
  text on white.
- **The white gap is load-bearing.** "Adjacent" in 1.4.11 cuts both ways: a
  solid primary ring around a _checked_ `Switch`, `Checkbox` or `Radio` - whose
  track is already `--primary-color` - has no edge against the very thing it
  marks. Verified in the browser: the checked track and the ring's outer band
  are both `rgb(92, 93, 232)`. The gap separates them at ≥4.76:1.

Do not pass a custom `$size` just to make one component stand out; rings were
2px and 3px arbitrarily before, rendering 4px and 5px bands side by side.

Watch for a same-property, same-specificity neighbour. `AvatarGroup`'s white
separator (`.eidos-avatar-group-item .eidos-avatar`) and the focus ring are
both `box-shadow` at (0,2,0), and the separator is later in the file, so it
silently won and a clickable avatar in a group had no ring. It is now scoped
`:not(:focus-visible)` - and only the `box-shadow` is, since putting
`margin-left` inside the `:not()` would shift the layout on focus.

A visually-hidden input (`Checkbox`, `Radio`) will pick up the fallback on an
element that is 1px and clipped, so it is invisible - harmless, but it means
those components must keep painting the ring on their sibling control.

### Motion: disable the decorative, keep the meaningful

Wrap decorative motion in the `reduced-motion` mixin. **Do not** use the common
global snippet:

```scss
/* never do this */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

It cannot tell the two apart, and it freezes `Spinner`, `Progress`'s
indeterminate bar and the `Button`/`SplitButton`/`Combobox` spinners - removing
the very state they exist to communicate. WCAG 2.3.3 targets _non-essential_
motion.

Disabled: `Skeleton` pulse/wave · `Snackbar` slide · `Drawer` panel and scrim ·
`Modal` zoom · `CommandPalette` entrance · `Table` filter-row slide · `Chat`
message entrance and typing dots.

Still runs: `Spinner` · `Progress` indeterminate · the `Button`,
`SplitButton` and `Combobox` spinners.

Before disabling a **transition** on an overlay, check how it unmounts.
`Drawer`, `Modal` and `CommandPalette` are safe because they unmount on a
`setTimeout(TRANSITION_MS)`; had they listened for `transitionend`, removing
the transition would strand them on screen forever, since that event never
fires. Check the component, don't assume.

Also confirm the animation is not the only thing supplying visible styling -
`Skeleton`'s wave is safe to stop only because its gradient is a static
`background` declaration and the animation merely moves `background-position`.

### Layering (z-index)

**Never hardcode a z-index on an overlay** - in SCSS or in a JSX `style` prop.
An inline `zIndex` silently overrides the SCSS token, which makes the documented
theming variable dead code. This exact bug put every dropdown behind `Modal`.

Every overlay portals to `document.body`, so they all compete on one plane.
Use the tokens, which are ordered in steps of 100:

```
--z-index-drawer:          1200
--z-index-modal:           1300
--z-index-dropdown:        1400   // all anchored popups
--z-index-command-palette: 1500
--z-index-snackbar:        1600
--z-index-tooltip:         1700
```

- Anchored popups (`Dropdown` and everything built on it, `Popover`,
  `ContextMenu`) MUST stay above `--z-index-modal`: they are opened _from_ modal
  and drawer content.
- Nested submenus use `calc(var(--z-index-dropdown) + 1)`.
- Small local values (`z-index: 1`/`3`/`10`) are fine _inside_ a component's own
  stacking context - sticky table cells, input adornments, calendar nav buttons.
  Only portalled overlays must use the tokens.

### Cross-component adapters must forward shared config fields 1:1

When one component projects its column/config type onto another's (e.g. `DataGrid`'s
`DataGridColumn` → `Table`'s `TableColumn`, both consumed by the shared
`TableFiltersDropdown`), every field the two types have in common must be
forwarded by the adapter - not just the ones exercised by the first feature
that used it. `DataGrid`'s filter adapter mapped `filterType`/`filterOptions`
but dropped `dateFilterMode`, so `DataGrid`'s date filter was silently stuck
in `'single'` mode even though the shared dropdown component fully supported
`'range'`/`'multiple'`. When adding a field to one of the two column types
because the shared component needs it, always check whether the adapter on
the other side needs the same field added to its mapping.

### Themeable fills must pair with `--x-contrast`, never a hardcoded `--white`

Any rule painting `background: var(--x-color)` has to set
`color: var(--x-contrast)` alongside it. The contrast token is computed per
colour (white unless white drops below 3:1), so hardcoding `var(--white)`
produces unreadable text the moment a consumer supplies a pale colour through
`ThemeProvider`.

Two structural traps when doing this:

- **A shared `color` above per-colour backgrounds doesn't work.** `Pagination`,
  `Badge` and `Avatar` each set `color: var(--white)` once on a parent while the
  fills were set per colour modifier below it. `--x-contrast` is only meaningful
  next to its own `--x-color`, so the declaration has to move into each colour
  rule.
- **Decorative fills count too.** `Radio`'s dot and `Switch`'s thumb are
  `background: var(--white)` sitting on a coloured control - they vanish on a
  pale colour exactly like text does. Both now take `currentColor` from the
  checked parent's `--x-contrast`.

`Badge` and `Avatar` originally carried a hand-written `color: var(--dark-color)`
exception for `warning` only, which is the tell: someone hit the amber
legibility problem, patched the two places they noticed, and left `success` and
`info` equally illegible. If a fix like that is colour-specific, the problem is
almost certainly systemic.

### Palette bases carry two contrast requirements, not one

`--x-color` is both a fill (white text on it) and a text colour on light
surfaces - close to 300 declarations use `color: var(--x-color)` for
`outlined`/`text` variants. A base therefore has to clear 4.5:1 against white _as text_, which is
why every base sits at ~5:1 rather than merely being "dark enough for a button".

`--x-dark` has its own pair of constraints: it must be **darker than its own
base** (it is the hover fill) and **legible as text on white** (Snackbar and
`global.scss`'s link hover use it as a foreground). Recomputing bases without
recomputing `-dark` left five of seven families with a `-dark` _lighter_ than
their new base, i.e. hovers that brightened.

A yellow-ish `warning` cannot clear 4.5:1 against white at all - that is
colour-space geometry, not tuning - so `--warning-color` is necessarily a dark
gold. Don't "fix" it back to amber.

In the **dark scheme** the same two requirements cannot be met by one value
(white text needs luminance <= 0.18, text on the dark page >= 0.23), so the
dark scheme tone-shifts: bases go light, `--x-contrast` goes dark, and
`--x-dark` - still "the hover" - goes _lighter_. See "Colour schemes" below.

### A `--x-50` tint behind `--x-color` text is not contrast-safe

It reads beautifully for the preset, which is exactly why it spreads. It is
**4.49:1 for the shipped indigo** - under AA - and 1.23:1 for a pale primary.
`Navigation`'s active item used it and had to become a filled
`--primary-color` / `--primary-contrast` pill, which is AA for every base by
construction.

Text on a tint is fine if the foreground is far enough down the ramp:
`--x-700` on `--x-50` is 7.08:1 for the preset and AA for every base except a
pale one. `TreeView`, `Select` and `Calendar` all do this correctly. The rule of
thumb: **on a tint use `-700`, never the base.**

**Only `gray` and `primary` have a `50-900` ramp.** `danger`, `success`,
`warning` and `info` have just `-color`, `-dark`, `-light` and `-contrast`, so
there is no `--danger-700` to reach for - use **`--x-dark`**, which
`deriveDark` guarantees is darker than the base for any theme.

`Alert` is the cautionary example. Every variant tints its own background
with `bg-color-opacity(x, 0.08)` and painted the title in `var(--x-color)` -
the same rule as above, in a form that did not look like a tint. Measured
against that 8% surface:

| variant | `--x-color` | `--x-dark` |
| ------- | ----------- | ---------- |
| primary | 4.51        | 6.17       |
| success | 4.52        | 6.14       |
| danger  | **4.44**    | 6.10       |
| warning | 4.52        | 6.22       |
| info    | **4.49**    | 6.10       |

Note what that table is really saying: three variants passed by a
_hundredth_ and two failed. That is not one bad colour, it is a pattern
parked on the threshold where the next palette tweak flips all five. Only
`danger` ever appeared in an audit, because no story rendered an `info`
alert with a title - the other failure was latent.

Derived scales are also where a "relative" mental model quietly breaks. See the
comment on `buildRamp` - the ramp's ends have to be absolute positions on the
lightness axis, not offsets from the base, or a dark base yields `--x-50` as a
mid grey and every tint consumer in the library turns muddy at once.

### You cannot mute text on a saturated fill

There is no room. Every palette base is tuned to land just over 4.5:1 against
white, so a filled surface has roughly **0.5 of contrast headroom** - and
every way of de-emphasising text spends more than that.

Measured on the preset bubble in `Chat`:

| white at opacity    | contrast |
| ------------------- | -------- |
| 0.75 (what shipped) | 3.57     |
| 0.90                | 4.40     |
| 0.95                | 4.70     |
| 1.00                | 5.02     |

Only full opacity is safe, and that is for the _preset_. A custom theme is
worse: `pickContrast` only guarantees the contrast pair clears 3:1, so any
muting at all can fail there.

Two corollaries:

- **Don't reach for `--text-muted` on a coloured fill.** It is a dark grey
  for light surfaces; `Chat`'s attachment size label used it on the purple
  bubble and measured **1.97:1**. On a fill, secondary text inherits.
- **De-emphasise with size and position, not contrast.** `Chat`'s timestamp
  is already `xs` and tucked to one side; it did not also need to be faded.

### A veil must move the surface _away_ from the text on it

`rgba(white, 0.15)` over a filled bubble looks like a neutral "inset" tint
and is the wrong direction: it moves the surface _towards_ the white text
sitting on it. Measured across the palette it gave **3.79-4.15:1** - failing
for every single colour. The same overlay in black gave **6.79-6.87:1**.

**Black stopped being safe with the dark scheme**, where fills are light and
the text on them is dark - a black veil there moves towards the text. What is
safe in both schemes:

- **On a fill:** `--x-dark` (or a further ramp step, `--primary-800`). It is
  the hover step, which by construction sits further from `--x-contrast` than
  the base - darker in light, lighter in dark - and the scheme tests hold it
  at >= 4.5:1 against the contrast token. `Chat`'s quote and attachment chip.
- **A hover veil on a fill:** `color-mix(in srgb, currentColor 25%,
transparent)`, with the `rgba` line above it as the fallback - `currentColor`
  is the fill's own foreground. `Chip`'s filled remove button.
- **A neutral veil on a surface:** `rgba(var(--text-default-rgb), a)` - the
  text colour's direction always contrasts with the surface under it.
  `--dark-rgb` / `--black-rgb` vanish on the dark page.

### Generated colour cannot promise contrast

`VirtualList`'s story avatars were `hsl(id * 37 % 360, 65%, 55%)` with white
initials - varied, tidy-looking, and ranging from 4.42:1 down to **1.64:1**,
because a fixed HSL lightness says nothing about luminance: yellow-green at
55% lightness is far brighter than blue at the same value.

If a demo needs several colours, cycle the palette bases **with their own
`--x-contrast`** as the foreground - never white, which is 2.9:1 on the dark
scheme's bases. That keeps the example legible in both schemes _and_
demonstrates the tokens instead of inventing colours a reader might copy.
Tints for demo chips: `rgba(var(--x-rgb), 0.14)`, not a fixed pastel (1.2:1
behind dark-scheme text).

### Colour schemes (light / dark / system)

`<html data-color-scheme="dark" | "system" | "light">`; no attribute is light.
The light tokens are `:root` in `variables.scss`; the dark overrides are the
`dark-tokens` mixin in `_color-schemes.scss`, emitted for `dark` and, inside a
`prefers-color-scheme` query, for `system`. The rules:

- **Paint with the roles, never the literals.** Surfaces: `--surface` (page,
  cards, inputs) or `--surface-raised` (anything that floats - menus,
  dialogs, popovers, tooltips, snackbars; a shadow cannot separate an overlay
  on a near-black page). Body text: `--text-default`. `--white` and
  `--dark-color` keep their literal values in both schemes on purpose, so a
  consumer's own `var(--white)` never turns dark - which means a component
  using them does not follow the scheme. Grep for them after any SCSS change.
  Legit literal whites remain: `Switch`'s thumb, `ColorPicker`'s handles and
  range thumbs (controls drawn on arbitrary colour).
- **A ring or border that separates something from what is under it uses
  `--surface`**, not white: the focus-ring gap, `Badge`'s ring, `Slider`'s
  thumb border, `Avatar` group rings.
- **The grey ramp flips in dark.** Low steps stay surfaces/borders, high steps
  stay text, so role-correct uses need no change - but a grey used as a
  _literal_ colour (text inside a `<pre>`, which is dark in both schemes)
  needs its own token (`--code-text`).
- **The dark palette is generated - never hand-edit a value.** It is
  `deriveDarkBase` / `deriveDarkHover` / `deriveDarkLight` / `buildDarkRamp`
  (in `ThemeProvider.color.ts`) applied to the light preset, and
  `ThemeProvider.scheme.test.ts` fails if the stylesheet drifts from them.
  Change the function, regenerate, paste. That parity is what guarantees a
  consumer's custom colour is darkened by the same rule as the preset.
- **`ThemeProvider` writes tokens for the scheme in effect.** Inline styles on
  `<html>` outrank the stylesheet's dark block, so a custom colour written for
  light would pin its light value in dark. Tokens are built per resolved
  scheme and diffed against the same scheme's preset; `system` is resolved
  with `matchMedia` (`useSyncExternalStore`). An unmanaged provider (neither
  `colorScheme` prop set) never touches the attribute - apps that SSR it rely
  on that.
- **A consumer's static `:root` override is light-only.** The dark block's
  selector outranks `:root`, so their `--primary-color` is replaced by the
  preset dark primary in dark. Documented in GETTING_STARTED; `toCss()`
  writes all three blocks for exactly this reason.
- **Enforcement.** `check-a11y-baseline.js` renders every story in both
  schemes (`&globals=colorScheme:dark`) with per-scheme counts, and
  `ThemeProvider.scheme.test.ts` asserts every text/fill/hover/focus pairing
  on every surface in both. When the dark audit fails, the story layer is
  the usual culprit (hardcoded `#fff`, pastels, `var(--white)` in inline
  styles), then veils.
- **Storybook docs pages are always light.** They render in the preview
  iframe around Storybook's own light prose, so the decorator forces `light`
  when `viewMode === 'docs'` and the docs container resets the attribute for
  story-less guide pages. The scheme is previewed in the Canvas view - which
  is also what the audit measures.

### Disabled text is exempt - but verify it is actually disabled

SC 1.4.3 exempts "text that is part of an inactive user interface
component". Eight nodes per scheme are left standing on that basis:
`Chip`, `ColorPicker`'s label, `InlineEdit`, `OTPInput`'s label and hint, and
`TagInput`'s chips.

Each was checked against the source before being accepted - they resolve to
`--text-disabled` or sit under a `--disabled` modifier applying
`opacity: 0.5`/`0.6`. That check matters: an earlier sweep of `--gray-400`
found only **11 of 118** uses were genuinely disabled, and the rest were real
content hiding behind the same assumption.

They stay counted in `scripts/a11y-baseline.json` rather than being tagged
out. A visible, explained 7 is more honest than a hidden 0, and the
conformance report lists them with this citation.

### One `ThemeProvider`, at the root

Tokens are written to `document.documentElement` because every overlay portals
to `document.body` - a wrapper-scoped theme would leave every dropdown and modal
rendering the preset. The consequence is that providers **do not compose**: two
of them target the same element, so whichever applied a given token last wins
for the whole page, including the other one's subtree. A second mounted provider
logs a `devWarn`.

This bites in Storybook specifically - see "Stories that mutate global state"
below.

### Siblings with different capabilities must say so in both docs

Components that read as interchangeable siblings (`Table`/`DataGrid`,
`Combobox`/`Select`/`TagInput`) but differ in a load-bearing way - pagination
model, single vs. multi-select, autocomplete vs. free-text - must state that
difference explicitly in **both** components' `.mdx` files, not just one or
neither. `Table`'s pagination is always client-side with no
`onPageChange`/controlled-page equivalent, while `DataGrid` has a full
server-side mode; `Table.mdx` didn't mention the limitation at all, which
cost a real consumer a rebuild. Don't leave a capability gap to be discovered
by trial and error - call it out where the consumer is deciding between the
two.

### `PageLayout` owns a scrollport, and that has three consequences

`&__content` is the layout's only scroll region - the document does not
scroll. Everything below follows from that, and each one was a real defect:

- **`window.scrollTo` is a no-op inside the layout**, and a navigation does
  not reset the offset: `<main>` is the same element for the whole session
  and only its contents change, so a long list's scroll position carries
  into the next screen. `scrollRestorationKey` (offset remembered per key,
  applied when the key changes) and `contentRef` exist for this. The key is
  supplied by the consumer because deciding what counts as a navigation is
  routing - the same reason the library ships no page-chrome hook, below.
- **The offset must be recorded as the user scrolls, not when the key
  changes.** By the time a navigation commits, the next page's content is in
  the DOM and the browser has clamped `scrollTop` to its height. This fails
  _invisibly_ on a fresh navigation and only shows when returning to a page.
- **Attach a DOM listener that must not miss events in the ref callback, not
  in `useEffect`.** A passive effect runs some time after the commit; a scroll
  in between was never recorded. See "`test:stories` runs the dev server;
  Chromatic runs the production build" for why only Chromatic saw it.
- **A control that drives the scroll position must sit outside the region it
  scrolls.** The header is inside it and scrolls away, so a "back to top"
  button there is unreachable exactly when it is wanted. It also makes any
  test of it meaningless: clicking scrolls the button into view, so the
  assertion passes whether or not the ref arrived - measured, by breaking
  the ref forwarding and watching the test still pass.

A scrollable region containing nothing focusable also cannot be scrolled by
keyboard at all (SC 2.1.1), so `<main>` carries `tabIndex={0}` and an inset
focus ring, matching `VirtualList` and `Chat`. This went unnoticed because
every `PageLayout` story happened to have a button in its header; axe only
caught it once a story rendered a header with no actions, which is also what
an ordinary read-only page looks like.

### The library ships no page-chrome registration hook, deliberately

With one `PageLayout` for a whole area, each page's `header` has to reach it
from outside, and the obvious design - a context the page registers into via
an effect - was considered and rejected. It would give `header` two sources
with precedence rules inside an otherwise pure declarative component, and it
is one commit late by construction, so the props path is still needed for
first paint.

The finding worth keeping, because it is not obvious and it kills the most
attractive version of the idea: **a registration API cannot merge
contributions from a page and a sub-layout, because effects fire
child-before-parent.** Registration order is therefore inner-first, which is
the wrong order for "innermost wins", and there is no public API for tree
depth - a hook has no DOM node, so `compareDocumentPosition` is not available
either. Any such API is limited to one winner.

`PageLayout.mdx` documents the two-source pattern (route table for the static
half, page-registered context for the dynamic half) as **application** code,
with relative imports, so it cannot be misread as a library export - it was,
previously. `dev/layouts/page-chrome.tsx` is the worked implementation.

### Every library link goes through `EidosLink`

Anything with an `href` - `Button`, `Chip`, `Header`/`Toolbar` actions,
`Breadcrumb` - renders `src/components/LinkProvider/Link.component.tsx`, never
a bare `<a>`. It owns three rules nobody should re-derive:

- **Enabled** → `LinkProvider`'s component (the app's router link), else `<a>`.
- **Disabled/loading** → `<a>` with **no `href`**, `role="link"`,
  `aria-disabled="true"`, `tabIndex={-1}`. An anchor with a destination cannot
  be disabled any other way, and a router link cannot render without one.
- **`target="_blank"`** → defaults `rel="noopener noreferrer"`.

`LinkProvider` is a context, not a per-component prop, because the router is
app-wide and actions are often config objects with nowhere to pass a component.
It writes nothing global (unlike `ThemeProvider`), so nesting is fine.

An `<a>` styled by a component class needs two things a `<button>` does not:
`display: inline-flex` (a block-level flex anchor stretches full-width, a
button does not), and a check that the global `a:hover` colour (0,1,1) does not
outrank a `color: inherit` at (0,1,0) - `Chip`'s inner action hit exactly this.

### String icons resolve through a registry, never the whole Lucide map

`renderIcon` must not reference `lucide-react`'s `icons` object: a lookup by a
runtime string cannot be tree-shaken, so it put all ~1,800 icons in every
consumer bundle (measured: 1,083 KB of JS for a site using a handful). String
names resolve through `registerIcons()` (`src/utils/iconRegistry.ts`), and
`eidos-ui/lucide-icons` is the opt-in "register everything" entry.

- **Library code and stories pass components**, never string names - the
  library must not trigger its own deprecation warning. Stories set icon args
  by name only via `iconArgType()` (`src/story-icons.docs.ts`), which maps
  names to components; a `text` control cannot hold a component.
- **The registry lives on `globalThis` under `Symbol.for`**, because tsup
  compiles each CJS entry separately and a module-level `Map` would split.
- **`dist/lucide-icons/*` must stay in `package.json` `sideEffects`** - it
  exports nothing, so a bundler would otherwise drop the import silently.
- 3.8 deprecated the full-map lookup; 4.0 removed it. `scripts/check-bundle.js`
  (in `verify`) fails if the `icons` map, or more than a handful of Lucide
  icons, reach a minimal consumer bundle again.

### Deprecation: tag, parameter, JSDoc, warning

A deprecation is four facts, each with one reader, and
`scripts/check-story-docs.js` fails when they disagree:

| Fact                                                          | Read by                                            |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `tags: ['deprecated']` in the stories meta                    | sidebar badge (`.storybook/manager.tsx`), filter   |
| `parameters.deprecation: { since, removeIn?, use?, reason? }` | `<DeprecationNotice of={X} />` under the `#` title |
| JSDoc `@deprecated` on the component/prop                     | editors (strikethrough)                            |
| `devWarn` on use                                              | the consumer's console                             |

A deprecated **prop** gets its argTypes entry `table: { category: 'Deprecated' }`
with a description starting `**Deprecated.**` - never `table: { disable: true }`,
which hides the migration path. `Popover.isOpen` was the first case the check
caught, and `Header` was itself still passing it.

Two traps found while building this, both verified: the manager bundles with
the **classic** JSX runtime, so `manager.tsx` must `import React` or the first
badge crashes the whole manager UI; and the manager only rebuilds on a
Storybook restart, so a stale bundle looks like "the badge doesn't work".
Only `component` rows are badged - stories inherit the tag, and badging them
repeats it on every row.

---

## Storybook documentation rules

### MDX file structure (mandatory, no deviations)

Every component must have a `.mdx` file. The structure is fixed:

````
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as XxxStories from './Xxx.stories';

<Meta of={XxxStories} />

# ComponentName

One or two sentences describing what the component is and when to use it.

[OPTIONAL: > **Note**: one-line callout - only if genuinely useful]

## Usage

```tsx
import { ComponentName } from 'eidos-ui';
// minimal runnable example
````

## Any concept section

Prose only. Any number of these, and they all sit _before_ the stories.

## Playground

<Canvas of={XxxStories.Playground} />
<Controls of={XxxStories.Playground} />

## First story alphabetically

<Canvas of={XxxStories.Aaa} />

### An edge case of that story

Nested, so it stays bound to the story above it.

## Second story alphabetically

<Canvas of={XxxStories.Bbb} />
```

**`scripts/check-story-docs.js` enforces this shape** (a `docs:stories` step in
`npm run verify`), and `storySort` in `.storybook/preview.ts` applies the same
order to the sidebar. The two exist to agree with each other - run
`npm run check:story-docs` to check without the full verify.

Five rules, and the reasoning matters more than the list:

- **`Playground` is the primary story on every page**, and the only one with
  `<Controls>`. It was called `Default` until the sidebar/page mismatch below
  was fixed; `Playground` says what it is - the args-driven surface you drive.
- **One story per `##` section.** Otherwise "the order of the stories" is not
  even well defined and a reader cannot tell which prose belongs to which
  canvas. Five pages had sections holding two or three
  (`Chat`'s `## Permissions`, `DataGrid`'s `## With selection`, …).
- **Everything after `Playground` is alphabetical**, by the label the sidebar
  shows. This is deliberately meaningless ordering: "well-paced" is not
  checkable, so it rots - 60 of 62 pages had drifted into their own narrative
  order, none matching the sidebar. Anything that genuinely must be read in
  sequence is prose, and prose goes first.
- **Prose sections all sit ahead of the stories**, so the story sequence is
  uninterrupted and is exactly what the sidebar lists.
- **Containment is by heading level**: a story owns everything up to the next
  `##`, and its edge cases are `###` beneath it. Deliberately **not** a JSX
  wrapper - MDX re-parses a multi-line JSX element's children as markdown,
  which has broken these pages three times, and `prettier --write` silently
  reintroduced one of them. MDX comment banners are out for the same reason:
  an editor extension in the wild rewrites `{/* … */}` into `{/_ … _/}`.
  Heading levels cannot fail either way.

**Section heading text is not enforced, on purpose.** Forcing it to equal the
story name was measured and rejected: 342 of 442 headings already matched, and
forcing the other 100 produced `HSL format` → `Hsl format`, `On a list` →
`On A list`, and `Optimistic sending` → `Failed message retry`. The _order_
matches the sidebar; the wording stays human.

### MDX rules

- `<Controls>` appears ONLY on the first/primary story section, never on others
- Section headers use sentence case: `## With icons`, not `## WithIcons`
- Skip "Examples" grid stories if the component already has individual variant sections
- Length is proportional to complexity: Spinner ~20 lines, DataGrid ~90 lines
- Usage block must be minimal but copy-paste runnable
- When a component has a custom `.mdx`, remove `tags: ['autodocs']` from the `.stories.tsx` - Storybook does not allow both

### Story file structure (mandatory, no deviations)

The `.mdx` is the documentation; the `.stories.tsx` exists to feed it. Every
story file follows the same shape, for the same reason the `.mdx` template is
fixed - a reader moving between two components should not have to relearn the
layout.

1. **`Playground` is the control surface.** It is args-driven - either no
   `render` at all, or `render: (args) => <X {...args} />`. It carries the
   full `argTypes` map, and it is the **only** story the `.mdx` attaches
   `<Controls>` to.

   A story written `render: () => <X someProp="fixed" />` ignores `args`
   entirely, so the Controls panel renders, responds to being dragged, and
   changes nothing. This is worse than having no controls: it looks like the
   component ignores the prop. Eight components shipped this way
   (`ButtonGroup`, `ContextMenu`, `FileUpload`, `Navigation`, `SplitButton`,
   `TableFiltersDropdown`, `ThemeProvider`, `VirtualList`) - the defect is
   invisible to lint, tsc and the build, and only shows up by actually
   dragging a control.

2. **Every public prop gets an `argTypes` entry** with `control`,
   `description`, and `table.type` / `table.defaultValue`. Non-visual props
   (`className`, `id`, `name`, event handlers) get `table: { disable: true }`
   rather than being omitted, so the panel stays readable. `Pill` and `Button`
   are the reference shape.

3. **Every other story is focused**: one feature, one story, shown by exactly
   one `.mdx` section. A story that no `.mdx` references does not exist as
   documentation - it is sidebar noise. ~20 were orphaned this way.

4. **No `Examples` grid stories.** They duplicate the individual stories,
   drift from them, and are the exact shape that freezes the Docs tab under
   React 19 (see the `react-element-to-jsx-string` note below). 12 of these
   were deleted; if a variant is worth showing, it is worth its own focused
   story and `.mdx` section.

5. **Never hand-roll story chrome.** Use the helpers in
   `src/story-layout.docs.tsx` (`StoryRow`, `StoryStack`, `StoryGroup`,
   `StoryGrid`, `StoryFrame`, `StoryValue`). The same `label`/`row`/`col`
   style objects had been copy-pasted into a dozen files with hardcoded hex
   (`#94a3b8`, `#666`, `#e2e8f0`) - all of them token values written out by
   hand, and `#94a3b8` is 2.56:1 on white, so the story scaffolding itself was
   failing the contrast check the components are held to.

   That file is `.docs.tsx` deliberately: `release-needed.js` and
   `check-changelog.js` exclude that suffix at any depth, so it cannot flag a
   release. Unlike a guide page's JSX it renders inside `<Canvas>`, so tokens
   and `rem` are correct there - the "fixed px" rule does not apply.

6. **`layout` has a rule**: `centered` for a single small control, `padded`
   for anything with internal layout, `fullscreen` only for page-level
   chrome (`PageLayout`, `Header`, `Navigation`).

7. **`satisfies Meta<typeof X>`**, never `const meta: Meta<typeof X> =` - the
   former keeps `StoryObj<typeof meta>` inference sharp enough to typecheck
   each story's `args`.

8. **Every story is annotated `: Story`, and required props live in the
   meta's `args`.** These two go together. A story that only sets `render`
   still has to satisfy the component's required props, and the tempting
   escape is to drop the annotation - `export const Foo = {` typechecks
   against nothing. Three files had done exactly that (`CommandPalette`,
   `Navigation`, and `VirtualList` via placeholder args), each with a comment
   citing the others as precedent, which is how it spread to 65 untyped
   stories. Put the required props in the meta instead:

   ```ts
   const meta = {
     component: Menu,
     // Required props: satisfies the type for render-only stories below,
     // and seeds Default's controls with real values.
     args: { trigger: <Button>Open</Button>, items: BASIC_ITEMS },
   } satisfies Meta<typeof Menu>;
   ```

   Make them **real defaults, not placeholders**. `VirtualList` had
   `data: [], renderRow: () => null` with a comment saying every story
   overrides them - which meant `Playground` could not be args-driven at all.

9. **No `alert()` or `console.log` in a story.** Use `action('Label')` from
   `storybook/actions` (core, no addon to install - `Select` was already
   using the `action:` argType form). `alert()` blocks the thread and pops a
   modal dialog over a Docs page rendering dozens of stories; a `console.log`
   is invisible unless devtools happen to be open, which makes the one thing  
   the story demonstrates undiscoverable. Where the _outcome_ is the point,
   render it in the story instead (see `FileUpload`'s `WithCallbacks`).

10. **Don't restate the export name in `name`.** Storybook already renders
    `IconOnly` as "Icon Only". Set `name` only where it genuinely reads better
    as prose (`'Multiple select (compact label)'`).

### Accessibility is checked, and the check is honest

`@storybook/addon-a11y` runs axe against every story, in the "Accessibility"
panel and under `npm run test:stories`. What actually **gates** is
`scripts/check-a11y-baseline.js` - see "The accessibility ratchet" below.

Three things to keep straight:

- **The axe tag set is pinned in `preview.ts`, and it has to be.** The addon's
  default does not include `wcag22aa`, so `target-size` (SC 2.5.8) was never
  evaluated - **99 failing nodes** across ColorPicker, DataGrid, Chip,
  SplitButton and NumberInput were invisible in every run until the tags were
  listed explicitly. The target is WCAG 2.2 AA; the configuration has to say
  so, because the default quietly means something narrower. List the older
  tags alongside `wcag22aa` too: axe tags each rule by the version that
  introduced it, so `['wcag22aa']` alone would drop everything 2.2 inherited.
- **`parameters.a11y.test` is `'todo'`, not `'error'`, and that is now
  permanent.** It was written as a temporary concession to a backlog of 679
  nodes across 11 rules; the backlog is gone (7 nodes, one rule - read
  `scripts/a11y-baseline.json`, never this sentence). But the advice that came
  with it - "flip to `'error'` when the baseline reaches zero" - can never be
  taken, because the baseline **cannot** reach zero by design: all 7 remaining
  nodes are SC 1.4.3 disabled-control exemptions that are deliberately counted
  rather than tagged out ("a visible, explained 7 is more honest than a hidden
  0"). `'error'` would therefore fail every run forever. Those two rules
  contradicted each other for as long as both were written down. Keep `'todo'`,
  and let the ratchet be the gate.
- **Axe is a net, not a certificate.** It covers roughly a third of the WCAG
  success criteria - it cannot see focus traps, focus restoration, or whether
  an error message is programmatically associated with its field, all of
  which were found by hand and none of which axe reported. A clean run is
  necessary and nowhere near sufficient.

### The accessibility ratchet

`scripts/check-a11y-baseline.js` drives axe over every story in
`storybook-static` and compares per-rule node counts to
`scripts/a11y-baseline.json`. It fails on **any increase**, and also fails on
a _decrease_ - telling you to re-record, so an improvement can never silently
slip back.

Three things about it that are not obvious:

- **It needs a fresh `storybook-static`.** It reads the built output rather
  than requiring a dev server, so it behaves the same in CI and locally.
  `verify` therefore only runs it when `build-storybook` just ran - and gates
  both on anything under `src/` or `.storybook/` having changed since the last
  tag. That gate used to be `*.mdx` only, which meant a `.tsx` change was never
  audited unless a docs page happened to change alongside it: the ratchet's
  whole purpose, invisible to the gate deciding whether to run it.
- **It must wait for the addon's own axe pass.** `addon-a11y` runs axe when
  the story renders, and axe refuses concurrent runs. Injecting a second run
  without retrying failed **58 of 461 stories** with "Axe is already running"
  - and the dev server's slower timing hid the collision entirely, which is
    why the first measurements were quietly under-reported.

- **The count has to be deterministic, and getting there is fiddly.** Measure
  before the story has mounted and the numbers wander: three passes gave
  `label` counts of 167, 206 and 219, with `nested-interactive` moving in
  lockstep, because one unrendered grid row costs one unlabelled checkbox and
  one clickable row. A gate that fails for reasons nobody can act on gets
  disabled within a week.

  **The one thing that must not be weakened is the wait for `storyFinished`.**
  That event fires after render, after `play` and after every `afterEach` hook,
  which also means the addon's axe pass above has already finished. Everything
  else about the audit's speed rests on it, and it fails _downwards_ - a story
  measured early reports fewer nodes, so the ratchet announces improvements
  that never happened. Three things that seemed obviously right and were not:

  - **A fixed delay is not a substitute.** 250ms was simultaneously too long
    (64% of a 186s step) and too short - the slowest `play` function here takes
    2.4s, so those stories were audited mid-interaction. It is also
    machine-dependent in the worst direction: fine on a laptop, too short on a
    slower CI box.
  - **Parallelism plus a _timed_ settle silently corrupts the counts.** With 6
    workers and a DOM-stability settle, `--all-rules` returned 1498, then 1176,
    then 1360 `region` nodes: under CPU contention the story has not finished
    rendering when axe measures it. A `requestIdleCallback` settle failed the
    same way. With `storyFinished` the counts are identical at 1, 5 and 8
    workers, which is what makes `A11Y_WORKERS` safe to vary per machine.
  - **Freezing animations did not fix it.** Worth keeping - `reducedMotion`
    plus zeroed durations, so nothing is mid-transition and therefore
    invisible to axe when measured - but it was not the cause.

  **Re-validate any change to the waiting with `--all-rules`, never with the
  default tag set.** The recorded baseline is one rule (`color-contrast`, 7
  nodes) which is insensitive to partial rendering - it reported a clean 7 on
  every corrupted run above. `--all-rules` drops the tag filter and reports
  ~2882 nodes, of which `region` alone counts every element outside a landmark,
  i.e. it measures directly how much of each story had rendered. Two runs of it
  must agree with each other and across `A11Y_WORKERS=1` and the default.

- **Opt a story out with the `a11y-contrast-demo` tag**, not an allowlist.
  `vite.config.ts` reads it via `tags.skip` and the script reads the same tag,
  so one fact drives both. Only for stories where the failure _is_ the
  documented subject - currently the two theme demos that render white on pale
  yellow on purpose.

### A claim in a doc must be checked by something, or it is decoration

`ACCESSIBILITY.md` is rendered into Storybook, so its figures are published
claims. It stated "across **475 stories**" and "Story tests 528" while
asserting, two lines later, that "these numbers are not hand-maintained ... if
this table is ever wrong, the build is already red".

Half of that was true. The per-rule violation counts _are_ ratcheted. The story
and test counts were plain prose, and the story count drifted 475 → 480 in the
same session that added the stories, with nothing to notice - `--update` would
have rewritten `storiesAudited` in the baseline without comment too.

Three rules came out of it:

- **`check-docs.js` compares the figures in `ACCESSIBILITY.md` against
  `a11y-baseline.json`**, so the file's own claim about itself is true.
- **`check-a11y-baseline.js` fails when the audited count differs from the
  recorded `storiesAudited`**, so the baseline cannot become the stale half of
  a self-consistent pair of wrong numbers. It is not a regression - no
  violation has appeared - so it reads like the "improved, re-record" branch,
  and it doubles as the prompt to ask whether the new stories cover states
  nothing had looked at before.
- **A number with no cheap authoritative source gets deleted, not checked.**
  The test count went, rather than acquiring a check that would have to run the
  suite to know the answer.

The general form: before writing a number or a guarantee into a doc, decide
what will fail when it stops being true. If the answer is "nothing", either
wire up the check or do not make the claim.

### An overlay that is open on its first render cannot be server-rendered

Every overlay portals into `document.body`, and a portal is client-only.
Measured against the built package, before this was fixed:

```
renderToString(<Modal isOpen>)          ReferenceError: document is not defined
renderToString(<Dropdown defaultOpen>)  ReferenceError: DOMRect is not defined
renderToString(<Select autoOpen>)       ReferenceError: DOMRect is not defined
```

Not a rendering glitch - the whole server render dies. `Select autoOpen` is not
hypothetical; `DataGrid`'s select cell editor uses it.

Three things worth keeping straight:

- **`isMounted` is not a guard against this.** `Modal`, `Drawer` and
  `CommandPalette` each have one and all three threw: it is initialised to
  `useState(isOpen)`, so it is already `true` on the first render. It sequences
  the open/close _animation_ and nothing else. Use `useIsClient`, which is
  `false` until the first effect.
- **`typeof document !== 'undefined'` is the wrong check.** It is true during
  hydration, so the client's first render would disagree with the server's - a
  hydration mismatch. A state flag set in an effect makes them agree by
  construction.
- **Browser-only globals in the render path count too.** `Dropdown` threw on
  `new DOMRect()` before it ever reached `document.body`, from a fallback in
  its sizing call. Only the width was read, so the parameter is now
  `{ width: number } | null`.

`scripts/check-ssr.js` (in `verify`, after `build`) renders every overlay in
both states with no DOM present and fails on a throw **or** on any `style`
attribute in the output. That second assertion is what makes
`ContentSecurityPolicy.mdx`'s "safe under SSR" claim enforced rather than
argued - and note the claim now rests on the portal boundary, not on overlays
"starting closed by default", which `defaultOpen`/`autoOpen` had already made
untrue.

It is a plain node script rather than a Vitest project on purpose: both test
projects run in a real chromium, and an SSR check needs the _absence_ of a DOM,
which chromium cannot provide. A node-environment project would be a third set
of rendering semantics.

### `test:stories` runs the dev server; Chromatic runs the production build

The two execute the same play functions against different React scheduling,
so **a play that passes locally can fail on Chromatic every time** - not
flakily. `PageLayout`'s `RestoresScrollPerKey` did exactly that: the
production build starts the play function before React has flushed the
initial mount's passive effects, the dev server does not, and the scroll
listener lived in one of those effects. Under the dev server it never failed
in any run, at any viewport, or with the CPU throttled 6x; against
`storybook-static` it failed 5/5, with Chromatic's exact message.

So when a play fails only on Chromatic, **reproduce against a production
build before theorising**: `npm run build-storybook`, serve `storybook-static`,
and run the story there (Playwright, waiting on the preview channel's
`storyFinished` event). Every other environment difference - viewport, device
pixel ratio, CPU speed - was tried first and reproduced nothing. And treat it
as a real bug until shown otherwise: a scroll that lands before passive
effects run is equally possible in a consumer's app.

### Do not add `.storybook/vitest.setup.ts`

Storybook's published docs still show a setup file calling
`setProjectAnnotations` and listing it in `setupFiles`. **Since Storybook 10.3
that is wrong for this project.** `@storybook/addon-vitest` applies the preview
annotations itself, and it _disables_ that automatic provisioning the moment it
finds a setup file doing it manually.

Adding the documented file broke 9 of 62 suites outright - `Error: Vitest
failed to find the runner`, importing the addon's own `setup-file.js` - and
dropped the run from 463 tests to 375. Storybook prints the reason at the top
of the run, so read the banner before trusting the docs page:

> Found a setup file with "setProjectAnnotations". Skipping automatic
> provisioning of preview annotations to avoid conflicts.

The two root causes already fixed are worth recognising, because both are the
library's recurring failure shape - valid CSS/markup, no warning anywhere:

- `--gray-400` used as a **text** colour in 99 declarations across 39
  components. The grays are a _surface_ ramp; text must come from
  `--text-muted` / `--text-disabled`. See the contrast table in
  `variables.scss` for why `--text-muted` is `--gray-600` and not the more
  obvious `--gray-500`.
- `Dropdown`'s trigger wrapper carrying `role="button"` around the real
  control, which propagated invalid nested-interactive ARIA to all seven
  components built on it.

### `typecheck` needs `dist/` - build styles first

`dev/main.tsx` imports `eidos-ui/fonts`, deliberately, because the dev app
is meant to consume the package the way a consumer does. That specifier
resolves through the `exports` map to `dist/fonts.css.d.ts`, which only
exists after a build - so on a **fresh checkout** `tsc --noEmit` fails with:

```
TS2882: Cannot find module or type declarations for side-effect import of 'eidos-ui/fonts'.
```

This passed locally for a long time purely because `dist/` was lying around
from an earlier build, and broke the moment CI ran it on a clean runner.
`npm run verify` had the same latent bug for the same reason.

Both now run `npm run build:styles` before `typecheck` - about a second of
Sass, which is why the fast CI job does not need the full package build.
`scripts/build-styles.js` also had to learn to create `dist/` itself; it had
only ever run after `tsup`, which made the directory for it.

**When a check depends on a build artefact, say so in the pipeline.** The
tempting shortcut here - an ambient `declare module 'eidos-ui/fonts'` - would
have made the error disappear while also hiding the removal of that entry
from the `exports` map, which nothing else validates.

### Consumer-facing docs are written in the present tense

**State what the component does.** A reader has not seen any earlier version, so
"this is no longer hardcoded", "the wrapper now measures what it was given" or
"previously this had to carry a placeholder" asks them to hold a history they do
not have in order to use something today - and it advertises, for no benefit,
that the library shipped the broken version. What changed belongs in
`CHANGELOG.md` and `Releases.mdx`, which is where a reader goes _asking_ the
historical question.

This is a habit, not a component-specific note: writing docs in the same sitting
as the fix makes the fix feel like the subject. Every phrasing above came from
shipped docs, spread across `Dropdown`, `Select`, `DataGrid`, `Table`,
`Navigation`, `Toolbar`, `ThemeProvider` and `ACCESSIBILITY.md`. Assume the
instinct will recur and re-read for it before finishing.

This applies to everything a consumer can read, which is more than the `.mdx`
files:

| Surface                                               | Renders where                                         |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `*.mdx`                                               | the docs page                                         |
| prop JSDoc in `*.types.ts`                            | **the Controls table**, via react-docgen              |
| story JSDoc                                           | the section description above that story's `<Canvas>` |
| `ACCESSIBILITY.md`, `README.md`, `GETTING_STARTED.md` | docs page / repo front door                           |

Prop JSDoc is the one that surprises people: it is written while thinking about
the implementation and it surfaces in the Controls panel next to the control.

**Source comments are the exception, and deliberately so.** In `.component.tsx`,
in this file, and in the JSDoc of a story tagged `['!dev', '!autodocs']` (which
renders nowhere), the history is the most valuable thing you can write - it is
what stops the next person reinstating the bug. Keep those. The test is simply
_who reads this surface_.

Two phrasings that are **not** historical framing and are fine: a conditional
("once the viewport can no longer fit every column…") and a property that holds
in spite of something ("a text field in a menu still works normally").

### Storybook is for consumers; the repo is for contributors

A reader in Storybook installed the package from npm. They have `dist/` and
nothing else - no `scripts/`, no `npm run verify`, no `.stories.tsx`, no
source SCSS (`files: ["dist"]`). Anything they cannot act on is noise at
best and misleading at worst.

`ACCESSIBILITY.md` serves both audiences, so it carries a
`<!-- storybook:end -->` marker: the renderer in `Foundations.docs.tsx`
stops there, and everything after it - the "Running the checks yourself"
commands - stays in the file for whoever is working in the repository. Move
contributor content behind the marker rather than deleting it.

The same habit applies to phrasing: state the **guarantee**, not the
mechanism. "Re-checked on every build; a release cannot be cut with more
violations than the figure above" tells a consumer something true and
useful. "Recorded by `node scripts/check-a11y-baseline.js --update`" tells
them about a file they do not have.

`/tmp/audience-sweep.mjs` is the shape of the check: load every docs page,
read `innerText`, and grep for `npm run`, `scripts/`, `git clone`,
`vitest`, `.stories.tsx` and similar. Grepping the `.mdx` sources is not
enough, because `ACCESSIBILITY.md` reaches the page through the plugin.

One exception worth preserving: the **Releases** page names internal files
(`global.scss`, `mixins.scss`) inside historical changelog entries. Those
describe consumer-visible effects and are a record of what happened -
leave them.

### Foundations pages are generated - never type a token value into prose

`Foundations/Colour`, `/Typography` and `/Layout` render from
`stats.tokenGroups`, which `.storybook/stats-plugin.ts` parses out of
`variables.scss` at Vite config time. Contrast figures on those pages use the
library's own `contrastRatio`, so the docs cannot disagree with the runtime.
`Foundations/Accessibility` reads `scripts/a11y-baseline.json` for the same
reason: the page reports whatever the CI gate is enforcing, not a copy of it.

This is the answer to a problem `check-docs.js` had already tried and
rejected. Value-checking prose is undecidable - `--primary-color: #5c5de8` in
a `:root` block is either "here are the defaults" or "here is how you
override", and nothing structural tells them apart. The fix was to remove the
ambiguity rather than detect it: **exactly one place states a token value,
and it is generated.** The override examples in `README` and
`GETTING_STARTED` now use values that are visibly not the defaults, so
neither can be misread.

Three conventions those pages follow, each fixing something that looked
wrong on the rendered page rather than in the source:

- **Tables share a column spec.** `COLUMNS` in `Foundations.docs.tsx` plus
  `table-layout: fixed`. Left to size themselves, eleven tables on the
  Colour page stepped left and right as `--info-color` and
  `--hyperlink-color` differ in length, and the grid never settled.
- **One heading per section, not two.** An MDX `## Breakpoints` above a
  `<Section title="Breakpoints">` renders the word twice. Name the MDX
  heading for the theme and the section for the specific table.
- **Swatches need a backdrop when the thing being shown is subtle.**
  `--box-shadow-xs` is `0 0 1px rgba(0,0,0,.05)`; a white card carrying it
  on a white page renders as literally nothing.

If you add a Foundations page, put every scrap of JSX in
`Foundations.docs.tsx`, and **do not use backticks in a `GuideHero`** - MDX
turns them into `<code>`, Storybook's docs CSS gives that a near-white
background, and the hero's light text colour is inherited onto it, producing
an invisible white box on the purple gradient. There is no inline-style fix,
and this library deliberately never injects a `<style>` element.

### The library cannot claim WCAG conformance - don't let anyone add one

WCAG 2.2 [§5.2.2](https://www.w3.org/TR/WCAG22/#cc2) is explicit:
"Conformance (and conformance level) is for full web page(s) only, and cannot
be achieved if part of a web page is excluded." A component library is not a
web page, so "eidos-ui is WCAG 2.2 AA" is not a true statement, an
overcautious one, or a marketing one - it is a category error.

`ACCESSIBILITY.md` is the artefact to update instead: what was tested, how,
the documented exemptions, what the consumer still owns, and what has _not_
been done (no screen-reader testing, no user testing, no independent audit).
If a claim is ever needed for procurement, those three omissions are the gap.

The `AccessibilityNote` on the Welcome page says the same thing in short
form. Keep the two in step - they are the second-most-copied fact in the
repo after the component count.

### A focus ring nested in a state modifier rings only that state

`Pagination` painted its focus ring inside `&--active`, so the only page
button that showed focus was the one you were already on - and `outline:
none` on the base rule had already suppressed the global fallback. Every
other page was a silent tab stop.

Two habits that catch this class of bug:

- **Check what a reset removes.** `input-reset` clears `outline`
  unconditionally (deliberately - see the mixin's note), so any component
  using it _must_ paint its own ring. `CommandPalette`'s search field and
  `MessageComposer`'s textarea both forgot, and `global.scss`'s
  `:focus-visible` fallback cannot save them because they suppressed it.
- **Verify by pixel, not by selector.** Reading the CSS suggested the
  `ColorPicker` sliders had a ring; screenshotting them focused and
  unfocused proved the bytes were identical. Conversely it cleared `Input`,
  `TreeView` and `Slider`, whose rings live on a wrapper, a child, or a
  `::-webkit-slider-thumb` where a computed-style probe cannot see them.

### 24px targets: take the size, not the spacing exception

SC 2.5.8 lets a sub-24px target pass if a 24px circle centred on it clears
its neighbours, and `ColorPicker`'s 20px swatches were four pixels of gap
away from qualifying. Don't.

The gap is `--spacing-xs`, which is `0.25em`: 3.5px at the default font
size and about 3.06px at the minimum `fontScale`. The exception would have
held for the preset theme and failed silently for a themed one - the same
threshold trap as the `Alert` tints. **Set a px floor; don't rely on a
computed value a theme can move.** `SplitButton`'s chevron got `min-width:
24px` for the same reason, its `em` padding having left it at 20.4px.

Growing a target is often free. `ColorPicker`'s sliders are a transparent
`<input type="range">` over a 10px painted track, so raising the input to
24px enlarged only the hit area - identical pixels, 20% easier to grab.
Check what actually paints the control before assuming a size change is
visible.

### `visually-hidden` keeps things focusable - that is what it is for

`MessageComposer` and `ThemeEditor` hid their file inputs with
`@include visually-hidden` and let a visible button call `.click()` on
them. The mixin is a clip-rect, which is _deliberately_ still focusable
(that is how skip links and screen-reader-only text work), so keyboard
users tabbed onto an invisible control and met the same action twice.

For a proxy element - one a visible control drives - use `display: none`
plus `tabIndex={-1}`, which is what `FileUpload` already did. `aria-hidden`
is only safe alongside the `tabIndex={-1}`; hiding a focusable element is
its own violation.

Rule of thumb: `visually-hidden` is for content you want **announced but
not seen**. If you want it neither announced nor reachable, it is the wrong
tool.

### Checking SC 2.4.11 needs a sibling-aware probe

Nothing in axe tests Focus Not Obscured. A `elementFromPoint` sweep over
every tab stop does, but the naive version reports **every custom checkbox
and radio in the library** as fully covered: the native input is visually
hidden under a sibling that paints the box _and_ the focus ring
(`input:focus-visible + .control`), so the hit test returns the sibling.

Count a sibling as visible, and the sweep over ~2350 tab stops finds
exactly what it should. Script: `/tmp/focus-obscured.mjs` pattern - sample
a grid of points per element, and fail only when _none_ of them hit it,
since the AA criterion is about being entirely hidden.

### A visible error is not an identified error

Eight components take an `error` prop. Before this work, **none** set
`aria-invalid`, and most rendered the message as a sibling `<div>` with no
`id` and no `aria-describedby`. A red border next to some red text is
perfectly valid DOM and completely silent - SC 3.3.1 (Level A) failing
across the whole form library, with nothing in axe to show for it.

Three things, together, on every field that can be invalid:

```tsx
const errorId = `${inputId}-error`;
...
aria-invalid={error ? true : undefined}
aria-describedby={error ? errorId : undefined}
...
{error && <div id={errorId}>…</div>}
```

Watch for two traps:

- **Merge `aria-describedby`, don't assign it.** `Input` receives one from
  callers (`Combobox` and `TagInput` describe their fields), so overwriting
  would trade one missing description for another. `expectErrorWiring` in
  `story-a11y.docs.ts` resolves _every_ id in the list for this reason.
- **A ternary between hint and error is not automatically a bug.**
  `TagInput` and `OTPInput` both use `error ? errorId : hintId`, which looks
  like one clobbering the other - but both _unmount_ the hint when an error
  shows, so the description correctly mirrors what is on screen. Check the
  render before "fixing" it.

Components that render their own error rather than delegating to `Input` -
`Combobox` does - need their own wiring; they inherit nothing.

### An auto-dismissing toast is a time limit

`Snackbar`'s auto-close was `setTimeout(() => remove(id), duration)` with no
way to stop it. That is SC 2.2.1 (Level A): a time limit that cannot be
turned off, adjusted or extended. It is worst precisely where the component
is most useful - `action` puts an "Undo" button inside something that
deletes itself on a stopwatch.

The fix is a timer that records `remaining` and `startedAt` so it can be
cancelled and restarted with the remainder, paused from
`SnackbarContainer` on `onMouseEnter`/`onFocus` and resumed on
`onMouseLeave`/`onBlur`. Focus matters as much as hover: it is what gives a
keyboard user time to reach the action, and React's `onFocus` bubbles, so
focusing the button inside pauses the whole snackbar.

Neither this nor the error wiring above is visible to axe. **The baseline
did not move by a single node across this entire phase** - which is the
point: a clean axe run is necessary and nowhere near sufficient.

### Never put an interactive role on a wrapper

This is the single most repeated defect in the library. It has now been
fixed five times, in five disguises:

| where                               | shape                                                           |
| ----------------------------------- | --------------------------------------------------------------- |
| `Dropdown` (3.x)                    | `<div role="button" tabIndex={-1}>` around the trigger          |
| `DataGrid` rows                     | dnd-kit `attributes` spread onto every `<tr>`                   |
| `Chip`                              | `<div role="button">` containing the remove `<button>`          |
| `Tooltip`                           | `role="button"` wrapper around a child that is usually a button |
| `Popover` / `Combobox` / `TagInput` | `aria-expanded` on a roleless `<div>`                           |

The wrapper exists for layout, a ref, or an event handler. None of those
need a role. Ask instead **which element the user actually activates**, and
put the role, the state and the name there:

- If the child is already a control - clone the ARIA onto it (`Popover`), or
  skip it entirely when the child provides it (`Tooltip` measures this from
  the DOM with `FOCUSABLE_SELECTOR`, because `children` is an arbitrary
  `ReactNode`).
- If there are genuinely two actions - render two sibling controls, never
  one inside the other (`Chip`).
- If a library hands you `attributes` - check what is in them. dnd-kit's
  carry `role="button"` and `tabIndex`, and describe the **activator**, not
  the element being moved.

`DataGrid` is the cautionary tale, at 177 nodes - but the node count
undersells it. A `<tr>` with a button role stops being a row, so the entire
table structure vanished for a screen reader. It applied to every grid in
the library, including those with `draggableRows` off, because `useSortable`
returns its attributes regardless of `disabled`.

The mirror-image bug came with it: because `attributes` never reached the
drag handle, the handle had no `tabIndex`, and `KeyboardSensor` had no
activator to start from. The keyboard alternative to dragging was in the
sensor list and unreachable. **A drag handle that is not focusable is not a
keyboard alternative.**

### `aria-controls` must name an element that exists _now_

`Combobox` and `TagInput` both set `aria-controls` to their listbox id
unconditionally, while the listbox only renders once the menu is open. A
dangling reference is invalid (`aria-valid-attr-value`) and a screen reader
following it finds nothing.

Gate it on the open state, alongside `aria-expanded`:

```tsx
aria-expanded={isOpen}
aria-controls={isOpen ? `${uid}-listbox` : undefined}
```

Note where those two live: on the **input**, which is the combobox, not on
the wrapper around it. `CommandPalette` already had this right and is the
reference to copy.

### An icon-only control needs a name, and `tooltip` is what supplies it

`Button` falls back to `tooltip` for `aria-label` when a button is icon-only
and has no explicit name; `SegmentedControl` does the same for a segment with
an icon and no `label`. Both `devWarn` when there is neither.

This was not a missing feature, it was a **broken documented pattern**.
`Tooltip` renders a floating panel and adds no naming attributes to its child

- no `aria-label`, no `aria-describedby` - so `IconButton`'s own JSDoc
  example, `<IconButton icon={Plus} tooltip="Add item" />`, shipped a control
  announced as just "button". Making `tooltip` name the button fixed 35 nodes
  across six components without anyone changing a line of calling code.

An explicit `aria-label` always wins: the caller may want a longer name than
the visible tooltip.

### A placeholder, a `<span>`, and a `<label>` with no `htmlFor` are all not labels

Three shapes that each looked labelled and were not:

- **`Pagination`** rendered `<label class="...">Show:</label>` next to its
  page-size control with **no `htmlFor`** - a real `<label>` element naming
  nothing. Fixed by passing an `id` through `inputProps` and pointing
  `htmlFor` at it, rather than adding an `aria-label`: an `aria-label` of
  "Rows per page" would satisfy axe while breaking SC 2.5.3 Label in Name,
  because the spoken name would no longer contain the visible "Show".
- **`ThemeEditor`** used `<span class="...__label">` for its row labels,
  which associates with nothing. Named the control through `inputProps`.
- **`TableFiltersDropdown`** relied on `placeholder="Enter value"`. A
  placeholder disappears the moment you type, and several of those rows sit
  side by side.

**`Select` now takes a `label` prop, and this note used to say it did not.**
Worth reading as a lesson about notes rather than about `Select`: it recorded
the inconsistency (every other field had `label`; here the capability existed
only through `inputProps={{ label: '…' }}`) and it named the consequence - two
stories shipped unlabelled - and then it sat there while the same defect
appeared in three more places: the `DatePicker` calendar's own month and year
pickers, `TableFiltersDropdown`'s column and value pickers, and `DataGrid`'s
quick filters. **A recorded gap is not a closed one.** If a note explains why a
defect keeps recurring, the note is the bug report, and it should be read as
one every time it is passed.

The API gap is closed from both ends now:

- a first-class `label`, matching `Input`, `Checkbox`, `Radio` and `Textarea`;
- a `devWarn` when the field ends up with no accessible name at all.

That warning is **measured from the DOM in an effect**, not from props -
`element.labels.length`, `aria-label`, `aria-labelledby` - and that distinction
is load-bearing. A props-only check would have cried wolf at `Pagination`,
which names its page-size picker with an external `<label for>`, and at the
`dev/` app, which wraps its `Select`s in a `<label>` element. Both are valid
labelling that no prop on `Select` can see. A warning that fires on correct
code gets muted, and then it protects nothing.

### Controls the audit cannot see

axe only sees what a story renders. Two defects were invisible for that
reason and were found by reading the source while fixing their neighbours:

- `Input`'s **clear button** only renders when the field has content, and
  nearly every story starts empty.
- `DatePicker`'s **clear button** only renders once a date is picked.

Both were nameless and `tabIndex={-1}`. When you fix a family of controls,
check the conditionally-rendered siblings rather than trusting the node count.

### `tabIndex={-1}` on a real button is a keyboard failure, not a tidy tab order

`Input` had it on all three of its buttons - clear, password toggle and
`posIcon`. It keeps the tab order short and makes the control **impossible to
operate by keyboard** (WCAG 2.1.1, Level A). A keyboard user could not reveal
their own password.

Worth stressing: giving such a button a name _without_ removing
`tabIndex={-1}` is worse than leaving it alone, because a screen reader then
announces a control the user still cannot reach. The two fixes belong
together.

### Every dialog needs `useDialogFocus` - `aria-modal` alone is a lie

`src/utils/useDialogFocus.ts` moves focus into a dialog on open, optionally
traps Tab, and returns focus to the opener on close. `Modal`, `Drawer`,
`CommandPalette` (trapped) and `Popover` (`trapTab: false`) all use it.

It exists because all four shipped `role="dialog"` with **no focus management
at all**. `aria-modal="true"` tells assistive technology the rest of the page
is inert; measured in a browser, focus never entered the dialog and Tab left
it on the first press. That is WCAG 2.4.3 (Level A) and **axe reports none of
it** - a static snapshot of the DOM looks perfectly correct.

Four things that were not obvious, each of which cost a debugging cycle:

- **Activate on _visible_, not _open_ or _mounted_.** These overlays mount
  first and apply their `--is-open` class two animation frames later.
  `.focus()` on an element that is still `visibility: hidden` is a silent
  no-op - it does not throw, focus just stays where it was. The hook also
  retries across a few frames so it never depends on a particular transition
  duration.
- **Restore has to accept focus being on `<body>`.** When the overlay hides,
  the browser blurs whatever was focused inside it, so by cleanup time
  `activeElement` is usually already `<body>`. Restoring only when focus is
  still _inside_ the container meant `CommandPalette` never restored at all.
- **The opener must survive the open.** `CommandPalette` returned
  `triggerNode` while closed and a fragment once open, so React saw a
  different root type and destroyed the very button the user clicked -
  leaving nothing to return focus to. Keep the root's shape stable and gate
  the portal inside it.
- **Non-modal still needs focus moved in.** `Popover` is honestly
  `aria-modal="false"`, so trapping Tab would strand the user - but its panel
  is portaled, so without moving focus in, Tab from the trigger goes to
  whatever follows it in the page and the panel's controls are unreachable.

Test it with `expectFocusTrap` from `src/story-a11y.docs.ts`, on a story
tagged `['!dev', '!autodocs']` - hidden from the sidebar, still run by
`npm run test:stories`. Don't attach it to `Playground`: the `.mdx` documents
that overlay stories start closed, and a `play` that opens one contradicts
the page it is documented on.

### Interactive overlay stories

CommandPalette, Modal, Drawer, and similar overlay components must start CLOSED in stories (`useState(false)`), with a visible trigger button. Never auto-open overlays on story mount - it breaks the Docs page by popping multiple overlays simultaneously.

### Top-level guide pages (not component docs)

`Welcome.mdx` ("Welcome"), `Introduction.mdx` ("Getting Started"),
`ContentSecurityPolicy.mdx` ("Content Security Policy"), and `Releases.mdx`
("Releases") live at `src/` root, not under a component folder, and don't
follow the component `.mdx` template above - they're prose/reference pages,
picked up by the same `../src/**/*.mdx` glob in `.storybook/main.ts`. Use a
bare `<Meta title="..." />` (no component group prefix).

All four are **named explicitly in `storySort.order`** in
`.storybook/preview.ts` so they lead the sidebar. Without that they fall into
the ungrouped bucket, which sorted "Welcome" and "Getting Started" _below_ all
58 components - the worst possible place for the two pages a newcomer needs
first. Note that Storybook places docs-only entries ahead of component groups
regardless of where they sit relative to `'*'`, so they cannot be pushed to
the tail by listing them after it.

### Numbers on a guide page are derived, never typed

`Welcome.mdx` leads with a component count, a story count, a token count and
the gzipped stylesheet size. Every one comes from `virtual:eidos-stats`, a
Vite virtual module served by `.storybook/stats-plugin.ts`, which reads the
source tree at config time. Nothing on that page is hand-maintained, because
this repo has twice shipped a stale count in prose (see "Documentation
freshness") and a landing page is the most visible possible place for it.

Two alternatives were considered and rejected, both for reasons worth keeping:

- **`import.meta.glob(..., { eager: true })` in the page.** The story modules
  are already in the preview bundle so it adds no bytes, but eagerly importing
  all 62 forces the whole library to load when Welcome renders - and Welcome
  is the first page anyone sees.
- **A generated file committed to `src/`.** Free at runtime, but stale the
  moment someone adds a component without re-running the generator, which is
  the exact failure this exists to prevent.

The story/category counts come from each story file's `title` - the same
source of truth `scripts/check-docs.js` uses - so the page cannot drift from
the sidebar.

`Releases.mdx` mirrors `CHANGELOG.md` in summary form (see "Changelog
discipline" below) - it has its own mock/example release entries clearly
marked with a banner and a `MOCK DATA BELOW` comment; leave them until real
entries have shipped and replaced them, don't delete them just to tidy up.

### MDX re-parses multi-line JSX children as markdown - in three different ways

The header comment in `Introduction.mdx` already warns that MDX parses a
multi-line JSX element's children as markdown flow content. What it does not
say is how many different ways that bites. All three of these shipped on
"Getting Started" simultaneously, and all three came from the same thing -
whether a value happened to be written on one line or two:

| Written across lines               | Becomes    | Symptom                                                      |
| ---------------------------------- | ---------- | ------------------------------------------------------------ |
| `1` inside a coloured circle       | `<p>`      | `.sbdocs p` colour wins over inherited white - **1.79:1**    |
| `Required` inside a badge `<span>` | `<p>`      | 18px pill renders as a **60px block**                        |
| `- all components are fully typed` | `<ul><li>` | leading `- ` read as a list marker: **bullet + 56px header** |

The colour one is the least obvious: Storybook's `.sbdocs p { color: #2E3438 }`
beats any `color` the element was inheriting, because an explicit rule
outranks inheritance.

That is what happened to the "Getting Started" step markers. Written this way,
the number is wrapped and turns dark:

```jsx
<div style={{ background: '#6d28d9', color: '#fff' }}>1</div>
```

Written inline, it stays a text node and inherits white:

```jsx
<div style={{ background: '#6d28d9', color: '#fff' }}>1</div>
```

Three copies of the same marker, two written the first way and one the second,
so steps 1 and 2 rendered at **1.79:1** and step 3 at 7.10:1. Valid markup, no
warning, and invisible unless you look at all three together.

The fix is not to write it inline - that only works until someone's formatter
wraps the line. That is not hypothetical: after the step markers were fixed,
a single `prettier --write` on `Introduction.mdx` expanded the `<span>` behind
the "REQUIRED" badge across lines and reintroduced the identical bug, turning
an 18px pill into a 60px block. The same run also collapsed the leading spaces
inside the code-sample string literals (`'  return ('` came back as
`' return ('`), mangling the indentation of every rendered snippet.

**Move anything with nested JSX or significant whitespace into a `.tsx`
file.** There, prettier formats it as TypeScript, JSX children are never
re-parsed as markdown, and string contents are left alone. The `.mdx` keeps
prose and section structure only. `GuideHero`, `GuideStep`, `GuideSteps`,
`GuideCallout`, `GuideCode` and `GuideNote` in `src/guide-page.docs.tsx`, plus
the page-specific `src/Introduction.docs.tsx`, exist for exactly this.

**Pass short labels as props, not children.** `GuideNote` takes `title` and
`hint` as strings precisely so the header cannot be markdown-parsed; only the
body copy stays as children, where a `<p>` is what you want anyway. Its `hint`
separator is a middot rather than `- ` so it cannot read as a list marker even
if the markup moves back into markdown.

Watch for the same shape anywhere a guide page sets `color` on a container and
lets children inherit it - a coloured badge, a callout header, a dark panel -
or puts a short label beginning with `-`, `*`, `>` or a digit-dot next to a
heading.

### A timeline's last step must not draw a connector

`GuideSteps` derives `isLast` from child position and tells the final
`GuideStep` to omit its connector. It is derived rather than a `last` prop so
that inserting or reordering a step cannot strand a line - which is the state
"Getting Started" was in: the third step's connector ran the full height of
its content (**1680px**) and terminated in empty space above the next section.

### Guide pages share one hero - don't write a second one

`Welcome.mdx` and `Introduction.mdx` both render `GuideHero` from
`src/guide-page.docs.tsx`, which owns the gradient banner, the decorative
circles and the version chip. They each had their own copy, and the copies had
already drifted into rendering the _same design at two different scales_ -
title 35px vs 40px, subtitle 15px vs 17px, different padding - purely because
one was written in `rem` and the other in `px`. Nothing catches that: both
render fine in isolation, and you only see it by flipping between the two
pages.

Keep the copy distinct too. The two heroes also both opened with "A React
component library", because `Welcome` described the library and `Getting
Started` re-described it before getting to the install steps. `Welcome` says
what the library is; `Getting Started` says what _that page_ does.

### Custom JSX directly in a top-level `.mdx` page needs fixed `px` sizing, not `rem`/`em`

> **Measured correction (Storybook 10.6):** the premise below - that a Docs
> page's JSX renders in the _manager_ frame at a 16px root - **is not what
> happens now.** Probed in the browser on `Welcome`, `Getting Started` and
> `Releases`, all three render inside the **preview iframe**, where
> `global.scss`'s `html { font-size: 14px }` applies and `1rem` resolves to
> `14px`, exactly as it does in a story. Either this changed in a Storybook
> upgrade or the original diagnosis attributed a real symptom to the wrong
> cause.
>
> The fixed-px convention is kept regardless - it is unambiguous, it costs
> nothing, and a guide page has no reason to scale with a root font-size.
> But do not repeat the 16px explanation as fact, and do not treat `rem` on a
> guide page as the bug it is described as below; if something renders at the
> wrong size there, measure before concluding why.

Applies specifically to JSX written for a top-level guide page - its body, or
its `*.docs.tsx` companion (like `Releases.docs.tsx`'s
`Code`/`BumpTag`/`ReleaseCard`) - not to component stories rendered via
`<Canvas>`, which are unaffected.

Storybook's Docs page renders that JSX in the _manager_ frame, not the
_preview_ iframe where `global.scss`'s `html { font-size: 14px }` reset
actually applies - it inherits the browser/Storybook-UI default of `16px`
instead. `--spacing-*` tokens are `em` (relative to each element's own
font-size, so they're unaffected), but the 8 `--font-size-*` tokens are
`rem` (relative to the document root), so anything sized off them renders
~14% larger there than anywhere else in the library - including reused
components like `Chip`/`Pill`, which can't opt out of `rem` sizing without
changing it for every other consumer. Use fixed `px` values for anything
custom written directly in one of these pages instead; don't reuse a shared
component there if the only way to size it correctly would be a local
scale/font-size hack.

### An `.mdx` file's top-level ESM block must be plain imports only - no JSX, no directory imports

A guide page that needs its own components (`Releases.mdx`'s
`Code`/`BumpTag`/`VersionTag`/`CategoryLabel`/`ReleaseCard`) declares them in a
sibling `Component.docs.tsx` (`src/Releases.docs.tsx`) and imports them, rather
than defining them as `export const`s inside the `.mdx`. Two independent editor
diagnostics, both verified against the parsers involved, force this - and
neither shows up in `npm run build-storybook`, which compiles the same file
without complaint:

1. **No JSX in the ESM block.** The MDX language server recovers from a
   half-written document by re-parsing its top-level import/export block with
   `acorn-loose`, which cannot be extended with `acorn-jsx`
   (`LooseParser.extend(jsx())` throws `this.curContext is not a function`, see
   [mdx-analyzer#267](https://github.com/mdx-js/mdx-analyzer/issues/267)). So
   any JSX there reports `Could not parse import/exports with acorn-loose` at
   the first `<`, and - because the whole block then fails to parse - every
   import in it reports as unresolved too. Those "cannot resolve" errors are a
   symptom, not a second problem: fix the JSX and they disappear.
2. **No directory imports.** `import { Divider } from './components/Divider'`
   resolves through that folder's `index.ts`, which the same language server
   doesn't do - it doesn't apply this project's `moduleResolution: bundler`.
   Extension substitution _does_ work, so `'./Releases.docs'` is fine while
   `'./components/Divider'` is not. Re-export or wrap the component in the
   `.docs.tsx` file (`ReleaseDivider`) instead of importing it in the `.mdx`.

`*.docs.tsx` is excluded from `BUILD_INPUTS` in both `release-needed.js` and
`check-changelog.js` for the same reason `.mdx` and `.stories.tsx` are: it is
Storybook-only and never reaches `dist/`, so editing one must not flag a
release. Keep the two lists in sync.

Two smaller, related notes:

- Put `<Meta title="..." />` _after_ every import, immediately before the
  first prose content - nothing but imports may sit above it.
- A component whose sole top-level return value is a shorthand fragment
  (`<>...</>`) can trip the same class of tooling with a misleading
  "unexpected closing slash" error. Use a real wrapping element (a `<div>`)
  in that specific position; fragments grouping children inside an array
  entry (as `ReleaseCard`'s `items` use) are fine.

If a fix here doesn't seem to stick, check whether an MDX-aware editor
extension has format-on-save enabled for `.mdx` - one observed in the wild
(the "MDX" extension by unified) repeatedly re-corrupts multi-line
`{/* ... */}` JSX comments into invalid `{/_ ... _/}`, and separately
collapses a function's closing `);`/`};` onto one line, independent of any
manual edit. Disable format-on-save for `.mdx` there before trusting further
edits to stick.

### A repeated guide-page element wraps itself - don't nest a list of them in MDX

`Releases.mdx` renders a release as a collapsed `<ReleaseCard>`, and each card
is **its own single-item `Accordion`** rather than seventeen children of one
shared `<ReleaseAccordion>`. The shared wrapper is the tidier structure and the
wrong choice here: it puts a long list of JSX elements _inside_ a multi-line JSX
element, which is the exact construct every bug in the section above came from,
and a formatter re-indenting those children is enough to change what they parse
as. The flat version also keeps the snippet `promote-changelog.js` generates
pasteable anywhere in the file, with no wrapper to land inside.

Two consequences worth copying if another guide page grows a repeated element:

- **Derive per-instance state, don't pass it.** Which card starts open is
  `version === packageVersion`, not a `defaultOpen` prop - a prop would have to
  be moved from one card to the next by hand at every release, and nothing would
  fail if it were forgotten. Same rule as the derived counts on `Welcome`.
- **One accordion per item means no single-open coordination.** That was wanted
  here (two releases can be compared); check it is wanted before copying.

Also note what collapsing content costs: a closed panel is still in the DOM,
clipped to zero height, so browser find-in-page matches text nobody can see.
Acceptable on `Releases` because the trigger rows carry the version numbers
people actually search for - but it is a real trade, not a free one.

### Guide-page styling that a pseudo-class needs goes in `.storybook/preview-docs.scss`

Guide-page JSX styles inline in its `*.docs.tsx`, and that stays the default.
`preview-docs.scss` exists only for what an inline `style` structurally cannot
express - a pseudo-class, a descendant selector - because a runtime `<style>`
element is not an option here (this library deliberately never generates one).
It is imported from `preview.ts`, so it is Storybook-only and never reaches
`dist/`.

It currently holds exactly one rule, and the reason generalises: in the
`default` `Accordion` variant an item gets a bottom border and a `:first-child`
gets a top one, and **a single-item accordion's item is always both** - so
stacking per-card accordions renders 2px between every pair. Dropping the bottom
border leaves one rule above each card, including the first, which doubles as
the separator from the intro prose. Whenever a variant's borders are written
against sibling position, check what they do when every instance is an only
child.

Don't migrate existing inline guide-page styles into this file wholesale; a
second place for the same concern is how the `GuideHero` duplication happened.

### Storybook's own CSP posture is not this library's to fix

Storybook's manager UI and `addon-docs` blocks (`<Canvas>`/`<Controls>`,
used in every component `.mdx`) run on Emotion, which injects
`<style data-emotion>` tags with no nonce support under the Vite-based
Storybook builder this project uses - a long-standing, still-open upstream
limitation (see Storybook's own GitHub discussions on `previewMainTemplate`
nonce injection being removed when the Webpack builder was dropped). Don't
attempt to chase a nonce-clean Storybook deployment; scope
`style-src 'unsafe-inline'` to wherever Storybook/Chromatic is hosted
specifically, and keep that separate from the actual CSP guidance given to
consumers of the published package (`ContentSecurityPolicy.mdx`) - the
_story preview content_ (the rendered eidos-ui components themselves) is
still held to the library's real CSP posture; only Storybook's own chrome
needs the exception.

### Stories that mutate global state need `inline: false`

A Docs page renders every story in the file into **one document**. For stories
that only draw markup that is fine; for stories that write to
`document.documentElement` it is not. Six `ThemeProvider` stories on the
`ThemeEditor` docs page produced a page where the `Playground` story showed the
`Controlled` story's teal primary and the `ContrastDiagnostics` story's
periwinkle success - last writer wins, globally.

Set it at the **meta** level so a story added later inherits isolation instead
of quietly contaminating its neighbours:

```ts
parameters: {
  docs: { story: { inline: false, height: '720px' } },
},
```

Each story then gets its own iframe and therefore its own `documentElement`.
Cost: the iframe is narrower than the Docs container, so responsive components
render their stacked layout there. The individual story view is unaffected.

### A large "Examples"-style story can freeze the Storybook tab under React 19

Storybook's Docs "Show code" panel walks the _entire rendered element tree_
of a story with a bundled `react-element-to-jsx-string` that reads
`element.ref` - a property React 19 explicitly warns on and will remove
(bundled inside Storybook's own build, not a resolvable dependency we can
`overrides`; see [storybook#31480](https://github.com/storybookjs/storybook/issues/31480)).
On a small tree that's just a harmless console warning. On `Menu`'s
`Examples` story - 7 nested Menu/Dropdown/Button trees rendered at once,
with icons, nested submenus, and a custom component item - walking and
warning on every node in a tree that deep is expensive enough to actually
freeze the tab, not just log noise.

**Size is not the only trigger.** `Timeline`'s `RichContent` story froze the
Docs tab with a _small_ tree: two items, but each `description` was JSX nested
inside an array-of-objects prop (`items={[{ description: <>…<Chip/>…</> }]}`) -
a fragment holding a list and components, several levels down. Removing that
one canvas made the page responsive again; a static source string fixed it
with the canvas kept. The same file's `icon: <Upload />` items were fine, so
the cost appears to come from rich JSX _inside object props_, not JSX in props
as such. The story passed `test:stories`, because that renders each story
alone - only the Docs page runs the source serializer, so **no automated check
covers this**. After adding a story with JSX in data props, open its Docs page.

If a component's `Examples`-style story stacks many real instances (not
just a handful), or passes rich JSX through data props, give it an explicit
static source string instead of letting Storybook derive one dynamically:

```ts
parameters: {
  docs: { source: { type: 'code', code: `...` } },
},
```

This is the fix that actually matters - `parameters.docs.canvas.sourceState
= 'none'` alone only hides the _panel's UI_, it does not skip Storybook
computing the source, which happens eagerly during the initial render
regardless of whether the panel is ever shown. On a heavy tree that eager
computation is exactly what freezes the tab, so hiding the panel alone does
nothing for this. An explicit `code` string sidesteps dynamic tree
serialization entirely - Storybook just displays that text.

Don't apply this project-wide; most stories are small enough that the
underlying bug never manifests as more than a console warning, and letting
Storybook derive source dynamically (so it can't drift from the real story)
is more valuable there than the (currently theoretical) freeze risk.

---

## Testing

`npm test` runs two Vitest projects, both in a real chromium via
`@vitest/browser-playwright`.

| Project     | What                                       | Run it                 |
| ----------- | ------------------------------------------ | ---------------------- |
| `unit`      | `src/**/*.test.ts` - pure logic            | `npm run test:unit`    |
| `storybook` | every story, plus `play` functions and axe | `npm run test:stories` |

### Which kind of test to write

- **`play` function in the story** for anything you can only observe by
  driving the component: keyboard, focus order, ARIA state, open/close, error
  wiring. It runs in a real browser and shows up in the Interactions panel, so
  it doubles as documentation. Storybook 10 supplies `canvas` and `userEvent`
  as parameters - no `within(canvasElement)` boilerplate - and `expect` comes
  from `storybook/test`.
- **A `*.test.ts` beside the module** for pure logic a story cannot reach:
  the colour maths, token emission, class-name helpers. A browser story is the
  wrong tool for a function that takes a hex and returns a number.

### Write the test before the refactor

Characterisation first: capture the behaviour that is currently _correct_,
confirm it passes **before** touching the component, then refactor. The point
is not coverage, it is that the diff is provably behaviour-preserving. This
matters most for `Combobox`, which `Select`, `TagInput` and `DataGrid`'s
filters all build on.

### Coverage from the Storybook widget can OOM `storybook dev`

Running the full suite with **Coverage** ticked in the testing widget could
kill the dev server outright:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

It looks alarming and is easy to misread as a broken test. It is neither:

- The tests **pass** first (465 passed, 2 skipped). The crash lands ~140s in,
  on a run that finished testing at ~38s.
- The stack is almost entirely `JsonStringify` -> `SerializeArrayLikeSlow`,
  i.e. the v8 coverage report being serialized - not any component.
- `npx vitest run --coverage` over the same suite completes in ~73s with a
  1.5 GB peak. Same stories, same config, no crash.

That "CLI fine, dev UI dies" signature is upstream
(storybookjs/storybook#35508). `scripts/storybook.js` raises the heap to
8 GB as a mitigation, reusing `run-with-heap.js` - the same helper the build
needs for tsup's declaration step.

If it still dies, raise the heap or get coverage from the CLI instead
(`npm test -- --coverage`). And note Storybook's docs say coverage is not
calculated while watch mode is active, so the widget's number always comes
from a non-watch run.

**Do not chase this into the component code.** A plausible-looking theory -
that the `play` functions pass DOM elements to `expect` and the instrumenter
serializes the whole tree - is wrong: Storybook's instrumenter reduces an
`HTMLElement` to `{ prefix, localName, id, classNames, innerText }` before it
ever reaches the channel.

### The unit project runs in a browser on purpose

Some of this logic is only meaningful against a real DOM (`isFontAvailable`
measures text on a canvas), and a second environment would invite the class of
bug where something passes in Node and fails in a browser. Chromium is already
being started for the story project. Adding jsdom to avoid it would mean a new
dependency _and_ a third set of rendering semantics.

`screenshotFailures` is off for `unit` - a screenshot of a blank page says
nothing about why a contrast ratio was wrong, and it litters `src/` with
`__screenshots__` directories.

### What the existing unit tests are actually protecting

Not coverage for its own sake. Each one pins a claim that is invisible at
runtime:

- **Every preset base clears 4.5:1 on white.** `ThemeProvider.tokens.ts`
  asserts this in prose and the conformance report repeats it. Measured worst
  case is `warning` at **5.00** - about half a point of headroom, so a palette
  tweak could cross the line with nothing else noticing.
- **`buildRamp` stays monotonic.** A ramp that stops descending still renders;
  it just makes hover states jump the wrong way.
- **`diffFromDefault({})` is empty.** This is what makes an unthemed
  `ThemeProvider` a genuine no-op. If it ever returns entries, every consumer
  silently gains inline custom properties shadowing their own stylesheet.
- **`deriveDark` lightens a near-black base.** Construct the test colour from
  a known lightness rather than hand-picking a hex - the threshold is
  `DARK_DELTA * 1.5` (0.129) and is not exported, so `#080b12` _looks_
  near-black but sits at 0.150 and takes the other branch.
- **`fontScale` out of range falls back, it does not clamp.** Silently turning
  a requested 2.0 into 1.25 gives the caller a layout they did not ask for and
  no signal.

(`dualModifier`, which emitted the camelCase `--fullWidth`/`--hideScrollbar`
class aliases, was removed in 4.0 as its changelog entry promised. Modifiers
are kebab-case only; do not reintroduce a second spelling.)

---

## Dev example app rules

`dev/` is NOT a per-component showcase. It is **Meridian**, a single realistic
example app (a fictional B2B support desk). The per-component reference lives in
Storybook and only in Storybook.

> **Do not add a showcase page per component.** The old `dev/design-system/`
> tree was one file per component and duplicated the stories almost exactly. It
> was deleted deliberately. Adding a new component does NOT require any change
> under `dev/`.

### Structure

```
dev/
  index.html        Vite entry (the Vite root is `dev`, see vite.dev.config.ts)
  main.tsx          providers: Snackbar, Dropdown, Router, Auth
  App.tsx           route table + the public/authenticated guard
  app.scss          layout and chrome only, using the library's CSS variables
  api/              simulated transport: latency, deterministic failures, seeded data
  auth/             fake OTP sign-in (demo only - not an auth pattern to copy)
  routes/           minimal hash router (no routing dependency)
  layouts/          public-layout, admin-layout (sidebar/topbar/command palette)
  lib/              small shared hooks (use-async)
  pages/            one file per screen
```

### Rules

- Import from the public entry points (`eidos-ui`, `eidos-ui/styles`),
  never via relative `../../src/...` paths. Both the Vite alias
  (`vite.dev.config.ts`) and the tsconfig `paths` entry map these to `src/`, so
  a type or value missing from the root barrel breaks the dev server
  immediately. This is intentional dogfooding - keep it that way.
- File names are kebab-case; components inside are named exports.
- Styling in `app.scss` covers layout/chrome only and must use the library's CSS
  custom properties (`--spacing-md`, `--gray-200`, …) rather than hardcoded values.
- Use a component only where the domain genuinely calls for it. Do not add a
  screen just to demonstrate a component.
- Failures must stay deterministic: a domain rule (locked ticket, last active
  admin) or the "Force API errors" switch. Never add random failure injection.
- `Button` has no `fullWidth` prop - use the `.mrd-block` utility class.
- Em-dashes (`—`) are forbidden to be used. Use hyphens (`-`) instead.

### Verifying dev changes

`npm run lint` runs with `--max-warnings 0`, so `react-hooks/exhaustive-deps`
warnings fail the build. Pass memoized callbacks to `useAsync` instead of
dependency arrays.

---

## File organization

- Types: `Component.types.ts`
- Component: `Component.component.tsx`
- Styles: `Component.scss`
- Stories: `Component.stories.tsx`
- Docs: `Component.mdx`
- Barrel: `index.ts` (re-exports component + types)

When creating a new component, always wire it into:

1. `src/styles/index.scss` (SCSS import)
2. `src/index.ts` (value export **and** type export - the root barrel must
   re-export every public type from the component's own `index.ts`, not just the
   component itself; consumers importing from `eidos-ui` cannot reach
   types that only the deep entry point exports)
3. Storybook (`Component.stories.tsx` + `Component.mdx`)

There is deliberately no dev-showcase step - see "Dev example app rules" above.

---

## Documentation freshness

Several files **duplicate** facts that live in code. Duplicated facts rot, and
no compiler reads prose, so this has to be checked deliberately. Real examples
found rotting in place:

- `GETTING_STARTED.md` advertised "49 components" when there were 57, and its
  inventory table omitted `Footer`, `Header`, `Navigation`, `PageLayout`,
  `Pill`, `Toolbar` and the entire `Theming` group.
- `README.md`'s theming example set `--primary-color: #6366f1` - the value
  replaced in 3.0.0 - so anyone copying it installed the old, contrast-failing
  palette.
- `README.md` never listed `TableFiltersDropdown` at all.

### What is enforced

`npm run check:docs` (`scripts/check-docs.js`, and a `docs` step in
`npm run verify`) checks `README.md` and `GETTING_STARTED.md` for:

1. **Every component with a story is mentioned**, and every Storybook group
   name appears. The source of truth is the `title` in each
   `*.stories.tsx` - the same string that builds the sidebar.
2. **Hard-coded component counts** match the number of directories in
   `src/components`.
3. **Every `--token:` the docs set still exists** in `variables.scss`, scoped
   to token families the library owns so consumer-side examples like
   `--app-header: 1100` in the z-index guidance are not flagged.

It runs in `verify`, not `release:preflight`, for the same reason `prettier`
does: these files never reach `dist/`, so a stale sentence must not be able to
block a release.

Two limits worth knowing rather than trusting blindly:

- Check 1 tests **presence anywhere in the file**, not membership of the right
  list. A component renamed in the table but still mentioned in prose passes.
- **Token _values_ are deliberately not compared.** It was tried and removed:
  nothing structurally separates "here are the defaults" from "override with
  your own brand colour" - both are `:root` blocks assigning real token names -
  so comparing values flags every legitimate override example.

### What is convention

Because of that second limit: **when a palette value changes, grep the docs for
the old hex.** `grep -rn '6366f1' README.md GETTING_STARTED.md src/*.mdx`. This
is the one part that cannot be automated precisely.

And when adding a component, the docs that need touching are:

| File                            | Holds                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `README.md`                     | component table (grouped as Storybook groups), Features table, Theming section |
| `GETTING_STARTED.md`            | intro count, providers section, inventory table                                |
| `src/Introduction.mdx`          | install/import steps                                                           |
| `src/ContentSecurityPolicy.mdx` | anything that adds an inline style, a `<style>`, or a subresource fetch        |
| `CHANGELOG.md`                  | see "Changelog discipline"                                                     |

`src/Releases.mdx` is release-time only.

## Build & packaging

### Published package

- Package name: `eidos-ui`
- Registry: npmjs.com (public)
- Current version: do not record it here - this line went stale twice. Read the
  source of truth instead: `node -p "require('./package.json').version"` for
  local, `npm view eidos-ui version` for what is actually published.
  They differing means a release was bumped but never published.

### Build system

- Bundler: **tsup** with esbuild under the hood
- `npm run build` = `node scripts/build.js`, which runs tsup and then
  `scripts/build-styles.js` (it exists to raise the heap limit - see below)
  - tsup produces ESM + CJS + DTS for one entry point per directory in
    `src/components` (58 at the time of writing; `ls -d src/components/*/ | wc -l`)
  - `build-styles.js` compiles `src/styles/index.scss` → `dist/index.css` and generates `dist/index.css.d.ts`

### The declaration step has a heap ceiling that grows with the component count

`npm run build` goes through `scripts/build.js`, which exists **only** to raise
Node's heap limit (`HEAP_MB`, currently 8192) for tsup's `dts` step. That step
bundles the type graph for every entry point in one worker thread, so its memory
use scales with the number of components. At 49 entries it finished in ~22s; at
51 it died with `ERR_WORKER_OUT_OF_MEMORY`. Those two numbers are the original
incident, not a current ceiling - with `HEAP_MB` raised it builds 58 entries
fine. Expect to raise it again rather than to stay under some entry count.

The failure is deliberately misleading and worth recognising: it happens **after
the ESM and CJS bundles report success**, so it reads as a type error in
whatever was added last. It is not - both of the entries that "caused" it built
in 1-2.5s in isolation. Confirm by building `HEAD` in a throwaway worktree
(`git worktree add /tmp/x HEAD`, symlink `node_modules`) before hunting for a
type problem.

**When it recurs, raise `HEAP_MB`.** The growth is inherent.

A bare `NODE_OPTIONS=... tsup` prefix in the npm script would be shorter, but
that syntax is invalid in Windows shells, hence the wrapper.

### Bundled fonts (`eidos-ui/fonts`)

A separate, opt-in entry point holding `@font-face` rules for Plus Jakarta Sans
and JetBrains Mono. Things to keep straight:

- **It must stay out of `index.css`.** These are the only rules in the library
  that fetch a subresource. Folding them in would make every consumer inherit a
  `font-src` requirement and would falsify the unqualified claim in
  `ContentSecurityPolicy.mdx` that the stylesheet needs no allowance. `grep -c
'url(' dist/index.css` must stay `0`.
- **`@fontsource-variable/*` are devDependencies, not dependencies.**
  `scripts/build-styles.js` copies the `.woff2` files into `dist/fonts/`, so
  they ship inside the tarball and consumers never install the upstream
  packages. Because of that, a version bump there _does_ change the tarball -
  `release-needed.js` special-cases it as the one devDependency that reaches
  `dist/`.
- **Upstream filenames are preserved on purpose.** `fonts.scss` takes the font
  directory as a Sass variable (`$jakarta-dir`, `$mono-dir`) so Storybook and
  `dev/` can point it at `node_modules` while the published CSS points at
  `./fonts`. Renaming the files would force a second copy of the `@font-face`
  rules that could drift.
- **Family names must match the tokens**, not upstream. `@fontsource-variable`
  declares `'Plus Jakarta Sans Variable'`; `--font-family-primary` says
  `'Plus Jakarta Sans'`. This is why the rules are written out rather than
  re-exported.
- **The OFL licences must travel with the font data** - both families are
  OFL-1.1, which permits redistribution on that condition. They are copied to
  `dist/fonts/*-OFL.txt`.
- `build-styles.js` **fails the build** if `fonts.scss` references a file that
  was not copied, or vice versa. A missing file would otherwise just fall back
  to the next family in the stack - silently, which is the exact failure this
  entry point exists to prevent.

### Entry points & code splitting

- tsup discovers component dirs from `src/components/*/` dynamically and produces one entry per component (PascalCase → kebab-case naming: `ButtonGroup` → `dist/button-group/`)
- `splitting: true` extracts shared code into chunk files (ESM only; CJS is per-entry standalone)
- `sideEffects: ["dist/index.css", "dist/index.css.d.ts"]` is set for bundler tree-shaking

### Consumer import patterns

```ts
import { Button } from 'eidos-ui'; // root barrel - tree-shaken
import { Button } from 'eidos-ui/button'; // deep import - only Button chunk loaded
import 'eidos-ui/styles'; // styles (once, in app entry)
```

### Externalized dependencies

The following are NOT bundled - consumers must have them:

- `react` / `react-dom` (peer deps)
- `lucide-react` (regular dep - auto-installed with the package)

Everything else (dayjs, @dnd-kit, @tanstack/react-virtual) is bundled into the component chunks.

### Does a change need publishing?

Only `dist/` ships (`files: ["dist"]`). Run `npm run release:needed` - it
compares the last tag against HEAD and reports whether anything reaches the
build output.

Needs a release: `src/**`, `tsup.config.ts`, `scripts/build-styles.js`, and the
consumer-facing `package.json` fields (`exports`, `main`, `types`, `files`,
`sideEffects`, `dependencies`, `peerDependencies`).

Push only: `dev/**`, `.storybook/**`, `.github/**`, docs, `.devin/**`, tsconfig,
eslint config, and `package.json` `scripts`/`devDependencies`.

`.mdx` and `.stories.tsx` sit under `src/` but are Storybook-only and never
reach the tarball - do not treat them as releasable.

### Changelog discipline (write it as you go, not at release time)

`CHANGELOG.md` has a standing `## [Unreleased]` section at the top. Whenever
a change is made that "needs a release" per the check above (touches `src/**`,
`tsup.config.ts`, `scripts/build-styles.js`, or the consumer-facing
`package.json` fields) - add or update a bullet under it **in the same
turn/session as the change itself**, not retroactively when someone remembers
to cut a release. Use the standard [Keep a Changelog](https://keepachangelog.com/)
subheadings, only adding the ones actually needed:

```md
## [Unreleased]

### Added

- `Navigation` component - collapsible sidebar rail with responsive auto-collapse.

### Fixed

- `Toolbar` no longer clips its breadcrumb trail on narrow viewports.
```

- **Added** → implies `minor` at cut time. **Fixed**/**Changed**
  (non-breaking) → `patch`. Anything breaking → start that bullet with the
  literal marker `**Breaking**:` and release `major`, regardless of what else
  is queued. The wording isn't just a style preference: `scripts/changelog-bump.js`
  greps for this exact marker (case-insensitively), `release.js` refuses a
  too-small bump before preflight runs, and `promote-changelog.js` aborts
  `npm version` itself if the bump that actually ran is too small.

#### What actually counts as breaking

The test is **"must a consumer change code to upgrade?"** - semver governs the
public API, not the rendering. For this library the public API is the exports,
props and types, plus the `--token` names and the documented `eidos-*` class
names, since `README.md` presents both as things to target.

| Change                                                 | Breaking     |
| ------------------------------------------------------ | ------------ |
| Removing or renaming an export, prop or type           | **yes**      |
| Narrowing a prop's accepted values                     | **yes**      |
| Removing or renaming a `--token` or an `eidos-*` class | **yes**      |
| Changing a token's **value**                           | no           |
| Restyling a component                                  | no           |
| Fixing a contrast or layout bug                        | no - `patch` |

Restyling and re-valuing tokens are the tempting cases, and the honest answer
for both is no: a consumer's code still compiles, their overrides still apply
to the same selectors, and there is nothing to refactor. Add a short note under
the entry that visual snapshots will differ, and keep the bump at `patch`.

Do not reach for `**Breaking**:` as a way to _signal_ "this looks different".
It is a legitimate convention in some design systems, but it is not what semver
means and it is not what this repo's tooling treats it as - the marker forces a
major. 3.0.0's palette darkening was marked this way and, judged against the
table above, should have been a minor: it added tokens and changed values, and
required nothing of consumers. Don't cite it as precedent.

- **Keep every entry to one line, one sentence.** No walls of text, no
  restating the full backstory of _why_ something changed (that lives in
  the commit/PR, not the changelog) - just what changed, from a consumer's
  point of view. If an entry needs more than one sentence to explain, it's
  a sign to split it into multiple short bullets, not to write a paragraph.
- If `[Unreleased]` already has entries from earlier in the session (or from
  a previous uncut session), a new change amends the existing bullet list -
  never overwrite what's there, and never remove another entry just because
  it's unrelated to the current task.
- Internal-only changes (`dev/**`, `.storybook/**`, `.github/**`, docs-only
  `.mdx`/`.stories.tsx` edits, tooling) do not need a changelog entry unless
  they're genuinely consumer-relevant.
- At actual release time, rename `## [Unreleased]` to `## [x.y.z] - <date>`
  (matching whatever `npm version` just produced) with a fresh, empty
  `## [Unreleased]` left above it for the next round, and copy the same
  entries into `src/Releases.mdx` under a matching heading (same one-line-
  per-entry rule applies there) - see that file's own header note for why
  both exist.

**This is enforced, not just a convention to remember**:
`scripts/check-changelog.js` (run from `release:preflight`, same as
`check-barrel-exports.js`) diffs the working tree against the last git tag's
build-affecting files (the same list `release-needed.js` uses) and fails the
release outright if anything reaches `dist/` but `[Unreleased]` is still
empty. It only checks that _something_ was written, not wording/length -
run `node scripts/check-changelog.js` standalone to check without running
the full preflight.

### Release workflow

```bash
npm run verify              # lint, typecheck, prettier, build (+ Storybook if .mdx changed)
npm run release             # prints the bump your changelog implies, then stops
npm run release -- minor    # patch | minor | major
```

`verify` is the one command to run while working and before releasing - it
covers the two things `release:preflight` does not (`prettier:check`, and
`build-storybook`, which is the only thing in the toolchain that parses `.mdx`).
It is deliberately separate from the release path: a mis-formatted file or a
broken docs page affects neither `dist/` nor consumers, so it must not be able
to block a release on its own.

`npm run release` with no bump reports what `[Unreleased]` implies and exits
without doing anything, so the safe move is always to run it bare first.

Each script is `release:preflight && npm version <bump>`. **Nothing publishes
locally** - `npm version`'s `postversion` hook pushes the tag, and the tag push
triggers `.github/workflows/publish.yml`, which runs `npm stage publish` in CI
(triggering `prepublishOnly: npm run build` there).

**A release is a two-step process. CI cannot make a version live.** The workflow
only stages it; the final step is yours:

```bash
npm run release -- approve             # resolves the stage id, prompts for 2FA
```

That looks up the queue via `npm stage list --json`, matches the entry against
`package.json`'s version, and hands the id to `npm stage approve` - so there is
no UUID to copy by hand. It refuses rather than guessing if nothing is staged or
if what's staged doesn't match the current version.

Until approved the version sits in the stage queue and is not installable.
`npm stage view`/`download <stage-id>` inspect it, `npm stage reject <stage-id>`
discards it, and npmjs.com's package page can approve it too.

Two gotchas, both hit on the first real release:

- **Raw `npm stage approve` takes the stage id, not a package spec.** Passing a
  spec such as `eidos-ui@1.0.2` fails with "stage-id must be a valid UUID" -
  which is why `release -- approve` exists. The workflow also prints the id in
  its summary.
- **`npm stage` needs npm >= 11.15.0 locally**, not just in CI. Node 22.19 ships
  npm 10.8, where the subcommand does not exist at all ("Unknown command").
  Note that `npm@latest` is now 12.x and requires a newer Node than 22.19, so on
  an older Node 22 install `npm@11` specifically rather than `npm@latest`.

Publishing uses **npm trusted publishing (OIDC)**: npm trusts that one workflow
file in this one repository, configured under the package's "Trusted Publisher"
settings on npmjs.com. Consequences worth knowing:

- There is **no npm token** anywhere - not on any machine, not in GitHub
  secrets. Nothing to rotate or leak.
- The trusted publisher is deliberately configured **stage-only**: `npm publish`
  from CI is rejected by the registry, only `npm stage publish` is accepted. This
  guards a threat a local pre-flight cannot - a compromised workflow, action or
  build dependency shipping a version to consumers unattended. Staging needs no
  2FA (so CI stays non-interactive); the approval is where the 2FA lands.
- **Provenance attestations are generated automatically** in this mode. Do not
  add `--provenance`; it is redundant here.
- Trusted publishing needs **npm >= 11.5.1** and `npm stage` needs **>= 11.15.0**,
  both newer than the npm bundled with Node 22 (10.x). The publish workflow
  upgrades npm explicitly, because the trusted-publishing failure mode is quiet:
  OIDC just isn't detected and npm falls back to looking for a token.
- Provenance requires the source repo to be **public** and `package.json`'s
  `repository` to match it case-sensitively.
- If the workflow file is ever renamed, the trusted publisher config on
  npmjs.com must be updated to match, or publishes start failing.
- npmjs.com → package settings → "Publishing access" is set to require 2FA and
  **disallow bypass-2FA tokens**. Bypass tokens only existed to let CI publish
  without a human; OIDC replaces that need, so allowing them would be strictly
  extra attack surface.

`release:preflight` (`scripts/preflight-release.js` + lint/typecheck/build)
runs BEFORE the bump and checks a clean tree, barrel exports and the changelog.
It exists because `npm version` commits and tags immediately and is never rolled
back - a failed publish otherwise strands a version that is tagged in git but
absent from the registry (this happened to 3.1.0).

**If the release dies on the `npm version` commit itself, check for empty-valued
signing keys in `~/.gitconfig` before anything else.** Commits are SSH-signed
here, and git validates `gpg.format` on _every_ config entry it parses - so a
single `gpg.format = ` (empty) aborts every commit with
`invalid value for 'gpg.format': ''`, including the one `npm version` makes
mid-release, leaving the version bumped but uncommitted and untagged. A GUI
client re-adds those empties periodically; it has happened at least three times.

```bash
grep -nE '=[[:space:]]*$' ~/.gitconfig   # must print nothing
```

Do **not** diagnose this with `git config --get gpg.format`. That returns the
last-wins value, so it happily reports `ssh` while a broken empty entry earlier
in the file is what git is actually choking on - which is exactly how this got
misdiagnosed once already. `git config --show-origin --get-all <key>` lists
every occurrence with the file it came from, and the `grep` above is faster.

**The override does not save you, and this is worth being precise about because
it reads as though it should.** `~/.gitconfig-personal` is pulled in by an
`includeIf` that sits _below_ the empty entries, so `gpg.format` and
`user.signingKey` resolve to real values - and git still aborts the commit,
naming the losing entry: `bad config variable 'gpg.format' in file
'~/.gitconfig' at line 8`. Reading the value succeeds; signing with it does not.
Do not "prove" it harmless with `git config --get`, and do not prove it with a
throwaway commit outside `~/Documents/Repositories/Personal/` either - the
`includeIf` will not match there, `commit.gpgsign` never turns on, and nothing
is signed at all. Both mistakes were made, in that order, and between them they
cost a stranded 3.6.2.

**`preflight-release.js` checks this with `--get-all`, and had to be changed to.**
It used `--get`, which is why 3.6.2 stranded _with the guard passing_: it cleared
`gpg.format` and `user.signingKey` on the strength of the overrides and reported
only the two keys that had none. The script's own header documents how to
re-verify that check against a config reproducing the shape.

Fix with `git config --file <origin> --unset <key>`, using the file the
`--show-origin` output names - `--global` misses anything an `includeIf` pulled
in. The real values live in `~/.gitconfig-personal`, so removing the empties from
`~/.gitconfig` loses nothing.

`chmod 444 ~/.gitconfig` is not a fix. A GUI client replaces the file rather
than appending to it, so it re-adds the empties regardless; all the read-only bit
does is make `git config --unset` fail with a lock error when you try to repair
it. That turned one failed release into two.

It deliberately no longer
checks npm auth or package ownership: there is no local npm credential to
validate now that publishing is OIDC-based in CI, so those checks would fail on
a perfectly releasable tree.

`preflight-release.js` also runs `scripts/check-barrel-exports.js`, which diffs
every component's own `index.ts` exports against the root barrel
(`src/index.ts`) and fails the release if anything is missing. This is the
enforcement for the "root barrel must re-export every public type" rule above -
`ComboboxOption` shipped missing from the root barrel in 3.0.0 because nothing
checked for this before. Run it standalone with
`node scripts/check-barrel-exports.js`.

**If the publish workflow fails after the bump, re-run that workflow run from
the Actions tab. Never re-run `release:*`** - that bumps again and strands
another version. Note that a version cannot be staged twice: staged versions
share the same semver index as published ones, so re-running after a _successful_
stage fails on the duplicate. Approve or reject the pending one instead.

A `postversion` script (`git push --follow-tags`) pushes automatically -
`npm version` runs it right after creating the commit+tag. That tag push is now
the publish trigger rather than something that merely races ahead of a local
`npm publish`, so the old warning has become the mechanism: the tag still lands
on GitHub before the registry has the version, and "tag exists on GitHub" still
does not imply "published successfully" - check the Publish workflow run.

The workflow re-checks that the tag matches `package.json`'s version before
publishing. `npm version` always sets both together, so a mismatch means a
hand-edited version or a manually pushed tag - worth catching before it reaches
the registry, where a published version can never be replaced.

A `version` script (`scripts/promote-changelog.js`) also runs automatically,
earlier in the same `npm version` lifecycle - after the version is bumped in
`package.json`, but before the commit/tag are created. It renames
`## [Unreleased]` to `## [x.y.z] - <today>` in `CHANGELOG.md` and stages the
result, so the changelog promotion lands in the _same_ commit as the version
bump instead of a separate manual one afterward. It also **aborts the whole
`npm version` call** (nothing gets committed or tagged) if the bump run is
smaller than what `[Unreleased]` implies: a literal `**Breaking**:` marker
requires `major`, checked first since it overrides everything else; an
`### Added` entry with no breaking marker requires at least `minor`. It does
not touch `src/Releases.mdx`
(generating JSX programmatically was judged too fragile after repeated MDX
parsing issues while building that file by hand) - it prints a ready-to-paste
`<ReleaseCard>` snippet to the terminal instead; copy it in manually.

### Dependency constraints

- **TypeScript is held at `^6.0.x`** - `@typescript-eslint` peer dep requires `<6.1.0`, blocking TS 7.x. Check each time `@typescript-eslint` is updated.
- tsup has a low-severity esbuild CVE (Windows dev server only) - does not apply to this project (macOS + Vite for dev). Safe to ignore until tsup publishes a fix.

## Git

**Never run `git commit` or `git push`.** The user commits manually.
`git add` and `git diff`/`git status` for inspection are fine.
When work is complete, summarise the changes and stop.
