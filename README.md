<div align="center">

# eidos-ui

**A modern, accessible React component library built with TypeScript, SCSS, and CSS custom properties.**

[![npm version](https://img.shields.io/npm/v/eidos-ui.svg)](https://www.npmjs.com/package/eidos-ui)
[![npm downloads](https://img.shields.io/npm/dm/eidos-ui.svg)](https://www.npmjs.com/package/eidos-ui)
[![license](https://img.shields.io/npm/l/eidos-ui.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

</div>

> **This package starts fresh at `0.1.0`.** It was previously published as `@pmealha/eidos-ui`
> (versions `0.1.1` through `5.0.0`), which reached `5.x` well before the API was actually stable -
> those version numbers didn't reflect real semantic versioning and are deprecated. `@pmealha/eidos-ui`
> will not receive further updates; install `eidos-ui` instead. See [CHANGELOG.md](./CHANGELOG.md) for
> what's changed release to release from here on.

## Features

|                     |                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Themeable**       | Every design token is a CSS custom property. Override them statically, or let users change the palette and typography at runtime with `ThemeProvider`. |
| **Type-safe**       | Written in TypeScript with full prop typings exported for every component.                                                                             |
| **Tree-shakeable**  | Per-component entry points (`eidos-ui/button`, `eidos-ui/table`, ...) keep bundles lean.                                                               |
| **Icon-agnostic**   | Works with any icon library - Lucide, MUI Icons, Font Awesome, Remix Icons, or your own.                                                               |
| **Accessible**      | Built with keyboard navigation and ARIA semantics in mind.                                                                                             |
| **Optimized build** | Bundled with tsup, shipping both ESM and CJS with source maps and `.d.ts` files.                                                                       |

## Installation

```bash
npm install eidos-ui
```

**Optional** - for component-based icons (recommended over string-based icon fonts):

```bash
npm install lucide-react
```

## Quick Start

```tsx
import { Button, Tooltip } from 'eidos-ui';
import 'eidos-ui/styles';
import 'eidos-ui/fonts'; // optional - bundled Plus Jakarta Sans + JetBrains Mono

function App() {
  return (
    <div>
      <Button variant="filled" color="primary">
        Click me
      </Button>

      <Tooltip message="Helpful hint">
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  );
}
```

### With icons

```tsx
// Component icons (tree-shakeable)
import { Plus, Download } from 'lucide-react';

<Button icon={Plus} />
<Button preIcon={Download}>Download</Button>

// String-based icons (icon font classes)
<Button icon="fa fa-plus" />   // Font Awesome
<Button icon="ri-add-line" />  // Remix Icons
```

## Components

These are the same groups used in Storybook, so the README and the docs sidebar stay in sync.

<table>
<tr><td valign="top">

**Layout**

- PageLayout
- Header
- IdentityHeader
- Footer
- Navigation
- Toolbar
- Breadcrumb

**Theming**

- ThemeProvider
- ThemeEditor

**Elements**

- Button
- ButtonGroup
- SplitButton
- Avatar
- Badge
- Card
- Chip
- Divider
- EmptyState
- Kbd
- Pill
- SegmentedControl

</td><td valign="top">

**Forms**

- Input
- Textarea
- NumberInput
- Select
- Combobox
- Checkbox
- Radio
- Switch
- Slider
- ColorPicker
- OTPInput
- TagInput
- FileUpload
- InlineEdit

**Navigation**

- Tabs
- Stepper
- Accordion
- Pagination
- TreeView

</td><td valign="top">

**Data**

- Table
- TableFiltersDropdown
- DataGrid
- DatePicker
- Timeline
- VirtualList
- Chat
- CommentThread
- MessageComposer

**Overlays**

- Modal
- Drawer
- Snackbar
- Tooltip
- Popover
- Menu
- ContextMenu
- CommandPalette
- Dropdown

**Feedback**

- Alert
- Progress
- Skeleton
- Spinner

</td></tr>
</table>

Full props and interactive examples for every component live in Storybook - see [Documentation](#documentation).

## Documentation

Run Storybook locally for the full interactive component reference, including a searchable "Releases" page mirroring [CHANGELOG.md](./CHANGELOG.md):

```bash
git clone https://github.com/PedroMealha/eidos-ui.git
cd eidos-ui
npm install
npm run storybook
```

For accessibility, [ACCESSIBILITY.md](./ACCESSIBILITY.md) covers what is tested
against WCAG 2.2 AA and how, what remains the consuming application's
responsibility, and what has not been done. It does not claim a conformance
level - [WCAG §5.2.2](https://www.w3.org/TR/WCAG22/#cc2) defines conformance
for full pages, so no component library can have one.

## Theming

Every design token is a CSS custom property. There are two ways to change them, depending on whether the theme is fixed at build time or chosen by the user.

### Static overrides

Redeclare any token in your own stylesheet:

```css
:root {
  /* Colours - each family also has -dark, -light, -rgb and -contrast */
  --primary-color: #0f766e;
  --secondary-color: #4b5563;

  /* Spacing (em-based, so it scales with font size) */
  --spacing-md: 1.1em;
  --spacing-lg: 1.6em;

  /* Border radius */
  --border-radius-md: 10px;
}
```

The values above are deliberately _not_ the defaults - this is what an override
looks like. For the shipped values, see **Foundations → Colour** (and Typography,
and Layout) in Storybook: those pages are generated from
`src/styles/variables.scss` at build time, so they are the one place a token
value is stated and the only place it cannot go stale.

Individual components can also be targeted directly, following each component's `eidos-<name>` BEM-style class names:

```css
.eidos-button--filled.eidos-button--primary {
  border-radius: 20px;
  background: linear-gradient(to right, #5c5de8, #8b5cf6);
}
```

### Runtime theming

`ThemeProvider` applies a theme at runtime - for a settings screen, a per-tenant palette, or a colour a user picks. Supply one base colour per family and the shades, tints, ramp steps and accessible foregrounds are derived from it:

```tsx
import { ThemeProvider, ThemeEditor } from 'eidos-ui';

<ThemeProvider defaultTheme={{ colors: { primary: '#0ea5e9' } }}>
  <App />
</ThemeProvider>;
```

`ThemeEditor` is a ready-made panel for editing the active theme, with live WCAG contrast readouts per colour:

```tsx
<ThemeProvider theme={theme} onThemeChange={saveThemeForUser}>
  <ThemeEditor />
  <App />
</ThemeProvider>
```

Ten things are editable - seven colour bases, two font stacks, and a font scale. Tokens are written through the CSSOM to `document.documentElement`, which needs **no Content Security Policy allowance** and covers portaled overlays too. A theme equal to the preset writes nothing at all.

Use `useTheme()` to read or change it from your own UI, and `toCss()` to export the resolved tokens as a `:root` block you can paste into a stylesheet - useful for baking a theme in at build time.

### Fonts

The theme names Plus Jakarta Sans and JetBrains Mono, but a font stack only _names_ families - it cannot install them. Import the bundled copies to actually use them:

```ts
import 'eidos-ui/fonts';
```

This is a separate entry point because these are the only rules in the library that fetch a subresource; importing it means allowing `font-src 'self'` (already covered by `default-src 'self'`). Skip it and the stylesheet fetches nothing, falling back to system fonts.

For a font of your own, `registerFontFace(family, arrayBuffer)` registers one at runtime with no CSP allowance at all.

See the **Theming** and **Content Security Policy** pages in Storybook for the full reference.

## TypeScript

Every component ships with exported prop types:

```tsx
import type { ButtonProps, TooltipProps } from 'eidos-ui';

const MyButton: React.FC<ButtonProps> = (props) => <Button {...props} />;
```

## Contributing

Bug reports, questions, and suggestions are very welcome via [GitHub Issues](https://github.com/PedroMealha/eidos-ui/issues). Pull requests are not accepted - this is a single-maintainer project by design; see [CONTRIBUTING.md](./CONTRIBUTING.md) for the reasoning and for what to do if you need behaviour the library doesn't have.

To report a security issue, please use private reporting rather than a public issue - see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © Pedro Mealha
