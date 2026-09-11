import React, { useState } from 'react';
import type { ToolbarProps } from './Toolbar.types';
import './Toolbar.scss';
import { IconButton } from '../Button';
import { Breadcrumb } from '../Breadcrumb';
import { Avatar } from '../Avatar';
import { Menu } from '../Menu';
import { CommandPalette } from '../CommandPalette';
import { CmdPaletteTriggerButton } from '../CommandPalette/CommandPalette.stories';

export const Toolbar: React.FC<ToolbarProps> = ({
  breadcrumbs,
  actions,
  userMenu,
  cmdPaletteItems,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const classes = ['eidos-toolbar', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {breadcrumbs && <Breadcrumb {...breadcrumbs} />}
      <div className="eidos-toolbar__content">
        {cmdPaletteItems && cmdPaletteItems.length > 0 && (
          <>
            <CmdPaletteTriggerButton label="Search" onClick={() => setOpen(true)} shortcutKey="k" />
            <CommandPalette
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              items={cmdPaletteItems}
            />
          </>
        )}
        {actions && actions.length > 0 && (
          <div className="eidos-toolbar__actions">
            {actions.map((action, index) => (
              <IconButton key={index} variant="text" size="sm" {...action} />
            ))}
          </div>
        )}
        <Menu
          trigger={<Avatar name="John Doe" size="sm" color="primary" />}
          items={userMenu}
          minWidth={220}
        />
      </div>
    </div>
  );
};
