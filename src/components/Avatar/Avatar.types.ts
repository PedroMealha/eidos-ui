import React from 'react';

/**
 * `sm`-`lg` (32/40/48px) share the `--component-size-*` scale with every other
 * sized control. `xl` (64px) and `2xl` (96px) are Avatar-only, for identity
 * media - a profile or account header - where 48px reads as a list thumbnail.
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarColor =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  color?: AvatarColor;
  shape?: 'circle' | 'square';
  fallback?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}
