import type { Meta, StoryObj } from '@storybook/react-vite';
import { SnackbarProvider, SnackbarContainer } from './index';
import { useSnackbar } from './Snackbar.hooks';
import { Button } from '../Button';
import { UserCircle } from 'lucide-react';

const label: React.CSSProperties = {
  marginBottom: '0.5rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94a3b8',
};

// Wrapper component used by the Examples story
const SnackbarDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar, clearAll } = useSnackbar();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div>
        <p style={label}>Variants</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={() => showSuccess('Operation completed successfully!')}>Success</Button>
          <Button onClick={() => showError('An error occurred!')}>Error</Button>
          <Button onClick={() => showWarning('Warning: Please review your changes.')}>
            Warning
          </Button>
          <Button onClick={() => showInfo("Here's some useful information.")}>Info</Button>
        </div>
      </div>

      <div>
        <p style={label}>With Actions</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            onClick={() =>
              showSuccess('File uploaded successfully', {
                action: { label: 'View', onClick: () => alert('Viewing file...') },
              })
            }
          >
            Success + Action
          </Button>
          <Button
            onClick={() =>
              showError('Failed to delete item', {
                action: { label: 'Retry', onClick: () => alert('Retrying...') },
              })
            }
          >
            Error + Retry
          </Button>
          <Button
            onClick={() =>
              showWarning('You have unsaved changes', {
                action: { label: 'Save', onClick: () => alert('Saving...') },
                duration: 0,
              })
            }
          >
            Warning + Save
          </Button>
        </div>
      </div>

      <div>
        <p style={label}>Duration</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={() => showSuccess('Stays 10 seconds', { duration: 10000 })}>10s</Button>
          <Button onClick={() => showError('Stays 2 seconds', { duration: 2000 })}>2s</Button>
          <Button onClick={() => showInfo('No auto-close', { duration: 0 })}>Persistent</Button>
        </div>
      </div>

      <div>
        <p style={label}>Advanced</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              showSuccess('First notification');
              setTimeout(() => showInfo('Second notification'), 300);
              setTimeout(() => showWarning('Third notification'), 600);
            }}
          >
            Stack Multiple
          </Button>
          <Button
            onClick={() =>
              showSnackbar({
                component: () => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserCircle size={40} style={{ color: '#667eea' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>New Message</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        John Doe sent you a message
                      </div>
                    </div>
                  </div>
                ),
                variant: 'info',
                duration: 5000,
              })
            }
          >
            Custom Component
          </Button>
          <Button onClick={clearAll} color="danger" variant="outlined">
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

// Meta configuration for Storybook
const meta: Meta = {
  title: 'Overlays/Snackbar',
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
        <SnackbarContainer />
      </SnackbarProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A notification system (toast/snackbar) that displays temporary messages to users. Supports multiple variants, custom durations, actions, and custom components. Built with Context API and Portal rendering for optimal positioning.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SnackbarDemo />,
  parameters: {
    docs: {
      source: {
        code: `
const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

<button onClick={() => showSuccess('Changes saved!')}>Success</button>
<button onClick={() => showError('An error occurred!')}>Error</button>
<button onClick={() => showWarning('Please review your changes.')}>Warning</button>
<button onClick={() => showInfo("Here's some useful information.")}>Info</button>`.trim(),
      },
    },
  },
};

export const Examples: Story = {
  render: () => <SnackbarDemo />,
  parameters: {
    docs: {
      source: {
        code: `
const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

<button onClick={() => showSuccess('Changes saved!')}>Success</button>
<button onClick={() => showError('An error occurred!')}>Error</button>
<button onClick={() => showWarning('Please review your changes.')}>Warning</button>
<button onClick={() => showInfo("Here's some useful information.")}>Info</button>`.trim(),
      },
    },
  },
};

export const SuccessVariant: Story = {
  render: () => {
    const { showSuccess } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button onClick={() => showSuccess('Operation completed successfully!')}>
          Show Success Notification
        </Button>
      </div>
    );
  },
};

export const ErrorVariant: Story = {
  render: () => {
    const { showError } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button onClick={() => showError('An error occurred while processing your request.')}>
          Show Error Notification
        </Button>
      </div>
    );
  },
};

export const WarningVariant: Story = {
  render: () => {
    const { showWarning } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button onClick={() => showWarning('Warning: Please review your changes before saving.')}>
          Show Warning Notification
        </Button>
      </div>
    );
  },
};

export const InfoVariant: Story = {
  render: () => {
    const { showInfo } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button onClick={() => showInfo("Here's some useful information for you.")}>
          Show Info Notification
        </Button>
      </div>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const { showSuccess } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button
          onClick={() =>
            showSuccess('File uploaded successfully', {
              action: {
                label: 'View',
                onClick: () => alert('Opening file...'),
              },
            })
          }
        >
          Show with Action
        </Button>
      </div>
    );
  },
};

export const PersistentNotification: Story = {
  render: () => {
    const { showWarning } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button
          onClick={() =>
            showWarning("This notification won't auto-close. You must close it manually.", {
              duration: 0,
            })
          }
        >
          Show Persistent Notification
        </Button>
      </div>
    );
  },
};

export const MultipleNotifications: Story = {
  render: () => {
    const { showSuccess, showInfo, showWarning, showError } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button
          onClick={() => {
            showSuccess('First notification');
            setTimeout(() => showInfo('Second notification'), 300);
            setTimeout(() => showWarning('Third notification'), 600);
            setTimeout(() => showError('Fourth notification'), 900);
          }}
        >
          Show Multiple Notifications
        </Button>
      </div>
    );
  },
};

export const CustomComponent: Story = {
  render: () => {
    const { showSnackbar } = useSnackbar();

    return (
      <div style={{ padding: '20px' }}>
        <Button
          onClick={() =>
            showSnackbar({
              component: () => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserCircle size={40} style={{ color: '#667eea' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                      New Message
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      John Doe: "Hey, can we schedule a meeting?"
                    </div>
                  </div>
                </div>
              ),
              variant: 'info',
              duration: 8000,
              action: {
                label: 'Reply',
                onClick: () => alert('Opening chat...'),
              },
            })
          }
        >
          Show Custom Component
        </Button>
      </div>
    );
  },
};
