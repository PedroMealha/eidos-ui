import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider.component';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the divider',
      table: { type: { summary: '"horizontal" | "vertical"' }, defaultValue: { summary: 'horizontal' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
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

export const Examples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div>
        <h3>Horizontal Divider</h3>
        <div style={{ padding: '1rem' }}>
          <p>Content above</p>
          <Divider direction="horizontal" />
          <p>Content below</p>
        </div>
      </div>

      <div>
        <h3>Vertical Divider</h3>
        <div style={{ display: 'flex', alignItems: 'center', height: '100px', gap: '1rem' }}>
          <div>Left content</div>
          <Divider direction="vertical" />
          <div>Right content</div>
        </div>
      </div>

      <div>
        <h3>In a Menu</h3>
        <div style={{ display: 'flex', flexDirection: 'column', width: '200px', border: '1px solid var(--gray-300)', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ padding: '0.75rem' }}>Menu Item 1</div>
          <Divider />
          <div style={{ padding: '0.75rem' }}>Menu Item 2</div>
          <Divider />
          <div style={{ padding: '0.75rem' }}>Menu Item 3</div>
        </div>
      </div>
    </div>
  ),
};
