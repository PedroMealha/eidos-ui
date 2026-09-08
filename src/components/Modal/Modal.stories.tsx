import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { CircleAlert, CircleCheck, Info, CircleX, Trash2 } from 'lucide-react';
import { Modal } from './Modal.component';
import { Button } from '../Button';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  args: {
    isOpen: false,
    onClose: () => {},
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
      description: 'Title of the modal',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
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

export const Examples = {
  render: () => {
    const [basicOpen, setBasicOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [dangerOpen, setDangerOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [sizesOpen, setSizesOpen] = useState<'sm' | 'md' | 'lg' | 'full' | null>(null);
    const [stringIconOpen, setStringIconOpen] = useState(false);

    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem' }}>
        <div>
          <p style={label}>Basic</p>
          <Button onClick={() => setBasicOpen(true)}>Open Basic Modal</Button>
          <Modal isOpen={basicOpen} onClose={() => setBasicOpen(false)} title="Welcome">
            <p>This is a simple modal with just a title and content.</p>
          </Modal>
        </div>

        <div>
          <p style={label}>Types</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="filled" color="primary" onClick={() => setInfoOpen(true)}>
              Info Modal
            </Button>
            <Button variant="filled" color="success" onClick={() => setSuccessOpen(true)}>
              Success Modal
            </Button>
            <Button variant="filled" color="secondary" onClick={() => setWarningOpen(true)}>
              Warning Modal
            </Button>
            <Button variant="filled" color="danger" onClick={() => setDangerOpen(true)}>
              Danger Modal
            </Button>
          </div>

          <Modal
            isOpen={infoOpen}
            onClose={() => setInfoOpen(false)}
            title="Information"
            icon={Info}
            type="info"
          >
            <p>This is an informational modal with an icon.</p>
          </Modal>

          <Modal
            isOpen={successOpen}
            onClose={() => setSuccessOpen(false)}
            title="Success!"
            icon={CircleCheck}
            type="success"
          >
            <p>Your action was completed successfully!</p>
          </Modal>

          <Modal
            isOpen={warningOpen}
            onClose={() => setWarningOpen(false)}
            title="Warning"
            icon={CircleAlert}
            type="warning"
          >
            <p>Please review the following information before proceeding.</p>
          </Modal>

          <Modal
            isOpen={dangerOpen}
            onClose={() => setDangerOpen(false)}
            title="Delete Item"
            icon={CircleX}
            type="danger"
          >
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </Modal>
        </div>

        <div>
          <p style={label}>With Icon</p>
          <Button onClick={() => setStringIconOpen(true)}>Open with String Icon</Button>
          <Modal
            isOpen={stringIconOpen}
            onClose={() => setStringIconOpen(false)}
            title="Delete Confirmation"
            icon="trash-2"
            type="danger"
          >
            <p>String-based icon example using "trash-2" instead of component.</p>
          </Modal>
        </div>

        <div>
          <p style={label}>With Actions</p>
          <Button onClick={() => setActionsOpen(true)}>Open Modal with Actions</Button>
          <Modal
            isOpen={actionsOpen}
            onClose={() => setActionsOpen(false)}
            title="Confirm Action"
            icon={CircleAlert}
            type="warning"
            actions={[
              {
                id: 'cancel',
                label: 'Cancel',
                variant: 'outlined',
                onClick: () => setActionsOpen(false),
              },
              {
                id: 'confirm',
                label: 'Confirm',
                variant: 'filled',
                color: 'danger',
                onClick: () => {
                  alert('Action confirmed!');
                  setActionsOpen(false);
                },
              },
            ]}
          >
            <p>This modal includes action buttons in the footer.</p>
            <p>Click "Confirm" to proceed or "Cancel" to close.</p>
          </Modal>
        </div>

        <div>
          <p style={label}>Sizes</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button onClick={() => setSizesOpen('sm')}>Small</Button>
            <Button onClick={() => setSizesOpen('md')}>Medium</Button>
            <Button onClick={() => setSizesOpen('lg')}>Large</Button>
            <Button onClick={() => setSizesOpen('full')}>Full Screen</Button>
          </div>

          <Modal
            isOpen={sizesOpen === 'sm'}
            onClose={() => setSizesOpen(null)}
            title="Small Modal"
            size="sm"
          >
            <p>This is a small modal (max-width: 400px).</p>
          </Modal>

          <Modal
            isOpen={sizesOpen === 'md'}
            onClose={() => setSizesOpen(null)}
            title="Medium Modal"
            size="md"
          >
            <p>This is a medium modal (max-width: 600px) - default size.</p>
          </Modal>

          <Modal
            isOpen={sizesOpen === 'lg'}
            onClose={() => setSizesOpen(null)}
            title="Large Modal"
            size="lg"
          >
            <p>This is a large modal (max-width: 800px).</p>
            <p>It can contain more content.</p>
          </Modal>

          <Modal
            isOpen={sizesOpen === 'full'}
            onClose={() => setSizesOpen(null)}
            title="Full Screen Modal"
            size="full"
          >
            <p>This modal takes up 95% of the viewport.</p>
            <p>Perfect for forms or detailed content.</p>
          </Modal>
        </div>

        <div>
          <p style={label}>Complex Example</p>
          <Button onClick={() => setActionsOpen(true)}>Open Complex Modal</Button>
          <Modal
            isOpen={actionsOpen}
            onClose={() => setActionsOpen(false)}
            title="Delete Account"
            icon={Trash2}
            type="danger"
            size="md"
            actions={[
              {
                id: 'cancel',
                label: 'Cancel',
                variant: 'text',
                onClick: () => setActionsOpen(false),
              },
              {
                id: 'delete',
                label: 'Delete Account',
                variant: 'filled',
                color: 'danger',
                onClick: () => {
                  alert('Account deleted!');
                  setActionsOpen(false);
                },
              },
            ]}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                <strong>Are you sure you want to delete your account?</strong>
              </p>
              <p>This action will:</p>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Permanently delete all your data</li>
                <li>Cancel all active subscriptions</li>
                <li>Remove access to all services</li>
              </ul>
              <p
                style={{ color: 'var(--danger-color)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                This action cannot be undone.
              </p>
            </div>
          </Modal>
        </div>
      </div>
    );
  },
};
