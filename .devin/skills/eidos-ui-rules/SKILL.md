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
Avatar is the only component with a defined `AvatarSize` type; it also uses `sm | md | lg` (3 sizes, no `xs` or `xl`).

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
surfaces - 292 declarations use `color: var(--x-color)` for `outlined`/`text`
variants. A base therefore has to clear 4.5:1 against white _as text_, which is
why every base sits at ~5:1 rather than merely being "dark enough for a button".

`--x-dark` has its own pair of constraints: it must be **darker than its own
base** (it is the hover fill) and **legible as text on white** (Snackbar and
`global.scss`'s link hover use it as a foreground). Recomputing bases without
recomputing `-dark` left five of seven families with a `-dark` _lighter_ than
their new base, i.e. hovers that brightened.

A yellow-ish `warning` cannot clear 4.5:1 against white at all - that is
colour-space geometry, not tuning - so `--warning-color` is necessarily a dark
gold. Don't "fix" it back to amber.

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

Derived scales are also where a "relative" mental model quietly breaks. See the
comment on `buildRamp` - the ramp's ends have to be absolute positions on the
lightness axis, not offsets from the base, or a dark base yields `--x-50` as a
mid grey and every tint consumer in the library turns muddy at once.

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

## PrimarySection

<Canvas of={XxxStories.PrimaryStory} />
<Controls of={XxxStories.PrimaryStory} />

## OtherSection

<Canvas of={XxxStories.OtherStory} />
```

### MDX rules

- `<Controls>` appears ONLY on the first/primary story section, never on others
- Section headers use sentence case: `## With icons`, not `## WithIcons`
- Skip "Examples" grid stories if the component already has individual variant sections
- Length is proportional to complexity: Spinner ~20 lines, DataGrid ~90 lines
- Usage block must be minimal but copy-paste runnable
- When a component has a custom `.mdx`, remove `tags: ['autodocs']` from the `.stories.tsx` - Storybook does not allow both

### Interactive overlay stories

CommandPalette, Modal, Drawer, and similar overlay components must start CLOSED in stories (`useState(false)`), with a visible trigger button. Never auto-open overlays on story mount - it breaks the Docs page by popping multiple overlays simultaneously.

### Top-level guide pages (not component docs)

`Introduction.mdx` ("Getting Started"), `ContentSecurityPolicy.mdx`
("Content Security Policy"), and `Releases.mdx` ("Releases") live at `src/`
root, not under a component folder, and don't follow the component `.mdx`
template above - they're prose/reference pages, picked up by the same
`../src/**/*.mdx` glob in `.storybook/main.ts`. Use a bare `<Meta title="..." />`
(no component group prefix) so they land in the ungrouped bucket at the end
of the sidebar per `storySort` in `.storybook/preview.ts`.

`Releases.mdx` mirrors `CHANGELOG.md` in summary form (see "Changelog
discipline" below) - it has its own mock/example release entries clearly
marked with a banner and a `MOCK DATA BELOW` comment; leave them until real
entries have shipped and replaced them, don't delete them just to tidy up.

### Custom JSX directly in a top-level `.mdx` page needs fixed `px` sizing, not `rem`/`em`

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
`ThemeEditor` docs page produced a page where the `Default` story showed the
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

If a component's `Examples`-style story stacks many real instances (not
just a handful), give it an explicit static source string instead of
letting Storybook derive one dynamically:

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
- `npm run build` = `tsup && node scripts/build-styles.js`
  - tsup produces ESM + CJS + DTS for all 49 component entry points
  - `build-styles.js` compiles `src/styles/index.scss` → `dist/index.css` and generates `dist/index.css.d.ts`

### The declaration step has a heap ceiling that grows with the component count

`npm run build` goes through `scripts/build.js`, which exists **only** to raise
Node's heap limit (`HEAP_MB`, currently 8192) for tsup's `dts` step. That step
bundles the type graph for every entry point in one worker thread, so its memory
use scales with the number of components. At 49 entries it finished in ~22s; at
51 it died with `ERR_WORKER_OUT_OF_MEMORY`.

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
absent from the registry (this happened to 3.1.0). It deliberately no longer
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
