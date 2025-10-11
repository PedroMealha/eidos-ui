# Getting Started with Eidos UI

## ✅ What's Been Set Up

Your design system package is ready with:

- ✅ **Button Component** - With variants, sizes, colors, icons, loading, tooltips
- ✅ **Tooltip Component** - Smart positioning, multiple triggers
- ✅ **SCSS Setup** - CSS custom properties + mixins
- ✅ **TypeScript** - Full type safety with `.types.ts` files
- ✅ **Storybook** - Interactive documentation
- ✅ **Build System** - tsup for library building
- ✅ **Dev Preview** - Vite dev server for quick testing
- ✅ **lucide-react** - Icon support installed

## 🚀 Quick Commands

### Development

```bash
# Start Storybook (best for component development)
npm run storybook

# Start Vite dev server (quick preview)
npm run dev
```

### Building

```bash
# Build the library for publishing
npm run build
```

### Testing

```bash
# Lint your code
npm run lint
```

## 📁 File Structure Overview

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx           # Component implementation
│   │   ├── Button.types.ts      # TypeScript types
│   │   ├── Button.scss          # Styles (uses CSS variables)
│   │   ├── Button.stories.tsx   # Storybook documentation
│   │   └── index.ts             # Exports
│   │
│   └── Tooltip/
│       ├── Tooltip.tsx
│       ├── Tooltip.types.ts
│       ├── Tooltip.scss
│       ├── Tooltip.stories.tsx
│       └── index.ts
│
├── styles/
│   ├── variables.scss    # CSS custom properties (:root)
│   ├── mixins.scss       # Reusable SCSS mixins
│   └── index.scss        # Main styles entry
│
└── index.ts              # Main library entry point
```

## 🎯 Next Steps

### 1. Test Your Components

```bash
npm install
npm run storybook
```

Visit `http://localhost:6006` to see your components!

### 2. View in Dev Mode

```bash
npm run dev
```

Visit `http://localhost:5173` to see all components in action.

### 3. Add More Components

Follow this pattern:

```
src/components/NewComponent/
├── NewComponent.tsx
├── NewComponent.types.ts
├── NewComponent.scss
├── NewComponent.stories.tsx
└── index.ts
```

Then export in `src/index.ts`:

```tsx
export { NewComponent } from './components/NewComponent';
export type { NewComponentProps } from './components/NewComponent';
```

And import styles in `src/styles/index.scss`:

```scss
@use '../components/NewComponent/NewComponent.scss';
```

### 4. Publishing to npm

When ready to publish:

```bash
# Update version
npm version patch  # or minor, or major

# Build
npm run build

# Publish
npm publish --access public
```

## 💡 Key Features to Know

### CSS Variables (Not SCSS Variables!)

Your components use CSS custom properties for theming:

```scss
// ❌ Don't use SCSS variables
$primary: #6366f1;

// ✅ Use CSS custom properties
.eidos-button {
  background: var(--primary-color);
  padding: var(--spacing-md);
}
```

Benefits:
- Users can override them
- Runtime theming support
- Dark mode support

### Component Naming

All component classes use the `eidos-` prefix:

```scss
.eidos-button { }
.eidos-tooltip { }
```

This prevents conflicts with user's code.

### Icon Support

Icons use `lucide-react` (already installed):

```tsx
import { Download } from 'lucide-react';

<Button preIcon={Download}>Download</Button>
<Button icon={Download} />  // Icon-only
```

### Shared Components

Components can use other components:

```tsx
// Button uses Tooltip internally
<Button tooltip="Click me">
  Submit
</Button>
```

## 🎨 Customization

Users can override your styles:

```css
/* In user's app */
:root {
  --primary-color: #ff0000;  /* Override your primary */
}

.eidos-button {
  border-radius: 20px;  /* Override button radius */
}
```

## 🐛 Troubleshooting

### Linter Errors?

```bash
npm run lint
```

Fix any errors before building.

### Build Fails?

Make sure all imports are correct:
- Component paths are case-sensitive
- SCSS files use `@use` not `@import`
- All exports are in `src/index.ts`

### Storybook Not Loading?

Check that:
- `.storybook/main.ts` includes correct story paths
- Component stories end with `.stories.tsx`
- All imports are valid

## 📚 Documentation

- **README.md** - Complete usage guide
- **This file** - Quick start guide
- **Storybook** - Interactive component docs
- **dev/** folder - Usage examples

## 🎉 You're Ready!

Your design system is fully set up and ready to use. Start by:

1. Running `npm run storybook`
2. Exploring the components
3. Adding your own components
4. Building and publishing when ready

Happy coding! 🚀

