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
import { CheckboxShowcase } from './design-system/checkboxes';
import { RadioShowcase } from './design-system/radios';
import { SwitchShowcase } from './design-system/switches';
import { TextareaShowcase } from './design-system/textareas';
import { BadgeShowcase } from './design-system/badges';
import { AlertShowcase } from './design-system/alerts';
import { TabsShowcase } from './design-system/tabs';
import { AccordionShowcase } from './design-system/accordion';
import { PopoverShowcase } from './design-system/popover';
import { DrawerShowcase } from './design-system/drawer';
import { SliderShowcase } from './design-system/slider';
import { EmptyStateShowcase } from './design-system/empty-state';
import { BreadcrumbShowcase } from './design-system/breadcrumb';
import { StepperShowcase } from './design-system/stepper';
import { PaginationShowcase } from './design-system/pagination';
import { TimelineShowcase } from './design-system/timeline';
import { NumberInputShowcase } from './design-system/number-input';
import { FileUploadShowcase } from './design-system/file-upload';
import { ProgressShowcase } from './design-system/progress';
import { SkeletonShowcase } from './design-system/skeleton';
import { AvatarShowcase } from './design-system/avatars';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation structure
// ─────────────────────────────────────────────────────────────────────────────

type ComponentId =
  | 'Button' | 'Chip' | 'Input' | 'Textarea' | 'Select' | 'Card' | 'Badge' | 'Alert'
  | 'Checkbox' | 'Radio' | 'Switch' | 'Slider'
  | 'Tabs' | 'Accordion' | 'Breadcrumb' | 'Stepper' | 'Pagination' | 'Dropdown' | 'Menu'
  | 'Modal' | 'Drawer' | 'Snackbar' | 'Tooltip' | 'Popover'
  | 'Date Picker' | 'Table' | 'Timeline'
  | 'Progress' | 'Skeleton' | 'Avatar' | 'Empty State'
  | 'Number Input' | 'File Upload'
  | 'Divider & Spinner';

const NAV: Array<{ group: string; items: ComponentId[] }> = [
  { group: 'ELEMENTS',    items: ['Button', 'Chip', 'Badge', 'Alert', 'Card', 'Avatar', 'Empty State'] },
  { group: 'FORMS',       items: ['Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch', 'Slider', 'Number Input', 'File Upload'] },
  { group: 'NAVIGATION',  items: ['Tabs', 'Accordion', 'Breadcrumb', 'Stepper', 'Pagination', 'Dropdown', 'Menu'] },
  { group: 'OVERLAYS',    items: ['Modal', 'Drawer', 'Snackbar', 'Tooltip', 'Popover'] },
  { group: 'DATA',        items: ['Date Picker', 'Table', 'Timeline'] },
  { group: 'FEEDBACK',    items: ['Progress', 'Skeleton'] },
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
  'Checkbox':          <CheckboxShowcase />,
  'Radio':             <RadioShowcase />,
  'Switch':            <SwitchShowcase />,
  'Textarea':          <TextareaShowcase />,
  'Badge':             <BadgeShowcase />,
  'Alert':             <AlertShowcase />,
  'Tabs':              <TabsShowcase />,
  'Accordion':         <AccordionShowcase />,
  'Popover':           <PopoverShowcase />,
  'Drawer':            <DrawerShowcase />,
  'Slider':            <SliderShowcase />,
  'Empty State':       <EmptyStateShowcase />,
  'Breadcrumb':        <BreadcrumbShowcase />,
  'Stepper':           <StepperShowcase />,
  'Pagination':        <PaginationShowcase />,
  'Timeline':          <TimelineShowcase />,
  'Number Input':      <NumberInputShowcase />,
  'File Upload':       <FileUploadShowcase />,
  'Progress':          <ProgressShowcase />,
  'Skeleton':          <SkeletonShowcase />,
  'Avatar':            <AvatarShowcase />,
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
