import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, Star, Check } from 'lucide-react';
import { Chip } from './Chip.component';
import { StoryRow } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  args: {
    children: undefined,
    preIcon: undefined,
    posIcon: undefined,
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the chip',
      table: { type: { summary: 'React.ReactNode' } },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
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
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the chip',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the chip',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip message to display on hover',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    preIcon: {
      control: 'text',
      description: 'Icon to display before text. Pass Lucide component (Tag) or string ("tag").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    posIcon: {
      control: 'text',
      description: 'Icon to display after text. Pass Lucide component (Check) or string ("check").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    onClick: {
      control: false,
      description: 'Callback when chip is clicked (makes chip clickable)',
      table: { type: { summary: '() => void' }, defaultValue: { summary: 'undefined' } },
    },
    onRemove: {
      control: false,
      description: 'Callback when remove button is clicked (adds remove button)',
      table: { type: { summary: '() => void' }, defaultValue: { summary: 'undefined' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make chip full width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'Chip Label',
  },
};

export const Variants: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip variant="filled">Filled</Chip>
      <Chip variant="outlined">Outlined</Chip>
      <Chip variant="text">Text</Chip>
    </StoryRow>
  ),
};

export const Colors: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip color="primary">Primary</Chip>
      <Chip color="secondary">Secondary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="danger">Danger</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="info">Info</Chip>
    </StoryRow>
  ),
};

export const Sizes: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </StoryRow>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip preIcon={Tag}>Tagged</Chip>
      <Chip posIcon={Check}>Verified</Chip>
      <Chip preIcon={Star} posIcon={Check}>
        Featured
      </Chip>
    </StoryRow>
  ),
};

export const Interactive: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip onClick={() => {}}>Clickable</Chip>
      <Chip onRemove={() => {}}>Removable</Chip>
      <Chip onClick={() => {}} onRemove={() => {}}>
        Both
      </Chip>
    </StoryRow>
  ),
};

export const States: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip>Default</Chip>
      <Chip disabled>Disabled</Chip>
      <Chip tooltip="Helpful information">With tooltip</Chip>
    </StoryRow>
  ),
};

/**
 * `Chip` sets `display: inline-flex` explicitly rather than inheriting
 * `flex` from its layout mixin. Without that override it stretches to fill
 * its parent the moment it is used outside a flex row - which is exactly
 * what this story puts it in, so a regression shows up as a full-width bar.
 *
 * The wrapper is a `div`, not a `p`, deliberately: `Chip` renders a `div`,
 * and a `div` inside a `p` is invalid HTML that React reports as a hydration
 * error. That is a real constraint on where a chip can go - see the note in
 * `Chip.mdx`.
 */
export const InlineInText: Story = {
  render: () => (
    <div style={{ maxWidth: 420, lineHeight: 2 }}>
      Filters currently applied: <Chip size="sm">Design</Chip> and{' '}
      <Chip size="sm" color="success">
        Published
      </Chip>
      . Remove one to widen the result set.
    </div>
  ),
};
