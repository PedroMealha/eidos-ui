import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OTPInput } from './OTPInput.component';

const meta = {
  title: 'Forms/OTPInput',
  component: OTPInput,
  parameters: { layout: 'centered' },
  argTypes: {
    length: {
      control: { type: 'number', min: 2, max: 12 },
      description: 'Number of individual slot inputs',
      table: { type: { summary: 'number' }, defaultValue: { summary: '6' } },
    },
    type: {
      control: 'select',
      options: ['numeric', 'alphanumeric'],
      description: 'Restricts accepted characters',
      table: {
        type: { summary: '"numeric" | "alphanumeric"' },
        defaultValue: { summary: 'numeric' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size of each slot',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    mask: {
      control: 'boolean',
      description: 'Mask entered characters as password dots',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all slot inputs',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description: 'Label rendered above the slots',
      table: { type: { summary: 'string' } },
    },
    hint: {
      control: 'text',
      description: 'Hint text rendered below the slots',
      table: { type: { summary: 'string' } },
    },
    error: {
      control: 'text',
      description: 'Error message - turns slots red when set',
      table: { type: { summary: 'string' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Focus the first empty slot on mount',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onComplete: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    length: 6,
    type: 'numeric',
    size: 'md',
  },
};

export const ShortCode: Story = {
  name: 'Short Code (4 slots)',
  args: {
    length: 4,
    type: 'numeric',
    size: 'md',
  },
};

export const WithLabel: Story = {
  args: {
    length: 6,
    label: 'One-time password',
    hint: 'Enter the 6-digit code sent to your phone.',
    size: 'md',
  },
};

export const WithError: Story = {
  args: {
    length: 6,
    label: 'Verification code',
    defaultValue: '12345',
    error: 'Invalid code. Please try again.',
    size: 'md',
  },
};

export const Masked: Story = {
  name: 'Masked (password dots)',
  args: {
    length: 6,
    mask: true,
    label: 'PIN',
    hint: 'Your 6-digit PIN is hidden as you type.',
    size: 'md',
  },
};

export const Alphanumeric: Story = {
  args: {
    length: 6,
    type: 'alphanumeric',
    label: 'Invite code',
    hint: 'Letters and digits are accepted.',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    length: 6,
    defaultValue: '123456',
    disabled: true,
    label: 'Verification code',
    hint: 'This field is currently disabled.',
    size: 'md',
  },
};

export const AutoFocus: Story = {
  args: {
    length: 6,
    autoFocus: true,
    label: 'Enter code',
    hint: 'The first slot is focused automatically.',
    size: 'md',
  },
};

// ── Sizes showcase ─────────────────────────────────────────────────────────

export const Sizes = {
  name: 'All Sizes',
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
      flexDirection: 'column' as const,
      gap: '1.5rem',
    };

    return (
      <div style={row}>
        <div>
          <p style={label}>Small</p>
          <OTPInput length={6} size="sm" />
        </div>
        <div>
          <p style={label}>Medium (default)</p>
          <OTPInput length={6} size="md" />
        </div>
        <div>
          <p style={label}>Large</p>
          <OTPInput length={6} size="lg" />
        </div>
      </div>
    );
  },
};

// ── Controlled usage example ───────────────────────────────────────────────

export const Controlled = {
  name: 'Controlled (with onComplete feedback)',
  render: () => {
    const ControlledDemo = () => {
      const [code, setCode] = useState('');
      const [completed, setCompleted] = useState(false);

      const handleChange = (val: string) => {
        setCode(val);
        setCompleted(false);
      };

      const handleComplete = (_val: string) => {
        setCompleted(true);
      };

      return (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
        >
          <OTPInput
            length={6}
            label="Verification code"
            hint="Enter the code sent to your device."
            value={code}
            onChange={handleChange}
            onComplete={handleComplete}
          />
          <p style={{ fontSize: '0.875rem', color: completed ? '#10b981' : '#94a3b8' }}>
            {completed ? `✓ Code accepted: ${code}` : `Current value: "${code}"`}
          </p>
          <button
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
            }}
            onClick={() => {
              setCode('');
              setCompleted(false);
            }}
          >
            Reset
          </button>
        </div>
      );
    };

    return <ControlledDemo />;
  },
};
