import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowBigDownDash,
  ArrowRight,
  Download,
  Plus,
  Replace,
  Rocket,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button, IconButton } from './Button.component';
import { registerIcons } from '../../utils';
import { expect } from 'storybook/test';
import { StoryRow } from '../../story-layout.docs';
import { iconArgType } from '../../story-icons.docs';

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
    preIcon: iconArgType(
      'Icon before the label: a component (`Download`), or a registered string name.',
    ),
    posIcon: iconArgType(
      'Icon after the label: a component (`ArrowRight`), or a registered string name.',
    ),
    icon: iconArgType(
      'Icon for an icon-only button. Mutually exclusive with children, preIcon and posIcon.',
    ),
    href: {
      control: 'text',
      description:
        'Renders the button as a link to this URL, through `LinkProvider`’s component when one is set. Disabled or loading removes the `href`.',
      table: {
        type: { summary: 'string' },
        category: 'Link',
        defaultValue: { summary: 'undefined' },
      },
    },
    target: {
      control: 'text',
      description: 'Link target. `_blank` defaults `rel` to `noopener noreferrer`.',
      table: { type: { summary: 'string' }, category: 'Link' },
    },
    rel: {
      control: 'text',
      description: 'Link relationship. An explicit value always wins over the `_blank` default.',
      table: { type: { summary: 'string' }, category: 'Link' },
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
    posIcon: 'MousePointerClick',
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
    icon: 'ArrowBigDownDash',
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

/**
 * Pass `href` and the button renders as a link, styled identically. A
 * disabled link drops its `href` entirely, since that is the only way to make
 * an anchor inert.
 */
export const AsLink: Story = {
  render: () => (
    <StoryRow>
      <Button href="#pricing">See pricing</Button>
      <Button href="https://github.com" target="_blank" variant="outlined" posIcon={ArrowRight}>
        GitHub
      </Button>
      <Button href="#disabled" disabled>
        Unavailable
      </Button>
    </StoryRow>
  ),
  play: async ({ canvas, step }) => {
    await step('an enabled link is a real anchor', async () => {
      const link = canvas.getByRole('link', { name: 'See pricing' });
      await expect(link.tagName).toBe('A');
      await expect(link).toHaveAttribute('href', '#pricing');
    });

    await step('target="_blank" gets a safe rel by default', async () => {
      await expect(canvas.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
        'rel',
        'noopener noreferrer',
      );
    });

    await step('a disabled link has no href and says why', async () => {
      const link = canvas.getByRole('link', { name: 'Unavailable' });
      await expect(link).not.toHaveAttribute('href');
      await expect(link).toHaveAttribute('aria-disabled', 'true');
      await expect(link).toHaveAttribute('tabindex', '-1');
    });
  },
};

// Registered at module scope, the way an app registers once at its root. The
// registry is global, so this also makes the names available to every other
// story - harmless, since registering only adds.
registerIcons({ Rocket, Sparkles });

/**
 * String icon names resolve through `registerIcons`. Register the icons your
 * app uses once, at the root, and any icon prop accepts their names.
 */
export const RegisteredIconNames: Story = {
  render: () => (
    <StoryRow>
      <Button preIcon="rocket">Launch</Button>
      <Button preIcon="Sparkles" variant="outlined">
        Generate
      </Button>
    </StoryRow>
  ),
  play: async ({ canvasElement }) => {
    // Both resolved to SVG icons, not to the icon-font `<i>` fallback.
    await expect(canvasElement.querySelectorAll('svg.eidos-button--pre-icon')).toHaveLength(2);
    await expect(canvasElement.querySelector('i.eidos-button--pre-icon')).toBeNull();
  },
};

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
