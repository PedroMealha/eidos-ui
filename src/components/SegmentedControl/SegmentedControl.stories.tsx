import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  List,
  LayoutGrid,
  Table2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { SegmentedControl } from './SegmentedControl.component';
import { StoryStack } from '../../story-layout.docs';

const RANGE_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const ABC_OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

const meta = {
  title: 'Elements/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  // `options` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding the Default controls.
  args: {
    options: RANGE_OPTIONS,
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Segment definitions. Each needs a `value` plus a `label` and/or an `icon`.',
      table: { type: { summary: 'SegmentedOption[]' } },
    },
    defaultValue: {
      control: 'text',
      description: "Initial value when uncontrolled. Defaults to the first option's value.",
      table: { type: { summary: 'string' } },
    },
    value: {
      control: false,
      description: 'Controlled selected value. Pair with `onChange`.',
      table: { type: { summary: 'string' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Control height',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Colour of the active segment chip',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable every segment.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: "Stretch to the parent's width, each segment taking an equal share.",
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    scrollButtons: {
      control: 'inline-radio',
      options: ['auto', 'none'],
      description: 'Scroll affordance when the track is wider than its container.',
      table: { type: { summary: '"auto" | "none"' }, defaultValue: { summary: 'auto' } },
    },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

// Uncontrolled (`defaultValue`) rather than the `useState` wrapper this used
// to have, so every prop in the panel actually drives the rendered control.
export const Default: Story = {
  args: {
    defaultValue: 'week',
    size: 'md',
    color: 'primary',
    disabled: false,
    fullWidth: false,
  },
};

// ─── Icons + tooltips ─────────────────────────────────────────────────────────

export const Icons: Story = {
  render: function IconsStory() {
    const [view, setView] = useState('list');
    return (
      <SegmentedControl
        options={[
          { value: 'list', icon: List, tooltip: 'List view' },
          { value: 'grid', icon: LayoutGrid, tooltip: 'Grid view' },
          { value: 'table', icon: Table2, tooltip: 'Table view' },
        ]}
        value={view}
        onChange={setView}
      />
    );
  },
};

// ─── Icons + labels ───────────────────────────────────────────────────────────

export const IconsAndLabels: Story = {
  render: function IconsAndLabelsStory() {
    const [align, setAlign] = useState('left');
    return (
      <SegmentedControl
        options={[
          { value: 'left', icon: AlignLeft, label: 'Left' },
          { value: 'center', icon: AlignCenter, label: 'Center' },
          { value: 'right', icon: AlignRight, label: 'Right' },
          { value: 'justify', icon: AlignJustify, label: 'Justify' },
        ]}
        value={align}
        onChange={setAlign}
      />
    );
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <StoryStack align="flex-start">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SegmentedControl
          key={size}
          size={size}
          defaultValue="week"
          options={RANGE_OPTIONS.slice(0, 3)}
        />
      ))}
    </StoryStack>
  ),
};

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors: Story = {
  render: () => (
    <StoryStack gap="sm" align="flex-start">
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const).map((color) => (
        <SegmentedControl key={color} color={color} defaultValue="b" options={ABC_OPTIONS} />
      ))}
    </StoryStack>
  ),
};

// ─── Disabled states ──────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <StoryStack gap="sm" align="flex-start">
      <SegmentedControl disabled defaultValue="b" options={ABC_OPTIONS} />
      <SegmentedControl
        defaultValue="b"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B', disabled: true },
          { value: 'c', label: 'Option C' },
        ]}
      />
    </StoryStack>
  ),
};

// ─── Full width ───────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
  render: function FullWidthStory() {
    const [v, setV] = useState('all');
    return (
      <SegmentedControl
        fullWidth
        value={v}
        onChange={setV}
        options={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
    );
  },
};

// ─── Overflow ─────────────────────────────────────────────────────────────────

export const Overflow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: function OverflowStory() {
    const [range, setRange] = useState('quarter');
    return (
      <SegmentedControl
        value={range}
        onChange={setRange}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This week' },
          { value: 'month', label: 'This month' },
          { value: 'quarter', label: 'This quarter' },
          { value: 'year', label: 'This year' },
          { value: 'all', label: 'All time' },
        ]}
      />
    );
  },
};
