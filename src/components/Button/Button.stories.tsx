import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, Trash2, ArrowBigDownDash, ArrowRight } from 'lucide-react';
import { Button, IconButton } from './Button.component';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // Default values to show all props in docs
    children: undefined,
    icon: undefined,
    preIcon: undefined,
    posIcon: undefined,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: 'medium' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loadingText: {
      control: 'text',
      description: 'Loading text',
      table: {
        type: { summary: 'string' },
      },
    },
    tooltip: {
      control: 'text',
      description: 'Optional tooltip text',
      table: {
        type: { summary: 'string' },
      },
    },
    children: {
      control: 'text',
      description: 'Button text content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    preIcon: {
      control: 'text',
      description: 'Icon to display before text. Pass Lucide component (Download) or string name ("download").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    posIcon: {
      control: 'text',
      description: 'Icon to display after text. Pass Lucide component (ChevronRight) or string name ("mouse-pointer-click").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    icon: {
      control: 'text',
      description: 'Icon for icon-only button. Pass Lucide component (Plus) or string name ("plus"). Mutually exclusive with children/preIcon/posIcon.',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// TEXT BUTTON - Main interactive example with all controls
// ============================================================================

export const TextButton: Story = {
  args: {
    variant: 'filled',
    color: 'primary',
    size: 'medium',
    children: 'Click me',
    disabled: false,
    loading: false,
    tooltip: '',
    posIcon: 'mouse-pointer-click',
  },
  argTypes: {
    icon: {
      table: { disable: true },
    },
  },
};

// ============================================================================
// ICON BUTTON - Interactive icon-only example
// ============================================================================

export const IconOnly: Story = {
  args: {
    icon: 'arrow-big-down-dash',
    variant: 'filled',
    color: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    tooltip: 'Add new item',
  },
  argTypes: {
    children: {
      table: { disable: true },
    },
    preIcon: {
      table: { disable: true },
    },
    posIcon: {
      table: { disable: true },
    },
  },
};

// ============================================================================
// EXAMPLES SHOWCASE
// ============================================================================

export const Examples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Variants */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Variants
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="filled" color="primary">Filled</Button>
          <Button variant="outlined" color="primary">Outlined</Button>
          <Button variant="text" color="primary">Text</Button>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Colors
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="success">Success</Button>
          <Button color="danger">Danger</Button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Sizes
        </h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </div>

      {/* With Icons - Component */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          With Icons (Component-based)
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button preIcon={Download}>Download</Button>
          <Button posIcon={ArrowRight}>Next</Button>
          <Button icon={Plus} />
          <IconButton icon={ArrowBigDownDash} tooltip="Using IconButton" />
          <IconButton icon={Trash2} color="danger" variant="outlined" />
        </div>
      </div>

      {/* With Icons - String */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          With Icons (String-based - Dynamic)
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button preIcon="download">Download</Button>
          <Button posIcon="arrow-right">Next</Button>
          <Button icon="plus" />
          <IconButton icon="arrow-big-down-dash" tooltip="String icon name" />
          <IconButton icon="trash-2" color="danger" variant="outlined" />
        </div>
      </div>

      {/* States */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          States
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button tooltip="Helpful hint">With Tooltip</Button>
        </div>
      </div>
    </div>
  ),
};
