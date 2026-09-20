import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Toolbar } from './Toolbar.component';
import { CMDP_ITEMS } from '../CommandPalette/CommandPalette.fixtures';
import { Pill } from '../Pill';
import { Switch } from '../Switch';

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
    user: { name: 'John Doe', color: 'primary' },
    actions: [
      {
        tooltip: 'Notifications',
        icon: 'Bell',
        color: 'secondary',
        onClick: action('Notifications clicked'),
      },
      {
        tooltip: 'Settings',
        icon: 'Settings',
        color: 'secondary',
        onClick: action('Settings clicked'),
      },
      {
        tooltip: 'User',
        icon: 'User',
        onClick: action('Settings clicked'),
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
        onClick: action('Settings clicked'),
      },
      {
        type: 'item',
        id: 'logout',
        label: 'Logout',
        icon: 'log-out',
        color: 'danger',
        onClick: action('Logout clicked'),
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
      description:
        'User menu items, opened from the `user` avatar. Omit to render the avatar as a plain mark.',
      table: {
        type: { summary: 'MenuItemType[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    user: {
      control: 'object',
      description: 'The signed-in user, rendered as the avatar at the far right.',
      table: {
        type: { summary: "Pick<AvatarProps, 'name' | 'src' | 'color'>" },
        defaultValue: { summary: 'undefined' },
      },
    },
    content: {
      control: false,
      description:
        'Free-form content rendered before the command palette trigger - an environment badge, an org switcher, a global toggle.',
      table: {
        type: { summary: 'React.ReactNode' },
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
 * `content` takes any node - unlike `actions`, which is a restricted button
 * subset - for the things an app bar needs that aren't buttons: an
 * environment badge, an org/tenant switcher, a global toggle.
 */
export const WithContent: Story = {
  args: {
    actions: undefined,
    content: (
      <>
        <Pill color="warning" variant="outlined" size="sm">
          Staging
        </Pill>
        <Switch label="Compact rows" size="sm" />
      </>
    ),
  },
};

/**
 * Every prop is optional - a bare `<Toolbar />` renders an empty bar. Here
 * only a single breadcrumb is given, with no user, so no avatar is rendered
 * at all (it used to be a hardcoded "John Doe" placeholder).
 */
export const Minimal: Story = {
  args: {
    breadcrumbs: { items: [{ label: 'Home' }] },
    cmdPaletteItems: undefined,
    actions: undefined,
    user: undefined,
    userMenu: undefined,
  },
};
