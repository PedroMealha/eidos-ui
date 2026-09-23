import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, Trash2, ArrowBigDownDash, ArrowRight, Replace } from 'lucide-react';
import { Button, IconButton } from './Button.component';
import { expect } from 'storybook/test';
import { StoryRow } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    // Default values to show all props in docs
    children: undefined,
    icon: undefined,
    preIcon: undefined,
    posIcon: undefined,
  },
  argTypes: {
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
      description: 'Button size',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loadingText: {
      control: 'text',
      description: 'Loading text',
      table: {
        type: { summary: 'string' },
      },
    },
    tooltip: {
      control: 'text',
      description: 'Optional tooltip text',
      table: {
        type: { summary: 'string' },
      },
    },
    children: {
      control: 'text',
      description: 'Button text content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    preIcon: {
      control: 'text',
      description:
        'Icon to display before text. Pass Lucide component (Download) or string name ("download").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    posIcon: {
      control: 'text',
      description:
        'Icon to display after text. Pass Lucide component (ChevronRight) or string name ("mouse-pointer-click").',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    icon: {
      control: 'text',
      description:
        'Icon for icon-only button. Pass Lucide component (Plus) or string name ("plus"). Mutually exclusive with children/preIcon/posIcon.',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - Main interactive example with all controls
// ============================================================================

export const Playground: Story = {
  args: {
    variant: 'filled',
    color: 'primary',
    size: 'md',
    children: 'Click me',
    disabled: false,
    loading: false,
    tooltip: '',
    posIcon: 'mouse-pointer-click',
  },
  argTypes: {
    icon: {
      table: { disable: true },
    },
  },
};

// ============================================================================
// ICON BUTTON - Interactive icon-only example
// ============================================================================

export const IconOnly: Story = {
  args: {
    icon: 'arrow-big-down-dash',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    tooltip: 'Add new item',
  },
  argTypes: {
    children: {
      table: { disable: true },
    },
    preIcon: {
      table: { disable: true },
    },
    posIcon: {
      table: { disable: true },
    },
  },
};

// ============================================================================
// FOCUSED STORIES - one axis each, in the order the .mdx presents them
// ============================================================================

export const Variants: Story = {
  render: () => (
    <StoryRow>
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </StoryRow>
  ),
};

export const Colors: Story = {
  render: () => (
    <StoryRow>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="danger">Danger</Button>
      <Button color="warning">Warning</Button>
      <Button color="info">Info</Button>
    </StoryRow>
  ),
};

export const Sizes: Story = {
  render: () => (
    <StoryRow>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </StoryRow>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StoryRow>
      <Button preIcon={Download}>Download</Button>
      <Button posIcon={ArrowRight}>Next</Button>
      <Button icon={Plus} tooltip="Add item" />
    </StoryRow>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <StoryRow>
      <IconButton icon={Trash2} color="danger" variant="outlined" size="sm" tooltip="Delete" />
      <IconButton icon={ArrowBigDownDash} tooltip="Icon-only button" />
      <IconButton icon={Replace} tooltip="Icon-only button" size="lg" />
    </StoryRow>
  ),
};

export const States: Story = {
  render: () => (
    <StoryRow>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
      <Button loading loadingText="Saving...">
        Save
      </Button>
      <Button tooltip="Helpful hint">With tooltip</Button>
    </StoryRow>
  ),
};

// ============================================================================
// ACCESSIBLE NAME - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * axe only checks that an icon-only button has *a* name. This pins *which*
 * name, which is the part that was wrong: `tooltip` used to describe the
 * button visually while contributing nothing to its accessible name, so the
 * pattern in `IconButton`'s own JSDoc shipped a control announced as just
 * "button".
 */
export const AccessibleName: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <StoryRow>
      <IconButton icon={Plus} tooltip="Add item" />
      <IconButton icon={Trash2} tooltip="Move to bin" aria-label="Delete permanently" />
    </StoryRow>
  ),
  play: async ({ canvas, step }) => {
    await step('tooltip names an icon-only button', async () => {
      await expect(canvas.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    });

    await step('an explicit aria-label wins over the tooltip', async () => {
      // The caller may want a longer or more precise name than the visible
      // tooltip, so the explicit one must not be overwritten.
      await expect(canvas.getByRole('button', { name: 'Delete permanently' })).toBeInTheDocument();
      await expect(canvas.queryByRole('button', { name: 'Move to bin' })).toBeNull();
    });
  },
};
