# Getting Started with Eidos UI

A React component library with 49 components, a consistent design language, and full TypeScript support.

## Quick commands

```bash
# Interactive component docs (recommended)
npm run storybook

# Dev preview (Vite)
npm run dev

# Build the library for publishing
npm run build

# Lint
npm run lint
```

## Install

```bash
npm install @pmealha/eidos-ui
```

**Peer dependencies** — must be present in your project (not bundled):

```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Import the stylesheet

Once at your app root (`main.tsx` or equivalent). Without it, components render unstyled.

```ts
import '@pmealha/eidos-ui/styles';
```

## Set up providers

Most components work standalone. Two require a context provider at the app root.

### Snackbar (required for toast notifications)

```tsx
import { SnackbarProvider, SnackbarContainer } from '@pmealha/eidos-ui';

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
import { useSnackbar } from '@pmealha/eidos-ui';

const { showSuccess, showError, showWarning, showInfo } = useSnackbar();
showSuccess('Saved!');
```

### Dropdown (optional — grouped menus only)

Only needed when using `dropdownGroup` to ensure only one menu is open at a time.

```tsx
import { DropdownProvider, Dropdown } from '@pmealha/eidos-ui';

<DropdownProvider>
  <Dropdown dropdownGroup="toolbar" trigger={<button>File</button>} content={...} />
  <Dropdown dropdownGroup="toolbar" trigger={<button>Edit</button>} content={...} />
</DropdownProvider>
```

## Icons

Many components accept icon props (`preIcon`, `postIcon`, `icon`). These use `lucide-react`, which is listed as a regular dependency and auto-installed with the package — no extra install step needed.

```tsx
import { Download, Plus } from 'lucide-react';
import { Button } from '@pmealha/eidos-ui';

<Button preIcon={Download}>Export</Button>
```

## TypeScript

All components are fully typed. Import types from the main entry point:

```ts
import type { ButtonProps, InputProps, SelectOption } from '@pmealha/eidos-ui';
```

## Theming

All design tokens are CSS custom properties defined on `:root`. Override them after the library stylesheet import to customise the look globally.

```css
:root {
  /* Brand colour */
  --primary-color: #0ea5e9;
  --primary-dark:  #0284c7;
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

## Import patterns

```ts
// Root barrel — works with any bundler that tree-shakes
import { Button, Input, DataGrid } from '@pmealha/eidos-ui';

// Deep import — explicit single-component chunk (useful in CJS / non-tree-shaking envs)
import { Button } from '@pmealha/eidos-ui/button';
import { DataGrid } from '@pmealha/eidos-ui/data-grid';
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
4. Add a dev showcase at `dev/design-system/<kebab-case-name>/index.tsx` and register it in `dev/App.tsx`.

## Component naming conventions

- TypeScript prop values: use full words for variants (`filled`, `outlined`, `text`), abbreviated for sizes (`sm`, `md`, `lg`), and full words for colours (`primary`, `secondary`, `success`, `danger`, `warning`, `info`).
- CSS classes: `eidos-` prefix (e.g. `eidos-button`, `eidos-input`).
- BEM size modifiers: `--sm`, `--md`, `--lg` (matches CSS variable convention: `--component-size-sm`).

## Publishing

```bash
npm run release:patch   # bug fixes
npm run release:minor   # new components / non-breaking changes
npm run release:major   # breaking API changes
```

Each script bumps the version and publishes (which triggers `prepublishOnly: npm run build` automatically).

## Component inventory

49 components across 9 categories:

| Category | Components |
|---|---|
| Elements | Accordion, Alert, Badge, Breadcrumb, Button, ButtonGroup, Card, Chip, Divider, EmptyState, Kbd, SegmentedControl, SplitButton |
| Forms | Checkbox, ColorPicker, Combobox, FileUpload, InlineEdit, Input, NumberInput, OTPInput, Radio, Select, Slider, Switch, TagInput, Textarea |
| Feedback | Alert, Progress, Skeleton, Spinner |
| Layout | Stepper |
| Navigation | Pagination, Tabs |
| Overlays | CommandPalette, ContextMenu, Drawer, Dropdown, Menu, Modal, Popover, Snackbar, Tooltip |
| Data Display | Avatar, Timeline, TreeView |
| Data | DataGrid, DatePicker, Table, TableFiltersDropdown, VirtualList |

For full interactive documentation, run `npm run storybook`.
