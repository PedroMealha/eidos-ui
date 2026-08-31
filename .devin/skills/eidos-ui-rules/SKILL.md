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

| Variant | Resting appearance |
| --- | --- |
| `filled` | solid `--x-color` background, white label |
| `outlined` | transparent background, 1px `--x-color` border, `--x-color` label |
| `text` | **transparent background**, `--x-color` label, no border |

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
doesn't fit) is not a substitute for this - it only reacts to the *anchor*
side, not to the *content* size once positioned.

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
  `ContextMenu`) MUST stay above `--z-index-modal`: they are opened *from* modal
  and drawer content.
- Nested submenus use `calc(var(--z-index-dropdown) + 1)`.
- Small local values (`z-index: 1`/`3`/`10`) are fine *inside* a component's own
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

```
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as XxxStories from './Xxx.stories';

<Meta of={XxxStories} />

# ComponentName

One or two sentences describing what the component is and when to use it.

[OPTIONAL: > **Note**: one-line callout - only if genuinely useful]

## Usage

```tsx
import { ComponentName } from '@pmealha/eidos-ui';
// minimal runnable example
```

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
`Introduction.mdx` ("Getting Started") and `ContentSecurityPolicy.mdx`
("Content Security Policy") live at `src/` root, not under a component
folder, and don't follow the component `.mdx` template above - they're
prose/reference pages, picked up by the same `../src/**/*.mdx` glob in
`.storybook/main.ts`. Use a bare `<Meta title="..." />` (no component group
prefix) so they land in the ungrouped bucket at the end of the sidebar per
`storySort` in `.storybook/preview.ts`.

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
*story preview content* (the rendered eidos-ui components themselves) is
still held to the library's real CSP posture; only Storybook's own chrome
needs the exception.

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
- Import from the public entry points (`@pmealha/eidos-ui`, `@pmealha/eidos-ui/styles`),
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
   component itself; consumers importing from `@pmealha/eidos-ui` cannot reach
   types that only the deep entry point exports)
3. Storybook (`Component.stories.tsx` + `Component.mdx`)

There is deliberately no dev-showcase step - see "Dev example app rules" above.

---

## Build & packaging

### Published package
- Package name: `@pmealha/eidos-ui`
- Registry: npmjs.com (public)
- Current version: do not record it here - this line went stale twice. Read the
  source of truth instead: `node -p "require('./package.json').version"` for
  local, `npm view @pmealha/eidos-ui version` for what is actually published.
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
import { Button } from '@pmealha/eidos-ui';           // root barrel - tree-shaken
import { Button } from '@pmealha/eidos-ui/button';    // deep import - only Button chunk loaded
import '@pmealha/eidos-ui/styles';                    // styles (once, in app entry)
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

### Release workflow
```bash
npm run release:patch   # bug fixes
npm run release:minor   # new features / new components (backward-compatible)
npm run release:major   # breaking API changes
```
Each script is `release:preflight && npm version <bump> && npm publish`
(publish triggers `prepublishOnly: npm run build`).

`release:preflight` (`scripts/preflight-release.js` + lint/typecheck/build)
runs BEFORE the bump and checks npm auth, package ownership and a clean tree.
It exists because `npm version` commits and tags immediately and is never rolled
back - a failed publish otherwise strands a version that is tagged in git but
absent from the registry (this happened to 3.1.0).

`preflight-release.js` also runs `scripts/check-barrel-exports.js`, which diffs
every component's own `index.ts` exports against the root barrel
(`src/index.ts`) and fails the release if anything is missing. This is the
enforcement for the "root barrel must re-export every public type" rule above -
`ComboboxOption` shipped missing from the root barrel in 3.0.0 because nothing
checked for this before. Run it standalone with
`node scripts/check-barrel-exports.js`.

**If publish fails after the bump, run `npm publish` alone to retry. Never
re-run `release:*`** - that bumps again and strands another version.

Then `git push --follow-tags`; `npm version` only tags locally.

### Dependency constraints
- **TypeScript is held at `^6.0.x`** - `@typescript-eslint` peer dep requires `<6.1.0`, blocking TS 7.x. Check each time `@typescript-eslint` is updated.
- tsup has a low-severity esbuild CVE (Windows dev server only) - does not apply to this project (macOS + Vite for dev). Safe to ignore until tsup publishes a fix.

## Git

**Never run `git commit` or `git push`.** The user commits manually.
`git add` and `git diff`/`git status` for inspection are fine.
When work is complete, summarise the changes and stop.
