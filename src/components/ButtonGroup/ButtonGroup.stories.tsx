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

const meta = {
  title: 'Elements/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  args: {
    // Required - overridden by every story's render function.
    children: null,
    orientation: 'horizontal',
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ButtonGroup variant="outlined" color="primary">
      <Button preIcon={AlignLeft}>Left</Button>
      <Button preIcon={AlignCenter}>Center</Button>
      <Button preIcon={AlignRight}>Right</Button>
    </ButtonGroup>
  ),
};

// ─── 1. Outlined (most common use-case) ──────────────────────────────────────

export const Outlined: Story = {
  name: 'Outlined',
  parameters: {
    docs: {
      description: {
        story:
          'The classic segmented action bar. Children inherit `variant` and `color` ' +
          'from the group unless they specify their own.',
      },
    },
  },
  render: () => (
    <ButtonGroup variant="outlined" color="primary">
      <Button preIcon={AlignLeft}>Left</Button>
      <Button preIcon={AlignCenter}>Center</Button>
      <Button preIcon={AlignRight}>Right</Button>
    </ButtonGroup>
  ),
};

// ─── 2. Filled ────────────────────────────────────────────────────────────────

export const Filled: Story = {
  name: 'Filled',
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

// ─── 3. Sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
    >
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
    </div>
  ),
};

// ─── 4. Icon-only buttons ─────────────────────────────────────────────────────

export const IconOnly: Story = {
  name: 'IconOnly',
  parameters: {
    docs: {
      description: {
        story:
          'Works with icon-only buttons. Useful for view-switcher or text-formatting toolbars.',
      },
    },
  },
  render: () => (
    <ButtonGroup variant="outlined">
      <IconButton icon={List} tooltip="List view" />
      <IconButton icon={LayoutGrid} tooltip="Grid view" />
    </ButtonGroup>
  ),
};

// ─── 5. Vertical orientation ─────────────────────────────────────────────────

export const Vertical: Story = {
  name: 'Vertical',
  render: () => (
    <ButtonGroup variant="outlined" orientation="vertical">
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </ButtonGroup>
  ),
};

// ─── 6. Mixed per-child overrides ────────────────────────────────────────────

export const PerChildOverride: Story = {
  name: 'PerChildOverride',
  parameters: {
    docs: {
      description: {
        story:
          'Each child can override the group-level props. Here `variant="outlined"` is the ' +
          'group default, but the delete button switches to `color="danger"` and ' +
          '`variant="filled"` independently.',
      },
    },
  },
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
