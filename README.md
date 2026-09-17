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

|                     |                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Themeable**       | Every design token is a CSS custom property, so palette, spacing, and radii can be overridden without touching source. |
| **Type-safe**       | Written in TypeScript with full prop typings exported for every component.                                             |
| **Tree-shakeable**  | Per-component entry points (`eidos-ui/button`, `eidos-ui/table`, ...) keep bundles lean.                               |
| **Icon-agnostic**   | Works with any icon library - Lucide, MUI Icons, Font Awesome, Remix Icons, or your own.                               |
| **Accessible**      | Built with keyboard navigation and ARIA semantics in mind.                                                             |
| **Optimized build** | Bundled with tsup, shipping both ESM and CJS with source maps and `.d.ts` files.                                       |

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
- Footer
- Navigation
- Toolbar
- Breadcrumb

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
- DatePicker
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
- DataGrid
- Timeline
- VirtualList

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

## Theming

All design tokens are exposed as CSS custom properties, so themes can be overridden globally without touching component source.

```css
:root {
  /* Colors */
  --primary-color: #6366f1;
  --secondary-color: #ec4899;

  /* Spacing */
  --spacing-md: 1em;
  --spacing-lg: 1.5em;

  /* Border radius */
  --border-radius-md: 8px;
}
```

Individual component styles can also be targeted directly, following each component's `eidos-<name>` BEM-style class names:

```css
.eidos-button--filled.eidos-button--primary {
  border-radius: 20px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}
```

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
