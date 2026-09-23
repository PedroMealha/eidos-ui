import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Download,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  LayoutGrid,
} from 'lucide-react';
import { ButtonGroup } from './ButtonGroup.component';
import { Button, IconButton } from '../Button';
import { StoryStack } from '../../story-layout.docs';

const meta = {
  title: 'Elements/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  args: {
    children: null,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: "Fallback variant for children that don't set their own",
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: "Fallback color for children that don't set their own",
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: "Fallback size for children that don't set their own",
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Lay the buttons out in a row or a column',
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ──────────────────────────────────────────────────────────────────

// Spreads `args` so the Controls panel actually drives the group. `children`
// stays fixed: it is the one prop a control cannot meaningfully supply, and
// the group-level props are the whole point of the component.
export const Playground: Story = {
  args: {
    variant: 'outlined',
    color: 'primary',
    size: 'md',
    orientation: 'horizontal',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button preIcon={AlignLeft}>Left</Button>
      <Button preIcon={AlignCenter}>Center</Button>
      <Button preIcon={AlignRight}>Right</Button>
    </ButtonGroup>
  ),
};

// ─── Filled ───────────────────────────────────────────────────────────────────

export const Filled: Story = {
  render: () => (
    <ButtonGroup variant="filled" color="primary">
      <Button preIcon={Plus}>Add</Button>
      <Button preIcon={Download}>Export</Button>
      <Button preIcon={Trash2} color="danger">
        Delete
      </Button>
    </ButtonGroup>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <StoryStack align="flex-start">
      <ButtonGroup variant="outlined" size="sm">
        <Button>Small</Button>
        <Button>Group</Button>
        <Button>Here</Button>
      </ButtonGroup>
      <ButtonGroup variant="outlined" size="md">
        <Button>Medium</Button>
        <Button>Group</Button>
        <Button>Here</Button>
      </ButtonGroup>
      <ButtonGroup variant="outlined" size="lg">
        <Button>Large</Button>
        <Button>Group</Button>
        <Button>Here</Button>
      </ButtonGroup>
    </StoryStack>
  ),
};

// ─── Icon-only buttons ────────────────────────────────────────────────────────

export const IconOnly: Story = {
  render: () => (
    <ButtonGroup variant="outlined">
      <IconButton icon={List} tooltip="List view" />
      <IconButton icon={LayoutGrid} tooltip="Grid view" />
    </ButtonGroup>
  ),
};

// ─── Vertical orientation ─────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <ButtonGroup variant="outlined" orientation="vertical">
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </ButtonGroup>
  ),
};

// ─── Mixed per-child overrides ────────────────────────────────────────────────

export const PerChildOverride: Story = {
  render: () => (
    <ButtonGroup variant="outlined" color="primary">
      <Button>Save</Button>
      <Button>Preview</Button>
      <Button variant="filled" color="danger" preIcon={Trash2}>
        Delete
      </Button>
    </ButtonGroup>
  ),
};
