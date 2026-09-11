import React from 'react';
import type { FooterProps } from './Footer.types';
import './Footer.scss';

export const Footer: React.FC<FooterProps> = (props) => {
  const { className = '' } = props;
  const isCopyright = 'copyright' in props && props.copyright !== undefined;

  const classes = [
    'eidos-footer',
    isCopyright ? 'eidos-footer--copyright' : 'eidos-footer--component',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <footer className={classes}>{isCopyright ? props.copyright : props.component}</footer>;
};

Footer.displayName = 'Footer';
