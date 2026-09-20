import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox.component';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'undefined' } },
    },
    label: {
      control: 'text',
      description: 'Label content rendered beside the control',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Show the indeterminate (mixed) state - overrides checked visually',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the checkbox',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the checkbox',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme applied when checked',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the checkbox control and label',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    defaultChecked: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT – interactive playground with all controls
// ============================================================================

export const Default: Story = {
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
    indeterminate: false,
  },
};

// ============================================================================
// INDIVIDUAL STATES
// ============================================================================

export const WithLabel: Story = {
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: true,
    color: 'primary',
    size: 'md',
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all items',
    indeterminate: true,
    color: 'primary',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled (unchecked)',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled (checked)',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'I agree to the terms',
    error: 'You must accept the terms to continue',
  },
};

// ============================================================================
// SHOWCASE STORIES
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={row}>
        <Checkbox size="sm" label="Small checkbox" defaultChecked />
        <Checkbox size="md" label="Medium checkbox (default)" defaultChecked />
        <Checkbox size="lg" label="Large checkbox" defaultChecked />
      </div>
    );
  },
};

export const Colors: Story = {
  render: () => {
    const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={row}>
        <Checkbox color="primary" label="Primary" defaultChecked />
        <Checkbox color="secondary" label="Secondary" defaultChecked />
        <Checkbox color="success" label="Success" defaultChecked />
        <Checkbox color="danger" label="Danger" defaultChecked />
      </div>
    );
  },
};
