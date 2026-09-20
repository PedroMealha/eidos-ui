import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Mail, ShoppingCart } from 'lucide-react';
import { Badge } from './Badge.component';
import { IconButton } from '../Button/Button.component';
import { Avatar } from '../Avatar/Avatar.component';
import { StoryRow, StoryStack, StoryGroup } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    children: {
      control: false,
      description: 'The element the badge is attached to',
      table: { type: { summary: 'React.ReactNode' } },
    },
    content: {
      control: 'text',
      description: 'Content shown inside the badge, e.g. a notification count',
      table: { type: { summary: 'React.ReactNode' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    dot: {
      control: 'boolean',
      description: 'Render a small dot instead of `content`',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    max: {
      control: 'number',
      description: 'When content is a number, display `max+` if the value exceeds this threshold',
      table: { type: { summary: 'number' } },
    },
    showZero: {
      control: 'boolean',
      description: 'Show the badge when `content` is `0`',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    overlap: {
      control: 'select',
      options: ['circular', 'rectangular'],
      description: "Pull the badge in to follow a circular child's curve (e.g. Avatar)",
      table: {
        type: { summary: '"circular" | "rectangular"' },
        defaultValue: { summary: 'rectangular' },
      },
    },
    placement: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Corner of the wrapped element the badge is anchored to',
      table: {
        type: { summary: '"top-right" | "top-left" | "bottom-right" | "bottom-left"' },
        defaultValue: { summary: 'top-right' },
      },
    },
    invisible: {
      control: 'boolean',
      description: 'Force-hide the badge without unmounting it',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: { table: { disable: true } },
  },
  // `children` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding the Default controls.
  args: {
    children: (
      <IconButton icon={Bell} variant="text" color="secondary" aria-label="Notifications" />
    ),
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    content: 4,
    color: 'danger',
  },
};

// ============================================================================
// COUNTS - notification-style counters, with max clamping
// ============================================================================

export const Counts: Story = {
  render: () => (
    <StoryRow gap="lg">
      <Badge content={3} color="primary">
        <IconButton icon={Mail} variant="text" color="secondary" aria-label="Messages" />
      </Badge>
      <Badge content={99} max={99} color="danger">
        <IconButton icon={Bell} variant="text" color="secondary" aria-label="Notifications" />
      </Badge>
      <Badge content={150} max={99} color="danger">
        <IconButton icon={ShoppingCart} variant="text" color="secondary" aria-label="Cart" />
      </Badge>
      <Badge content={0} color="primary">
        <IconButton icon={Bell} variant="text" color="secondary" aria-label="No notifications" />
      </Badge>
    </StoryRow>
  ),
};

// ============================================================================
// DOT - minimal presence/status indicator, no count
// ============================================================================

export const Dot: Story = {
  render: () => (
    <StoryRow gap="lg">
      <Badge dot color="success" overlap="circular">
        <Avatar name="Jane Doe" />
      </Badge>
      <Badge dot color="danger" overlap="circular">
        <Avatar name="John Smith" />
      </Badge>
      <Badge dot color="warning" overlap="circular">
        <Avatar name="Ana Silva" />
      </Badge>
    </StoryRow>
  ),
};

// ============================================================================
// OVERLAP - rectangular (default) vs circular children
// ============================================================================

export const Overlap: Story = {
  render: () => (
    <StoryStack gap="lg">
      <StoryGroup label="Rectangular - square/rectangular children (default)">
        <Badge content={2} color="primary" overlap="rectangular">
          <IconButton icon={Bell} variant="outlined" color="secondary" aria-label="Notifications" />
        </Badge>
      </StoryGroup>
      <StoryGroup label="Circular - pulled in to follow the child's curve">
        <Badge content={2} color="primary" overlap="circular">
          <Avatar name="Jane Doe" />
        </Badge>
      </StoryGroup>
    </StoryStack>
  ),
};

// ============================================================================
// ALIGNMENT - anchor to any corner
// ============================================================================

export const Alignment: Story = {
  render: () => (
    <StoryRow gap="lg">
      <Badge content={10} color="primary" placement="top-right">
        <Avatar shape="square" name="TR" />
      </Badge>
      <Badge content={10} color="primary" placement="top-left">
        <Avatar shape="square" name="TL" />
      </Badge>
      <Badge content={10} color="primary" placement="bottom-right">
        <Avatar shape="square" name="BR" />
      </Badge>
      <Badge content={10} color="primary" placement="bottom-left">
        <Avatar shape="square" name="BL" />
      </Badge>
    </StoryRow>
  ),
};
