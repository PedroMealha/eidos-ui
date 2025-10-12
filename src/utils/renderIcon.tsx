import React from "react";
import { icons } from "lucide-react";

export type IconType = React.ComponentType<{ className?: string }> | string;

/**
 * Helper function to render icons dynamically
 * Supports both React components (Lucide, MUI, etc.) and string-based icon names
 *
 * @param icon - Icon component or string name (e.g., "heart" or "arrow-right")
 * @param className - Optional CSS class name to apply to the icon
 * @returns React node representing the icon, or null if no icon provided
 *
 * @example
 * // Component-based icon
 * import { Heart } from 'lucide-react';
 * renderIcon(Heart, 'my-icon-class');
 *
 * @example
 * // String-based Lucide icon (kebab-case converted to PascalCase)
 * renderIcon('heart', 'my-icon-class');
 * renderIcon('arrow-right', 'my-icon-class');
 *
 * @example
 * // String-based CSS class (for Font Awesome, Remixicon, etc.)
 * renderIcon('fas fa-heart', 'my-icon-class');
 */
export const renderIcon = (
  icon: IconType | undefined,
  className?: string
): React.ReactNode => {
  if (!icon) return null;

  if (typeof icon === "string") {
    // Convert kebab-case to PascalCase for Lucide icons
    const iconName = icon
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    // Try to find the icon in lucide-react
    const LucideIcon = icons[iconName as keyof typeof icons] as
      | React.ComponentType<{ className?: string }>
      | undefined;

    if (LucideIcon) {
      return <LucideIcon className={className} aria-hidden="true" />;
    }

    // Fallback: render as a CSS class (for Font Awesome, Remixicon, etc.)
    return <i className={`${icon} ${className || ""}`} aria-hidden="true" />;
  }

  // It's a React component
  const IconComponent = icon;
  return <IconComponent className={className} aria-hidden="true" />;
};

