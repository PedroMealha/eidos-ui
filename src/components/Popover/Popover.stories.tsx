import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover.component';
import { Button } from '../Button';

const meta = {
  title: 'Overlays/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Preferred placement relative to the trigger (auto-flips if no space)',
      table: {
        type: { summary: '"top" | "bottom" | "left" | "right"' },
        defaultValue: { summary: 'bottom' },
      },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show a × close button in the panel header',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the trigger from opening the popover',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    title: {
      control: 'text',
      description:
        'Optional heading shown at the top of the panel. Accepts inline nodes, not just a string.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    maxWidth: {
      control: 'number',
      description: 'Max width of the panel in px',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '320' },
      },
    },
    trigger: { table: { disable: true } },
    children: { table: { disable: true } },
    isOpen: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    closeOnClickOutside: { table: { disable: true } },
    closeOnEscape: { table: { disable: true } },
    className: { table: { disable: true } },
    contentClassName: { table: { disable: true } },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - Basic popover with text content, bottom placement
// ============================================================================

export const Default: Story = {
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Popover {...args} />
    </div>
  ),
  args: {
    trigger: <Button>Open Popover</Button>,
    placement: 'bottom',
    children: (
      <p style={{ margin: 0 }}>
        This is a simple popover with plain text content. Click outside or press <kbd>Esc</kbd> to
        close it.
      </p>
    ),
  },
};

// ============================================================================
// WITH TITLE - Has title prop and showCloseButton
// ============================================================================

export const WithTitle: Story = {
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Popover {...args} />
    </div>
  ),
  args: {
    trigger: <Button>Open with Title</Button>,
    title: 'Popover Title',
    showCloseButton: true,
    placement: 'bottom',
    children: (
      <p style={{ margin: 0 }}>
        This popover has a title and a close button in the header. Click the × button or outside to
        dismiss.
      </p>
    ),
  },
};

// ============================================================================
// PLACEMENTS - All four placement options
// ============================================================================

export const Placements = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6rem',
        padding: '6rem',
      }}
    >
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <div key={placement} style={{ display: 'flex', justifyContent: 'center' }}>
          <Popover
            trigger={
              <Button variant="outlined">
                {placement.charAt(0).toUpperCase() + placement.slice(1)}
              </Button>
            }
            placement={placement}
            title={`Placement: ${placement}`}
          >
            <p style={{ margin: 0 }}>
              Popover aligned to the <strong>{placement}</strong>.
            </p>
          </Popover>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// RICH CONTENT - Children contain a small form
// ============================================================================

export const RichContent: Story = {
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Popover {...args} />
    </div>
  ),
  args: {
    trigger: <Button>Subscribe</Button>,
    title: 'Stay Updated',
    showCloseButton: true,
    placement: 'bottom',
    maxWidth: 300,
    children: (
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <label style={{ fontSize: '0.875rem', color: '#475569' }}>
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            style={{
              display: 'block',
              marginTop: '0.25rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <Button type="submit" size="sm">
          Subscribe
        </Button>
      </form>
    ),
  },
};

// ============================================================================
// CONTROLLED - Externally controlled open state
// ============================================================================

export const Controlled = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '4rem',
        }}
      >
        <Popover
          trigger={<Button>{isOpen ? 'Close Popover' : 'Open Popover'}</Button>}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Controlled Popover"
          showCloseButton
          placement="bottom"
        >
          <p style={{ margin: 0 }}>
            This popover is controlled externally via <code>isOpen</code> and{' '}
            <code>onOpenChange</code>. Use the button on the right to force-close it from outside.
          </p>
        </Popover>
        <Button variant="outlined" color="danger" onClick={() => setIsOpen(false)}>
          Force Close
        </Button>
      </div>
    );
  },
};

// ============================================================================
// DISABLED - Trigger cannot open the popover
// ============================================================================

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Popover {...args} />
    </div>
  ),
  args: {
    trigger: <Button disabled>Disabled Trigger</Button>,
    disabled: true,
    placement: 'bottom',
    children: <p style={{ margin: 0 }}>You should not see this.</p>,
  },
};
