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

/**
 * `actions` accepts a restricted subset of `Button` props - `icon` for an
 * icon-only action, or `children`/`preIcon`/`posIcon` for a labeled one -
 * and any number of them can be mixed together.
 */
export const WithMultipleActions: Story = {
  args: {
    actions: [
      { icon: 'Bell', color: 'secondary', variant: 'text', tooltip: 'Notifications' },
      { icon: 'Settings', color: 'secondary', variant: 'text', tooltip: 'Settings' },
      {
        children: 'Export',
        preIcon: 'download',
        variant: 'outlined',
        onClick: () => alert('Export clicked'),
      },
      {
        children: 'New item',
        preIcon: 'plus',
        onClick: () => alert('New item clicked'),
      },
    ],
  },
};

/**
 * `subtitle` and `actions` are both optional - a bare `title` is a valid
 * header on its own.
 */
export const TitleOnly: Story = {
  args: {
    subtitle: undefined,
    actions: undefined,
  },
};
