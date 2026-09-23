import React from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert.component';
import { StoryStack } from '../../story-layout.docs';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Semantic colour variant',
      table: {
        type: { summary: '"info" | "success" | "warning" | "danger"' },
        defaultValue: { summary: 'info' },
      },
    },
    title: {
      control: 'text',
      description:
        'Optional bold heading rendered above the body content. Accepts inline nodes, not just a string.',
      table: { type: { summary: 'React.ReactNode' } },
    },
    children: {
      control: 'text',
      description: 'Body text / content of the alert',
      table: { type: { summary: 'React.ReactNode' } },
    },
    icon: {
      control: 'boolean',
      description:
        'true/omitted = default variant icon, false = no icon, or pass an IconType for a custom icon',
      table: {
        type: { summary: 'boolean | IconType' },
        defaultValue: { summary: 'true' },
      },
    },
    onDismiss: {
      control: false,
      description: 'Callback fired when the × dismiss button is clicked',
      table: { type: { summary: '() => void' } },
    },
    action: {
      control: false,
      description: 'Optional action button rendered inside the alert body',
      table: { type: { summary: 'AlertAction' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Playground: Story = {
  args: {
    variant: 'info',
    children: 'Your session will expire in 10 minutes. Save your work to avoid losing progress.',
  },
};

// Per-variant `Success`/`Warning`/`Danger` stories used to sit here. Each was
// a one-arg copy of Playground that no .mdx referenced, and `AllVariants` below
// shows all four together - which is how you actually compare them.

// ============================================================================
// WITH TITLE
// ============================================================================

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Scheduled maintenance',
    children:
      'The platform will be unavailable on Saturday 15th between 02:00 – 04:00 UTC for scheduled maintenance.',
  },
};

// ============================================================================
// WITH ACTION
// ============================================================================

export const WithAction: Story = {
  args: {
    variant: 'warning',
    title: 'Storage limit reached',
    children:
      'You have used 95% of your available storage. Upgrade your plan to continue uploading files.',
    action: {
      label: 'Upgrade plan',
      onClick: action('Upgrade plan clicked'),
    },
  },
};

// ============================================================================
// DISMISSABLE - uses useState so needs a render function
// ============================================================================

export const Dismissable: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) {
      return (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Alert dismissed. Refresh the page to reset.
        </p>
      );
    }

    return <Alert {...args} onDismiss={() => setVisible(false)} />;
  },
  args: {
    variant: 'info',
    title: 'Dismissable alert',
    children: 'Click the × button on the right to dismiss this alert.',
  },
};

// ============================================================================
// NO ICON
// ============================================================================

export const NoIcon: Story = {
  args: {
    variant: 'success',
    title: 'No icon',
    children: 'This alert renders without an icon - useful when screen real estate is tight.',
    icon: false,
  },
};

// ============================================================================
// ALL VARIANTS - visual reference of all four variants at once
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <StoryStack gap="sm">
        <Alert variant="info" title="Information">
          Here is some helpful context about this feature or action.
        </Alert>
        <Alert variant="success" title="Success">
          Everything went as expected. Your data has been saved.
        </Alert>
        <Alert variant="warning" title="Warning">
          Proceed carefully. This operation may have side effects.
        </Alert>
        <Alert variant="danger" title="Error">
          Something went wrong. Please try again or contact support.
        </Alert>
      </StoryStack>
    </div>
  ),
};
