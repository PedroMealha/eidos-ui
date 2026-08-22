---
name: eidos-ui-rules
description: Core consistency and normalization rules for the eidos-ui component library
triggers:
  - model
---

# eidos-ui Project Rules

## Non-negotiable principles

**Normalization and consistency are the primary goals for this project.** Every decision — naming, API shape, documentation structure, showcase layout — must be consistent across all components. If something is inconsistent, fix it immediately and completely, not just for the component currently being worked on.

---

## Component API normalization

### Variant naming
All components that have a "subtle/low-prominence" third variant must use `text` (not `soft`, `ghost`, `subtle`, or any other term).
The standard variant set is: `filled | outlined | text` (plus `bare` on inputs for special editor cases).

### Size naming
Always: `small | medium | large` — never `sm`, `md`, `lg`, or abbreviated forms.

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

[OPTIONAL: > **Note**: one-line callout — only if genuinely useful]

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
- When a component has a custom `.mdx`, remove `tags: ['autodocs']` from the `.stories.tsx` — Storybook does not allow both

### Interactive overlay stories
CommandPalette, Modal, Drawer, and similar overlay components must start CLOSED in stories (`useState(false)`), with a visible trigger button. Never auto-open overlays on story mount — it breaks the Docs page by popping multiple overlays simultaneously.

---

## Dev showcase rules

### File location
Each component gets `dev/design-system/<kebab-case-name>/index.tsx`.

### Structure
- Import from `../../../src/components/X` (never from the barrel `src/index.ts` in dev)
- Use `Section`, `Row`, `Col`, `Grid` from `../shared/Section` — never raw `div` grids
- Export named as `XxxShowcase`
- Group related variants inside a single `<Section>` — don't create one Section per variant
- Maximum ~4 sections unless the component has genuinely distinct interaction patterns

### App.tsx registration
When adding a new showcase: update `ComponentId` type, add to the correct `NAV` group, add entry to `SHOWCASES` record. All three must stay in sync.

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
2. `src/index.ts` (value export + type export)
3. Dev showcase (showcase file + App.tsx registration)

## Git

**Never run `git commit` or `git push`.** The user commits manually.
`git add` and `git diff`/`git status` for inspection are fine.
When work is complete, summarise the changes and stop.
