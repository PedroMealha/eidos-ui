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
    title: 'Page Title',
    subtitle: 'Page Subtitle',
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
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the page layout.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Page Title' },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle of the page layout.',
      table: {
        type: { summary: 'string | React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    noHeaderDivider: {
      control: 'boolean',
      description: 'Whether to show the divider after the header.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
