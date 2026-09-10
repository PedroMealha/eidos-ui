import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight } from 'lucide-react';
import { PageLayout } from './PageLayout.component';

const meta = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ height: '1000px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    toolbar: {
      brandName: 'Eidos UI',
      avatar: {
        name: 'Eidos UI',
      },
      actions: [
        {
          icon: 'Bell',
          color: 'secondary',
          onClick: () => alert('Notifications clicked'),
        },
        {
          children: 'Settings',
          preIcon: 'Settings',
          color: 'secondary',
          onClick: () => alert('Settings clicked'),
        },
        {
          icon: 'User',
          onClick: () => alert('Settings clicked'),
        },
      ],
    },
    header: {
      title: 'Page Title',
      subtitle: 'Page Subtitle',
      actions: [
        {
          children: 'Action 1',
          onClick: () => alert('Action 1 clicked'),
        },
        {
          children: 'Action 2',
          onClick: () => alert('Action 2 clicked'),
        },
      ],
      breadcrumbs: {
        separator: <ChevronRight size={14} />,
        items: [
          { label: 'Home' },
          { label: 'Products' },
          { label: 'Electronics' },
          { label: 'Smartphones' },
        ],
      },
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
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
