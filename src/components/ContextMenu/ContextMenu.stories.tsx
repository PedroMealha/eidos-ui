import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Pencil,
  ExternalLink,
  RefreshCw,
  Download,
  Share2,
} from 'lucide-react';
import { ContextMenu } from './ContextMenu.component';
import type { MenuItemType } from '../Menu';

// ─── Shared items ─────────────────────────────────────────────────────────────

const EDIT_ITEMS: MenuItemType[] = [
  { type: 'item', id: 'cut', label: 'Cut', icon: Scissors, onClick: action('cut') },
  { type: 'item', id: 'copy', label: 'Copy', icon: Copy, onClick: action('copy') },
  {
    type: 'item',
    id: 'paste',
    label: 'Paste',
    icon: Clipboard,
    onClick: action('paste'),
  },
  { type: 'separator', id: 'sep1' },
  {
    type: 'item',
    id: 'rename',
    label: 'Rename',
    icon: Pencil,
    onClick: action('rename'),
  },
  {
    type: 'item',
    id: 'open',
    label: 'Open in new tab',
    icon: ExternalLink,
    onClick: action('open'),
  },
  { type: 'separator', id: 'sep2' },
  {
    type: 'item',
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: 'danger',
    onClick: action('delete'),
  },
];

const TABLE_ITEMS: MenuItemType[] = [
  { type: 'item', id: 'refresh', label: 'Refresh', icon: RefreshCw, onClick: () => {} },
  { type: 'item', id: 'export', label: 'Export selected', icon: Download, onClick: () => {} },
  { type: 'item', id: 'share', label: 'Share', icon: Share2, onClick: () => {} },
  { type: 'separator', id: 'sep1' },
  {
    type: 'item',
    id: 'delete',
    label: 'Delete selected',
    icon: Trash2,
    onClick: () => {},
    disabled: true,
  },
];

// ─── Shared target area styles ────────────────────────────────────────────────

const targetStyle: React.CSSProperties = {
  width: 400,
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-muted)',
  userSelect: 'none',
};

const meta = {
  title: 'Overlays/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'centered' },
  argTypes: {
    items: {
      control: 'object',
      description: 'Menu items shown on right-click. Supports every `MenuItemType` variant.',
      table: { type: { summary: 'MenuItemType[]' } },
    },
    disabled: {
      control: 'boolean',
      description: "Falls through to the browser's own context menu instead.",
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  // `items` and `children` are required, so they live here to satisfy the type
  // for the render-only stories below as well as seeding the Default controls.
  args: {
    items: EDIT_ITEMS,
    disabled: false,
    children: (
      <div
        style={{
          ...targetStyle,
          border: '2px dashed var(--gray-200)',
          background: 'var(--gray-50)',
        }}
      >
        Right-click here
      </div>
    ),
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 1. Default ───────────────────────────────────────────────────────────────

// Args-driven, so the Controls panel the .mdx renders actually does something
// - `disabled` in particular is worth toggling, since it hands the right-click
// back to the browser.
export const Default: Story = {};

// ─── 2. On a table / list ─────────────────────────────────────────────────────

export const OnAList: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Context menu on a data list - each row opens the same menu.',
      },
    },
  },
  render: () => {
    const rows = ['Alice Martin', 'Bob Chen', 'Carol White', 'David Kim', 'Eva Torres'];
    return (
      <div
        style={{
          width: 340,
          border: '1px solid var(--gray-200)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {rows.map((name, i) => (
          <ContextMenu key={name} items={TABLE_ITEMS}>
            <div
              style={{
                padding: '10px 16px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--gray-100)' : 'none',
                cursor: 'default',
                fontSize: 14,
                color: 'var(--gray-700)',
                background: 'var(--white)',
              }}
            >
              {name}
            </div>
          </ContextMenu>
        ))}
      </div>
    );
  },
};

// ─── 3. With nested menu ──────────────────────────────────────────────────────

export const WithNested: Story = {
  render: () => {
    const items: MenuItemType[] = [
      { type: 'item', id: 'copy', label: 'Copy', icon: Copy, onClick: () => {} },
      { type: 'item', id: 'paste', label: 'Paste', icon: Clipboard, onClick: () => {} },
      { type: 'separator', id: 'sep1' },
      {
        type: 'nested',
        id: 'share',
        label: 'Share via',
        icon: Share2,
        items: [
          { type: 'item', id: 'link', label: 'Copy link', onClick: () => {} },
          { type: 'item', id: 'email', label: 'Send by e-mail', onClick: () => {} },
          { type: 'item', id: 'export', label: 'Export as PDF', onClick: () => {} },
        ],
      },
      { type: 'separator', id: 'sep2' },
      { type: 'item', id: 'delete', label: 'Delete', icon: Trash2, onClick: () => {} },
    ];

    return (
      <ContextMenu items={items}>
        <div
          style={{
            ...targetStyle,
            border: '2px dashed var(--gray-200)',
            background: 'var(--gray-50)',
          }}
        >
          Right-click for nested menu
        </div>
      </ContextMenu>
    );
  },
};

// ─── 4. Disabled ─────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: "When `disabled` is true, the browser's native context menu is shown instead.",
      },
    },
  },
  render: () => (
    <ContextMenu items={EDIT_ITEMS} disabled>
      <div
        style={{
          ...targetStyle,
          border: '2px dashed var(--gray-200)',
          background: 'var(--gray-50)',
        }}
      >
        Right-click - native menu only (disabled)
      </div>
    </ContextMenu>
  ),
};
