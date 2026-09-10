import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar } from './Toolbar.component';

const meta = {
  title: 'Layout/Components/Toolbar',
  component: Toolbar,
  parameters: { layout: 'padded' },
  args: {
      brandName: 'Eidos UI',
      avatar: {
        name: 'Eidos UI',
      },
      actions: [
        {
          icon: 'Bell',
          color: 'secondary',
          onClick: () => console.log('Notifications clicked'),
        },
        {
          children: 'Settings',
          preIcon: 'Settings',
          color: 'secondary',
          onClick: () => console.log('Settings clicked'),
        },
        {
          icon: 'User',
          onClick: () => console.log('Settings clicked'),
        },
      ],
  },
  argTypes: {
    brandName: {
      control: 'text',
      description: 'Brand name to display in the toolbar.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Brand Name' },
      },
    },
    avatar: {
      control: 'object',
      description: 'Avatar to display next to the brand name.',
      table: {
        type: { summary: 'ToolbarAvatarProps' },
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
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};