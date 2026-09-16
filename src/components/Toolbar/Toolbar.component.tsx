import React from 'react';
import type { ToolbarProps } from './Toolbar.types';
import './Toolbar.scss';
import { IconButton } from '../Button';
import { Breadcrumb } from '../Breadcrumb';
import { Avatar } from '../Avatar';
import { Menu } from '../Menu';
import { CommandPalette } from '../CommandPalette';

export const Toolbar: React.FC<ToolbarProps> = ({
  breadcrumbs,
  actions,
  user,
  userMenu,
  cmdPaletteItems,
  content,
  className = '',
}) => {
  const classes = ['eidos-toolbar', className].filter(Boolean).join(' ');

  // The avatar is the menu's trigger when there are items to open, and a
  // plain mark when there aren't - `Menu` with an empty `items` array would
  // render an interactive, focusable trigger that opens nothing. A menu
  // given without a `user` still needs a trigger, and `Avatar` already
  // falls back to a generic user icon when it has neither `name` nor `src`.
  const hasMenu = userMenu !== undefined && userMenu.length > 0;
  const avatar = user || hasMenu ? <Avatar {...user} size="sm" /> : null;

  return (
    <div className={classes}>
      {breadcrumbs && <Breadcrumb {...breadcrumbs} />}
      <div className="eidos-toolbar__content">
        {content && <div className="eidos-toolbar__slot">{content}</div>}
        {cmdPaletteItems && cmdPaletteItems.length > 0 && (
          <CommandPalette trigger triggerLabel="Search" items={cmdPaletteItems} />
        )}
        {actions && actions.length > 0 && (
          <div className="eidos-toolbar__actions">
            {actions.map((action, index) => (
              <IconButton key={index} variant="text" size="sm" {...action} />
            ))}
          </div>
        )}
        {hasMenu ? <Menu trigger={avatar} items={userMenu} minWidth={220} /> : avatar}
      </div>
    </div>
  );
};
