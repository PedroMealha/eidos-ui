import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { expect, fn } from 'storybook/test';
import { Check, GitBranch, Tag, X } from 'lucide-react';
import { SplitChip } from './SplitChip.component';
import type { SplitChipSegment } from './SplitChip.types';
import { StoryRow, StoryStack } from '../../story-layout.docs';

const STATUS_SEGMENTS: SplitChipSegment[] = [
  { id: 'key', label: 'Status', variant: 'outlined' },
  { id: 'value', label: 'Open', color: 'success', onClick: action('Status value clicked') },
];

const meta = {
  title: 'Elements/SplitChip',
  component: SplitChip,
  parameters: { layout: 'centered' },
  // `segments` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding Playground's controls.
  args: {
    segments: STATUS_SEGMENTS,
  },
  argTypes: {
    segments: {
      control: 'object',
      description:
        'The segments, left to right. Each takes `id`, `label` and optionally `variant`, `color`, `onClick`, `preIcon`, `posIcon`, `tooltip` and `disabled`.',
      table: { type: { summary: 'SplitChipSegment[]' } },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Default visual style for segments that do not set their own',
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Default colour for segments that do not set their own',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of every segment',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable every segment',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    showDividers: {
      control: 'boolean',
      description: 'Draw a 1px divider between adjacent segments',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof SplitChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Dividers: Story = {
  render: () => (
    <StoryStack gap="sm" align="center">
      <StoryRow gap="sm">
        <SplitChip
          segments={[
            { id: 'a', label: 'Seamless' },
            { id: 'b', label: 'by' },
            { id: 'c', label: 'default' },
          ]}
        />
        <SplitChip
          showDividers
          segments={[
            { id: 'a', label: 'With' },
            { id: 'b', label: 'dividers' },
          ]}
        />
      </StoryRow>
      <StoryRow gap="sm">
        <SplitChip
          variant="outlined"
          segments={[
            { id: 'a', label: 'Seamless' },
            { id: 'b', label: 'outline' },
          ]}
        />
        <SplitChip
          variant="outlined"
          showDividers
          segments={[
            { id: 'a', label: 'With' },
            { id: 'b', label: 'dividers' },
          ]}
        />
      </StoryRow>
      <StoryRow gap="sm">
        <SplitChip
          variant="text"
          color="danger"
          showDividers
          segments={[
            { id: 'a', label: 'Outlined', variant: 'outlined' },
            { id: 'b', label: 'keeps its edge', color: 'success' },
          ]}
        />
      </StoryRow>
    </StoryStack>
  ),
};

const onValueClick = fn();

/**
 * Only the segments with an `onClick` are buttons. The key segment on the
 * left is static - no pointer cursor, no hover state - and each clickable
 * segment fires its own handler only.
 */
export const Interactive: Story = {
  render: () => (
    <StoryRow gap="sm">
      <SplitChip
        segments={[
          { id: 'key', label: 'Assignee', variant: 'outlined', color: 'secondary' },
          { id: 'value', label: 'Ada Lovelace', color: 'secondary', onClick: onValueClick },
          {
            id: 'clear',
            label: 'Clear',
            color: 'secondary',
            posIcon: X,
            onClick: action('Clear clicked'),
          },
        ]}
      />
    </StoryRow>
  ),
  play: async ({ canvas, userEvent }) => {
    onValueClick.mockClear();

    const key = canvas.getByText('Assignee').closest('.eidos-chip');
    expect(key?.tagName).toBe('DIV');
    expect(key).not.toHaveClass('eidos-chip--clickable');

    const value = canvas.getByRole('button', { name: 'Ada Lovelace' });
    expect(value).toHaveClass('eidos-chip--clickable');
    expect(canvas.getAllByRole('button')).toHaveLength(2);

    await userEvent.click(value);
    expect(onValueClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    expect(onValueClick).toHaveBeenCalledTimes(1);
  },
};

export const Sizes: Story = {
  render: () => (
    <StoryRow gap="sm">
      <SplitChip size="sm" segments={STATUS_SEGMENTS} />
      <SplitChip size="md" segments={STATUS_SEGMENTS} />
      <SplitChip size="lg" segments={STATUS_SEGMENTS} />
    </StoryRow>
  ),
};

export const States: Story = {
  render: () => (
    <StoryRow gap="sm">
      <SplitChip
        segments={[
          { id: 'key', label: 'Plan', variant: 'outlined' },
          { id: 'value', label: 'Pro', onClick: action('Plan clicked'), disabled: true },
        ]}
      />
      <SplitChip disabled segments={STATUS_SEGMENTS} />
      <SplitChip
        segments={[
          { id: 'key', label: 'SLA', variant: 'outlined', color: 'warning' },
          {
            id: 'value',
            label: '2h left',
            color: 'warning',
            tooltip: 'First response due at 14:30',
            onClick: action('SLA clicked'),
          },
        ]}
      />
    </StoryRow>
  ),
};

export const Variants: Story = {
  render: () => (
    <StoryRow gap="sm">
      <SplitChip
        segments={[
          { id: 'a', label: 'Filled', variant: 'filled', color: 'info' },
          { id: 'b', label: 'Outlined', variant: 'outlined', color: 'info' },
          { id: 'c', label: 'Text', variant: 'text', color: 'info' },
        ]}
      />
      <SplitChip
        segments={[
          { id: 'a', label: 'Build', variant: 'outlined', color: 'secondary' },
          { id: 'b', label: 'Passing', color: 'success' },
        ]}
      />
      <SplitChip
        segments={[
          { id: 'a', label: 'Priority', variant: 'outlined', color: 'danger' },
          { id: 'b', label: 'Urgent', color: 'danger' },
        ]}
      />
    </StoryRow>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StoryRow gap="sm">
      <SplitChip
        segments={[
          { id: 'a', label: 'Branch', preIcon: GitBranch, variant: 'outlined' },
          { id: 'b', label: 'main' },
        ]}
      />
      <SplitChip
        segments={[
          { id: 'a', label: 'Label', preIcon: Tag, variant: 'outlined', color: 'success' },
          { id: 'b', label: 'Verified', posIcon: Check, color: 'success' },
        ]}
      />
    </StoryRow>
  ),
};
