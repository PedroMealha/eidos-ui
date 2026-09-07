import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Mail, ShoppingCart } from 'lucide-react';
import { Badge } from './Badge.component';
import { IconButton } from '../Button/Button.component';
import { Avatar } from '../Avatar/Avatar.component';

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
    children: <IconButton icon={Bell} variant="text" color="secondary" aria-label="Notifications" />,
  },
};

// ============================================================================
// COUNTS - notification-style counters, with max clamping
// ============================================================================

export const Counts = {
  render: () => {
    const row: React.CSSProperties = { display: 'flex', gap: '1.5rem', alignItems: 'center' };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
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
        </div>
      </div>
    );
  },
};

// ============================================================================
// DOT - minimal presence/status indicator, no count
// ============================================================================

export const Dot = {
  render: () => {
    const row: React.CSSProperties = { display: 'flex', gap: '1.5rem', alignItems: 'center' };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
          <Badge dot color="success" overlap="circular">
            <Avatar name="Jane Doe" />
          </Badge>
          <Badge dot color="danger" overlap="circular">
            <Avatar name="John Smith" />
          </Badge>
          <Badge dot color="warning" overlap="circular">
            <Avatar name="Ana Silva" />
          </Badge>
        </div>
      </div>
    );
  },
};

// ============================================================================
// OVERLAP - rectangular (default) vs circular children
// ============================================================================

export const Overlap = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const row: React.CSSProperties = { display: 'flex', gap: '1.5rem', alignItems: 'center' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        <div>
          <p style={label}>Rectangular - square/rectangular children (default)</p>
          <div style={row}>
            <Badge content={2} color="primary" overlap="rectangular">
              <IconButton icon={Bell} variant="outlined" color="secondary" aria-label="Notifications" />
            </Badge>
          </div>
        </div>
        <div>
          <p style={label}>Circular - pulled in to follow the child&apos;s curve</p>
          <div style={row}>
            <Badge content={2} color="primary" overlap="circular">
              <Avatar name="Jane Doe" />
            </Badge>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// ALIGNMENT - anchor to any corner
// ============================================================================

export const Alignment = {
  render: () => {
    const row: React.CSSProperties = { display: 'flex', gap: '1.5rem', alignItems: 'center' };

    return (
      <div style={{ padding: '1rem' }}>
        <div style={row}>
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
        </div>
      </div>
    );
  },
};
