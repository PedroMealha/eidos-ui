import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox, SearchX, FolderOpen, AlertCircle } from 'lucide-react';
import { EmptyState } from './EmptyState.component';
import { Button } from '../Button';

const meta = {
	title: 'Elements/EmptyState',
	component: EmptyState,
	parameters: { layout: 'centered' },
	argTypes: {
		title: {
			control: 'text',
			description: 'Main heading.',
			table: { type: { summary: 'string' } },
		},
		description: {
			control: 'text',
			description: 'Supporting text below the title.',
			table: { type: { summary: 'string' } },
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Controls padding, icon size, and text size.',
			table: {
				type: { summary: '"sm" | "md" | "lg"' },
				defaultValue: { summary: 'md' },
			},
		},
		icon: { table: { disable: true } },
		action: { table: { disable: true } },
		className: { table: { disable: true } },
	},
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
	args: {
		icon: <Inbox />,
		title: 'Your inbox is empty',
		description: "You're all caught up! New messages will appear here.",
		action: <Button color="primary">Compose message</Button>,
	},
};

// ============================================================================
// NO DATA (search result)
// ============================================================================

export const NoData: Story = {
	args: {
		icon: <SearchX />,
		title: 'No results found',
		description: 'Try adjusting your filters or search terms.',
		action: <Button variant="outlined" color="primary">Clear filters</Button>,
	},
};

// ============================================================================
// NO CONTENT (first-time / onboarding)
// ============================================================================

export const NoContent: Story = {
	args: {
		icon: <FolderOpen />,
		title: 'No items yet',
		description: 'Create your first item to get started.',
		action: <Button color="primary">Create item</Button>,
	},
};

// ============================================================================
// ERROR STATE
// ============================================================================

export const Error: Story = {
	args: {
		icon: <AlertCircle />,
		title: 'Something went wrong',
		description: 'An unexpected error occurred while loading your data. Please try again.',
		action: <Button color="danger" variant="outlined">Retry</Button>,
	},
};

// ============================================================================
// WITHOUT ICON
// ============================================================================

export const WithoutIcon: Story = {
	args: {
		title: 'Nothing to show',
		description: 'There are no items matching your current criteria.',
	},
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
	render: () => {
		const wrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center', width: '100%' };
		const label: React.CSSProperties = { margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', textAlign: 'center' };
		return (
			<div style={wrapper}>
				<div style={{ width: '100%' }}>
					<p style={label}>Small</p>
					<EmptyState
						size="sm"
						icon={<Inbox />}
						title="No messages"
						description="Your inbox is empty."
						action={<Button size="sm" color="primary">Compose</Button>}
					/>
				</div>
				<div style={{ width: '100%' }}>
					<p style={label}>Medium</p>
					<EmptyState
						size="md"
						icon={<FolderOpen />}
						title="No items yet"
						description="Create your first item to get started."
						action={<Button color="primary">Create item</Button>}
					/>
				</div>
				<div style={{ width: '100%' }}>
					<p style={label}>Large</p>
					<EmptyState
						size="lg"
						icon={<SearchX />}
						title="No results found"
						description="Try adjusting your filters or broadening your search to find what you're looking for."
						action={<Button color="primary">Clear filters</Button>}
					/>
				</div>
			</div>
		);
	},
};
