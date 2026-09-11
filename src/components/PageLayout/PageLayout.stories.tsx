import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight } from 'lucide-react';
import { PageLayout } from './PageLayout.component';
import { CMDP_ITEMS } from '../CommandPalette/CommandPalette.stories';

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
