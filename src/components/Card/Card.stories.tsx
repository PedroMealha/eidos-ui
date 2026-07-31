import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card.component';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
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
      table: { type: { summary: '"outlined" | "elevated" | "flat"' }, defaultValue: { summary: 'outlined' } },
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

export const Elevated: Story = {
  args: { variant: 'elevated' },
};

export const Flat: Story = {
  args: { variant: 'flat' },
};

export const Clickable: Story = {
  args: { clickable: true },
  render: (args) => (
    <Card {...args} onClick={() => alert('Card clicked')}>
      Click me — hover to see the interactive styles.
    </Card>
  ),
};

export const Padding: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 360 }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p}>
          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>padding="{p}"</span>
        </Card>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(['outlined', 'elevated', 'flat'] as const).map((v) => (
        <Card key={v} variant={v} style={{ width: 200 }}>
          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>variant="{v}"</span>
        </Card>
      ))}
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>Card title</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#71717a', lineHeight: 1.6 }}>
        Cards are surface-level containers that group related content. Use them to
        establish visual hierarchy without adding page-level sections.
      </p>
    </Card>
  ),
};
