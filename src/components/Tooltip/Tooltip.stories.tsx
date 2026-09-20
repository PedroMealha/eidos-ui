import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip.component';
import { Button } from '../Button';
import { Info } from 'lucide-react';
import { StoryRow } from '../../story-layout.docs';

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
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
  // `children` and `message` are required, so they live here to satisfy the
  // type for the render-only stories below as well as seeding Default.
  args: {
    message: 'This is a helpful tooltip',
    children: <Button>Hover me</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - Primary interactive example with all controls
// ============================================================================

export const Default: Story = {
  args: {
    placement: 'top',
    triggerType: 'hover',
    delay: 100,
    disabled: false,
  },
};

// `MessageTooltip` was a byte-identical copy of Default, referenced by no .mdx.

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
// PLACEMENTS
// ============================================================================

export const Placements: Story = {
  render: () => (
    <StoryRow>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip key={placement} message={`Placed ${placement}`} placement={placement}>
          <Button variant="outlined" size="sm">
            {placement}
          </Button>
        </Tooltip>
      ))}
    </StoryRow>
  ),
};

// ============================================================================
// TRIGGERS
// ============================================================================

export const Triggers: Story = {
  render: () => (
    <StoryRow>
      {(['hover', 'click', 'focus'] as const).map((triggerType) => (
        <Tooltip
          key={triggerType}
          message={`Triggered on ${triggerType}`}
          triggerType={triggerType}
        >
          <Button variant="outlined" size="sm">
            {triggerType}
          </Button>
        </Tooltip>
      ))}
    </StoryRow>
  ),
};

// ============================================================================
// COMMON USE CASES
// ============================================================================

export const CommonUseCases: Story = {
  render: () => (
    <StoryRow>
      <Tooltip message="More information">
        <Button preIcon={Info} variant="text">
          Info
        </Button>
      </Tooltip>
      <Tooltip message="Delete permanently" placement="bottom">
        <Button color="danger">Delete</Button>
      </Tooltip>
      <Tooltip message="This action is disabled">
        <Button disabled>Disabled</Button>
      </Tooltip>
    </StoryRow>
  ),
};
