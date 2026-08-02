import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Copy, Scissors, Clipboard, Trash2, Pencil, ExternalLink,
	RefreshCw, Download, Share2,
} from 'lucide-react';
import { ContextMenu } from './ContextMenu.component';
import type { MenuItemType } from '../Menu';

const meta = {
	title: 'Elements/ContextMenu',
	component: ContextMenu,
	parameters: { layout: 'centered' },
	args: {
		// Required — overridden by every story's render function.
		items: [],
		children: null,
	},
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Shared items ─────────────────────────────────────────────────────────────

const EDIT_ITEMS: MenuItemType[] = [
	{ type: 'item', id: 'cut',   label: 'Cut',   icon: Scissors,  onClick: () => console.log('cut') },
	{ type: 'item', id: 'copy',  label: 'Copy',  icon: Copy,      onClick: () => console.log('copy') },
	{ type: 'item', id: 'paste', label: 'Paste', icon: Clipboard, onClick: () => console.log('paste') },
	{ type: 'separator', id: 'sep1' },
	{ type: 'item', id: 'rename', label: 'Rename', icon: Pencil,      onClick: () => console.log('rename') },
	{ type: 'item', id: 'open',   label: 'Open in new tab', icon: ExternalLink, onClick: () => console.log('open') },
	{ type: 'separator', id: 'sep2' },
	{ type: 'item', id: 'delete', label: 'Delete', icon: Trash2, color: 'danger', onClick: () => console.log('delete') },
];

const TABLE_ITEMS: MenuItemType[] = [
	{ type: 'item', id: 'refresh',  label: 'Refresh',          icon: RefreshCw, onClick: () => {} },
	{ type: 'item', id: 'export',   label: 'Export selected',  icon: Download,  onClick: () => {} },
	{ type: 'item', id: 'share',    label: 'Share',            icon: Share2,    onClick: () => {} },
	{ type: 'separator', id: 'sep1' },
	{ type: 'item', id: 'delete',   label: 'Delete selected',  icon: Trash2,    onClick: () => {}, disabled: true },
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
	color: 'var(--gray-400)',
	userSelect: 'none',
};

// ─── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
	name: 'Default',
	parameters: {
		docs: {
			description: {
				story:
					'Right-click anywhere inside the dashed region to open the context menu. ' +
					'Close by clicking outside, pressing Escape, or selecting an item.',
			},
		},
	},
	render: () => (
		<ContextMenu items={EDIT_ITEMS}>
			<div style={{ ...targetStyle, border: '2px dashed var(--gray-200)', background: 'var(--gray-50)' }}>
				Right-click here
			</div>
		</ContextMenu>
	),
};

// ─── 2. On a table / list ─────────────────────────────────────────────────────

export const OnAList: Story = {
	name: 'OnAList',
	parameters: {
		docs: {
			description: {
				story: 'Context menu on a data list — each row opens the same menu.',
			},
		},
	},
	render: () => {
		const rows = ['Alice Martin', 'Bob Chen', 'Carol White', 'David Kim', 'Eva Torres'];
		return (
			<div style={{ width: 340, border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
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
	name: 'WithNested',
	render: () => {
		const items: MenuItemType[] = [
			{ type: 'item',   id: 'copy',  label: 'Copy',  icon: Copy,  onClick: () => {} },
			{ type: 'item',   id: 'paste', label: 'Paste', icon: Clipboard, onClick: () => {} },
			{ type: 'separator', id: 'sep1' },
			{
				type: 'nested', id: 'share', label: 'Share via', icon: Share2,
				items: [
					{ type: 'item', id: 'link',  label: 'Copy link',   onClick: () => {} },
					{ type: 'item', id: 'email', label: 'Send by e-mail', onClick: () => {} },
					{ type: 'item', id: 'export', label: 'Export as PDF', onClick: () => {} },
				],
			},
			{ type: 'separator', id: 'sep2' },
			{ type: 'item', id: 'delete', label: 'Delete', icon: Trash2, onClick: () => {} },
		];

		return (
			<ContextMenu items={items}>
				<div style={{ ...targetStyle, border: '2px dashed var(--gray-200)', background: 'var(--gray-50)' }}>
					Right-click for nested menu
				</div>
			</ContextMenu>
		);
	},
};

// ─── 4. Disabled ─────────────────────────────────────────────────────────────

export const Disabled: Story = {
	name: 'Disabled',
	parameters: {
		docs: {
			description: {
				story:
					'When `disabled` is true, the browser\'s native context menu is shown instead.',
			},
		},
	},
	render: () => (
		<ContextMenu items={EDIT_ITEMS} disabled>
			<div style={{ ...targetStyle, border: '2px dashed var(--gray-200)', background: 'var(--gray-50)' }}>
				Right-click — native menu only (disabled)
			</div>
		</ContextMenu>
	),
};
