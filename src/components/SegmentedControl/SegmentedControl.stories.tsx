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

const meta = {
  title: 'Elements/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  args: {
    // Required - overridden by every story's render function.
    options: [],
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [view, setView] = useState('week');
    return (
      <SegmentedControl
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        value={view}
        onChange={setView}
      />
    );
  },
};

// ─── 1. Labels ────────────────────────────────────────────────────────────────

export const Labels: Story = {
  name: 'Labels',
  parameters: {
    docs: {
      description: {
        story:
          'Text-only segments. Controlled via `value` + `onChange`. ' +
          'The group respects the primary color by default.',
      },
    },
  },
  render: function LabelsStory() {
    const [view, setView] = useState('week');
    return (
      <SegmentedControl
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        value={view}
        onChange={setView}
      />
    );
  },
};

// ─── 2. Icons + tooltips ──────────────────────────────────────────────────────

export const Icons: Story = {
  name: 'Icons',
  parameters: {
    docs: {
      description: {
        story: 'Icon-only segments with a tooltip on each. Ideal for view-switcher toolbars.',
      },
    },
  },
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

// ─── 3. Icons + labels ────────────────────────────────────────────────────────

export const IconsAndLabels: Story = {
  name: 'IconsAndLabels',
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

// ─── 4. Sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
    >
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SegmentedControl
          key={size}
          size={size}
          defaultValue="week"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
      ))}
    </div>
  ),
};

// ─── 5. Colors ────────────────────────────────────────────────────────────────

export const Colors: Story = {
  name: 'Colors',
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}
    >
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const).map((color) => (
        <SegmentedControl
          key={color}
          color={color}
          defaultValue="b"
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
            { value: 'c', label: 'Option C' },
          ]}
        />
      ))}
    </div>
  ),
};

// ─── 6. Disabled states ───────────────────────────────────────────────────────

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}
    >
      <SegmentedControl
        disabled
        defaultValue="b"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
          { value: 'c', label: 'Option C' },
        ]}
      />
      <SegmentedControl
        defaultValue="b"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B', disabled: true },
          { value: 'c', label: 'Option C' },
        ]}
      />
    </div>
  ),
};

// ─── 7. Full width ────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: 'FullWidth',
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
  name: 'Overflow',
  parameters: {
    docs: {
      description: {
        story:
          'A track wider than its container scrolls instead of overflowing the ' +
          'page, with chevron buttons at either end - the same treatment `Tabs` ' +
          'uses. Each button is rendered only while its own direction has ' +
          'somewhere to go, so neither appears when every segment fits. Native ' +
          'scrolling (touch swipe, trackpad, shift+wheel) works too, and ' +
          'selecting a segment off screen scrolls it into view. Pass ' +
          '`scrollButtons="none"` to keep the native scrollbar instead.',
      },
    },
  },
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
