import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { expect } from 'storybook/test';
import { Tag, Star, Check } from 'lucide-react';
import { Chip } from './Chip.component';
import { StoryRow } from '../../story-layout.docs';
import { iconArgType } from '../../story-icons.docs';

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
    preIcon: iconArgType(
      'Icon before the label: a component (`Tag`), or a registered string name.',
    ),
    posIcon: iconArgType(
      'Icon after the label: a component (`Check`), or a registered string name.',
    ),
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
    href: {
      control: 'text',
      description:
        'Makes the chip a link to this URL, through `LinkProvider`’s component when one is set.',
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

/**
 * A chip with `href` is a link, styled as a clickable chip. Combined with
 * `onRemove`, the link and the remove button stay separate sibling controls.
 */
export const AsLink: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip href="#react" preIcon={Tag}>
        react
      </Chip>
      <Chip href="#typescript" variant="outlined" onRemove={action('Chip removed')}>
        typescript
      </Chip>
    </StoryRow>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'react' });
    await expect(link).toHaveAttribute('href', '#react');
    await expect(link).toHaveClass('eidos-chip--clickable');

    // Removable: the link moves inside, so the two controls are siblings
    // rather than a button nested in a link.
    const removable = canvas.getByRole('link', { name: 'typescript' });
    await expect(removable).toHaveClass('eidos-chip--action');
    await expect(removable.querySelector('button')).toBeNull();
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

/**
 * Only a chip with `onClick` is a button and shows hover feedback. The
 * remove-only chip is a plain container whose close button is the sole
 * control.
 */
export const Interactive: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Chip onClick={action('Chip clicked')}>Clickable</Chip>
      <Chip onRemove={action('Chip removed')}>Removable</Chip>
      <Chip onClick={action('Chip clicked')} onRemove={action('Chip removed')}>
        Both
      </Chip>
    </StoryRow>
  ),
  play: async ({ canvas }) => {
    const removable = canvas.getByText('Removable').closest('.eidos-chip');
    expect(removable?.tagName).toBe('DIV');
    expect(removable).not.toHaveClass('eidos-chip--clickable');

    expect(canvas.getByRole('button', { name: 'Clickable' })).toHaveClass('eidos-chip--clickable');
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * The label is `line-height: 1`, so descenders (g, j, p, q, y) extend below
 * its box. It used to truncate with `overflow: hidden`, which clips both axes
 * and cut the tails off every descender - measured as a 12.25px box around
 * 14px of glyph. Only the inline axis should clip.
 */
export const DescendersNotClipped: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <StoryRow gap="sm">
      <Chip>Typography gjpqy</Chip>
      <div style={{ width: 120 }}>
        <Chip>A very long label that has to be truncated with an ellipsis</Chip>
      </div>
    </StoryRow>
  ),
  play: async ({ canvas }) => {
    const copy = canvas.getByText('Typography gjpqy');
    await expect(getComputedStyle(copy).overflowY).toBe('visible');

    // Horizontal truncation must survive the change: the long label stays
    // inside its 120px column instead of overflowing it.
    const long = canvas.getByText(/A very long label/);
    const column = long.closest('.eidos-chip')!.parentElement!;
    await expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
    await expect(long.closest('.eidos-chip')!.getBoundingClientRect().width).toBeLessThanOrEqual(
      column.getBoundingClientRect().width,
    );
  },
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
