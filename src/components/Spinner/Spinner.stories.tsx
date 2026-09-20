import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner.component';
import { StoryRow, StoryFrame } from '../../story-layout.docs';

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Diameter of the spinner.',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Colour of the rotating arc.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
};

export const Sizes: Story = {
  render: () => (
    <StoryRow gap="lg">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </StoryRow>
  ),
};

export const Colors: Story = {
  render: () => (
    <StoryRow gap="lg">
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <Spinner color="success" />
      <Spinner color="danger" />
      <Spinner color="warning" />
      <Spinner color="info" />
    </StoryRow>
  ),
};

/**
 * The spinner centres itself against the nearest positioned ancestor, so a
 * container only needs `position: relative` to host it.
 */
export const Contained: Story = {
  render: () => (
    <StoryFrame height={120} width={240}>
      <Spinner />
    </StoryFrame>
  ),
};
