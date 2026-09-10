import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header.component';

const meta = {
  title: 'Layout/Components/Header',
  component: Header,
  parameters: { layout: 'padded' },
  args: {
      title: 'Eidos UI',
      subtitle: 'A modern UI component library',
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
  argTypes: {
    title: {
      control: 'text',
      description: 'Title to display in the header.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Brand Name' },
      },
    },
    subtitle: {
      control: 'object',
      description: 'Subtitle to display in the header.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    breadcrumbs: {
      control: 'object',
      description: 'Breadcrumbs to display in the header.',
      table: {
        type: { summary: 'BreadcrumbProps' },
        defaultValue: { summary: 'undefined' },
      },
    },
    actions: {
      control: 'object',
      description: 'Actions to display in the header.',
      table: {
        type: { summary: 'HeaderActionProps[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};