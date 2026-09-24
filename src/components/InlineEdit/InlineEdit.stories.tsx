import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineEdit } from './InlineEdit.component';
import { Button } from '../Button/Button.component';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Forms/InlineEdit',
  component: InlineEdit,
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: 'text',
      description:
        'The current displayed value. Always required - pass a state variable and wire `onChange` / `onConfirm` to keep it in sync.',
      table: { type: { summary: 'string' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size of the display element and the underlying input.',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    trigger: {
      control: 'select',
      options: ['click', 'doubleClick'],
      description: 'Interaction that opens edit mode when using uncontrolled editing state.',
      table: { type: { summary: '"click" | "doubleClick"' }, defaultValue: { summary: 'click' } },
    },
    type: {
      control: 'select',
      options: ['text', 'number', 'date'],
      description: 'HTML input type applied while in edit mode.',
      table: { type: { summary: '"text" | "number" | "date"' }, defaultValue: { summary: 'text' } },
    },
    placeholder: {
      control: 'text',
      description:
        'Placeholder shown when `value` is empty - both in display mode and inside the input in edit mode.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill the parent container width.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevent all interaction and dim the display.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    confirmOnBlur: {
      control: 'boolean',
      description:
        'Commit the value when the input loses focus. Set to `false` when the parent manages the commit lifecycle externally (e.g. inside a DataGrid).',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    inputVariant: {
      control: 'select',
      options: ['filled', 'outlined', 'text', 'bare'],
      description: 'Variant applied to the underlying `<Input>` while in edit mode.',
      table: {
        type: { summary: '"filled" | "outlined" | "text" | "bare"' },
        defaultValue: { summary: 'outlined' },
      },
    },
    editing: {
      control: 'boolean',
      description:
        'Controlled editing state. Omit to use uncontrolled mode. Pair with `onEditingChange` for fully controlled behaviour.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'undefined' } },
    },
    onChange: {
      control: false,
      description:
        'Fires on every keystroke while in edit mode. Use this to keep an external value state in sync.',
      table: {
        type: { summary: '(value: string) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    onConfirm: {
      control: false,
      description: 'Fires when editing is confirmed (Enter or blur). Receives the committed value.',
      table: {
        type: { summary: '(value: string) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    onCancel: {
      control: false,
      description:
        'Fires when editing is cancelled (Esc). The value reverts to what it was when editing began.',
      table: { type: { summary: '() => void' }, defaultValue: { summary: 'undefined' } },
    },
    onEditingChange: {
      control: false,
      description:
        'Called when the component wants to open or close editing. Pair with `editing` for fully controlled mode.',
      table: {
        type: { summary: '(editing: boolean) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    renderDisplay: {
      control: false,
      description: 'Custom render function for the read-only display. Receives the current value.',
      table: {
        type: { summary: '(value: string) => React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    className: { table: { disable: true } },
  },
  // Required props live at meta level so the render-only stories below
  // satisfy the type, and so Playground's controls start from real values.
  args: { value: 'Page title' },
} satisfies Meta<typeof InlineEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - primary story; all controls apply here
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'Page title',
    size: 'md',
    trigger: 'click',
    disabled: false,
    fullWidth: false,
    confirmOnBlur: true,
    inputVariant: 'outlined',
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
      gap: '0.375rem',
      alignItems: 'flex-start',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '2.5rem', alignItems: 'flex-end' };
    const caption: React.CSSProperties = {
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: 'var(--text-muted)',
    };

    return (
      <div style={row}>
        <div style={col}>
          <InlineEdit size="sm" value="Page title" />
          <span style={caption}>Small</span>
        </div>
        <div style={col}>
          <InlineEdit size="md" value="Page title" />
          <span style={caption}>Medium</span>
        </div>
        <div style={col}>
          <InlineEdit size="lg" value="Page title" />
          <span style={caption}>Large</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// TRIGGER MODES
// ============================================================================

export const Trigger: Story = {
  render: () => {
    const [clickValue, setClickValue] = useState('Click to edit');
    const [dblValue, setDblValue] = useState('Double-click to edit');

    const col: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'flex-start',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '2.5rem', alignItems: 'flex-start' };
    const caption: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)' };

    return (
      <div style={row}>
        <div style={col}>
          <InlineEdit
            value={clickValue}
            onChange={setClickValue}
            onConfirm={setClickValue}
            trigger="click"
          />
          <span style={caption}>trigger="click"</span>
        </div>
        <div style={col}>
          <InlineEdit
            value={dblValue}
            onChange={setDblValue}
            onConfirm={setDblValue}
            trigger="doubleClick"
          />
          <span style={caption}>trigger="doubleClick"</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// WITH PLACEHOLDER
// ============================================================================

export const WithPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Add a title…',
  },
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
  args: {
    value: 'Cannot edit this',
    disabled: true,
  },
};

// ============================================================================
// CUSTOM DISPLAY
// ============================================================================

export const CustomDisplay: Story = {
  render: () => {
    const [value, setValue] = useState('Custom styled text');

    return (
      <InlineEdit
        value={value}
        onChange={setValue}
        onConfirm={setValue}
        renderDisplay={(v) => <span style={{ fontWeight: 700, fontStyle: 'italic' }}>{v}</span>}
      />
    );
  },
};

// ============================================================================
// CONTROLLED - editing state driven externally
// ============================================================================

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('Controlled value');
    const [editing, setEditing] = useState(false);

    const badge: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: editing ? 'var(--primary-100)' : 'var(--gray-100)',
      color: editing ? 'var(--primary-700)' : 'var(--text-muted)',
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <InlineEdit
          value={value}
          editing={editing}
          onEditingChange={setEditing}
          onChange={setValue}
          onConfirm={setValue}
        />
        <Button size="sm" variant="outlined" onClick={() => setEditing((e) => !e)}>
          Edit
        </Button>
        <span style={badge}>{editing ? 'editing' : 'display'}</span>
      </div>
    );
  },
};

// ============================================================================
// WITH CALLBACKS
// ============================================================================

export const WithCallback: Story = {
  render: () => {
    const [value, setValue] = useState('Edit me');

    return (
      <InlineEdit
        value={value}
        onConfirm={(v) => {
          setValue(v);
          action('Confirmed')(v);
        }}
        onCancel={action('Cancelled')}
      />
    );
  },
};
