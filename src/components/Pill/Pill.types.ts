import React from 'react';

export type PillColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type PillVariantProps = 'filled' | 'outlined' | 'text';

export interface PillProps {
  children?: React.ReactNode;
  color?: PillColorProps;
  variant?: PillVariantProps;
  size?: 'sm' | 'md';
  /** Render a small coloured dot alongside the content. With no `children`, renders dot-only. */
  dot?: boolean;
  /** When children is a number, clamp display to `max+` if exceeded */
  max?: number;
  className?: string;
}
