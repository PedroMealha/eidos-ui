import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload } from './FileUpload.component';

const meta = {
	title: 'Forms/FileUpload',
	component: FileUpload,
	parameters: { layout: 'padded' },
	tags: ['autodocs'],
	argTypes: {
		accept: {
			control: 'text',
			description: "Accepted file types (e.g. 'image/*', '.pdf,.docx').",
			table: { type: { summary: 'string' } },
		},
		multiple: {
			control: 'boolean',
			description: 'Allow selecting multiple files.',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		maxSize: {
			control: 'number',
			description: 'Maximum file size in bytes.',
			table: { type: { summary: 'number' } },
		},
		maxFiles: {
			control: 'number',
			description: 'Maximum number of files (only relevant when multiple=true).',
			table: { type: { summary: 'number' } },
		},
		hint: {
			control: 'text',
			description: 'Custom hint text displayed inside the drop zone.',
			table: { type: { summary: 'string' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Disable all interaction.',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		className: { table: { disable: true } },
		onFilesAccepted: { table: { disable: true } },
		onFilesRejected: { table: { disable: true } },
	},
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT — basic drop zone, shows accepted file count via render state
// ============================================================================

export const Default: Story = {
	render: () => {
		const [accepted, setAccepted] = useState<File[]>([]);
		return (
			<div style={{ width: 480 }}>
				<FileUpload onFilesAccepted={setAccepted} />
				{accepted.length > 0 && (
					<p
						style={{
							marginTop: '0.75rem',
							fontSize: '0.75rem',
							color: '#64748b',
						}}
					>
						{accepted.length} file{accepted.length > 1 ? 's' : ''} accepted
					</p>
				)}
			</div>
		);
	},
};

// ============================================================================
// MULTIPLE — multiple files, capped at 5
// ============================================================================

export const Multiple: Story = {
	render: () => (
		<div style={{ width: 480 }}>
			<FileUpload
				multiple
				maxFiles={5}
				hint="Select up to 5 files"
			/>
		</div>
	),
};

// ============================================================================
// WITH MAX SIZE — reject files above 5 MB
// ============================================================================

export const WithMaxSize: Story = {
	render: () => (
		<div style={{ width: 480 }}>
			<FileUpload
				maxSize={5 * 1024 * 1024}
				hint="Maximum file size: 5 MB"
				onFilesRejected={(files, reason) =>
					console.warn('Rejected', reason, files.map((f) => f.name))
				}
			/>
		</div>
	),
};

// ============================================================================
// IMAGES ONLY
// ============================================================================

export const ImagesOnly: Story = {
	args: {
		accept: 'image/*',
		hint: 'PNG, JPG, GIF, WebP accepted',
	},
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
	args: {
		disabled: true,
		hint: 'File upload is currently unavailable',
	},
};

// ============================================================================
// WITH CALLBACKS — logs accepted / rejected files to the console
// ============================================================================

export const WithCallbacks: Story = {
	render: () => (
		<div style={{ width: 480 }}>
			<FileUpload
				multiple
				maxSize={10 * 1024 * 1024}
				onFilesAccepted={(files) =>
					console.log(
						'✅ Accepted:',
						files.map((f) => `${f.name} (${f.size} B)`)
					)
				}
				onFilesRejected={(files, reason) =>
					console.warn(
						`❌ Rejected (${reason}):`,
						files.map((f) => f.name)
					)
				}
			/>
		</div>
	),
};
