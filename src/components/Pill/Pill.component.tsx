import React from 'react';
import type { PillProps } from './Pill.types';
import './Pill.scss';

export const Pill: React.FC<PillProps> = ({
  children,
  color = 'primary',
  variant = 'filled',
  size = 'md',
  dot = false,
  max,
  className = '',
}) => {
  const hasContent = children !== undefined && children !== null && children !== '';
  const dotOnly = dot && !hasContent;

  const classes = [
    'eidos-pill',
    `eidos-pill--${variant}`,
    `eidos-pill--${color}`,
    `eidos-pill--${size}`,
    dotOnly && 'eidos-pill--dot',
    dot && hasContent && 'eidos-pill--with-dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (dotOnly) {
    return <span className={classes} />;
  }

  let content: React.ReactNode = children;
  if (typeof children === 'number' && max !== undefined) {
    content = children > max ? `${max}+` : children;
  }

  return (
    <span className={classes}>
      {dot && <span className="eidos-pill--dot-indicator" />}
      {content}
    </span>
  );
};
