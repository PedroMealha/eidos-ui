import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pill } from './Pill.component';
import { Chip } from '../Chip/Chip.component';

const meta = {
  title: 'Elements/Pill',
  component: Pill,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Pill content. When a number and `max` is set, shows `max+` if exceeded.',
      table: { type: { summary: 'React.ReactNode' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Pill size',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    dot: {
      control: 'boolean',
      description:
        'Render a coloured dot. With no children, renders dot-only; with children, the dot sits alongside the label.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    max: {
      control: 'number',
      description: 'When children is a number, display `max+` if the value exceeds this threshold',
      table: { type: { summary: 'number' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    children: 'New',
    color: 'primary',
    variant: 'filled',
    size: 'md',
  },
};

// ============================================================================
// VARIANTS
// ============================================================================

export const Variants = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '0.5rem', alignItems: 'center' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        <div>
          <p style={label}>Filled</p>
          <div style={row}>
            <Pill variant="filled" color="primary">
              Filled
            </Pill>
            <Pill variant="filled" color="success">
              Filled
            </Pill>
            <Pill variant="filled" color="danger">
              Filled
            </Pill>
          </div>
        </div>
        <div>
          <p style={label}>Outlined</p>
          <div style={row}>
            <Pill variant="outlined" color="primary">
              Outlined
            </Pill>
            <Pill variant="outlined" color="success">
              Outlined
            </Pill>
            <Pill variant="outlined" color="danger">
              Outlined
            </Pill>
          </div>
        </div>
        <div>
          <p style={label}>Text</p>
          <div style={row}>
            <Pill variant="text" color="primary">
              Text
            </Pill>
            <Pill variant="text" color="success">
              Text
            </Pill>
            <Pill variant="text" color="danger">
              Text
            </Pill>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  render: () => {
    const row: React.CSSProperties = {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
          <Pill color="primary">Primary</Pill>
          <Pill color="secondary">Secondary</Pill>
          <Pill color="success">Success</Pill>
          <Pill color="danger">Danger</Pill>
          <Pill color="warning">Warning</Pill>
          <Pill color="info">Info</Pill>
        </div>
      </div>
    );
  },
};

// ============================================================================
// DOT
// ============================================================================

export const Dot = {
  render: () => {
    const row: React.CSSProperties = {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
          <Pill dot color="primary" />
          <Pill dot color="secondary" />
          <Pill dot color="success" />
          <Pill dot color="danger" />
          <Pill dot color="warning" />
          <Pill dot color="info" />
        </div>
      </div>
    );
  },
};

// ============================================================================
// DOT WITH LABEL - dot rendered alongside content, e.g. a status pill
// ============================================================================

export const DotWithLabel = {
  render: () => {
    const row: React.CSSProperties = {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
          <Pill dot variant="text" color="success">
            Active
          </Pill>
          <Pill dot variant="text" color="danger">
            Offline
          </Pill>
          <Pill dot variant="text" color="warning">
            Away
          </Pill>
          <Pill dot variant="outlined" color="info">
            In progress
          </Pill>
        </div>
      </div>
    );
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '0.75rem', alignItems: 'center' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        <div>
          <p style={label}>Small</p>
          <div style={row}>
            <Pill size="sm">Small</Pill>
            <Pill size="sm" variant="outlined">
              Small
            </Pill>
            <Pill size="sm" variant="text">
              Small
            </Pill>
            <Pill size="sm" dot color="success" />
          </div>
        </div>
        <div>
          <p style={label}>Medium</p>
          <div style={row}>
            <Pill size="md">Medium</Pill>
            <Pill size="md" variant="outlined">
              Medium
            </Pill>
            <Pill size="md" variant="text">
              Medium
            </Pill>
            <Pill size="md" dot color="success" />
          </div>
        </div>
        <div>
          <p style={label}>Large</p>
          <div style={row}>
            <Pill size="lg">Large</Pill>
            <Pill size="lg" variant="outlined">
              Large
            </Pill>
            <Pill size="lg" variant="text">
              Large
            </Pill>
            <Pill size="lg" dot color="success" />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// NUMBERS - with max clamping
// ============================================================================

export const Numbers = {
  render: () => {
    const label: React.CSSProperties = {
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      color: '#94a3b8',
      marginBottom: '0.5rem',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
        <p style={label}>With max=99 - value 150 is clamped to &ldquo;99+&rdquo;</p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Pill color="primary" max={99}>
            {1}
          </Pill>
          <Pill color="primary" max={99}>
            {5}
          </Pill>
          <Pill color="primary" max={99}>
            {99}
          </Pill>
          <Pill color="danger" max={99}>
            {150}
          </Pill>
        </div>
      </div>
    );
  },
};

// ============================================================================
// WITH CHIP - common UI composition pattern
// ============================================================================

export const WithChip = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
        <div>
          <p style={label}>Status label + count pill</p>
          <div style={row}>
            <Chip color="primary" variant="text">
              In Progress
            </Chip>
            <Pill color="primary">4</Pill>
          </div>
        </div>
        <div>
          <p style={label}>Category chip + text pill</p>
          <div style={row}>
            <Chip color="success" variant="text">
              Completed
            </Chip>
            <Pill color="success" variant="text">
              12
            </Pill>
          </div>
        </div>
        <div>
          <p style={label}>Alert chip + danger pill</p>
          <div style={row}>
            <Chip color="danger" variant="text">
              Errors
            </Chip>
            <Pill color="danger" max={9}>
              {15}
            </Pill>
          </div>
        </div>
        <div>
          <p style={label}>Dot indicator alongside chip</p>
          <div style={row}>
            <Pill dot color="success" />
            <Chip color="success" variant="outlined">
              Online
            </Chip>
            <Pill dot color="danger" />
            <Chip color="danger" variant="outlined">
              Offline
            </Chip>
            <Pill dot color="warning" />
            <Chip color="warning" variant="outlined">
              Away
            </Chip>
          </div>
        </div>
      </div>
    );
  },
};
