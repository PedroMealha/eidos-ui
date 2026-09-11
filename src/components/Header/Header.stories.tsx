import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header.component';

const meta = {
  title: 'Layout/Components/Header',
  component: Header,
  parameters: { layout: 'padded' },
  args: {
      title: 'Eidos UI',
      subtitle: 'A modern UI component library',
      actions: [
        {
          children: 'Refresh',
          preIcon: 'refresh-cw',
          variant: 'outlined',
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
      },
    },
    subtitle: {
      control: 'object',
      description: 'Subtitle to display in the header.',
      table: {
        type: { summary: 'string | React.ReactNode' },
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