# Getting Started with Eidos UI

A React component library with 60 components, a consistent design language, and full TypeScript support.

## Quick commands

```bash
# Interactive component docs (recommended)
npm run storybook

# Example application (Vite) - http://localhost:5173
npm run dev

# Build the library for publishing
npm run build

# Lint
npm run lint
```

## Install

```bash
npm install eidos-ui
```

**Peer dependencies** - must be present in your project (not bundled):

```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Import the stylesheet

Once at your app root (`main.tsx` or equivalent). Without it, components render unstyled.

```ts
import 'eidos-ui/styles';
```

### Fonts (optional)

The theme names Plus Jakarta Sans and JetBrains Mono, but a font stack only
_names_ families - it cannot install them. Add this import to use the bundled
copies (~102 KB of `woff2`, latin + latin-ext):

```ts
import 'eidos-ui/fonts';
```

Without it the stacks fall back to `-apple-system` / `monospace`, which is a
perfectly reasonable look - just not the intended one.

It is a separate entry point on purpose: these are the only rules in the library
that fetch a subresource, so importing them is also opting into a `font-src`
requirement. `default-src 'self'` or `font-src 'self'` covers it; skip the
import and the stylesheet still fetches nothing at all. See
[Content Security Policy](https://github.com/PedroMealha/eidos-ui#readme) in the
Storybook docs for the full breakdown.

## Set up providers

Most components work standalone. Three involve a context provider at the app
root - one required, two optional.

### Snackbar (required for toast notifications)

```tsx
import { SnackbarProvider, SnackbarContainer } from 'eidos-ui';

function Root() {
  return (
    <SnackbarProvider>
      <App />
      <SnackbarContainer />
    </SnackbarProvider>
  );
}
```

Then call from anywhere inside the tree:

```tsx
import { useSnackbar } from 'eidos-ui';

const { showSuccess, showError, showWarning, showInfo } = useSnackbar();
showSuccess('Saved!');
```

### Dropdown (optional - grouped menus only)

Only needed when using `dropdownGroup` to ensure only one menu is open at a time.

```tsx
import { DropdownProvider, Dropdown } from 'eidos-ui';

<DropdownProvider>
  <Dropdown dropdownGroup="toolbar" trigger={<button>File</button>} content={...} />
  <Dropdown dropdownGroup="toolbar" trigger={<button>Edit</button>} content={...} />
</DropdownProvider>
```

### Theme (optional - runtime theming only)

Only needed if the palette or typography changes at runtime. Static theming
needs no provider - just override the tokens in CSS.

```tsx
import { ThemeProvider } from 'eidos-ui';

<ThemeProvider defaultTheme={{ colors: { primary: '#0ea5e9' } }}>
  <App />
</ThemeProvider>;
```

Use **one** provider, at the root. Tokens are written to
`document.documentElement` so that portaled overlays are themed too, which means
providers don't compose - two of them fight over the same element. A second one
logs a development warning.

## Icons

Many components accept icon props (`preIcon`, `posIcon`, `icon`). These use `lucide-react`, which is listed as a regular dependency and auto-installed with the package - no extra install step needed.

```tsx
import { Download, Plus } from 'lucide-react';
import { Button } from 'eidos-ui';

<Button preIcon={Download}>Export</Button>;
```

Passing components is the recommended form: only the icons you import reach your
bundle. To use string names (`preIcon="download"`), register the icons once at your
app root with `registerIcons({ Download, Plus })`, or `import 'eidos-ui/lucide-icons'`
to register the whole Lucide set. An unregistered name is treated as icon-font classes,
with a development warning if it is a single word.

## TypeScript

All components are fully typed. Import types from the main entry point:

```ts
import type { ButtonProps, InputProps, SelectOption } from 'eidos-ui';
```

## Theming

All design tokens are CSS custom properties defined on `:root`. Override them after the library stylesheet import to customise the look globally.

For a theme chosen at runtime rather than fixed at build time, use
`ThemeProvider` (above) and optionally the `ThemeEditor` panel. It derives every
shade, tint, ramp step and accessible foreground from one base colour per
family; see the Theming pages in Storybook.

```css
:root {
  /* Brand colour */
  --primary-color: #0ea5e9;
  --primary-dark: #0284c7;
  --primary-light: #7dd3fc;

  /* Border radius */
  --border-radius-md: 6px;
  --border-radius-lg: 8px;

  /* Component heights */
  --component-size-sm: 28px;
  --component-size-md: 36px;
  --component-size-lg: 44px;
}
```

### Layering (z-index)

Every overlay in the library renders through a portal on `document.body`, so
they all compete on the same plane and DOM order must never be what decides the
outcome. The layers are ordered in steps of 100 so you can slot your own
elements in between:

| Token                       | Value  | Used by                                                                                                                                 |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--z-index-drawer`          | `1200` | `Drawer`                                                                                                                                |
| `--z-index-modal`           | `1300` | `Modal`                                                                                                                                 |
| `--z-index-dropdown`        | `1400` | `Dropdown`, `Select`, `Combobox`, `Menu`, `DatePicker`, `SplitButton`, `ColorPicker`, `ContextMenu`, `Popover`, table/grid filter menus |
| `--z-index-command-palette` | `1500` | `CommandPalette`                                                                                                                        |
| `--z-index-snackbar`        | `1600` | `SnackbarContainer`                                                                                                                     |
| `--z-index-tooltip`         | `1700` | `Tooltip`                                                                                                                               |

The ordering is deliberate: anchored popups sit **above** `Modal` and `Drawer`
because they are opened _from_ modal and drawer content - a `Select` inside a
`Modal` must be able to render over it. Tooltips sit at the top because they are
small, transient and never interactive.

If your application has its own fixed chrome (a sticky header, for example),
give it a value below `--z-index-drawer` so library overlays always cover it:

```css
:root {
  --app-header: 1100; /* below 1200, so drawers and modals cover the header */
}
```

## Import patterns

```ts
// Root barrel - works with any bundler that tree-shakes
import { Button, Input, DataGrid } from 'eidos-ui';

// Deep import - explicit single-component chunk (useful in CJS / non-tree-shaking envs)
import { Button } from 'eidos-ui/button';
import { DataGrid } from 'eidos-ui/data-grid';
```

## File structure

```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.component.tsx   # Implementation
│       ├── ComponentName.types.ts        # TypeScript types
│       ├── ComponentName.scss            # Styles (CSS custom properties)
│       ├── ComponentName.stories.tsx     # Storybook stories
│       ├── ComponentName.mdx             # Storybook docs
│       └── index.ts                      # Barrel export
│
├── styles/
│   ├── variables.scss    # CSS custom properties (:root)
│   ├── mixins.scss       # Reusable SCSS mixins
│   └── index.scss        # Main styles entry (imports all component SCSS)
│
└── index.ts              # Main library entry point
```

## The example application

`npm run dev` serves **Meridian**, a fictional B2B support desk that lives in
`dev/`. It exists to exercise the library the way a real product does - a
public marketing/sign-in area, an authenticated admin area, simulated API
latency, and genuine loading, empty and error states.

- **Sign in** with any email address; the one-time code is always `123456`.
- Pick the **admin** or **member** role at sign-in to see how the app changes
  (members cannot reach the Team page).
- Flip **Force API errors** in the header to make every request fail, which is
  the quickest way to review error states. Locked tickets (`MER-1214`,
  `MER-1263`) also reject writes on purpose.

> The authentication is entirely fake and runs in the browser. It is there to
> give the app a realistic public/authenticated split - it is not an auth
> pattern to copy.

The example imports the library through its **public entry points**
(`eidos-ui` and `eidos-ui/styles`), aliased to `src/` by
`vite.dev.config.ts` and the tsconfig `paths` entry. That is deliberate: if a
component or type is missing from the root barrel, the example app fails
immediately instead of after publishing.

Per-component documentation lives in Storybook, not here. `dev/` is one
cohesive app, so adding a new component requires no changes to it.

## Adding a new component

1. Create the component directory and files (see structure above).
2. Add the SCSS import to `src/styles/index.scss`:
   ```scss
   @use '../components/NewComponent/NewComponent.scss';
   ```
3. Export from `src/index.ts`:
   ```ts
   export { NewComponent } from './components/NewComponent';
   export type { NewComponentProps } from './components/NewComponent';
   ```
   Export **every** public type the component's own `index.ts` exposes, not just
   the component. Consumers importing from `eidos-ui` cannot reach
   types that only the deep entry point re-exports.
4. Add `NewComponent.stories.tsx` and `NewComponent.mdx` so it appears in Storybook.

No change is needed under `dev/` - that folder is a single example application
(see below), not a per-component showcase.

## Component naming conventions

- TypeScript prop values: use full words for variants (`filled`, `outlined`, `text`), abbreviated for sizes (`sm`, `md`, `lg`), and full words for colours (`primary`, `secondary`, `success`, `danger`, `warning`, `info`).
- CSS classes: `eidos-` prefix (e.g. `eidos-button`, `eidos-input`).
- BEM size modifiers: `--sm`, `--md`, `--lg` (matches CSS variable convention: `--component-size-sm`).

## Publishing

### Does this change even need a release?

`files: ["dist"]` means only `dist/` is published, so a release is warranted
only when a change reaches the build output:

```bash
npm run release:needed              # compares the latest tag against HEAD
npm run release:needed -- v3.0.0    # or against a specific ref
```

| Needs a release                                                                                        | Push only                                    |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `src/**` (components, styles, `index.ts`)                                                              | `dev/**`, `.storybook/**`, `.github/**`      |
| `tsup.config.ts`, `scripts/build-styles.js`                                                            | docs, `AGENTS.md`, `.devin/**`               |
| `package.json`: `exports`, `main`, `types`, `files`, `sideEffects`, `dependencies`, `peerDependencies` | `package.json`: `scripts`, `devDependencies` |

Two deliberate subtleties: `.mdx` and `.stories.tsx` live under `src/` but are
Storybook-only and never reach the tarball, so they do not count; and
`package.json` is always in the tarball, but only the fields above change how
the package resolves or installs.

Publishing on doc-only changes inflates the version history until "what changed
in 3.4.0?" stops being answerable. Let non-shipping work ride along with the
next real change - but don't sit on a genuine `src/` fix.

### Releasing

```bash
npm run verify           # lint, typecheck, prettier, build (+ Storybook if .mdx changed)
npm run release          # reports the bump your changelog implies, then stops
npm run release -- minor # patch (fixes) | minor (new, non-breaking) | major (breaking)
```

Each script runs `release:preflight` first, then bumps the version and
publishes (which triggers `prepublishOnly: npm run build` automatically).

`release:preflight` verifies, **before** anything is bumped:

1. You are authenticated with npm (`npm whoami`).
2. Your account owns the package.
3. The working tree is clean.
4. `lint`, `typecheck` and `build` all pass.

This matters because `npm version` creates a commit **and a tag** immediately,
and nothing rolls them back if `npm publish` then fails - leaving a version that
exists in git but never reached the registry.

> **If publish fails after the version was already bumped**, run `npm publish`
> on its own to retry. Do **not** re-run `npm run release:*` - that would bump
> the version a second time and strand another one.

Afterwards, push the commit and the tag (`npm version` only tags locally):

```bash
git push --follow-tags
npm view eidos-ui version   # confirm the registry agrees
```

A logged-out publish of a scoped package fails with a misleading
`404 Not Found` rather than a permission error - the preflight catches that
case up front.

## Component inventory

60 component directories under `src/components/`, grouped exactly as the
Storybook sidebar groups them - the sidebar is generated from the `title` in
each `*.stories.tsx`, so that is the authoritative list:

| Group      | Components                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Layout     | PageLayout, Breadcrumb, Footer, Header, IdentityHeader, Navigation, Toolbar                                                              |
| Theming    | ThemeProvider, ThemeEditor                                                                                                               |
| Elements   | Avatar, Badge, Button, ButtonGroup, Card, Chip, Divider, EmptyState, Kbd, Pill, SegmentedControl, SplitButton, SplitChip                 |
| Forms      | Checkbox, ColorPicker, Combobox, FileUpload, InlineEdit, Input, NumberInput, OTPInput, Radio, Select, Slider, Switch, TagInput, Textarea |
| Navigation | Accordion, LinkProvider, Pagination, Stepper, Tabs, TreeView                                                                             |
| Overlays   | CommandPalette, ContextMenu, Drawer, Dropdown, Menu, Modal, Popover, Snackbar, Tooltip                                                   |
| Data       | Chat, CommentThread, DataGrid, DatePicker, MessageComposer, Table, TableFiltersDropdown, Timeline, VirtualList                           |
| Feedback   | Alert, Progress, Skeleton, Spinner                                                                                                       |

`TableFiltersDropdown` is exported from the `Table` directory, and `Chat`,
`CommentThread` and `MessageComposer` all live in `Conversation`, which is why
the table lists more names than there are directories.

For full interactive documentation, run `npm run storybook`.
