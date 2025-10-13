# @pmealha/eidos-ui

A modern, accessible React component library built with TypeScript, SCSS, and CSS custom properties.

## ✨ Features

- 🎨 **Customizable** - CSS custom properties for easy theming
- 💪 **TypeScript** - Full type safety and IntelliSense support
- 🎭 **SCSS** - Powerful styling with mixins and design tokens
- 🏗️ **Optimized** - Built with tsup for minimal bundle size
- ⚡ **Tree-shakeable** - Import only what you need
- ♿ **Accessible** - Built with accessibility in mind
- 🎯 **Icon Flexibility** - Works with any icon library (Lucide, MUI Icons, Font Awesome, Remix Icons, etc.)

## 📦 Installation

```bash
npm install @pmealha/eidos-ui
```

**Optional:** If you want to use component-based icons (recommended):
```bash
npm install lucide-react
# or use MUI Icons, Heroicons, etc.
```

## 🚀 Quick Start

```tsx
import { Button, Tooltip, DatePicker } from '@pmealha/eidos-ui';
import '@pmealha/eidos-ui/styles';

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

### With Icons

```tsx
// Using component icons (tree-shakeable)
import { Plus, Download } from 'lucide-react';
<Button icon={Plus} />
<Button preIcon={Download}>Download</Button>

// Or using string-based icons
<Button icon="fa fa-plus" />  // Font Awesome
<Button icon="ri-add-line" />  // Remix Icons
```

## 📦 Available Components

- **Button** - Versatile button with variants, sizes, colors, icons, loading states
- **Chip** - Compact elements for tags, labels, or selections
- **DatePicker** - Date selection with single, multiple, and range modes
- **Divider** - Visual separator with optional text
- **Dropdown** - Customizable dropdown menus
- **Input** - Text input with validation and icons
- **Menu** - Navigation and action menus
- **Modal** - Dialog overlays with customizable actions
- **Select** - Dropdown selection with search
- **Snackbar** - Toast notifications with actions
- **Spinner** - Loading indicators
- **Table** - Data tables with sorting, filtering, and pagination
- **Tooltip** - Contextual hints with smart positioning

## 📚 Documentation

For detailed component documentation, props, and interactive examples, visit our Storybook:

```bash
npm run storybook
```

Or check the [live Storybook documentation](#) _(coming soon)_

## 🎨 Customization

### Theming with CSS Variables

All design tokens are customizable via CSS custom properties:

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

### Dark Mode Example

```css
[data-theme="dark"] {
  --primary-color: #818cf8;
  --background: #1e293b;
  --text-color: #f1f5f9;
}
```

### Override Component Styles

```css
.eidos-button {
  border-radius: 20px;
}

.eidos-button--primary {
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}
```

## 💻 TypeScript Support

Full TypeScript support with exported types:

```tsx
import type { ButtonProps, TooltipProps } from '@pmealha/eidos-ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## 🎯 Icon Support

The library supports multiple icon approaches:

1. **Component Icons** (Lucide, MUI, Heroicons) - Recommended for tree-shaking
2. **String-based Icons** (Font Awesome, Remix Icons) - Great for dynamic icons

```tsx
// Component-based (tree-shakeable)
import { Plus } from 'lucide-react';
<Button icon={Plus} />

// String-based (requires icon CSS to be loaded)
<Button icon="fa fa-plus" />
```

## 📄 License

MIT

## 👤 Author

Pedro Mealha

---

Built with ❤️ using React, TypeScript, SCSS, and Storybook
