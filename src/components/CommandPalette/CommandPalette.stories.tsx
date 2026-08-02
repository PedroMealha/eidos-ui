import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { BookOpen, Bug, FilePlus, LayoutDashboard, Moon, Search, Settings } from 'lucide-react';
import { CommandPalette } from './CommandPalette.component';
import type { CommandItem } from './CommandPalette.types';

// ── Shared sample data ─────────────────────────────────────────────────────────

const ITEMS: CommandItem[] = [
  {
    id: '1',
    label: 'Go to Dashboard',
    icon: LayoutDashboard,
    group: 'Navigation',
    shortcut: ['⌘', 'D'],
  },
  {
    id: '2',
    label: 'New Document',
    icon: FilePlus,
    group: 'Actions',
    shortcut: ['⌘', 'N'],
    action: () => alert('New doc'),
  },
  {
    id: '3',
    label: 'Search Files',
    icon: Search,
    group: 'Actions',
    keywords: ['find', 'lookup'],
  },
  {
    id: '4',
    label: 'Toggle Theme',
    icon: Moon,
    group: 'Settings',
  },
  {
    id: '5',
    label: 'Open Settings',
    icon: Settings,
    group: 'Settings',
    shortcut: ['⌘', ','],
  },
  {
    id: '6',
    label: 'View Documentation',
    description: 'Open the docs in a new tab',
    icon: BookOpen,
    group: 'Help',
  },
  {
    id: '7',
    label: 'Report a Bug',
    icon: Bug,
    group: 'Help',
    disabled: true,
  },
];

/** Palette trigger shared across stories */
const TriggerButton = ({ onClick }: { onClick: () => void }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
    }}
  >
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#fff',
        color: '#1e293b',
        fontSize: '0.875rem',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      Open Command Palette
      <kbd
        style={{
          display: 'inline-flex',
          gap: '2px',
          padding: '1px 6px',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#94a3b8',
          background: '#f8fafc',
        }}
      >
        ⌘K
      </kbd>
    </button>
  </div>
);

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Overlays/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A keyboard-driven command palette rendered via `createPortal`. ' +
          'Supports fuzzy search, grouped results, keyboard shortcuts, and smooth enter/exit animations.',
      },
    },
  },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
    items: { control: false },
    footer: { control: false },
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
    maxHeight: { control: 'text' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;

// ── Stories ────────────────────────────────────────────────────────────────────

// Stories that manage their own `open` state use a plain object (no `Story`
// type annotation). This mirrors the Chip `Examples` pattern in the codebase
// and avoids the Storybook TS error that would otherwise require required props
// (open / onClose / items) inside `args` even when a render function is used.

/**
 * The default story renders a full palette with a mixed set of items.
 * Click the trigger button to open it.
 */
export const Default = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette open={open} onClose={() => setOpen(false)} items={ITEMS} />
      </>
    );
  },
};

/**
 * All items carry a `group` property, producing clearly labelled sections.
 * Groups appear in the order their first item appears in the `items` array.
 */
export const WithGroups = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette open={open} onClose={() => setOpen(false)} items={ITEMS} />
      </>
    );
  },
};

/**
 * Demonstrates shortcut badges rendered as `<kbd>` elements.
 * Use ArrowUp / ArrowDown to move between items and inspect the shortcuts.
 */
export const WithShortcuts = {
  render: () => {
    const [open, setOpen] = useState(false);
    const shortcutItems: CommandItem[] = ITEMS.filter((item) => item.shortcut);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette open={open} onClose={() => setOpen(false)} items={shortcutItems} />
      </>
    );
  },
};

/**
 * Empty items list — shows the `emptyText` placeholder immediately.
 * You can also trigger the empty state in any other story by typing a
 * query that matches nothing.
 */
export const EmptyState = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette
          open={open}
          onClose={() => setOpen(false)}
          items={[]}
          emptyText="No commands available right now"
        />
      </>
    );
  },
};

/**
 * The `footer` prop accepts any ReactNode and is placed on the right side of
 * the footer bar, next to the keyboard-hint strip.
 */
export const WithFooter = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette
          open={open}
          onClose={() => setOpen(false)}
          items={ITEMS}
          footer={
            <span
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'var(--font-family-mono, monospace)',
              }}
            >
              {ITEMS.length} commands
            </span>
          }
        />
      </>
    );
  },
};

/**
 * Items with `disabled: true` are rendered at reduced opacity and skip
 * keyboard navigation — you cannot land on them with ArrowUp / ArrowDown.
 */
export const WithDisabledItems = {
  render: () => {
    const [open, setOpen] = useState(false);
    const mixed: CommandItem[] = [
      { id: 'a', label: 'Active Command', icon: Settings, group: 'General' },
      { id: 'b', label: 'Disabled Command', icon: Bug, group: 'General', disabled: true },
      {
        id: 'c',
        label: 'Another Active',
        icon: FilePlus,
        group: 'General',
        shortcut: ['⌘', 'N'],
      },
      {
        id: 'd',
        label: 'Also Disabled',
        description: 'This action is currently unavailable',
        icon: Moon,
        group: 'General',
        disabled: true,
      },
    ];
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} />
        <CommandPalette open={open} onClose={() => setOpen(false)} items={mixed} />
      </>
    );
  },
};
