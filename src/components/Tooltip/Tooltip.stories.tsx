import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip.component';
import { Button } from '../Button';
import { Info } from 'lucide-react';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Tooltip text content',
      table: {
        type: { summary: 'string' },
      },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Preferred placement (auto-adjusts if no space)',
      table: {
        type: { summary: '"top" | "bottom" | "left" | "right"' },
        defaultValue: { summary: 'top' },
      },
    },
    triggerType: {
      control: 'select',
      options: ['hover', 'click', 'focus'],
      description: 'How to trigger the tooltip',
      table: {
        type: { summary: '"hover" | "click" | "focus"' },
        defaultValue: { summary: 'hover' },
      },
    },
    delay: {
      control: 'number',
      description: 'Delay before showing (ms)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the tooltip',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      table: { disable: true },
    },
    closeOnClickOutside: {
      table: { disable: true },
    },
    closeOnEscape: {
      table: { disable: true },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MESSAGE TOOLTIP - Main interactive example with all controls
// ============================================================================

export const MessageTooltip: Story = {
  args: {
    message: 'This is a helpful tooltip',
    placement: 'top',
    triggerType: 'hover',
    delay: 100,
    disabled: false,
    children: <Button>Hover me</Button>,
  },
};

// ============================================================================
// COMPONENT TOOLTIP - Custom component instead of string
// ============================================================================

const CustomTooltipContent = () => (
  <div style={{ padding: '0.5rem' }}>
    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Custom Component</strong>
    <p style={{ margin: 0, fontSize: '0.875rem' }}>
      You can render any React component as tooltip content
    </p>
  </div>
);

export const ComponentTooltip: Story = {
  args: {
    component: CustomTooltipContent,
    placement: 'top',
    triggerType: 'hover',
    delay: 100,
    disabled: false,
    children: <Button variant="outlined">Hover for custom content</Button>,
  },
  argTypes: {
    component: {
      control: false,
      description: 'Custom React component to render in tooltip',
    },
    message: {
      table: { disable: true },
    },
  },
};

// ============================================================================
// EXAMPLES SHOWCASE
// ============================================================================

export const Examples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      {/* Placements */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Placements
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Tooltip message="Top tooltip" placement="top">
            <Button variant="outlined" size="small">Top</Button>
          </Tooltip>
          <Tooltip message="Bottom tooltip" placement="bottom">
            <Button variant="outlined" size="small">Bottom</Button>
          </Tooltip>
          <Tooltip message="Left tooltip" placement="left">
            <Button variant="outlined" size="small">Left</Button>
          </Tooltip>
          <Tooltip message="Right tooltip" placement="right">
            <Button variant="outlined" size="small">Right</Button>
          </Tooltip>
        </div>
      </div>

      {/* Triggers */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Triggers
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Tooltip message="Triggered on hover" triggerType="hover">
            <Button variant="outlined" size="small">Hover</Button>
          </Tooltip>
          <Tooltip message="Triggered on click" triggerType="click">
            <Button variant="outlined" size="small">Click</Button>
          </Tooltip>
          <Tooltip message="Triggered on focus" triggerType="focus">
            <Button variant="outlined" size="small">Focus</Button>
          </Tooltip>
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
          Common Use Cases
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Tooltip message="Download the file">
            <Button preIcon={Info} variant="text">Info</Button>
          </Tooltip>

          <Tooltip message="Delete permanently" placement="bottom">
            <Button color="danger">Delete</Button>
          </Tooltip>

          <Tooltip message="This action is disabled" placement="top">
            <Button disabled>Disabled Action</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};
