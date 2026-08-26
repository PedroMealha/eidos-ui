import React, { useState } from 'react';

// Component showcases
import { AccordionShowcase }      from './design-system/accordion';
import { AlertShowcase }          from './design-system/alerts';
import { AvatarShowcase }         from './design-system/avatars';
import { BadgeShowcase }          from './design-system/badges';
import { BreadcrumbShowcase }     from './design-system/breadcrumb';
import { ButtonShowcase }         from './design-system/buttons';
import { ButtonGroupShowcase }    from './design-system/button-group';
import { CardShowcase }           from './design-system/cards';
import { CheckboxShowcase }       from './design-system/checkboxes';
import { ChipShowcase }           from './design-system/chips';
import { ColorPickerShowcase }    from './design-system/color-picker';
import { ComboboxShowcase }       from './design-system/combobox';
import { CommandPaletteShowcase } from './design-system/command-palette';
import { ContextMenuShowcase }    from './design-system/context-menu';
import { DataGridShowcase }       from './design-system/data-grid';
import { DatePickerShowcase }     from './design-system/date-pickers';
import { DividerShowcase }        from './design-system/divider';
import { DrawerShowcase }         from './design-system/drawer';
import { DropdownShowcase }       from './design-system/dropdowns';
import { EmptyStateShowcase }     from './design-system/empty-state';
import { FileUploadShowcase }     from './design-system/file-upload';
import { InlineEditShowcase }     from './design-system/inline-edit';
import { InputShowcase }          from './design-system/inputs';
import { KbdShowcase }            from './design-system/kbd';
import { MenuShowcase }           from './design-system/menus';
import { ModalShowcase }          from './design-system/forms';
import { NumberInputShowcase }    from './design-system/number-input';
import { OTPInputShowcase }       from './design-system/otp-input';
import { PaginationShowcase }     from './design-system/pagination';
import { PopoverShowcase }        from './design-system/popover';
import { ProgressShowcase }       from './design-system/progress';
import { RadioShowcase }          from './design-system/radios';
import { SegmentedControlShowcase } from './design-system/segmented-control';
import { SelectShowcase }         from './design-system/selects';
import { SkeletonShowcase }       from './design-system/skeleton';
import { SliderShowcase }         from './design-system/slider';
import { SnackbarShowcase }       from './design-system/snackbars';
import { SpinnerShowcase }        from './design-system/spinner';
import { SplitButtonShowcase }    from './design-system/split-button';
import { StepperShowcase }        from './design-system/stepper';
import { SwitchShowcase }         from './design-system/switches';
import { TableShowcase }          from './design-system/tables';
import { TabsShowcase }           from './design-system/tabs';
import { TagInputShowcase }       from './design-system/tag-input';
import { TextareaShowcase }       from './design-system/textareas';
import { TimelineShowcase }       from './design-system/timeline';
import { TooltipShowcase }        from './design-system/tooltips';
import { TreeViewShowcase }       from './design-system/tree-view';
import { VirtualListShowcase }    from './design-system/virtual-list';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation structure
// ─────────────────────────────────────────────────────────────────────────────

type ComponentId =
  // Elements
  | 'Avatar' | 'Badge' | 'Button' | 'Button Group' | 'Card' | 'Chip'
  | 'Divider' | 'Empty State' | 'Kbd' | 'Segmented Control' | 'Split Button'
  // Forms
  | 'Checkbox' | 'Color Picker' | 'Combobox' | 'File Upload' | 'Inline Edit'
  | 'Input' | 'Number Input' | 'OTP Input' | 'Radio' | 'Select'
  | 'Slider' | 'Switch' | 'Tag Input' | 'Textarea'
  // Navigation
  | 'Accordion' | 'Breadcrumb' | 'Pagination' | 'Stepper' | 'Tabs' | 'Tree View'
  // Overlays
  | 'Command Palette' | 'Context Menu' | 'Drawer' | 'Dropdown'
  | 'Menu' | 'Modal' | 'Popover' | 'Snackbar' | 'Tooltip'
  // Data
  | 'Data Grid' | 'Date Picker' | 'Table' | 'Timeline' | 'Virtual List'
  // Feedback
  | 'Alert' | 'Progress' | 'Skeleton' | 'Spinner';

const NAV: Array<{ group: string; items: ComponentId[] }> = [
  { group: 'ELEMENTS',   items: ['Avatar', 'Badge', 'Button', 'Button Group', 'Card', 'Chip', 'Divider', 'Empty State', 'Kbd', 'Segmented Control', 'Split Button'] },
  { group: 'FORMS',      items: ['Checkbox', 'Color Picker', 'Combobox', 'File Upload', 'Inline Edit', 'Input', 'Number Input', 'OTP Input', 'Radio', 'Select', 'Slider', 'Switch', 'Tag Input', 'Textarea'] },
  { group: 'NAVIGATION', items: ['Accordion', 'Breadcrumb', 'Pagination', 'Stepper', 'Tabs', 'Tree View'] },
  { group: 'OVERLAYS',   items: ['Command Palette', 'Context Menu', 'Drawer', 'Dropdown', 'Menu', 'Modal', 'Popover', 'Snackbar', 'Tooltip'] },
  { group: 'DATA',       items: ['Data Grid', 'Date Picker', 'Table', 'Timeline', 'Virtual List'] },
  { group: 'FEEDBACK',   items: ['Alert', 'Progress', 'Skeleton', 'Spinner'] },
];

const SHOWCASES: Record<ComponentId, React.ReactNode> = {
  // Elements
  'Avatar':            <AvatarShowcase />,
  'Badge':             <BadgeShowcase />,
  'Button':            <ButtonShowcase />,
  'Button Group':      <ButtonGroupShowcase />,
  'Card':              <CardShowcase />,
  'Chip':              <ChipShowcase />,
  'Divider':           <DividerShowcase />,
  'Empty State':       <EmptyStateShowcase />,
  'Kbd':               <KbdShowcase />,
  'Segmented Control': <SegmentedControlShowcase />,
  'Split Button':      <SplitButtonShowcase />,
  // Forms
  'Checkbox':          <CheckboxShowcase />,
  'Color Picker':      <ColorPickerShowcase />,
  'Combobox':          <ComboboxShowcase />,
  'File Upload':       <FileUploadShowcase />,
  'Inline Edit':       <InlineEditShowcase />,
  'Input':             <InputShowcase />,
  'Number Input':      <NumberInputShowcase />,
  'OTP Input':         <OTPInputShowcase />,
  'Radio':             <RadioShowcase />,
  'Select':            <SelectShowcase />,
  'Slider':            <SliderShowcase />,
  'Switch':            <SwitchShowcase />,
  'Tag Input':         <TagInputShowcase />,
  'Textarea':          <TextareaShowcase />,
  // Navigation
  'Accordion':         <AccordionShowcase />,
  'Breadcrumb':        <BreadcrumbShowcase />,
  'Pagination':        <PaginationShowcase />,
  'Stepper':           <StepperShowcase />,
  'Tabs':              <TabsShowcase />,
  'Tree View':         <TreeViewShowcase />,
  // Overlays
  'Command Palette':   <CommandPaletteShowcase />,
  'Context Menu':      <ContextMenuShowcase />,
  'Drawer':            <DrawerShowcase />,
  'Dropdown':          <DropdownShowcase />,
  'Menu':              <MenuShowcase />,
  'Modal':             <ModalShowcase />,
  'Popover':           <PopoverShowcase />,
  'Snackbar':          <SnackbarShowcase />,
  'Tooltip':           <TooltipShowcase />,
  // Data
  'Data Grid':         <DataGridShowcase />,
  'Date Picker':       <DatePickerShowcase />,
  'Table':             <TableShowcase />,
  'Timeline':          <TimelineShowcase />,
  'Virtual List':      <VirtualListShowcase />,
  // Feedback
  'Alert':             <AlertShowcase />,
  'Progress':          <ProgressShowcase />,
  'Skeleton':          <SkeletonShowcase />,
  'Spinner':           <SpinnerShowcase />,
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
