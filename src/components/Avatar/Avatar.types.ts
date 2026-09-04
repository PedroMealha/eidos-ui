import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
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
