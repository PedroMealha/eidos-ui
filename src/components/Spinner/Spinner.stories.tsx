import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner.component';

const meta = {
  title: 'Layout/Spinner',
  component: Spinner,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
          <p style={label}>Sizes</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Spinner size="small" />
            <Spinner size="medium" />
            <Spinner size="large" />
          </div>
        </div>

        <div>
          <p style={label}>Colors</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Spinner color="primary" />
            <Spinner color="secondary" />
            <Spinner color="success" />
            <Spinner color="danger" />
          </div>
        </div>

        <div>
          <p style={label}>Contained</p>
          <div style={{ height: '80px', position: 'relative', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
            <Spinner />
          </div>
        </div>
      </div>
    );
  },
};
