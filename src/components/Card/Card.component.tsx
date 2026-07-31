import React from 'react';
import type { CardProps } from './Card.types';
import './Card.scss';

export const Card: React.FC<CardProps> = ({
  variant = 'outlined',
  padding = 'md',
  as: Tag,
  clickable = false,
  className = '',
  children,
  ...rest
}) => {
  // Guard against empty string passed by Storybook's text control
  const Element: React.ElementType = Tag || 'div';

  const classes = [
    'eidos-card',
    `eidos-card--${variant}`,
    `eidos-card--padding-${padding}`,
    clickable ? 'eidos-card--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Element className={classes} {...rest}>
      {children}
    </Element>
  );
};
