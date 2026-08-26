import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd.component';
import { Menu } from '../Menu';
import type { MenuItemType } from '../Menu';
import { Copy, Scissors, Clipboard, Undo2, Redo2 } from 'lucide-react';

const meta = {
	title: 'Elements/Kbd',
	component: Kbd,
	parameters: { layout: 'centered' },
	args: { children: '⌘K' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
	name: 'Default',
	args: { children: '⌘K', size: 'md' },
};

// ─── 2. Sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
	name: 'Sizes',
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
			<Kbd size="sm">⌘K</Kbd>
			<Kbd size="md">⌘K</Kbd>
			<Kbd size="lg">⌘K</Kbd>
		</div>
	),
};

// ─── 3. Common keys ───────────────────────────────────────────────────────────

export const CommonKeys: Story = {
	name: 'CommonKeys',
	parameters: {
		docs: {
			description: {
				story: 'A sample of common keys and modifier symbols.',
			},
		},
	},
	render: () => (
		<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: 440 }}>
			{['⌘', '⌥', '⇧', '⌃', 'Enter', 'Esc', 'Tab', '↑', '↓', '←', '→', 'Del', 'Backspace', 'Space', 'F1'].map(k => (
				<Kbd key={k}>{k}</Kbd>
			))}
		</div>
	),
};

// ─── 4. Compound shortcuts ────────────────────────────────────────────────────

export const CompoundShortcuts: Story = {
	name: 'CompoundShortcuts',
	parameters: {
		docs: {
			description: {
				story:
					'For multi-key combos, place individual `<Kbd>` elements side-by-side. ' +
					'The `+` separator is rendered as plain text between them.',
			},
		},
	},
	render: () => {
		const sep = <span style={{ color: 'var(--gray-400)', fontSize: 12 }}> + </span>;
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Kbd>⌘</Kbd>{sep}<Kbd>K</Kbd>
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Kbd>⌘</Kbd>{sep}<Kbd>⇧</Kbd>{sep}<Kbd>P</Kbd>
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Kbd>Ctrl</Kbd>{sep}<Kbd>S</Kbd>
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Kbd>Alt</Kbd>{sep}<Kbd>F4</Kbd>
				</div>
			</div>
		);
	},
};

// ─── 5. Inline in prose ───────────────────────────────────────────────────────

export const InlineProse: Story = {
	name: 'InlineProse',
	render: () => (
		<p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
			Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette,{' '}
			<Kbd>Esc</Kbd> to dismiss, or <Kbd>↑</Kbd> / <Kbd>↓</Kbd> to navigate results.
		</p>
	),
};

// ─── 6. In a Menu (with shortcut prop) ────────────────────────────────────────

export const InMenu: Story = {
	name: 'InMenu',
	parameters: {
		docs: {
			description: {
				story:
					'The `shortcut` prop on a `MenuItem` is automatically rendered as a `<Kbd>`. ' +
					'No extra work required - just pass the string.',
			},
		},
	},
	render: () => {
		const items: MenuItemType[] = [
			{ type: 'item', id: 'undo',  label: 'Undo',  icon: Undo2,     shortcut: '⌘Z',   onClick: () => {} },
			{ type: 'item', id: 'redo',  label: 'Redo',  icon: Redo2,     shortcut: '⌘⇧Z',  onClick: () => {} },
			{ type: 'separator', id: 'sep1' },
			{ type: 'item', id: 'cut',   label: 'Cut',   icon: Scissors,  shortcut: '⌘X',   onClick: () => {} },
			{ type: 'item', id: 'copy',  label: 'Copy',  icon: Copy,      shortcut: '⌘C',   onClick: () => {} },
			{ type: 'item', id: 'paste', label: 'Paste', icon: Clipboard, shortcut: '⌘V',   onClick: () => {} },
		];
		return (
			<Menu
				trigger={<button style={{ padding: '6px 12px', cursor: 'pointer' }}>Open menu ▾</button>}
				items={items}
			/>
		);
	},
};
