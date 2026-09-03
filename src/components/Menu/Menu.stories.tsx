import type { Meta, StoryObj } from '@storybook/react-vite';
import { User, Settings, LogOut, FileText, Copy, Trash2, Share2, Mail } from 'lucide-react';
import { Menu } from './Menu.component';
import { Button } from '../Button';
import type { MenuItemType } from './Menu.types';

const meta = {
	title: 'Overlays/Menu',
	component: Menu,
	parameters: { layout: 'centered' },
	argTypes: {
		trigger: {
			control: false,
			description: 'The element that triggers the menu (e.g., button, icon)',
			table: { type: { summary: 'React.ReactNode' } },
		},
		items: {
			control: false,
			description: 'Array of menu items (item, separator, component, nested)',
			table: { type: { summary: 'MenuItemType[]' } },
		},
		minWidth: {
			control: 'text',
			description: 'Minimum width of menu (number in px or string with units)',
			table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
		},
		maxWidth: {
			control: 'text',
			description: 'Maximum width of menu',
			table: { type: { summary: 'number | string | "auto"' }, defaultValue: { summary: 'undefined' } },
		},
		minHeight: {
			control: 'text',
			description: 'Minimum height of menu',
			table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
		},
		maxHeight: {
			control: 'text',
			description: 'Maximum height of menu',
			table: { type: { summary: 'number | string | "auto"' }, defaultValue: { summary: 'undefined' } },
		},
		autoWidth: {
			control: 'boolean',
			description: 'Match menu width to trigger width',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
		closeOnItemClick: {
			control: 'boolean',
			description: 'Close menu when an item is clicked',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
		tooltip: {
			control: 'text',
			description: 'Tooltip message for the menu trigger',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		triggerRef: { table: { disable: true } },
	},
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicMenuItems: MenuItemType[] = [
	{ type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => alert('Profile') },
	{ type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: () => alert('Settings') },
	{ type: 'separator', id: 'sep1' },
	{ type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: () => alert('Logout') },
];

export const Default: Story = {
	args: {
		trigger: <Button variant="outlined">Open Menu</Button>,
		items: basicMenuItems,
	},
};

export const Examples = {
	// Storybook's own "Show code" source generation walks the entire rendered
	// element tree with a version of `react-element-to-jsx-string` that reads
	// the (React 19-removed) `element.ref` property - see
	// https://github.com/storybookjs/storybook/issues/31480. That's just a
	// console warning on a small tree, but this story renders 7 nested
	// Menu/Dropdown/Button trees at once (icons, nested submenus, a custom
	// component item); walking and warning on every node in a tree that deep
	// is what freezes the tab, not the warning itself. `sourceState: 'none'`
	// alone only hides the panel's UI - Storybook still computes the source
	// eagerly during the initial render regardless, so the freeze happened
	// before you could even see the hidden panel. Providing an explicit
	// static `code` string instead bypasses dynamic tree serialization
	// entirely: Storybook just displays this text, with no need to walk the
	// rendered output at all.
	parameters: {
		docs: {
			source: {
				type: 'code',
				code: `<Menu
  trigger={<Button variant="filled">User Menu</Button>}
  items={[
    { type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => {} },
    { type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: () => {} },
    { type: 'separator', id: 'sep1' },
    { type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: () => {} },
  ]}
/>

<Menu
  trigger={<Button variant="filled" color="secondary">File Menu</Button>}
  items={[
    { type: 'item', id: '1', label: 'New File', icon: FileText, shortcut: '⌘N', onClick: () => {} },
    { type: 'item', id: '2', label: 'Copy', icon: Copy, shortcut: '⌘C', onClick: () => {} },
    { type: 'item', id: '3', label: 'Delete', icon: Trash2, shortcut: '⌫', onClick: () => {} },
  ]}
/>

<Menu
  trigger={<Button variant="outlined" color="success">More Options</Button>}
  items={[
    { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: () => {} },
    { type: 'item', id: '2', label: 'Share', icon: Share2, onClick: () => {} },
    { type: 'separator', id: 'sep1' },
    {
      type: 'nested',
      id: 'nested1',
      label: 'More Actions',
      icon: Settings,
      items: [
        { type: 'item', id: 'n1', label: 'Archive', onClick: () => {} },
        { type: 'item', id: 'n2', label: 'Export', onClick: () => {} },
        { type: 'item', id: 'n3', label: 'Print', onClick: () => {} },
      ],
    },
    { type: 'separator', id: 'sep2' },
    { type: 'item', id: '3', label: 'Delete', icon: Trash2, color: 'danger', onClick: () => {} },
  ]}
/>

<Menu
  trigger={<Button variant="text">Edit</Button>}
  items={[
    { type: 'item', id: '1', label: 'Cut', icon: 'scissors', shortcut: '⌘X', onClick: () => {} },
    { type: 'item', id: '2', label: 'Copy', icon: 'copy', shortcut: '⌘C', onClick: () => {}, disabled: true },
    { type: 'item', id: '3', label: 'Paste', icon: 'clipboard', shortcut: '⌘V', onClick: () => {}, disabled: true },
  ]}
/>

<Menu
  trigger={<Button variant="outlined" color="primary">Custom Menu</Button>}
  items={[
    { type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => {} },
    { type: 'separator', id: 'sep1' },
    {
      type: 'component',
      id: 'custom',
      component: <div>Any React content can go here</div>,
    },
    { type: 'separator', id: 'sep2' },
    { type: 'item', id: '2', label: 'Logout', icon: LogOut, onClick: () => {} },
  ]}
/>

<Menu
  trigger={<Button variant="outlined" size="sm">Min Width</Button>}
  items={[
    { type: 'item', id: '1', label: 'Short', onClick: () => {} },
    { type: 'item', id: '2', label: 'Item', onClick: () => {} },
  ]}
  minWidth={200}
/>

<Menu
  trigger={<Button variant="filled">Hover Me</Button>}
  items={basicMenuItems}
  tooltip="Open menu to see options"
/>`,
			},
		},
	},
	render: () => {
		const label: React.CSSProperties = {
			marginBottom: '0.625rem',
			fontSize: '0.7rem',
			fontWeight: 600,
			textTransform: 'uppercase',
			letterSpacing: '0.07em',
			color: '#94a3b8',
		};

		return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem' }}>
			<div>
				<p style={label}>Basic Menu</p>
				<Menu
					trigger={<Button variant="filled">User Menu</Button>}
					items={[
						{ type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => alert('Profile') },
						{ type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: () => alert('Settings') },
						{ type: 'separator', id: 'sep1' },
						{ type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: () => alert('Logout') },
					]}
				/>
			</div>

			<div>
				<p style={label}>Keyboard Shortcuts</p>
				<Menu
					trigger={<Button variant="filled" color="secondary">File Menu</Button>}
					items={[
						{
							type: 'item',
							id: '1',
							label: 'New File',
							icon: FileText,
							shortcut: '⌘N',
							onClick: () => alert('New File'),
						},
						{
							type: 'item',
							id: '2',
							label: 'Copy',
							icon: Copy,
							shortcut: '⌘C',
							onClick: () => alert('Copy'),
						},
						{
							type: 'item',
							id: '3',
							label: 'Delete',
							icon: Trash2,
							shortcut: '⌫',
							onClick: () => alert('Delete'),
						},
					]}
				/>
			</div>

			<div>
				<p style={label}>Nested Menu</p>
				<Menu
					trigger={<Button variant="outlined" color="success">More Options</Button>}
					items={[
						{ type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: () => alert('Copy') },
						{ type: 'item', id: '2', label: 'Share', icon: Share2, onClick: () => alert('Share') },
						{ type: 'separator', id: 'sep1' },
						{
							type: 'nested',
							id: 'nested1',
							label: 'More Actions',
							icon: Settings,
							items: [
								{ type: 'item', id: 'n1', label: 'Archive', onClick: () => alert('Archive') },
								{ type: 'item', id: 'n2', label: 'Export', onClick: () => alert('Export') },
								{ type: 'item', id: 'n3', label: 'Print', onClick: () => alert('Print') },
							],
						},
						{ type: 'separator', id: 'sep2' },
						{ type: 'item', id: '3', label: 'Delete', icon: Trash2, color: 'danger', onClick: () => alert('Delete') },
					]}
				/>
			</div>

			<div>
				<p style={label}>With Disabled Items</p>
				<Menu
					trigger={<Button variant="text">Edit</Button>}
					items={[
						{ type: 'item', id: '1', label: 'Cut', icon: 'scissors', shortcut: '⌘X', onClick: () => alert('Cut') },
						{
							type: 'item',
							id: '2',
							label: 'Copy',
							icon: 'copy',
							shortcut: '⌘C',
							onClick: () => alert('Copy'),
							disabled: true,
						},
						{
							type: 'item',
							id: '3',
							label: 'Paste',
							icon: 'clipboard',
							shortcut: '⌘V',
							onClick: () => alert('Paste'),
							disabled: true,
						},
					]}
				/>
			</div>

			<div>
				<p style={label}>Custom Component Item</p>
				<Menu
					trigger={<Button variant="outlined" color="primary">Custom Menu</Button>}
					items={[
						{ type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => alert('Profile') },
						{ type: 'separator', id: 'sep1' },
						{
							type: 'component',
							id: 'custom',
							component: (
								<div style={{ padding: '0.5rem', background: 'var(--gray-50)', borderRadius: '4px' }}>
									<strong>Custom Content</strong>
									<p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
										You can add any React component here
									</p>
								</div>
							),
						},
						{ type: 'separator', id: 'sep2' },
						{ type: 'item', id: '2', label: 'Logout', icon: LogOut, onClick: () => alert('Logout') },
					]}
				/>
			</div>

			<div>
				<p style={label}>Sizing</p>
				<div style={{ display: 'flex', gap: '1rem' }}>
					<Menu
						trigger={<Button variant="outlined" size="sm">Min Width</Button>}
						items={[
							{ type: 'item', id: '1', label: 'Short', onClick: () => alert('Short') },
							{ type: 'item', id: '2', label: 'Item', onClick: () => alert('Item') },
						]}
						minWidth={200}
					/>
					<Menu
						trigger={<Button variant="outlined" size="sm">Max Height</Button>}
						items={[
							{ type: 'item', id: '1', label: 'Item 1', icon: Mail, onClick: () => {} },
							{ type: 'item', id: '2', label: 'Item 2', icon: Mail, onClick: () => {} },
							{ type: 'item', id: '3', label: 'Item 3', icon: Mail, onClick: () => {} },
							{ type: 'item', id: '4', label: 'Item 4', icon: Mail, onClick: () => {} },
							{ type: 'item', id: '5', label: 'Item 5', icon: Mail, onClick: () => {} },
							{ type: 'item', id: '6', label: 'Item 6', icon: Mail, onClick: () => {} },
						]}
						maxHeight={150}
					/>
				</div>
			</div>

			<div>
				<p style={label}>With Tooltip</p>
				<Menu
					trigger={<Button variant="filled">Hover Me</Button>}
					items={basicMenuItems}
					tooltip="Open menu to see options"
				/>
			</div>
		</div>
		);
	},
};

