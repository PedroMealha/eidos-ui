import React from 'react';
import type { BadgeProps } from './Badge.types';
import './Badge.scss';

export const Badge: React.FC<BadgeProps> = ({
  children,
  content,
  color = 'primary',
  max,
  dot = false,
  showZero = false,
  overlap = 'rectangular',
  placement = 'top-right',
  invisible = false,
  className = '',
}) => {
  const hasContent = content !== undefined && content !== null && content !== '';
  const isZero = content === 0;
  const isHidden = invisible || (!dot && !hasContent) || (!dot && isZero && !showZero);

  let displayContent: React.ReactNode = content;
  if (typeof content === 'number' && max !== undefined && content > max) {
    displayContent = `${max}+`;
  }

  const badgeClasses = [
    'eidos-badge',
    `eidos-badge--${color}`,
    `eidos-badge--${overlap}`,
    `eidos-badge--${placement}`,
    dot && 'eidos-badge--dot',
    isHidden && 'eidos-badge--hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className="eidos-badge-wrapper">
      {children}
      <span className={badgeClasses}>{!dot && displayContent}</span>
    </span>
  );
};
