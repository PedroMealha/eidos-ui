import type { Meta } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
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

/**
 * Palette trigger shared across stories. `minHeight: '100vh'` previously used
 * here to vertically centre the button meant "100% of the browser window's
 * height", not "100% of this story's canvas" - harmless in Storybook's own
 * full-page story view, but in the Docs page's embedded (much shorter)
 * Canvas it produced a huge, mostly-empty block. A fixed height centres the
 * button just as well without depending on the surrounding page's height.
 */
const TriggerButton = ({
  onClick,
  shortcutKey,
}: {
  onClick: () => void;
  shortcutKey?: string | null;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
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
      {shortcutKey && (
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
          ⌘{shortcutKey.toUpperCase()}
        </kbd>
      )}
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
    open: {
      control: false,
      description:
        'Controlled open state. Omit (with `onClose`) for the palette to manage its own state.',
    },
    defaultOpen: {
      control: false,
      description: 'Initial open state when uncontrolled (`open` omitted).',
    },
    onClose: { control: false },
    onOpen: {
      control: false,
      description: 'Called when `shortcutKey` fires while `open` is controlled.',
    },
    shortcutKey: {
      control: 'text',
      description: 'Cmd/Ctrl+<key> shortcut that opens the palette. Pass `null` to disable it.',
    },
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
  // Docs pages render every story's Canvas simultaneously, each mounting its
  // own live CommandPalette - if every one of these secondary stories also
  // kept the default `shortcutKey: 'k'`, a single ⌘K press would open all of
  // them at once (see `Uncontrolled`, the one place this is meant to be
  // demonstrated). Still fully overridable via Controls if you want to test
  // it here specifically.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {/* The badge always shows a hint (defaulting to K) even though the
            functional shortcut defaults to disabled above - this story's
            trigger is the button; `shortcutKey` only reflects a value you've
            explicitly set via Controls. */}
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          items={ITEMS}
        />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Open Command Palette</button>
<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={items}
/>`.trim(),
      },
    },
  },
};

/**
 * Omitting `open`/`onClose` lets the palette manage its own state entirely -
 * no `useState`/`useEffect` needed at all. Press ⌘K / Ctrl+K to open it
 * directly; `shortcutKey` can be changed to any other letter, or set to
 * `null` to rely solely on your own trigger.
 */
export const Uncontrolled = {
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const key = args.shortcutKey === undefined ? 'k' : args.shortcutKey;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          background: '#f8fafc',
          color: '#94a3b8',
          fontSize: '0.875rem',
        }}
      >
        {key ? (
          <span>
            Press <kbd style={{ fontFamily: 'monospace' }}>⌘{key.toUpperCase()}</kbd> to open
          </span>
        ) : (
          <span>
            No trigger here - `shortcutKey` is disabled and there's no button in this story
          </span>
        )}
        <CommandPalette {...args} items={ITEMS} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'No `open`/`onClose` here at all - just press ⌘K / Ctrl+K. Try `shortcutKey="r"` to change it to ⌘R, or `shortcutKey={null}` to disable the built-in listener.',
      },
      source: {
        code: `<CommandPalette items={items} />`,
      },
    },
  },
};

/**
 * All items carry a `group` property, producing clearly labelled sections.
 * Groups appear in the order their first item appears in the `items` array.
 */
export const WithGroups = {
  // See the comment on Default's `args` - avoids every story's own default
  // ⌘K listener firing at once on the Docs page, where all Canvases (and
  // thus all CommandPalette instances) are mounted simultaneously.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          items={ITEMS}
        />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

// Items that share a \`group\` string are clustered under a labelled heading.
<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={items}
/>`.trim(),
      },
    },
  },
};

/**
 * Demonstrates shortcut badges rendered as `<kbd>` elements.
 * Use ArrowUp / ArrowDown to move between items and inspect the shortcuts.
 */
export const WithShortcuts = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const [open, setOpen] = useState(false);
    const shortcutItems: CommandItem[] = ITEMS.filter((item) => item.shortcut);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          items={shortcutItems}
        />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

// Each item's \`shortcut: string[]\` renders as <kbd> badges.
<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={items}
/>`.trim(),
      },
    },
  },
};

/**
 * Empty items list - shows the `emptyText` placeholder immediately.
 * You can also trigger the empty state in any other story by typing a
 * query that matches nothing.
 */
export const EmptyState = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          items={[]}
          emptyText={args.emptyText ?? 'No commands available right now'}
        />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={[]}
  emptyText="No commands available right now"
/>`.trim(),
      },
    },
  },
};

/**
 * The `footer` prop accepts any ReactNode and is placed on the right side of
 * the footer bar, next to the keyboard-hint strip.
 */
export const WithFooter = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
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
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={items}
  footer={<span>{items.length} commands</span>}
/>`.trim(),
      },
    },
  },
};

/**
 * Items with `disabled: true` are rendered at reduced opacity and skip
 * keyboard navigation - you cannot land on them with ArrowUp / ArrowDown.
 */
export const WithDisabledItems = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
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
        <TriggerButton onClick={() => setOpen(true)} shortcutKey={args.shortcutKey || 'k'} />
        <CommandPalette
          {...args}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          items={mixed}
        />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [open, setOpen] = useState(false);

// Set \`disabled: true\` on any item to skip it during keyboard navigation.
<CommandPalette
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  items={items}
/>`.trim(),
      },
    },
  },
};
