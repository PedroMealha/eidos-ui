import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight, LayoutDashboard, Settings, Ticket, Users } from 'lucide-react';
import { PageLayout } from './PageLayout.component';
import { CMDP_ITEMS } from '../CommandPalette/CommandPalette.fixtures';
import { Divider } from '../Divider';
import { Pill } from '../Pill';

const meta = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ height: '1000px', boxShadow: '0 0 6px 3px rgb(0,0,0,0.04)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    navigation: {
      brand: { name: 'Eidos' },
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      footer: (
        <>
          <Divider />
          <Pill color="primary" variant="outlined" size="sm">
            Admin
          </Pill>
        </>
      ),
    },
    toolbar: {
      breadcrumbs: {
        separator: <ChevronRight size={14} />,
        items: [
          { label: 'Home' },
          { label: 'Products' },
          { label: 'Electronics' },
          { label: 'Smartphones' },
        ],
      },
      cmdPaletteItems: CMDP_ITEMS,
      user: { name: 'John Doe', color: 'primary' },
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
            <div
              style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-sm) 0' }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
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
    header: {
      title: 'Page Title',
      subtitle: 'Page Subtitle',
      actions: [
        {
          children: 'Refresh',
          preIcon: 'refresh-cw',
          variant: 'outlined',
          onClick: () => alert('Settings clicked'),
        },
      ],
    },
    children: 'Page content',
  },
  argTypes: {
    header: {
      control: 'object',
      description: 'Header section of the page layout.',
      table: {
        type: { summary: 'HeaderProps' },
        defaultValue: { summary: '{}' },
      },
    },
    toolbar: {
      control: 'object',
      description: 'Toolbar of the page layout.',
      table: {
        type: { summary: 'ToolbarProps' },
        defaultValue: { summary: '{}' },
      },
    },
    navigation: {
      control: 'object',
      description: 'Sidebar navigation rail of the page layout. Omit to leave the region empty.',
      table: {
        type: { summary: 'NavigationProps' },
        defaultValue: { summary: 'undefined' },
      },
    },
    footer: {
      control: 'object',
      description:
        'Footer of the page layout. Omit to fall back to the default Eidos UI copyright notice.',
      table: {
        type: { summary: 'FooterProps' },
        defaultValue: { summary: "{ copyright: '© <year> Eidos UI' }" },
      },
    },
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * At a narrow width, `Toolbar` wraps its breadcrumb trail onto its own line
 * (rather than clipping it or squeezing the search/actions/user menu off to
 * the side) and `Header` wraps its actions below the title/subtitle - both
 * driven by plain CSS, with no JS breakpoint of their own.
 *
 * `navigation.collapseBelow` is also set here - resize your actual browser
 * window (not this canvas frame) past `1024px` to see the rail itself
 * auto-collapse to icon-only, exactly as it does standalone (see the
 * `Navigation` docs).
 */
export const NarrowViewport: Story = {
  args: {
    navigation: {
      ...meta.args.navigation,
      collapseBelow: 1024,
    },
  },
  // Combined with the meta-level decorator's own height/shadow wrapper -
  // this one just constrains the width to demonstrate the narrow-viewport
  // behaviour without duplicating that styling.
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
};
