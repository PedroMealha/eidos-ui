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

Applies specifically to inline JSX written directly in a top-level guide
page's body (like `Releases.mdx`'s `Code`/`BumpTag`/`ReleaseCard`) - not to
component stories rendered via `<Canvas>`, which are unaffected.

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

### MDX top-level ESM block must be pure imports/exports, and avoid shorthand `<>...</>` as a component's sole top-level return

Two related but separate MDX gotchas hit while building `Releases.mdx`:

1. The _leading_ block of an `.mdx` file (before any prose/JSX body content)
   must be entirely `import`/`export` statements, with nothing else mixed
   in - Storybook's actual Vite/MDX pipeline tolerates a stray `<Meta />` in
   the middle of that block, but stricter MDX tooling (e.g. an editor's MDX
   language server) will not. Put `<Meta title="..." />` _after_ all
   `export const` declarations, immediately before the first prose content.
2. A component defined in that block whose sole top-level return value is a
   shorthand fragment (`<>...</>`) - not fragments used elsewhere, e.g.
   inside an array of JSX children - can trip the same class of tooling
   with a misleading "unexpected closing slash" error. Use a real wrapping
   element (a `<div>`) instead of a fragment in that specific position;
   fragments used to group multiple children within an array entry are
   fine and don't need this treatment.

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

- **Added** → implies `release:minor` at cut time. **Fixed**/**Changed**
  (non-breaking) → `release:patch`. Anything breaking → start that bullet
  with the literal marker `**Breaking**:` and `release:major`, regardless of
  what else is queued - `promote-changelog.js` greps for this exact marker
  (case-insensitively) to abort the release if the bump run doesn't match,
  so the wording isn't just a style preference here.
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
npm run release:patch   # bug fixes
npm run release:minor   # new features / new components (backward-compatible)
npm run release:major   # breaking API changes
```

Each script is `release:preflight && npm version <bump>`. **Nothing publishes
locally** - `npm version`'s `postversion` hook pushes the tag, and the tag push
triggers `.github/workflows/publish.yml`, which runs `npm stage publish` in CI
(triggering `prepublishOnly: npm run build` there).

**A release is a two-step process. CI cannot make a version live.** The workflow
only stages it; the final step is yours:

```bash
npm stage list eidos-ui                # copy the stage id (a UUID)
npm stage approve <stage-id>           # prompts for 2FA
```

(or approve it from the package page on npmjs.com). Until then the version
exists in the stage queue and is not installable. `npm stage view`/`download`
inspect it, `npm stage reject <stage-id>` discards it.

Two gotchas, both hit on the first real release:

- **`approve` takes the stage id, not a package spec.** Passing a spec such as
  `eidos-ui@1.0.2` fails with "stage-id must be a valid UUID". The workflow
  prints the id in its summary; `npm stage list` also shows it.
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
