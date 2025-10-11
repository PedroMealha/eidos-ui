import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, Star, Check } from 'lucide-react';
import { Chip } from './Chip.component';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    children: undefined,
    preIcon: undefined,
    posIcon: undefined,
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the chip',
      table: { type: { summary: 'React.ReactNode' } },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'soft'],
      description: 'Visual style variant',
      table: { type: { summary: '"filled" | "outlined" | "soft"' }, defaultValue: { summary: 'filled' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: { type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' }, defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the chip',
      table: { type: { summary: '"small" | "medium" | "large"' }, defaultValue: { summary: 'medium' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the chip',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip message to display on hover',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    preIcon: {
      control: false,
      description: 'Icon to display before text. Pass Lucide component (Tag).',
      table: { type: { summary: 'React.ComponentType' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    posIcon: {
      control: false,
      description: 'Icon to display after text. Pass Lucide component (Check).',
      table: { type: { summary: 'React.ComponentType' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    onClick: {
      control: false,
      description: 'Callback when chip is clicked (makes chip clickable)',
      table: { type: { summary: '() => void' }, defaultValue: { summary: 'undefined' } },
    },
    onRemove: {
      control: false,
      description: 'Callback when remove button is clicked (adds remove button)',
      table: { type: { summary: '() => void' }, defaultValue: { summary: 'undefined' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make chip full width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Chip Label',
  },
};

export const Examples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div>
        <h3>Variants</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip variant="filled">Filled</Chip>
          <Chip variant="outlined">Outlined</Chip>
          <Chip variant="soft">Soft</Chip>
        </div>
      </div>

      <div>
        <h3>Colors</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip color="primary">Primary</Chip>
          <Chip color="secondary">Secondary</Chip>
          <Chip color="success">Success</Chip>
          <Chip color="danger">Danger</Chip>
          <Chip color="warning">Warning</Chip>
          <Chip color="info">Info</Chip>
        </div>
      </div>

      <div>
        <h3>Sizes</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip size="small">Small</Chip>
          <Chip size="medium">Medium</Chip>
          <Chip size="large">Large</Chip>
        </div>
      </div>

      <div>
        <h3>With Icons</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip preIcon={Tag}>Tagged</Chip>
          <Chip posIcon={Check}>Verified</Chip>
          <Chip preIcon={Star} posIcon={Check}>Featured</Chip>
        </div>
      </div>

      <div>
        <h3>Interactive</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip onClick={() => alert('Clicked!')}>Clickable</Chip>
          <Chip onRemove={() => alert('Removed!')}>Removable</Chip>
          <Chip onClick={() => alert('Clicked!')} onRemove={() => alert('Removed!')}>
            Both
          </Chip>
        </div>
      </div>

      <div>
        <h3>States</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip>Default</Chip>
          <Chip disabled>Disabled</Chip>
          <Chip tooltip="Helpful information">With Tooltip</Chip>
        </div>
      </div>

      <div>
        <h3>Combined Styles</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip variant="outlined" color="success" preIcon={Check} size="small">
            Verified
          </Chip>
          <Chip variant="soft" color="warning" posIcon={Star}>
            Premium
          </Chip>
          <Chip variant="filled" color="danger" onRemove={() => {}}>
            Error
          </Chip>
        </div>
      </div>
    </div>
  ),
};


