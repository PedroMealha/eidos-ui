import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch.component';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  args: {
    label: 'Toggle me',
    labelPosition: 'right',
    color: 'primary',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state. Requires an onChange handler.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'undefined' },
      },
    },
    label: {
      control: 'text',
      description: 'Label rendered next to the switch track.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the label relative to the switch track.',
      table: {
        type: { summary: '"left" | "right"' },
        defaultValue: { summary: 'right' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction and applies a dimmed appearance.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color of the track when checked.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the switch track and thumb.',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT – main interactive story; all controls apply here
// ============================================================================

export const Default: Story = {
  args: {
    label: 'Notifications',
  },
};

// ============================================================================
// PRE-CHECKED (uncontrolled)
// ============================================================================

export const Checked: Story = {
  args: {
    label: 'Enabled by default',
    defaultChecked: true,
  },
};

// ============================================================================
// DISABLED (unchecked)
// ============================================================================

export const Disabled: Story = {
  args: {
    label: 'Unavailable option',
    disabled: true,
  },
};

// ============================================================================
// DISABLED + CHECKED
// ============================================================================

export const DisabledChecked: Story = {
  args: {
    label: 'Locked on',
    disabled: true,
    defaultChecked: true,
  },
};

// ============================================================================
// LABEL ON THE LEFT
// ============================================================================

export const LabelLeft: Story = {
  args: {
    label: 'Dark mode',
    labelPosition: 'left',
    defaultChecked: true,
  },
};

// ============================================================================
// SIZES SHOWCASE
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={col}>
        <Switch size="sm" label="Small" />
        <Switch size="md" label="Medium" defaultChecked />
        <Switch size="lg" label="Large" />
      </div>
    );
  },
};

// ============================================================================
// COLORS SHOWCASE
// ============================================================================

export const Colors: Story = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={col}>
        <Switch color="primary" label="Primary" defaultChecked />
        <Switch color="secondary" label="Secondary" defaultChecked />
        <Switch color="success" label="Success" defaultChecked />
        <Switch color="danger" label="Danger" defaultChecked />
      </div>
    );
  },
};
