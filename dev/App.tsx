import React, { useState } from 'react';

// Component showcases — populated as subfolders are added
import { ButtonShowcase } from './design-system/buttons';
import { ChipShowcase } from './design-system/chips';
import { InputShowcase } from './design-system/inputs';
import { SelectShowcase } from './design-system/selects';
import { DropdownShowcase } from './design-system/dropdowns';
import { MenuShowcase } from './design-system/menus';
import { TooltipShowcase } from './design-system/tooltips';
import { SnackbarShowcase } from './design-system/snackbars';
import { ModalShowcase } from './design-system/forms';
import { DatePickerShowcase } from './design-system/date-pickers';
import { TableShowcase } from './design-system/tables';
import { LayoutShowcase } from './design-system/layout';
import { CardShowcase } from './design-system/cards';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation structure
// ─────────────────────────────────────────────────────────────────────────────

type ComponentId =
  | 'Button' | 'Chip' | 'Input' | 'Select' | 'Card'
  | 'Dropdown' | 'Menu'
  | 'Modal' | 'Snackbar' | 'Tooltip'
  | 'Date Picker' | 'Table'
  | 'Divider & Spinner';

const NAV: Array<{ group: string; items: ComponentId[] }> = [
  { group: 'ELEMENTS',    items: ['Button', 'Chip', 'Input', 'Select', 'Card'] },
  { group: 'NAVIGATION',  items: ['Dropdown', 'Menu'] },
  { group: 'OVERLAYS',    items: ['Modal', 'Snackbar', 'Tooltip'] },
  { group: 'DATA',        items: ['Date Picker', 'Table'] },
  { group: 'LAYOUT',      items: ['Divider & Spinner'] },
];

const SHOWCASES: Record<ComponentId, React.ReactNode> = {
  'Button':          <ButtonShowcase />,
  'Chip':            <ChipShowcase />,
  'Input':           <InputShowcase />,
  'Select':          <SelectShowcase />,
  'Dropdown':        <DropdownShowcase />,
  'Menu':            <MenuShowcase />,
  'Modal':           <ModalShowcase />,
  'Snackbar':        <SnackbarShowcase />,
  'Tooltip':         <TooltipShowcase />,
  'Date Picker':     <DatePickerShowcase />,
  'Table':           <TableShowcase />,
  'Divider & Spinner': <LayoutShowcase />,
  'Card':              <CardShowcase />,
};

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

export const App = () => {
  const [active, setActive] = useState<ComponentId>('Button');

  return (
    <div className="ds-app">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="ds-header">
        <div className="ds-header-left">
          <span className="ds-logo">eidos-ui</span>
          <span className="ds-version">v0.1.6</span>
        </div>
        <span className="ds-header-hint">Design System Preview</span>
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="ds-body">
        {/* Sidebar */}
        <nav className="ds-sidebar">
          {NAV.map(({ group, items }) => (
            <div key={group} className="ds-nav-group">
              <p className="ds-nav-group-label">{group}</p>
              {items.map((id) => (
                <button
                  key={id}
                  className={`ds-nav-item${active === id ? ' ds-nav-item--active' : ''}`}
                  onClick={() => setActive(id)}
                >
                  {id}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Content */}
        <main className="ds-content">
          <h1 className="ds-page-title">{active}</h1>
          <div className="ds-page-body">
            {SHOWCASES[active]}
          </div>
        </main>
      </div>
    </div>
  );
};
