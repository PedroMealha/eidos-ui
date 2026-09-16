import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header.component';
import { Pill } from '../Pill';

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
      // Kept as a text control even though the prop is a ReactNode - the
      // string case is the one worth having editable in the Controls panel.
      control: 'text',
      description: 'Title to display in the header. Accepts inline nodes, not just a string.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    subtitle: {
      control: 'object',
      description: 'Subtitle to display in the header.',
      table: {
        type: { summary: 'React.ReactNode' },
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

/**
 * `title` takes any inline node, not only a string, so a status indicator can
 * sit beside the text rather than being pushed into the subtitle. It is
 * centered on the title's own line, and wraps below it when there isn't room
 * for both.
 */
export const WithInlineTitleContent: Story = {
  args: {
    title: (
      <>
        Invoice #4823
        <Pill color="warning" variant="outlined" size="sm">
          Overdue
        </Pill>
      </>
    ),
    subtitle: 'Issued 12 March 2026 · Net 30',
  },
};
