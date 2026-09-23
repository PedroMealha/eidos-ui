import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider.component';

const meta = {
  title: 'Elements/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the divider',
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// The decorator gives the container both a width and a height, and lays it
// out as a flex row. A fixed-width box with no height (what this used to be)
// renders a `vertical` divider as nothing at all - so flipping the `direction`
// control, the one control this component has, appeared to break it.
export const Playground: Story = {
  args: {
    direction: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', height: '120px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '200px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export const SeparatingContent: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <p style={{ margin: 0, padding: 'var(--spacing-sm) 0' }}>Content above</p>
      <Divider />
      <p style={{ margin: 0, padding: 'var(--spacing-sm) 0' }}>Content below</p>
    </div>
  ),
};

export const InAList: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        border: '1px solid var(--gray-300)',
        borderRadius: 'var(--border-radius-md)',
      }}
    >
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>Item 1</div>
      <Divider />
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>Item 2</div>
      <Divider />
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>Item 3</div>
    </div>
  ),
};
