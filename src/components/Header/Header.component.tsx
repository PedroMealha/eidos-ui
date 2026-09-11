import React from 'react';
import type { HeaderProps } from './Header.types';
import './Header.scss';
import { Button } from '../Button';

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, className = '' }) => {
  const classes = ['eidos-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="eidos-header__content">
        <div>
          <h1 className="eidos-header__title">{title}</h1>
          {subtitle && <span className="eidos-header__subtitle">{subtitle}</span>}
        </div>
        <div className="eidos-header__actions">
          {actions?.map((action, index) => (
            <Button key={index} size="md" {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};
