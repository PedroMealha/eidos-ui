import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner.component';

const meta = {
  title: 'Components/Spinner',
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
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ padding: '1rem' }}>Full Page Loading</h3>
        <div style={{ height: '400px', position: 'relative' }}>
          <Spinner />
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <h3>Custom Usage (Icon Only)</h3>
        <p>You can use the Loader2 icon from lucide-react directly for inline loading states:</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <span>Loading</span>
          <span style={{ animation: 'spin-pulse 1s linear infinite', display: 'inline-flex' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        </div>
      </div>
    </div>
  ),
};
