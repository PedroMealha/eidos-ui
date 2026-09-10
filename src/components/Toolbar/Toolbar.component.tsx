import React from 'react';
import type { ToolbarProps } from './Toolbar.types';
import './Toolbar.scss';
import { Button } from '../Button';
import { Avatar } from '../Avatar';

export const Toolbar: React.FC<ToolbarProps> = ({
  brandName = 'Brand Name',
  avatar,
  actions,
  className = '',
}) => {
  const classes = ['eidos-toolbar', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <button className="eidos-toolbar__brand" type="button">
        {avatar && <Avatar size="sm" shape="square" {...avatar} />}
        <h3 className="eidos-toolbar__brand-name">{brandName}</h3>
      </button>
      <div className="eidos-toolbar__actions">
        {actions?.map((action, index) => (
          <Button key={index} size="sm" {...action} />
        ))}
      </div>
    </div>
  );
};
