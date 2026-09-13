import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar } from './Toolbar.component';
import { CMDP_ITEMS } from '../CommandPalette/CommandPalette.fixtures';

const meta = {
  title: 'Layout/Components/Toolbar',
  component: Toolbar,
  parameters: { layout: 'padded' },
  args: {
    breadcrumbs: {
      items: [
        {
          label: 'Home',
          href: '#',
        },
        {
          label: 'Components',
          href: '#',
        },
      ],
      separator: '/',
    },
    cmdPaletteItems: CMDP_ITEMS,
    actions: [
      {
        tooltip: 'Notifications',
        icon: 'Bell',
        color: 'secondary',
        onClick: () => alert('Notifications clicked'),
      },
      {
        tooltip: 'Settings',
        icon: 'Settings',
        color: 'secondary',
        onClick: () => alert('Settings clicked'),
      },
      {
        tooltip: 'User',
        icon: 'User',
        onClick: () => alert('Settings clicked'),
      },
    ],
    userMenu: [
      {
        type: 'component',
        id: 'identity',
        component: (
          <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-sm) 0' }}>
            <span
              style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              John Doe
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
              john.doe@example.com
            </span>
          </div>
        ),
      },
      { type: 'separator', id: 'sep-1' },
      {
        type: 'item',
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        onClick: () => alert('Settings clicked'),
      },
      {
        type: 'item',
        id: 'logout',
        label: 'Logout',
        icon: 'log-out',
        color: 'danger',
        onClick: () => alert('Logout clicked'),
      },
    ],
  },
  argTypes: {
    breadcrumbs: {
      control: 'object',
      description: 'Breadcrumbs to display in the header.',
      table: {
        type: { summary: 'BreadcrumbProps' },
        defaultValue: { summary: 'undefined' },
      },
    },
    cmdPaletteItems: {
      control: 'object',
      description: 'Command palette items to display in the toolbar.',
      table: {
        type: { summary: 'CommandItem[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    actions: {
      control: 'object',
      description: 'Actions to display in the toolbar.',
      table: {
        type: { summary: 'ToolbarActionProps[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    userMenu: {
      control: 'object',
      description: 'User menu items to display in the toolbar.',
      table: {
        type: { summary: 'MenuItemType[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * `cmdPaletteItems` renders a `CommandPalette` with its built-in `trigger`,
 * with no `actions` alongside it.
 */
export const WithCommandPalette: Story = {
  args: {
    actions: undefined,
  },
};

/**
 * `actions` accepts a restricted subset of `Button` props - `icon` for an
 * icon-only action - rendered right-aligned, with no command palette trigger.
 */
export const WithActions: Story = {
  args: {
    cmdPaletteItems: undefined,
  },
};

/**
 * A single breadcrumb and an empty `userMenu` - the minimum required shape
 * for `ToolbarProps`, with every optional prop omitted.
 */
export const Minimal: Story = {
  args: {
    breadcrumbs: { items: [{ label: 'Home' }] },
    cmdPaletteItems: undefined,
    actions: undefined,
    userMenu: [],
  },
};
