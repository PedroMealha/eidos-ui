import React from 'react';
import { devWarn } from './devWarn';
import { resolveRegisteredIcon, toIconKey, type IconComponent } from './iconRegistry';

export type IconType = IconComponent | string;

/**
 * Renders an icon prop.
 *
 * @param icon - An icon component, or a string: a name registered with
 *   `registerIcons`, or CSS classes for an icon font.
 * @param className - Optional CSS class name to apply to the icon.
 * @returns React node representing the icon, or null if no icon provided.
 *
 * @example
 * // Component - the recommended form; only the icons you import are bundled
 * import { Heart } from 'lucide-react';
 * renderIcon(Heart, 'my-icon-class');
 *
 * @example
 * // Registered name
 * registerIcons({ Heart });
 * renderIcon('heart', 'my-icon-class');
 *
 * @example
 * // CSS classes for an icon font (Font Awesome, Remixicon, ...)
 * renderIcon('fas fa-heart', 'my-icon-class');
 */
export const renderIcon = (icon: IconType | undefined, className?: string): React.ReactNode => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    const Registered = resolveRegisteredIcon(icon);
    if (Registered) {
      return <Registered className={className} aria-hidden="true" />;
    }

    // No lookup against Lucide's full `icons` map. There was one until 4.0,
    // and referencing that map put every Lucide icon (~1,800 modules) into
    // every consumer's bundle, however few they used - no bundler can
    // tree-shake a lookup by a runtime string. Do not reintroduce it: a
    // consumer who wants every name opts in with `eidos-ui/lucide-icons`.
    //
    // An unregistered string is treated as icon-font classes. A single token
    // with no space is far more often a forgotten registration than a font
    // class, so it warns - once per name. The cost is one dev-only warning
    // for single-class fonts (Remixicon's `ri-home-line`); the alternative is
    // an upgrade that silently renders empty `<i>` elements where icons were.
    if (!/\s/.test(icon)) {
      const iconName = toIconKey(icon);
      devWarn(
        `icon-unregistered-${iconName}`,
        `Icon "${icon}" is not registered, so it is rendered as the CSS class "${icon}". If it is a Lucide icon, pass the component (\`import { ${iconName} } from 'lucide-react'\`), register it once with \`registerIcons({ ${iconName} })\`, or \`import 'eidos-ui/lucide-icons'\` to register them all. If it is an icon-font class, ignore this.`,
      );
    }

    return <i className={`${icon} ${className || ''}`} aria-hidden="true" />;
  }

  // It's a React component
  const IconComponent = icon;
  return <IconComponent className={className} aria-hidden="true" />;
};
