import type { Meta } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { BookOpen, Bug, FilePlus, LayoutDashboard, Moon, Search, Settings } from 'lucide-react';
import { CommandPalette } from './CommandPalette.component';
import type { CommandItem } from './CommandPalette.types';
import { Avatar } from '../Avatar';

// ── Shared sample data ─────────────────────────────────────────────────────────

export const CMDP_ITEMS: CommandItem[] = [
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
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          height: '300px',
        }}
      >
        <Story />
      </div>
    ),
  ],
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
    items: {
      control: 'object',
      description: 'Array of command items to display in the palette.',
      table: {
        type: {
          summary: 'CommandItem[]',
        },
      },
    },
    footer: { control: false },
    trigger: {
      control: false,
      description:
        'Renders a clickable entry point inline. `true` for the built-in default trigger, a `ReactNode` for your own, or omit for a fully headless palette.',
    },
    triggerLabel: { control: 'text' },
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
    maxHeight: { control: 'text' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;

// ── Stories ────────────────────────────────────────────────────────────────────

// Stories use a plain object (no `Story` type annotation). This mirrors the
// Chip `Examples` pattern in the codebase and avoids the Storybook TS error
// that would otherwise require required props (items) inside `args` even
// when a render function is used.

/**
 * The default story renders a full palette with a mixed set of items.
 * Click the built-in trigger to open it.
 *
 * Docs pages render every story's Canvas simultaneously, each mounting its
 * own live CommandPalette - if every one of these secondary stories also
 * kept the default `shortcutKey: 'k'`, a single ⌘K press would open all of
 * them at once (see `Uncontrolled`, the one place this is meant to be
 * demonstrated), so it's disabled here. Still fully overridable via Controls.
 */
export const Default = {
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette {...args} trigger items={CMDP_ITEMS} />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={items} />`,
      },
    },
  },
};

/**
 * Omitting `trigger` (as well as `open`/`onClose`) lets the palette manage
 * its own state entirely - no `useState`/`useEffect`, and no visible entry
 * point at all. Press ⌘K / Ctrl+K to open it directly; `shortcutKey` can be
 * changed to any other letter, or set to `null` to disable the listener.
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
        <CommandPalette {...args} items={CMDP_ITEMS} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'No `trigger`/`open`/`onClose` here at all - just press ⌘K / Ctrl+K. Try `shortcutKey="r"` to change it to ⌘R, or `shortcutKey={null}` to disable the built-in listener.',
      },
      source: {
        code: `<CommandPalette items={items} />`,
      },
    },
  },
};

/**
 * `trigger` also accepts any `ReactNode` instead of `true` - it's wrapped in
 * a click handler that opens the palette, the same convention `Menu` and
 * `Dropdown` use for their own `trigger` prop.
 */
export const WithCustomTrigger = {
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger={<Avatar name="John Doe" size="sm" color="primary" />}
      items={CMDP_ITEMS}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger={<Avatar name="John Doe" size="sm" />} items={items} />`,
      },
    },
  },
};

/**
 * All items carry a `group` property, producing clearly labelled sections.
 * Groups appear in the order their first item appears in the `items` array.
 */
export const WithGroups = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette {...args} trigger items={CMDP_ITEMS} />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Items that share a \`group\` string are clustered under a labelled heading.
<CommandPalette trigger items={items} />`.trim(),
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
    const shortcutItems: CommandItem[] = CMDP_ITEMS.filter((item) => item.shortcut);
    return <CommandPalette {...args} trigger items={shortcutItems} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
// Each item's \`shortcut: string[]\` renders as <kbd> badges.
<CommandPalette trigger items={items} />`.trim(),
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
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger
      items={[]}
      emptyText={args.emptyText ?? 'No commands available right now'}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={[]} emptyText="No commands available right now" />`,
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
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger
      items={CMDP_ITEMS}
      footer={
        <span
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            fontFamily: 'var(--font-family-mono, monospace)',
          }}
        >
          {CMDP_ITEMS.length} commands
        </span>
      }
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={items} footer={<span>{items.length} commands</span>} />`,
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
    return <CommandPalette {...args} trigger items={mixed} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
// Set \`disabled: true\` on any item to skip it during keyboard navigation.
<CommandPalette trigger items={items} />`.trim(),
      },
    },
  },
};
