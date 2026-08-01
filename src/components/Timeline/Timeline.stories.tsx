import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, AlertCircle, Clock, Upload, Star, Zap } from 'lucide-react';
import { Timeline } from './Timeline.component';
import type { TimelineItem } from './Timeline.types';

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Data/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    items: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT — mixed colors with timestamps
// ============================================================================

export const Default: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Order placed',
        timestamp: 'Today 09:41',
        color: 'primary',
      },
      {
        id: '2',
        title: 'Payment confirmed',
        description: 'Payment of $124.00 was confirmed.',
        timestamp: 'Today 09:42',
        color: 'success',
      },
      {
        id: '3',
        title: 'Processing',
        description: 'Your order is being processed.',
        timestamp: 'Today 10:15',
        color: 'secondary',
      },
      {
        id: '4',
        title: 'Awaiting dispatch',
        timestamp: 'Estimated: Tomorrow',
        color: 'default',
      },
    ] satisfies TimelineItem[],
  },
};

// ============================================================================
// WITH ICONS
// ============================================================================

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Uploaded',
        description: 'File uploaded successfully.',
        timestamp: '2 days ago',
        icon: <Upload size={14} />,
        color: 'primary',
      },
      {
        id: '2',
        title: 'Reviewed',
        description: 'Document reviewed by the team.',
        timestamp: 'Yesterday',
        icon: <CheckCircle size={14} />,
        color: 'success',
      },
      {
        id: '3',
        title: 'Flagged',
        description: 'Requires attention before approval.',
        timestamp: '2 hours ago',
        icon: <AlertCircle size={14} />,
        color: 'danger',
      },
      {
        id: '4',
        title: 'Pending approval',
        timestamp: 'In progress',
        icon: <Clock size={14} />,
        color: 'default',
      },
    ] satisfies TimelineItem[],
  },
};

// ============================================================================
// SIMPLE — no timestamps, no icons
// ============================================================================

export const Simple: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Created account',
        description: 'Signed up with email and password.',
      },
      {
        id: '2',
        title: 'Verified email',
        description: 'Confirmed email address via verification link.',
      },
      {
        id: '3',
        title: 'Completed profile',
        description: 'Added profile photo and bio.',
      },
      {
        id: '4',
        title: 'First purchase',
        description: 'Made first purchase through the platform.',
      },
    ] satisfies TimelineItem[],
  },
};

// ============================================================================
// ALL COLORS — one item per color variant
// ============================================================================

export const AllColors = {
  render: () => (
    <Timeline
      items={[
        { id: '1', title: 'Default',   description: 'Default gray dot.',         color: 'default'   },
        { id: '2', title: 'Primary',   description: 'Primary brand color.',       color: 'primary'   },
        { id: '3', title: 'Secondary', description: 'Secondary accent color.',    color: 'secondary' },
        { id: '4', title: 'Success',   description: 'Green success state.',        color: 'success'   },
        { id: '5', title: 'Danger',    description: 'Red danger / error state.',  color: 'danger'    },
      ]}
    />
  ),
};

// ============================================================================
// LONG CONTENT — items with extended description text
// ============================================================================

export const LongContent: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'System upgrade completed',
        description:
          'The platform was upgraded to version 4.2.0 during the scheduled maintenance window. All services are back online and operating normally. No data was lost during the process.',
        timestamp: 'Mar 15, 2024',
        icon: <Star size={14} />,
        color: 'success',
      },
      {
        id: '2',
        title: 'Security audit initiated',
        description:
          'A comprehensive security audit was initiated by the infrastructure team to identify and remediate potential vulnerabilities across all production environments.',
        timestamp: 'Mar 22, 2024',
        icon: <Zap size={14} />,
        color: 'primary',
      },
      {
        id: '3',
        title: 'Critical vulnerability patched',
        description:
          'A critical SQL injection vulnerability was identified and patched in under 4 hours by the security team. All affected records have been reviewed and no data exfiltration was detected.',
        timestamp: 'Mar 23, 2024',
        icon: <AlertCircle size={14} />,
        color: 'danger',
      },
    ] satisfies TimelineItem[],
  },
};
