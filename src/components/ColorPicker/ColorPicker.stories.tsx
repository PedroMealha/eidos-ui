import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorPicker } from './ColorPicker.component';

const meta = {
  title: 'Forms/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: 'color',
      description: 'Controlled hex value',
      table: { type: { summary: 'string' } },
    },
    defaultValue: {
      control: 'color',
      description: 'Initial hex value (uncontrolled)',
      table: { type: { summary: 'string' } },
    },
    format: {
      control: 'select',
      options: ['hex', 'rgb', 'hsl'],
      description: 'Text-input format shown initially',
      table: {
        type: { summary: '"hex" | "rgb" | "hsl"' },
        defaultValue: { summary: 'hex' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Overall size (affects canvas height and trigger dimensions)',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    inline: {
      control: 'boolean',
      description: 'Render the picker panel directly - no popover trigger',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    showAlpha: {
      control: 'boolean',
      description: 'Show the alpha / opacity slider',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    showSwatches: {
      control: 'boolean',
      description: 'Show the preset colour swatches',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the picker',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description: 'Label rendered above the trigger or panel',
      table: { type: { summary: 'string' } },
    },
    swatches: { table: { disable: true } },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Playground - trigger / popover mode ────────────────────────────────────────

export const Playground: Story = {
  args: {
    defaultValue: '#6366f1',
    label: 'Brand colour',
  },
};

// ── Inline ────────────────────────────────────────────────────────────────────

export const Inline: Story = {
  args: {
    defaultValue: '#10b981',
    inline: true,
    label: 'Pick a colour',
  },
};

// ── With alpha slider ─────────────────────────────────────────────────────────

export const WithAlpha: Story = {
  args: {
    defaultValue: '#6366f1',
    showAlpha: true,
    inline: true,
    label: 'Colour with opacity',
  },
};

// ── HSL format ────────────────────────────────────────────────────────────────

export const HslFormat: Story = {
  args: {
    defaultValue: '#06b6d4',
    format: 'hsl',
    inline: true,
    label: 'HSL format',
  },
};

// ── Custom swatches ───────────────────────────────────────────────────────────

export const CustomSwatches: Story = {
  args: {
    defaultValue: '#e11d48',
    inline: true,
    label: 'Tailwind rose palette',
    swatches: [
      '#fff1f2',
      '#fecdd3',
      '#fda4af',
      '#fb7185',
      '#f43f5e',
      '#e11d48',
      '#be123c',
      '#9f1239',
      '#881337',
      '#4c0519',
    ],
  },
};

// ── Disabled ──────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    defaultValue: '#6366f1',
    disabled: true,
    label: 'Disabled',
  },
};

// ── Controlled ────────────────────────────────────────────────────────────────
// Shows how to wire up the component as a fully controlled input.

export const Controlled: Story = {
  render: () => {
    const [colour, setColour] = useState('#6366f1');

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
      >
        <ColorPicker value={colour} onChange={setColour} inline label="Controlled colour picker" />
        <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Current value: <strong>{colour}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['#ef4444', '#6366f1', '#10b981'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColour(c)}
              // The hex sits *beside* a swatch rather than on top of it.
              // Painting text onto the colour being previewed cannot be made
              // accessible: the background is whatever the user picked, and
              // these three measured 2.53:1, 3.76:1 and 4.46:1 against white
              // text. A docs example should not demonstrate that.
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--gray-200)',
                background: 'var(--white)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: c,
                  // Keeps a pale swatch visible against the white button -
                  // SC 1.4.11 applies to a graphic that carries meaning.
                  border: '1px solid var(--gray-300)',
                }}
              />
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

// ── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ColorPicker defaultValue="#6366f1" size="sm" label="Small" />
      <ColorPicker defaultValue="#6366f1" size="md" label="Medium" />
      <ColorPicker defaultValue="#6366f1" size="lg" label="Large" />
    </div>
  ),
};
