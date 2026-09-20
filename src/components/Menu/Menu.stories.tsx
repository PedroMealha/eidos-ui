import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { User, Settings, LogOut, FileText, Copy, Trash2, Share2, Mail } from 'lucide-react';
import { Menu } from './Menu.component';
import { Button } from '../Button';
import type { MenuItemType } from './Menu.types';
import { StoryRow } from '../../story-layout.docs';

const meta = {
  title: 'Overlays/Menu',
  component: Menu,
  parameters: { layout: 'centered' },
  argTypes: {
    trigger: {
      control: false,
      description: 'The element that triggers the menu (e.g., button, icon)',
      table: { type: { summary: 'React.ReactNode' } },
    },
    items: {
      control: false,
      description: 'Array of menu items (item, separator, component, nested)',
      table: { type: { summary: 'MenuItemType[]' } },
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of menu (number in px or string with units)',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of menu',
      table: {
        type: { summary: 'number | string | "auto"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of menu',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of menu',
      table: {
        type: { summary: 'number | string | "auto"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    autoWidth: {
      control: 'boolean',
      description: 'Match menu width to trigger width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    closeOnItemClick: {
      control: 'boolean',
      description: 'Close menu when an item is clicked',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip message for the menu trigger',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    triggerRef: { table: { disable: true } },
  },
  // `trigger` and `items` are required, so they live here to satisfy the type
  // for the render-only stories below as well as seeding the Default controls.
  args: {
    trigger: <Button variant="outlined">Open menu</Button>,
    items: [
      { type: 'item', id: '1', label: 'Profile', icon: User, onClick: action('Profile') },
      { type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: action('Settings') },
      { type: 'separator', id: 'sep1' },
      { type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: action('Logout') },
    ],
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicMenuItems: MenuItemType[] = [
  { type: 'item', id: '1', label: 'Profile', icon: User, onClick: action('Profile') },
  { type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: action('Settings') },
  { type: 'separator', id: 'sep1' },
  { type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: action('Logout') },
];

export const Default: Story = {};

// The `Examples` story that used to live here rendered all seven menus at
// once. Storybook's "Show code" walks the whole rendered tree with a bundled
// `react-element-to-jsx-string` that reads React 19's removed `element.ref`,
// and on a tree that deep the walk froze the Docs tab - which is why it
// carried a hand-maintained static `code` string as a workaround. Split into
// focused stories, each tree is small enough that Storybook can derive the
// source dynamically again, so the source can no longer drift from the story.

export const WithShortcuts: Story = {
  args: {
    trigger: (
      <Button variant="filled" color="secondary">
        File Menu
      </Button>
    ),
    items: [
      {
        type: 'item',
        id: '1',
        label: 'New File',
        icon: FileText,
        shortcut: '⌘N',
        onClick: action('New File'),
      },
      { type: 'item', id: '2', label: 'Copy', icon: Copy, shortcut: '⌘C', onClick: action('Copy') },
      {
        type: 'item',
        id: '3',
        label: 'Delete',
        icon: Trash2,
        shortcut: '⌫',
        onClick: action('Delete'),
      },
    ],
  },
};

export const WithNestedSubmenu: Story = {
  args: {
    trigger: (
      <Button variant="outlined" color="success">
        More Options
      </Button>
    ),
    items: [
      { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: action('Copy') },
      { type: 'item', id: '2', label: 'Share', icon: Share2, onClick: action('Share') },
      { type: 'separator', id: 'sep1' },
      {
        type: 'nested',
        id: 'nested1',
        label: 'More Actions',
        icon: Settings,
        items: [
          { type: 'item', id: 'n1', label: 'Archive', onClick: action('Archive') },
          { type: 'item', id: 'n2', label: 'Export', onClick: action('Export') },
          { type: 'item', id: 'n3', label: 'Print', onClick: action('Print') },
        ],
      },
      { type: 'separator', id: 'sep2' },
      {
        type: 'item',
        id: '3',
        label: 'Delete',
        icon: Trash2,
        color: 'danger',
        onClick: action('Delete'),
      },
    ],
  },
};

export const WithDisabledItems: Story = {
  args: {
    trigger: <Button variant="text">Edit</Button>,
    items: [
      {
        type: 'item',
        id: '1',
        label: 'Cut',
        icon: 'scissors',
        shortcut: '⌘X',
        onClick: action('Cut'),
      },
      {
        type: 'item',
        id: '2',
        label: 'Copy',
        icon: 'copy',
        shortcut: '⌘C',
        onClick: action('Copy'),
        disabled: true,
      },
      {
        type: 'item',
        id: '3',
        label: 'Paste',
        icon: 'clipboard',
        shortcut: '⌘V',
        onClick: action('Paste'),
        disabled: true,
      },
    ],
  },
};

export const WithCustomComponentItem: Story = {
  args: {
    trigger: (
      <Button variant="outlined" color="primary">
        Custom Menu
      </Button>
    ),
    items: [
      { type: 'item', id: '1', label: 'Profile', icon: User, onClick: action('Profile') },
      { type: 'separator', id: 'sep1' },
      {
        type: 'component',
        id: 'custom',
        component: (
          <div
            style={{
              padding: 'var(--spacing-sm)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--border-radius-sm)',
            }}
          >
            <strong>Custom Content</strong>
            <p
              style={{
                margin: 'var(--spacing-xs) 0 0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-muted)',
              }}
            >
              You can add any React component here
            </p>
          </div>
        ),
      },
      { type: 'separator', id: 'sep2' },
      { type: 'item', id: '2', label: 'Logout', icon: LogOut, onClick: action('Logout') },
    ],
  },
};

export const Sizing: Story = {
  render: () => (
    <StoryRow>
      <Menu
        trigger={
          <Button variant="outlined" size="sm">
            Min width
          </Button>
        }
        items={[
          { type: 'item', id: '1', label: 'Short', onClick: action('Short') },
          { type: 'item', id: '2', label: 'Item', onClick: action('Item') },
        ]}
        minWidth={200}
      />
      <Menu
        trigger={
          <Button variant="outlined" size="sm">
            Max height
          </Button>
        }
        items={Array.from({ length: 6 }, (_, i) => ({
          type: 'item' as const,
          id: String(i + 1),
          label: `Item ${i + 1}`,
          icon: Mail,
          onClick: () => {},
        }))}
        maxHeight={150}
      />
    </StoryRow>
  ),
};

export const WithTooltip: Story = {
  args: {
    trigger: <Button variant="filled">Hover me</Button>,
    items: basicMenuItems,
    tooltip: 'Open menu to see options',
  },
};
