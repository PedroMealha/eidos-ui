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

### Size naming
Always: `sm | md | lg` - abbreviated forms that match the CSS variable convention (`--component-size-sm`, `--spacing-sm`, etc.).
Never use full words (`small`, `medium`, `large`) or other abbreviations.
Avatar is the only component with a defined `AvatarSize` type; it also uses `sm | md | lg` (3 sizes, no `xs` or `xl`).

### Color naming
Always: `primary | secondary | success | danger | warning | info`

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
- Current stable version: `3.0.0` (as of 2026-08-28)
- Registry: npmjs.com (public)

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

### Release workflow
```bash
npm run release:patch   # bug fixes
npm run release:minor   # new features / new components (backward-compatible)
npm run release:major   # breaking API changes
```
Each script runs `npm version <bump>` then `npm publish` (which triggers `prepublishOnly: npm run build`).

### Dependency constraints
- **TypeScript is held at `^6.0.x`** - `@typescript-eslint` peer dep requires `<6.1.0`, blocking TS 7.x. Check each time `@typescript-eslint` is updated.
- tsup has a low-severity esbuild CVE (Windows dev server only) - does not apply to this project (macOS + Vite for dev). Safe to ignore until tsup publishes a fix.

## Git

**Never run `git commit` or `git push`.** The user commits manually.
`git add` and `git diff`/`git status` for inspection are fine.
When work is complete, summarise the changes and stop.
