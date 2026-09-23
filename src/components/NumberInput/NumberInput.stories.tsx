import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput.component';
import { expectErrorWiring } from '../../story-a11y.docs';

const meta = {
  title: 'Forms/NumberInput',
  component: NumberInput,
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: 'number',
      description: 'Controlled value. Omit to use uncontrolled mode.',
      table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
    },
    defaultValue: {
      control: 'number',
      description: 'Initial value for uncontrolled usage.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value.',
      table: { type: { summary: 'number' } },
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value.',
      table: { type: { summary: 'number' } },
    },
    step: {
      control: 'number',
      description: 'Increment / decrement step.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
    precision: {
      control: 'number',
      description: 'Decimal places to display. 0 = integer.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size of the control.',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all interaction.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Prevent value changes while keeping the field accessible.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    allowTyping: {
      control: 'boolean',
      description: 'Allow direct keyboard entry in the display field.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expand to fill the parent container.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Apply error styling.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description: 'Label rendered above the control.',
      table: { type: { summary: 'string' } },
    },
    helperText: {
      control: 'text',
      description: 'Hint text shown below the control.',
      table: { type: { summary: 'string' } },
    },
    errorMessage: {
      control: 'text',
      description: 'Error message shown when error=true.',
      table: { type: { summary: 'string' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown inside the display field.',
      table: { type: { summary: 'string' } },
    },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - uncontrolled, interactive controls active
// ============================================================================

export const Playground: Story = {
  args: {
    defaultValue: 0,
    min: 0,
    max: 100,
    size: 'md',
  },
};

// ============================================================================
// WITH MIN / MAX - controlled, value managed via useState
// ============================================================================

export const WithMinMax: Story = {
  render: () => {
    const [val, setVal] = useState(5);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: 240 }}>
        <NumberInput value={val} onChange={setVal} min={1} max={10} step={1} label="Quantity" />
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Current value: <strong>{val}</strong>
        </p>
      </div>
    );
  },
};

// ============================================================================
// PRECISION - decimal step and display
// ============================================================================

export const Precision: Story = {
  args: {
    defaultValue: 1.5,
    step: 0.1,
    precision: 1,
    label: 'Temperature (°C)',
    helperText: 'Adjusted in 0.1 °C increments',
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const col: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: 280,
    };
    const label: React.CSSProperties = {
      marginBottom: '0.25rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: 'var(--text-muted)',
    };
    return (
      <div style={col}>
        <div>
          <p style={label}>Small</p>
          <NumberInput size="sm" defaultValue={0} />
        </div>
        <div>
          <p style={label}>Medium</p>
          <NumberInput size="md" defaultValue={0} />
        </div>
        <div>
          <p style={label}>Large</p>
          <NumberInput size="lg" defaultValue={0} />
        </div>
      </div>
    );
  },
};

// ============================================================================
// WITH LABEL, HELPER TEXT, AND ERROR STATE
// ============================================================================

export const WithLabel: Story = {
  render: () => {
    const col: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: 280,
    };
    return (
      <div style={col}>
        <NumberInput
          defaultValue={5}
          label="Items in cart"
          helperText="Maximum 99 items per order"
          min={1}
          max={99}
        />
        <NumberInput
          defaultValue={0}
          label="Discount (%)"
          error
          errorMessage="Discount cannot exceed 100%"
          min={0}
          max={100}
        />
      </div>
    );
  },
};

// ============================================================================
// READ-ONLY
// ============================================================================

export const ReadOnly: Story = {
  args: {
    defaultValue: 42,
    readOnly: true,
    label: 'Fixed value',
    helperText: 'This value cannot be changed',
  },
};

// ============================================================================
// NO TYPING - stepper buttons only
// ============================================================================

export const NoTyping: Story = {
  args: {
    defaultValue: 3,
    min: 1,
    max: 10,
    allowTyping: false,
    label: 'Rating',
  },
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
  args: {
    defaultValue: 7,
    disabled: true,
    label: 'Locked value',
  },
};

// ============================================================================
// ERROR WIRING - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 * Axe cannot see any of this - see the note on `Input`'s equivalent story.
 */
export const ErrorWiring: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Quantity', value: 120, max: 100, error: true, errorMessage: 'Maximum is 100' },
  play: async ({ canvas }) => {
    await expectErrorWiring(canvas.getByRole('spinbutton'), 'Maximum is 100');
  },
};
