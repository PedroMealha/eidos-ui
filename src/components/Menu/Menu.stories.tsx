import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { User, Settings, LogOut, FileText, Copy, Trash2, Share2, Mail } from 'lucide-react';
import { Menu } from './Menu.component';
import { Button } from '../Button';
import type { MenuItemType } from './Menu.types';
import { StoryRow } from '../../story-layout.docs';
import { expect, screen, waitFor } from 'storybook/test';

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

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * The items were `<li onClick>` with no role, no `tabIndex` and no key handler,
 * so every menu in the library - here, `ContextMenu`, `SplitButton`, `Table` and
 * `DataGrid` row actions - could only be operated with a mouse. That is WCAG
 * 2.1.1 (Level A), and no tooling caught it: axe only sees what is on screen and
 * every other story on this page renders the menu closed.
 */
export const KeyboardOperation: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    trigger: <Button variant="outlined">Actions</Button>,
    items: [
      { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: action('Copy') },
      { type: 'item', id: '2', label: 'Share', icon: Share2, onClick: action('Share') },
      { type: 'separator', id: 'sep' },
      { type: 'item', id: '3', label: 'Delete', icon: Trash2, onClick: action('Delete') },
    ],
  },
  play: async ({ canvas, userEvent, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    await step('opens from the keyboard, and focus moves into the menu', async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');

      const items = await screen.findAllByRole('menuitem');
      expect(items, 'the items are not exposed as menuitems').toHaveLength(3);
      // Retried: the panel is `visibility: hidden` until it has been
      // positioned, and focus cannot land on a hidden element.
      await waitFor(() =>
        expect(document.activeElement, 'focus never entered the menu').toBe(items[0]),
      );
    });

    await step('arrow keys, Home and End move within the menu', async () => {
      const items = screen.getAllByRole('menuitem');

      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(items[1]);

      await userEvent.keyboard('{End}');
      expect(document.activeElement).toBe(items[2]);

      // Wraps, rather than dead-ending at the last item.
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(items[0]);

      await userEvent.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(items[2]);
    });

    await step('the menu is a single tab stop, not one per item', async () => {
      const items = screen.getAllByRole('menuitem');
      const tabbable = items.filter((item) => item.getAttribute('tabindex') === '0');
      expect(tabbable, 'roving tabIndex is not being applied').toHaveLength(1);
      expect(tabbable[0]).toBe(document.activeElement);
    });

    await step('Enter activates the focused item', async () => {
      await userEvent.keyboard('{Enter}');
      // An `li` is not a button, so this only works because activation is wired
      // by hand - and it closes the menu, which returns focus to the trigger.
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      await waitFor(() =>
        expect(document.activeElement, 'focus was not returned to the trigger').toBe(trigger),
      );
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Deliberately left **open** when the play function finishes, and deliberately
 * carrying one of every item type. axe only audits what is rendered, so a menu
 * that is always closed is a menu whose ARIA is never checked - which is how
 * `role="menu"` sat on `Dropdown`'s content `<div>` (making the items
 * `listitem`s of a list, not a menu) through several releases.
 */
export const OpenMenuAria: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    trigger: <Button variant="outlined">Everything</Button>,
    items: [
      { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: action('Copy') },
      { type: 'item', id: '2', label: 'Paste', icon: FileText, disabled: true },
      { type: 'separator', id: 'sep1' },
      {
        type: 'nested',
        id: 'nested',
        label: 'Send to',
        icon: Share2,
        items: [{ type: 'item', id: 'n1', label: 'Email', icon: Mail, onClick: action('Email') }],
      },
      {
        type: 'component',
        id: 'custom',
        component: <span style={{ fontSize: 'var(--font-size-sm)' }}>Signed in as Ada</span>,
      },
    ],
  },
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Everything' }));

    await step('the list itself is the menu, and its items are menuitems', async () => {
      const menu = await screen.findByRole('menu');
      expect(menu.tagName, 'the role must sit on the element holding the items').toBe('UL');

      // Two real items plus the submenu trigger. The separator is a
      // `separator`, and the component item is a `none` wrapper around content
      // that owns its own semantics.
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    await step('a disabled item says so, and is not a tab stop', async () => {
      const paste = screen.getByRole('menuitem', { name: /Paste/ });
      expect(paste).toHaveAttribute('aria-disabled', 'true');
      expect(paste).toHaveAttribute('tabindex', '-1');
    });

    await step('the submenu trigger advertises its popup', async () => {
      expect(screen.getByRole('menuitem', { name: /Send to/ })).toHaveAttribute(
        'aria-haspopup',
        'menu',
      );
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * ArrowRight is the menu idiom for opening a submenu. It matters more here than
 * in a flat menu: the submenu is a nested `Dropdown`, so without a key handler
 * its trigger was a `<div>` that only responded to a click.
 */
export const KeyboardSubmenu: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    trigger: <Button variant="outlined">Open submenu</Button>,
    items: [
      { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: action('Copy') },
      {
        type: 'nested',
        id: 'nested',
        label: 'Send to',
        icon: Share2,
        items: [
          { type: 'item', id: 'n1', label: 'Email', icon: Mail, onClick: action('Email') },
          { type: 'item', id: 'n2', label: 'Slack', icon: Share2, onClick: action('Slack') },
        ],
      },
    ],
  },
  play: async ({ canvas, userEvent, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Open submenu' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const submenuTrigger = await screen.findByRole('menuitem', { name: /Send to/ });
    await waitFor(() => expect(document.activeElement).not.toBe(trigger));

    await step('ArrowRight opens the submenu and moves focus into it', async () => {
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(submenuTrigger);

      await userEvent.keyboard('{ArrowRight}');

      // Both panels are open now, so the submenu's own items are the ones added.
      await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
      await waitFor(() =>
        expect(
          screen.getByRole('menuitem', { name: /Email/ }),
          'focus did not move into the submenu',
        ).toBe(document.activeElement),
      );
    });
  },
};
