import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover.component';
import { Button } from '../Button';
import { expectFocusTrap } from '../../story-a11y.docs';

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
    open: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    closeOnClickOutside: { table: { disable: true } },
    closeOnEscape: { table: { disable: true } },
    className: { table: { disable: true } },
    contentClassName: { table: { disable: true } },
  },
  // Required props live at meta level so the render-only stories below
  // satisfy the type, and so Default's controls start from real values.
  args: {
    trigger: <Button variant="outlined">Open popover</Button>,
    children: <p style={{ margin: 0 }}>Popover content.</p>,
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

export const Placements: Story = {
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
        <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            style={{
              display: 'block',
              marginTop: '0.25rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--gray-200)',
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

export const Controlled: Story = {
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
          open={isOpen}
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

// ============================================================================
// FOCUS MANAGEMENT - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `Popover` is a **non-modal** dialog (`aria-modal="false"`), so the
 * expectations are deliberately different from `Modal`'s: focus moves in and
 * comes back, but Tab must be able to leave. Trapping it would strand a
 * keyboard user in a panel that never claimed to own the page.
 *
 * Moving focus in is not optional here even though it is non-modal: the panel
 * is portaled to `document.body`, so Tab from the trigger continues into
 * whatever follows the trigger in the page, and the panel's own buttons are
 * unreachable by keyboard.
 */
export const FocusManagement: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Popover {...args} />
      <Button>Somewhere else to tab to</Button>
    </div>
  ),
  args: {
    trigger: <Button>Open Popover</Button>,
    title: 'Focus management',
    children: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm">First</Button>
        <Button size="sm">Second</Button>
      </div>
    ),
  },
  play: async ({ canvas, userEvent, step }) => {
    await expectFocusTrap({
      userEvent,
      step,
      trigger: canvas.getByRole('button', { name: 'Open Popover' }),
      trapped: false,
      cycles: 6,
    });
  },
};
