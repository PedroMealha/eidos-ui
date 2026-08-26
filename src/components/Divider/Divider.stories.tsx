import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider.component';

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
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

export const Default: Story = {
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
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '2rem 2.5rem',
        padding: '1.5rem',
      }}>
        <div>
          <p style={label}>Horizontal</p>
          <div>
            <div style={{ padding: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>Content above</div>
            <Divider direction="horizontal" />
            <div style={{ padding: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>Content below</div>
          </div>
        </div>

        <div>
          <p style={label}>Vertical</p>
          <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Left</span>
            <Divider direction="vertical" />
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Right</span>
          </div>
        </div>

        <div>
          <p style={label}>In a List</p>
          <div style={{ display: 'flex', flexDirection: 'column', width: '180px', border: '1px solid var(--gray-300)', borderRadius: 'var(--border-radius-md)' }}>
            <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 1</div>
            <Divider />
            <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 2</div>
            <Divider />
            <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 3</div>
          </div>
        </div>
      </div>
    );
  },
};
