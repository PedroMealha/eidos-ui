import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { SnackbarProvider, SnackbarContainer } from './index';
import { useSnackbar } from './Snackbar.hooks';
import { Button } from '../Button';
import { UserCircle } from 'lucide-react';
import type { SnackbarVariant } from './Snackbar.types';
import { StoryLabel } from '../../story-layout.docs';
import { expect, screen, waitFor } from 'storybook/test';

// Fires one of each variant, so they can be compared without flipping the
// playground's `variant` control four times.
const SnackbarDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar, clearAll } = useSnackbar();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div>
        <StoryLabel>Variants</StoryLabel>
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
        <StoryLabel>With Actions</StoryLabel>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            onClick={() =>
              showSuccess('File uploaded successfully', {
                action: { label: 'View', onClick: action('Viewing file...') },
              })
            }
          >
            Success + Action
          </Button>
          <Button
            onClick={() =>
              showError('Failed to delete item', {
                action: { label: 'Retry', onClick: action('Retrying...') },
              })
            }
          >
            Error + Retry
          </Button>
          <Button
            onClick={() =>
              showWarning('You have unsaved changes', {
                action: { label: 'Save', onClick: action('Saving...') },
                duration: 0,
              })
            }
          >
            Warning + Save
          </Button>
        </div>
      </div>

      <div>
        <StoryLabel>Duration</StoryLabel>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={() => showSuccess('Stays 10 seconds', { duration: 10000 })}>10s</Button>
          <Button onClick={() => showError('Stays 2 seconds', { duration: 2000 })}>2s</Button>
          <Button onClick={() => showInfo('No auto-close', { duration: 0 })}>Persistent</Button>
        </div>
      </div>

      <div>
        <StoryLabel>Advanced</StoryLabel>
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
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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

/**
 * `Snackbar` has no props of its own - it is a provider plus the `useSnackbar`
 * hook - so there is nothing for Storybook to infer controls from. These args
 * describe the *options object* the hook takes instead, which is the thing a
 * reader actually wants to experiment with.
 */
interface SnackbarPlaygroundArgs {
  message: string;
  variant: SnackbarVariant;
  duration: number;
  withAction: boolean;
}

const meta: Meta<SnackbarPlaygroundArgs> = {
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
  args: {
    message: 'Your changes have been saved.',
    variant: 'success',
    duration: 4000,
    withAction: false,
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Text shown in the toast.',
      table: { type: { summary: 'string' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['success', 'danger', 'warning', 'info'],
      description: 'Colour and icon of the toast.',
      table: {
        type: { summary: '"success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'info' },
      },
    },
    duration: {
      control: { type: 'number', step: 500 },
      description: 'Auto-dismiss delay in ms. `0` keeps the toast until closed manually.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '4000' } },
    },
    withAction: {
      control: 'boolean',
      description: 'Adds a labelled action button inside the toast.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;
type Story = StoryObj<SnackbarPlaygroundArgs>;

// ─── Default - the args-driven playground ─────────────────────────────────────

const Playground = ({ message, variant, duration, withAction }: SnackbarPlaygroundArgs) => {
  const { showSnackbar } = useSnackbar();
  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <Button
        onClick={() =>
          showSnackbar({
            message,
            variant,
            duration,
            ...(withAction ? { action: { label: 'Undo', onClick: action('Undo clicked') } } : {}),
          })
        }
      >
        Show snackbar
      </Button>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Playground {...args} />,
};

// ─── All variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => <SnackbarDemo />,
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
                onClick: action('Opening file...'),
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
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      John Doe: "Hey, can we schedule a meeting?"
                    </div>
                  </div>
                </div>
              ),
              variant: 'info',
              duration: 8000,
              action: {
                label: 'Reply',
                onClick: action('Opening chat...'),
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

// ============================================================================
// TIMING ADJUSTABLE - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Auto-dismiss was a bare `setTimeout` nothing could stop - a time limit the
 * user can neither turn off, adjust nor extend (SC 2.2.1, Level A). Axe sees
 * none of this; only a clock does.
 *
 * The deadline here is deliberately short so the test stays fast, and the
 * assertions are one-sided - "still there after N ms" and "gone eventually"
 * - rather than measuring elapsed time, which would make the test a
 * stopwatch race on a loaded CI box.
 */
export const TimingAdjustable: Story = {
  tags: ['!dev', '!autodocs'],
  render: function TimingAdjustableStory() {
    const { showInfo } = useSnackbar();
    return <Button onClick={() => showInfo('Saved. Undo?', { duration: 600 })}>Notify</Button>;
  },
  play: async ({ canvas, userEvent, step }) => {
    await step('hovering holds the countdown open', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Notify' }));
      const alert = await screen.findByRole('alert');

      await userEvent.hover(alert);
      // Comfortably past the 600ms deadline. Without a pause it would be gone.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      expect(
        screen.queryByRole('alert'),
        'the snackbar dismissed itself while the pointer was over it',
      ).not.toBeNull();
    });

    await step('and it resumes once the pointer leaves', async () => {
      await userEvent.unhover(screen.getByRole('alert'));
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull(), { timeout: 3000 });
    });
  },
};
