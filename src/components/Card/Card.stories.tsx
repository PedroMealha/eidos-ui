import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card.component';
import { StoryRow, StoryStack } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Card',
  component: Card,
  parameters: { layout: 'padded' },
  args: {
    variant: 'outlined',
    padding: 'md',
    clickable: false,
    children: 'Card content goes here.',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'elevated', 'flat'],
      description: 'Visual style of the card.',
      table: {
        type: { summary: '"outlined" | "elevated" | "flat"' },
        defaultValue: { summary: 'outlined' },
      },
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Inner padding.',
      table: { type: { summary: '"none" | "sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    clickable: {
      control: 'boolean',
      description: 'Adds hover/focus styles and `cursor: pointer`.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    as: {
      control: 'select',
      options: ['div', 'article', 'section', 'aside', 'main', 'header', 'footer', 'li'],
      description: 'HTML element to render as. Use semantic elements where appropriate.',
      table: { type: { summary: 'React.ElementType' }, defaultValue: { summary: '"div"' } },
    },
    children: {
      control: 'text',
      description: 'Card content.',
      table: { type: { summary: 'React.ReactNode' } },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// `Elevated` and `Flat` were separate one-arg stories that no .mdx referenced,
// and `Variants` already shows all three side by side, which is how you
// actually compare them.
export const Variants: Story = {
  render: () => (
    <StoryRow align="stretch">
      {(['outlined', 'elevated', 'flat'] as const).map((v) => (
        <Card key={v} variant={v} style={{ width: 200 }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            variant=&quot;{v}&quot;
          </span>
        </Card>
      ))}
    </StoryRow>
  ),
};

export const Clickable: Story = {
  args: { clickable: true },
  render: (args) => (
    <Card {...args} onClick={() => {}}>
      Click me - hover to see the interactive styles.
    </Card>
  ),
};

export const Padding: Story = {
  render: () => (
    <StoryStack>
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p} style={{ width: 360 }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            padding=&quot;{p}&quot;
          </span>
        </Card>
      ))}
    </StoryStack>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <h3 style={{ margin: '0 0 var(--spacing-sm)', fontSize: 'var(--font-size-base)' }}>
        Card title
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        Cards are surface-level containers that group related content. Use them to establish visual
        hierarchy without adding page-level sections.
      </p>
    </Card>
  ),
};
