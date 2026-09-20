import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { useState, type ComponentProps } from 'react';
import { CircleAlert, CircleCheck, Info, CircleX, Trash2 } from 'lucide-react';
import { Modal } from './Modal.component';
import { Button } from '../Button';
import { StoryRow } from '../../story-layout.docs';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  // `isOpen`, `onClose` and `children` are required, so they live here to
  // satisfy the type for the render-only stories below as well as seeding the
  // Default controls. Overlays always start closed - see the .mdx note.
  args: {
    isOpen: false,
    onClose: () => {},
    children: <p>This is a basic modal with default styling.</p>,
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
      table: { type: { summary: 'boolean' } },
    },
    onClose: {
      control: false,
      description: 'Callback function when modal is closed',
      table: { type: { summary: '() => void' } },
    },
    title: {
      control: 'text',
      description: 'Title of the modal. Accepts inline nodes, not just a string.',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
    },
    icon: {
      control: 'text',
      description:
        'Icon to display in header. Pass Lucide component (CircleAlert) or string ("circle-alert")',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Type of modal (affects header color)',
      table: {
        type: { summary: '"info" | "success" | "warning" | "danger"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Size of the modal',
      table: { type: { summary: '"sm" | "md" | "lg" | "full"' }, defaultValue: { summary: 'md' } },
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close modal when clicking outside',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close modal when pressing Escape key',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    actions: {
      control: false,
      description: 'Array of action buttons',
      table: { type: { summary: 'ModalAction[]' }, defaultValue: { summary: '[]' } },
    },
    children: {
      control: false,
      description: 'Modal content',
      table: { type: { summary: 'React.ReactNode' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for controlling modal state
const ModalWrapper = (args: ComponentProps<typeof Modal>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Default Modal',
    children: <p>This is a basic modal with default styling.</p>,
  },
  parameters: {
    docs: {
      source: {
        code: `
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Default Modal">
  <p>This is a basic modal with default styling.</p>
</Modal>`.trim(),
      },
    },
  },
};

// The `Examples` story this replaces drove both its "With Actions" and its
// "Complex Example" modal from the same `actionsOpen` state, so either trigger
// opened both modals stacked on top of each other. Splitting gives each story
// its own state and makes that class of mistake impossible.

/** Trigger + modal pair sharing one piece of local open state. */
const ModalDemo = ({
  triggerLabel,
  children,
  ...modalProps
}: { triggerLabel: string } & Omit<ComponentProps<typeof Modal>, 'isOpen' | 'onClose'>) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{triggerLabel}</Button>
      <Modal {...modalProps} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Types: Story = {
  render: () => (
    <StoryRow>
      <ModalDemo triggerLabel="Info" title="Information" icon={Info} type="info">
        <p>This is an informational modal with an icon.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Success" title="Success!" icon={CircleCheck} type="success">
        <p>Your action was completed successfully.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Warning" title="Warning" icon={CircleAlert} type="warning">
        <p>Please review the following information before proceeding.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Danger" title="Delete item" icon={CircleX} type="danger">
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </ModalDemo>
    </StoryRow>
  ),
};

export const WithStringIcon: Story = {
  render: () => (
    <ModalDemo
      triggerLabel="Open with string icon"
      title="Delete confirmation"
      icon="trash-2"
      type="danger"
    >
      <p>
        The <code>icon</code> prop accepts a Lucide component or its kebab-case name.
      </p>
    </ModalDemo>
  ),
};

export const Sizes: Story = {
  render: () => (
    <StoryRow>
      <ModalDemo triggerLabel="Small" title="Small modal" size="sm">
        <p>Small - max-width 400px.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Medium" title="Medium modal" size="md">
        <p>Medium - max-width 600px, the default.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Large" title="Large modal" size="lg">
        <p>Large - max-width 800px.</p>
      </ModalDemo>
      <ModalDemo triggerLabel="Full screen" title="Full screen modal" size="full">
        <p>Full - 95% of the viewport.</p>
      </ModalDemo>
    </StoryRow>
  ),
};

export const WithActions: Story = {
  render: function WithActionsStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open modal with actions</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm action"
          icon={CircleAlert}
          type="warning"
          actions={[
            { id: 'cancel', label: 'Cancel', variant: 'outlined', onClick: () => setIsOpen(false) },
            {
              id: 'confirm',
              label: 'Confirm',
              variant: 'filled',
              color: 'danger',
              onClick: () => {
                action('Action confirmed')();
                setIsOpen(false);
              },
            },
          ]}
        >
          <p>This modal includes action buttons in the footer.</p>
        </Modal>
      </>
    );
  },
};

export const DestructiveConfirmation: Story = {
  render: function DestructiveConfirmationStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button color="danger" onClick={() => setIsOpen(true)}>
          Delete account
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete account"
          icon={Trash2}
          type="danger"
          size="md"
          actions={[
            { id: 'cancel', label: 'Cancel', variant: 'text', onClick: () => setIsOpen(false) },
            {
              id: 'delete',
              label: 'Delete account',
              variant: 'filled',
              color: 'danger',
              onClick: () => {
                action('Account deleted')();
                setIsOpen(false);
              },
            },
          ]}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p>
              <strong>Are you sure you want to delete your account?</strong>
            </p>
            <p>This action will:</p>
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
              <li>Permanently delete all your data</li>
              <li>Cancel all active subscriptions</li>
              <li>Remove access to all services</li>
            </ul>
            <p style={{ color: 'var(--danger-color)', fontWeight: 'var(--font-weight-semibold)' }}>
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};
