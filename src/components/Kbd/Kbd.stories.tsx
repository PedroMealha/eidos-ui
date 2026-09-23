import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd.component';
import { Menu } from '../Menu';
import type { MenuItemType } from '../Menu';
import { Copy, Scissors, Clipboard, Undo2, Redo2 } from 'lucide-react';
import { Button } from '../Button';
import { StoryRow, StoryStack } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Kbd',
  component: Kbd,
  parameters: { layout: 'centered' },
  // `children` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding the Playground controls.
  args: { children: '⌘K' },
  argTypes: {
    children: {
      control: 'text',
      description: 'The key name or symbol to display.',
      table: { type: { summary: 'React.ReactNode' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Key cap size. Match it to the surrounding text.',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: { children: '⌘K', size: 'md' },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <StoryRow>
      <Kbd size="sm">⌘K</Kbd>
      <Kbd size="md">⌘K</Kbd>
      <Kbd size="lg">⌘K</Kbd>
    </StoryRow>
  ),
};

// ─── Common keys ──────────────────────────────────────────────────────────────

export const CommonKeys: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', maxWidth: 440 }}>
      {[
        '⌘',
        '⌥',
        '⇧',
        '⌃',
        'Enter',
        'Esc',
        'Tab',
        '↑',
        '↓',
        '←',
        '→',
        'Del',
        'Backspace',
        'Space',
        'F1',
      ].map((k) => (
        <Kbd key={k}>{k}</Kbd>
      ))}
    </div>
  ),
};

// ─── Compound shortcuts ───────────────────────────────────────────────────────

export const CompoundShortcuts: Story = {
  render: () => {
    const sep = (
      <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}> + </span>
    );
    return (
      <StoryStack gap="sm">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Kbd>⌘</Kbd>
          {sep}
          <Kbd>K</Kbd>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Kbd>⌘</Kbd>
          {sep}
          <Kbd>⇧</Kbd>
          {sep}
          <Kbd>P</Kbd>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Kbd>Ctrl</Kbd>
          {sep}
          <Kbd>S</Kbd>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Kbd>Alt</Kbd>
          {sep}
          <Kbd>F4</Kbd>
        </div>
      </StoryStack>
    );
  },
};

// ─── Inline in prose ──────────────────────────────────────────────────────────

export const InlineProse: Story = {
  render: () => (
    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', lineHeight: 1.8 }}>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, <Kbd>Esc</Kbd> to dismiss, or{' '}
      <Kbd>↑</Kbd> / <Kbd>↓</Kbd> to navigate results.
    </p>
  ),
};

// ─── In a Menu (via the `shortcut` prop) ──────────────────────────────────────

export const InMenu: Story = {
  render: () => {
    const items: MenuItemType[] = [
      { type: 'item', id: 'undo', label: 'Undo', icon: Undo2, shortcut: '⌘Z', onClick: () => {} },
      { type: 'item', id: 'redo', label: 'Redo', icon: Redo2, shortcut: '⌘⇧Z', onClick: () => {} },
      { type: 'separator', id: 'sep1' },
      { type: 'item', id: 'cut', label: 'Cut', icon: Scissors, shortcut: '⌘X', onClick: () => {} },
      { type: 'item', id: 'copy', label: 'Copy', icon: Copy, shortcut: '⌘C', onClick: () => {} },
      {
        type: 'item',
        id: 'paste',
        label: 'Paste',
        icon: Clipboard,
        shortcut: '⌘V',
        onClick: () => {},
      },
    ];
    return <Menu trigger={<Button variant="outlined">Open menu</Button>} items={items} />;
  },
};
