import type { AvatarProps } from '../Avatar';
import type { HeaderProps } from './Header.types';

/**
 * Extends `HeaderProps` rather than renaming its fields to `name`/
 * `description`: one vocabulary for one concept, and every prop added to
 * `Header` later reaches this preset with no second edit here - the same
 * reason `PageLayout` spreads its `header` config instead of forwarding it
 * field by field.
 */
export interface IdentityHeaderProps extends HeaderProps {
  /**
   * Avatar shorthand for the leading media, rendered at `lg`.
   *
   * Pass `media` instead for anything else - including an avatar larger than
   * `Avatar`'s own `lg` size (48px), which `Avatar` cannot currently express.
   * If both are given, `media` wins.
   */
  avatar?: Pick<AvatarProps, 'name' | 'src' | 'alt' | 'color' | 'shape'>;
}
