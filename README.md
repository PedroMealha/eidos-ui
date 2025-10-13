# @pmealha/eidos-ui

A modern, accessible React component library built with TypeScript, SCSS, and CSS custom properties.

## ✨ Features

- 🎨 **Customizable** - CSS custom properties for easy theming
- 💪 **TypeScript** - Full type safety and IntelliSense support
- 🎭 **SCSS** - Powerful styling with mixins and design tokens
- 📚 **Storybook** - Interactive component documentation
- 🏗️ **Optimized** - Built with tsup for minimal bundle size
- ⚡ **Tree-shakeable** - Import only what you need
- ♿ **Accessible** - Built with accessibility in mind
- 🎯 **Icon Flexibility** - Supports both component icons (Lucide, MUI) and class strings (Font Awesome, Remix Icons)

## 📦 Installation

```bash
npm install @pmealha/eidos-ui lucide-react
```

or with yarn:

```bash
yarn add @pmealha/eidos-ui lucide-react
```

or with pnpm:

```bash
pnpm add @pmealha/eidos-ui lucide-react
```

> **Note:** `lucide-react` is an optional peer dependency. Install it only if you want to use icon features.

## 🚀 Quick Start

### Import Components and Styles

```tsx
import { Button, IconButton, Tooltip } from '@pmealha/eidos-ui';
import { Plus } from 'lucide-react';
import '@pmealha/eidos-ui/styles';

function App() {
  return (
    <div>
      <Button variant="filled" color="primary">
        Click me
      </Button>

      <IconButton icon={Plus} tooltip="Add item" />

      <Tooltip message="Helpful hint">
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  );
}
```

## 📖 Components

### Button

A versatile button component with multiple variants, colors, and icon support.

> **💡 Tip:** For icon-only buttons, you can use either `<Button icon={...} />` or the convenience wrapper `<IconButton icon={...} />` - they're exactly the same!

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'filled' \| 'outlined' \| 'text'` | `'filled'` | Visual style variant |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'danger'` | `'primary'` | Color theme |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `tooltip` | `string` | - | Optional tooltip text |
| `preIcon` | `React.ComponentType \| string` | - | Icon before text |
| `posIcon` | `React.ComponentType \| string` | - | Icon after text |
| `icon` | `React.ComponentType \| string` | - | Icon-only button |

#### Examples

```tsx
import { Button, IconButton } from '@pmealha/eidos-ui';
import { Download, Plus, Trash2, ChevronRight } from 'lucide-react';

// Basic buttons
<Button variant="filled" color="primary">Primary</Button>
<Button variant="outlined" color="secondary">Secondary</Button>
<Button variant="text" color="danger">Text Button</Button>

// With icons - Component way (recommended for tree-shaking)
<Button preIcon={Download}>Download</Button>
<Button posIcon={ChevronRight}>Next</Button>
<Button icon={Plus} />

// With icons - String way (dynamic icon names)
<Button preIcon="download">Download</Button>
<Button posIcon="chevron-right">Next</Button>
<Button icon="plus" />

// Icon-only (two ways, both work with strings or components)
<Button icon={Plus} />
<IconButton icon="plus" />  // String-based
<IconButton icon={Plus} />   // Component-based

// Icon button with props
<IconButton
  icon={Trash2}
  color="danger"
  variant="outlined"
  tooltip="Delete"
/>

// With loading state
<Button loading>Submitting...</Button>

// With tooltip
<Button icon="plus" tooltip="Add new item" />

// Note: Also supports Font Awesome and other icon libraries
// <Button icon="fa fa-plus" />  // If you have Font Awesome CSS loaded
```

### Tooltip

An accessible tooltip component with smart positioning and multiple trigger options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | Tooltip text content |
| `children` | `ReactElement` | - | Trigger element |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred placement |
| `trigger` | `'hover' \| 'click' \| 'focus'` | `'hover'` | Trigger behavior |
| `delay` | `number` | `100` | Show delay in milliseconds |
| `disabled` | `boolean` | `false` | Disable tooltip |
| `closeOnClickOutside` | `boolean` | `true` | Close on outside click (click trigger) |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key (click trigger) |

#### Examples

```tsx
import { Tooltip, Button } from '@pmealha/eidos-ui';

// Basic tooltip
<Tooltip message="This is helpful information">
  <Button>Hover me</Button>
</Tooltip>

// Different placements
<Tooltip message="Top tooltip" placement="top">
  <span>Top</span>
</Tooltip>

// Click trigger
<Tooltip message="Click to see" trigger="click">
  <Button>Click me</Button>
</Tooltip>

// Custom delay
<Tooltip message="Delayed tooltip" delay={500}>
  <Button>Slow show</Button>
</Tooltip>
```

## 🎨 Customization

### CSS Custom Properties

All design tokens are defined as CSS custom properties, making theming easy:

```css
:root {
  /* Primary colors */
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #a5b4fc;

  /* Spacing */
  --spacing-xs: 0.25em;
  --spacing-sm: 0.5em;
  --spacing-md: 1em;
  --spacing-lg: 1.5em;

  /* Border radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* And many more... */
}
```

### Override Styles

You can override any component's styles in your own CSS:

```css
/* Override button styles */
.eidos-button {
  border-radius: 20px;
}

.eidos-button--primary {
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}

/* Override tooltip styles */
.eidos-tooltip {
  backdrop-filter: blur(10px);
}
```

### Dark Mode

Create a dark theme by overriding CSS variables:

```css
[data-theme="dark"] {
  --primary-color: #818cf8;
  --background: #1e293b;
  --text-color: #f1f5f9;
  /* Override other variables... */
}
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Available Scripts

```bash
# Start Storybook (component development)
npm run storybook

# Start Vite dev server (quick preview)
npm run dev

# Build the library
npm run build

# Build Storybook for deployment
npm run build-storybook

# Lint code
npm run lint
```

### Project Structure

```
eidos-ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.scss
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── Tooltip/
│   │       ├── Tooltip.tsx
│   │       ├── Tooltip.types.ts
│   │       ├── Tooltip.scss
│   │       ├── Tooltip.stories.tsx
│   │       └── index.ts
│   ├── styles/
│   │   ├── variables.scss    # CSS custom properties
│   │   ├── mixins.scss        # SCSS mixins
│   │   └── index.scss         # Main styles entry
│   └── index.ts               # Library entry point
├── dev/                       # Development preview
├── .storybook/               # Storybook config
└── dist/                     # Built files (generated)
```

### Adding New Components

1. **Create component directory:**
   ```
   src/components/ComponentName/
   ```

2. **Create component files:**
   - `ComponentName.tsx` - Component implementation
   - `ComponentName.types.ts` - TypeScript types
   - `ComponentName.scss` - Styles (use `eidos-` prefix)
   - `ComponentName.stories.tsx` - Storybook stories
   - `index.ts` - Export file

3. **Export in main index:**
   ```tsx
   // src/index.ts
   export { ComponentName } from './components/ComponentName';
   export type { ComponentNameProps } from './components/ComponentName';
   ```

4. **Import styles:**
   ```scss
   // src/styles/index.scss
   @use '../components/ComponentName/ComponentName.scss';
   ```

## 📦 Publishing to npm

### First Time Setup

1. Create an npm account at https://www.npmjs.com/signup
2. Login via terminal:
   ```bash
   npm login
   ```
3. Ensure you have access to the `@pmea` scope

### Publishing Process

1. **Update version:**
   ```bash
   npm version patch  # 0.1.0 → 0.1.1
   npm version minor  # 0.1.0 → 0.2.0
   npm version major  # 0.1.0 → 1.0.0
   ```

2. **Build the library:**
   ```bash
   npm run build
   ```

3. **Publish:**
   ```bash
   npm publish --access public
   ```

### Publishing Checklist

- [ ] All components working correctly
- [ ] Storybook stories updated
- [ ] Version number bumped
- [ ] Build succeeds without errors
- [ ] No linter errors
- [ ] Git changes committed
- [ ] Git tag created

## 📝 Usage in Your Apps

### Installation

```bash
npm install @pmealha/eidos-ui lucide-react
```

### Import Components

```tsx
import { Button, Tooltip } from '@pmealha/eidos-ui';
import '@pmealha/eidos-ui/styles';
```

### TypeScript Support

Full TypeScript support out of the box:

```tsx
import type { ButtonProps, TooltipProps } from '@pmealha/eidos-ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## 🤝 Design Tokens

All design tokens are available as CSS custom properties in `variables.scss`:

- **Colors:** Primary, secondary, success, danger, warning, info
- **Typography:** Font families, sizes, weights
- **Spacing:** xs, sm, md, lg, xl, 2xl, 3xl
- **Border radius:** xs, sm, md, lg, xl, 2xl, 3xl
- **Shadows:** xs, sm, md, lg, xl, 2xl, 3xl
- **Component sizes:** sm (32px), md (40px), lg (48px)

## 📚 Documentation

- **Storybook:** Run `npm run storybook` for interactive docs
- **Type Definitions:** Exported TypeScript types for all components
- **Examples:** Check the `dev/` folder for usage examples

## 🔧 SCSS Mixins

The library includes useful SCSS mixins in `src/styles/mixins.scss`:

- Layout: `flex-center`, `flex-between`, `grid-center`, `absolute-center`
- Typography: `font-weight`, `font-size`, `text-truncate`
- Interactive: `hover-lift`, `focus-ring`, `button-reset`
- Responsive: `mobile-up`, `tablet-up`, `desktop-up`
- Shadows: `elevation`
- And many more...

## 📄 License

MIT

## 👤 Author

Pedro Mealha

## 🐛 Issues

Found a bug or want to request a feature? Open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, SCSS, and Storybook
