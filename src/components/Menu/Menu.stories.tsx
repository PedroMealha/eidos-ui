import type { Meta, StoryObj } from '@storybook/react';
import { User, Settings, LogOut, FileText, Copy, Trash2, Share2, Mail } from 'lucide-react';
import { Menu } from './Menu.component';
import { Button } from '../Button';
import type { MenuItemType } from './Menu.types';

const meta = {
	title: 'Components/Menu',
	component: Menu,
	parameters: { layout: 'centered' },
	tags: ['autodocs'],
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
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '3rem' }}>
			<div>
				<h3>Basic Menu</h3>
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
				<h3>With String-based Icons (Lucide)</h3>
				<Menu
					trigger={<Button variant="outlined">Actions</Button>}
					items={[
						{ type: 'item', id: '1', label: 'Copy', icon: 'copy', onClick: () => alert('Copy') },
						{ type: 'item', id: '2', label: 'Share', icon: 'share-2', onClick: () => alert('Share') },
						{ type: 'item', id: '3', label: 'Delete', icon: 'trash-2', onClick: () => alert('Delete') },
					]}
				/>
			</div>

			<div>
				<h3>With Keyboard Shortcuts</h3>
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
				<h3>Nested Menu</h3>
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
						{ type: 'item', id: '3', label: 'Delete', icon: Trash2, onClick: () => alert('Delete') },
					]}
				/>
			</div>

			<div>
				<h3>With Disabled Items</h3>
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
				<h3>With Component Item</h3>
				<Menu
					trigger={<Button variant="soft" color="primary">Custom Menu</Button>}
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
				<h3>With Custom Sizing</h3>
				<div style={{ display: 'flex', gap: '1rem' }}>
					<Menu
						trigger={<Button variant="outlined" size="small">Min Width</Button>}
						items={[
							{ type: 'item', id: '1', label: 'Short', onClick: () => alert('Short') },
							{ type: 'item', id: '2', label: 'Item', onClick: () => alert('Item') },
						]}
						minWidth={200}
					/>
					<Menu
						trigger={<Button variant="outlined" size="small">Max Height</Button>}
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
				<h3>With Tooltip</h3>
				<Menu
					trigger={<Button variant="filled">Hover Me</Button>}
					items={basicMenuItems}
					tooltip="Open menu to see options"
				/>
			</div>
		</div>
	),
};

