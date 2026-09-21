import React, { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './Drawer.component';
import { Button } from '../Button';
import type { DrawerPlacement, DrawerSize } from './Drawer.types';
import { expectFocusTrap } from '../../story-a11y.docs';

const meta = {
  title: 'Overlays/Drawer',
  component: Drawer,
  parameters: { layout: 'padded' },
  // Required props live at meta level so the render-only stories below
  // satisfy the type, and so Default's controls start from real values.
  args: {
    children: null,
    isOpen: false,
    onClose: () => {},
    placement: 'right',
    size: 'md',
    closeOnBackdropClick: true,
    closeOnEscape: true,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'Side from which the drawer slides in.',
      table: {
        type: { summary: '"left" | "right" | "top" | "bottom"' },
        defaultValue: { summary: 'right' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Width (left/right) or height (top/bottom) of the panel.',
      table: {
        type: { summary: '"sm" | "md" | "lg" | "full"' },
        defaultValue: { summary: 'md' },
      },
    },
    title: {
      control: 'text',
      description: 'Title displayed in the drawer header. Accepts inline nodes, not just a string.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close the drawer when clicking the backdrop.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close the drawer when pressing the Escape key.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    isOpen: { table: { disable: true } },
    onClose: { table: { disable: true } },
    actions: {
      control: false,
      table: {
        type: { summary: 'DrawerAction[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    children: { control: false, table: { type: { summary: 'React.ReactNode' } } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// HELPERS
// ============================================================================

const labelStyle: React.CSSProperties = {
  marginBottom: '0.625rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-muted)',
};

const drawerBody = (
  <>
    <p>
      This is the drawer body. It can contain any content - forms, navigation links, settings
      panels, or rich layouts.
    </p>
    <p>
      The body scrolls independently when content overflows, keeping the header and footer always
      visible.
    </p>
  </>
);

// ============================================================================
// DEFAULT - interactive playground; all controls apply here
// ============================================================================

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {drawerBody}
        </Drawer>
      </>
    );
  },
  args: {
    title: 'Default Drawer',
    // children is required by DrawerProps; the render function's JSX children
    // take precedence at runtime - this satisfies the StoryObj type constraint.
    children: drawerBody,
  },
};

// ============================================================================
// WITH TITLE - explicit title prop
// ============================================================================

export const WithTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Panel Title">
          {drawerBody}
        </Drawer>
      </>
    );
  },
};

// ============================================================================
// WITH ACTIONS - footer action buttons
// ============================================================================

export const WithActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer with Actions</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Changes"
          actions={[
            {
              id: 'cancel',
              label: 'Cancel',
              variant: 'outlined',
              onClick: () => setIsOpen(false),
            },
            {
              id: 'confirm',
              label: 'Save Changes',
              variant: 'filled',
              color: 'primary',
              onClick: () => {
                action('Changes saved')();
                setIsOpen(false);
              },
            },
          ]}
        >
          {drawerBody}
        </Drawer>
      </>
    );
  },
};

// ============================================================================
// PLACEMENTS - all four sides
// ============================================================================

export const Placements: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<DrawerPlacement>('right');

    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['left', 'right', 'top', 'bottom'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => {
                setPlacement(p);
                setOpen(true);
              }}
            >
              {p}
            </Button>
          ))}
        </div>
        <Drawer
          isOpen={open}
          onClose={() => setOpen(false)}
          placement={placement}
          title={`${placement.charAt(0).toUpperCase() + placement.slice(1)} Drawer`}
        >
          <p>
            Drawer opens from the <strong>{placement}</strong>.
          </p>
        </Drawer>
      </>
    );
  },
};

// ============================================================================
// SIZES - sm / md / lg / full
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const [activeSize, setActiveSize] = useState<DrawerSize | null>(null);

    const sizeDescriptions: Record<DrawerSize, string> = {
      sm: '280px wide',
      md: '400px wide (default)',
      lg: '560px wide',
      full: '100% of the viewport',
    };

    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg', 'full'] as const).map((s) => (
            <Button key={s} onClick={() => setActiveSize(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Drawer
          isOpen={activeSize !== null}
          onClose={() => setActiveSize(null)}
          size={activeSize ?? 'md'}
          title={`${activeSize ? activeSize.charAt(0).toUpperCase() + activeSize.slice(1) : ''} Drawer`}
        >
          {activeSize && (
            <p>
              This is the <strong>{activeSize}</strong> variant - {sizeDescriptions[activeSize]}.
            </p>
          )}
        </Drawer>
      </>
    );
  },
};

// ============================================================================
// BOTTOM SHEET - bottom placement simulating a mobile sheet
// ============================================================================

export const BottomSheet: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320 }}>
          <p style={labelStyle}>Mobile bottom sheet pattern</p>
          <Button onClick={() => setIsOpen(true)}>Open Bottom Sheet</Button>
        </div>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          size="md"
          title="Quick Actions"
          actions={[
            {
              id: 'dismiss',
              label: 'Dismiss',
              variant: 'text',
              onClick: () => setIsOpen(false),
            },
          ]}
        >
          <p>
            This bottom sheet slides up from the bottom of the screen, common in mobile UI patterns
            for contextual menus and action sheets.
          </p>
        </Drawer>
      </>
    );
  },
};

// ============================================================================
// FOCUS MANAGEMENT - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`. See
 * the equivalent story on `Modal` for why this is not attached to `Default`.
 *
 * `Drawer` failed this worse than `Modal` did: focus escaped on the second
 * Tab, and closing it dropped focus onto `<body>`, returning a keyboard user
 * to the top of the document rather than to the control they opened it from.
 */
export const FocusManagement: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {drawerBody}
        </Drawer>
      </>
    );
  },
  args: { title: 'Focus management', children: drawerBody },
  play: async ({ canvas, userEvent, step }) => {
    await expectFocusTrap({
      userEvent,
      step,
      trigger: canvas.getByRole('button', { name: 'Open Drawer' }),
    });
  },
};
