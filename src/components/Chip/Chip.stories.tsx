import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, Star, Check } from 'lucide-react';
import { Chip } from './Chip.component';

const meta = {
  title: 'Elements/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
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
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: { type: { summary: '"filled" | "outlined" | "text"' }, defaultValue: { summary: 'filled' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: { type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' }, defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the chip',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
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
      control: 'text',
      description: 'Icon to display before text. Pass Lucide component (Tag) or string ("tag").',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    posIcon: {
      control: 'text',
      description: 'Icon to display after text. Pass Lucide component (Check) or string ("check").',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
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
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '2rem 2.5rem',
        padding: '1.5rem',
      }}>
        <div>
          <p style={label}>Variants</p>
          <div style={row}>
            <Chip variant="filled">Filled</Chip>
            <Chip variant="outlined">Outlined</Chip>
            <Chip variant="text">Text</Chip>
          </div>
        </div>

        <div>
          <p style={label}>Sizes</p>
          <div style={row}>
            <Chip size="sm">Small</Chip>
            <Chip size="md">Medium</Chip>
            <Chip size="lg">Large</Chip>
          </div>
        </div>

        <div>
          <p style={label}>States</p>
          <div style={row}>
            <Chip>Default</Chip>
            <Chip disabled>Disabled</Chip>
            <Chip tooltip="Helpful information">With Tooltip</Chip>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <p style={label}>Colors</p>
          <div style={row}>
            <Chip color="primary">Primary</Chip>
            <Chip color="secondary">Secondary</Chip>
            <Chip color="success">Success</Chip>
            <Chip color="danger">Danger</Chip>
            <Chip color="warning">Warning</Chip>
            <Chip color="info">Info</Chip>
          </div>
        </div>

        <div>
          <p style={label}>Icons</p>
          <div style={row}>
            <Chip preIcon={Tag}>Tagged</Chip>
            <Chip posIcon={Check}>Verified</Chip>
            <Chip preIcon={Star} posIcon={Check}>Featured</Chip>
          </div>
        </div>

        <div>
          <p style={label}>Interactive</p>
          <div style={row}>
            <Chip onClick={() => alert('Clicked!')}>Clickable</Chip>
            <Chip onRemove={() => alert('Removed!')}>Removable</Chip>
            <Chip onClick={() => alert('Clicked!')} onRemove={() => alert('Removed!')}>Both</Chip>
          </div>
        </div>

        <div>
          <p style={label}>Combined</p>
          <div style={row}>
            <Chip variant="outlined" color="success" preIcon={Check} size="sm">Verified</Chip>
            <Chip variant="text" color="warning" posIcon={Star}>Premium</Chip>
            <Chip variant="filled" color="danger" onRemove={() => {}}>Error</Chip>
          </div>
        </div>
      </div>
    );
  },
};


