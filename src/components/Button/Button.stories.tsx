import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, Trash2, ArrowBigDownDash, ArrowRight } from 'lucide-react';
import { Button, IconButton } from './Button.component';

const meta = {
  title: 'Elements/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
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
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
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
// DEFAULT - Main interactive example with all controls
// ============================================================================

export const Default: Story = {
  args: {
    variant: 'filled',
    color: 'primary',
    size: 'md',
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
    size: 'md',
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
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '2rem 3rem',
        padding: '1.5rem',
      }}>
        <div>
          <p style={label}>Variants</p>
          <div style={row}>
            <Button variant="filled">Filled</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
          </div>
        </div>

        <div>
          <p style={label}>Colors</p>
          <div style={row}>
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="danger">Danger</Button>
          </div>
        </div>

        <div>
          <p style={label}>Sizes</p>
          <div style={row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div>
          <p style={label}>States</p>
          <div style={row}>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button tooltip="Helpful hint">With Tooltip</Button>
          </div>
        </div>

        {/* Icons spans both columns */}
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={label}>Icons &amp; Icon Buttons</p>
          <div style={row}>
            <Button preIcon={Download}>Download</Button>
            <Button posIcon={ArrowRight}>Next</Button>
            <Button icon={Plus} />
            <IconButton icon={ArrowBigDownDash} tooltip="Icon-only button" />
            <IconButton icon={Trash2} color="danger" variant="outlined" />
          </div>
        </div>
      </div>
    );
  },
};
