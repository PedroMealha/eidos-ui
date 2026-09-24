import React from 'react';
import { icons } from 'lucide-react';
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

    // Deprecated fallback, removed in 4.0: resolving an unregistered name
    // against Lucide's full `icons` map. Referencing that map is what puts
    // every Lucide icon (~1,800 modules) into a consumer's bundle, however
    // few they use - no bundler can tree-shake a lookup by a runtime string.
    // It stays for one minor so existing string names keep working while
    // the warning below points at the migration.
    const iconName = toIconKey(icon);
    const LucideIcon = icons[iconName as keyof typeof icons] as IconComponent | undefined;

    if (LucideIcon) {
      devWarn(
        `icon-string-fallback-${iconName}`,
        `Icon "${icon}" was resolved by name from the full Lucide icon set. That lookup is deprecated and is removed in 4.0, because it bundles every Lucide icon. Pass the component instead (\`import { ${iconName} } from 'lucide-react'\`), register it once with \`registerIcons({ ${iconName} })\`, or \`import 'eidos-ui/lucide-icons'\` to register them all.`,
      );
      return <LucideIcon className={className} aria-hidden="true" />;
    }

    // Fallback: render as a CSS class (for Font Awesome, Remixicon, etc.)
    return <i className={`${icon} ${className || ''}`} aria-hidden="true" />;
  }

  // It's a React component
  const IconComponent = icon;
  return <IconComponent className={className} aria-hidden="true" />;
};
