import React from 'react';

export interface PillProps {
  children?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'sm' | 'md';
  /** Render a small coloured dot alongside the content. With no `children`, renders dot-only. */
  dot?: boolean;
  /** When children is a number, clamp display to `max+` if exceeded */
  max?: number;
  className?: string;
}
