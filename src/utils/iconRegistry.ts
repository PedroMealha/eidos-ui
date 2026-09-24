import type React from 'react';

/** A component an icon prop can render: Lucide, MUI, or any `className`-taking SVG. */
export type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Stored on `globalThis` under a registered symbol rather than in a
 * module-level `Map`.
 *
 * tsup compiles every CommonJS entry point independently (`splitting` only
 * shares chunks for ESM), so `eidos-ui/button` and `eidos-ui/lucide-icons`
 * each carry their own copy of this module under `require`. A module-level
 * registry would therefore split in two: icons registered through one entry
 * would be invisible to components loaded through another, silently, and
 * only for CJS consumers. `Symbol.for` resolves to the same key from every
 * copy.
 */
const REGISTRY_KEY = Symbol.for('eidos-ui.icon-registry');

const registry = (): Map<string, IconComponent> => {
  const scope = globalThis as unknown as Record<symbol, Map<string, IconComponent> | undefined>;
  return (scope[REGISTRY_KEY] ??= new Map());
};

/**
 * `arrow-right`, `ArrowRight` and `arrowRight` all name the same icon. Lucide
 * exports PascalCase; string props are conventionally kebab-case.
 */
export const toIconKey = (name: string): string =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * Makes icons available to every icon prop by string name.
 *
 * Pass only the icons your app uses, so only those reach your bundle:
 *
 * ```ts
 * import { ArrowRight, Settings } from 'lucide-react';
 * registerIcons({ ArrowRight, Settings });
 * ```
 *
 * Keys may be PascalCase (as Lucide exports them) or kebab-case; both resolve
 * `icon="arrow-right"` and `icon="ArrowRight"`. Registering the same name
 * again replaces it. To register every Lucide icon, import
 * `eidos-ui/lucide-icons` once instead - at the cost of the whole icon set in
 * your bundle.
 */
export const registerIcons = (icons: Record<string, IconComponent>): void => {
  const target = registry();
  for (const [name, component] of Object.entries(icons)) {
    target.set(toIconKey(name), component);
  }
};

/** The registered component for a string icon name, if any. */
export const resolveRegisteredIcon = (name: string): IconComponent | undefined =>
  registry().get(toIconKey(name));
