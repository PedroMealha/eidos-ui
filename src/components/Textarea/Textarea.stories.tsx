import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpCircle } from 'lucide-react';
import { Textarea } from './Textarea.component';

const meta = {
	title: 'Components/Textarea',
	component: Textarea,
	parameters: { layout: 'padded' },
	tags: ['autodocs'],
	args: {
		variant: 'filled',
		color: 'primary',
		size: 'medium',
		disabled: false,
		loading: false,
		fullWidth: false,
		rows: 4,
		resize: 'vertical',
		showCount: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['filled', 'outlined', 'text'],
			description: 'Visual style variant.',
			table: {
				type: { summary: '"filled" | "outlined" | "text"' },
				defaultValue: { summary: 'filled' },
			},
		},
		color: {
			control: 'select',
			options: ['primary', 'secondary', 'success', 'danger'],
			description: 'Color theme applied to borders and focus ring.',
			table: {
				type: { summary: '"primary" | "secondary" | "success" | "danger"' },
				defaultValue: { summary: 'primary' },
			},
		},
		size: {
			control: 'select',
			options: ['small', 'medium', 'large'],
			description: 'Font size of the textarea content.',
			table: {
				type: { summary: '"small" | "medium" | "large"' },
				defaultValue: { summary: 'medium' },
			},
		},
		disabled: {
			control: 'boolean',
			description: 'Prevents user interaction.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		loading: {
			control: 'boolean',
			description: 'Dashed border loading state; disables interaction.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		label: {
			control: 'text',
			description: 'Label text rendered above the textarea.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'undefined' },
			},
		},
		error: {
			control: 'text',
			description: 'Error message shown below the textarea.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'undefined' },
			},
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'undefined' },
			},
		},
		rows: {
			control: 'number',
			description: 'Initial number of visible text rows.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '4' },
			},
		},
		resize: {
			control: 'select',
			options: ['none', 'vertical', 'both'],
			description: 'CSS resize behaviour of the textarea.',
			table: {
				type: { summary: '"none" | "vertical" | "both"' },
				defaultValue: { summary: 'vertical' },
			},
		},
		showCount: {
			control: 'boolean',
			description: 'Display a character counter. Requires `maxLength`.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		maxLength: {
			control: 'number',
			description: 'Maximum character count. Also enables the counter when `showCount` is true.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: 'undefined' },
			},
		},
		fullWidth: {
			control: 'boolean',
			description: 'Stretch the component to fill its container.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		required: {
			control: 'boolean',
			description: 'Mark field as required (shows asterisk in label).',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		className: { table: { disable: true } },
		id: { table: { disable: true } },
		disclaimerIcon: { table: { disable: true } },
		disclaimerContent: { table: { disable: true } },
	},
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT – main interactive story with controls
// ============================================================================

export const Default: Story = {
	args: {
		placeholder: 'Start typing…',
	},
};

// ============================================================================
// OUTLINED
// ============================================================================

export const Outlined: Story = {
	args: {
		variant: 'outlined',
		placeholder: 'Outlined textarea…',
	},
};

// ============================================================================
// WITH LABEL
// ============================================================================

export const WithLabel: Story = {
	args: {
		label: 'Description',
		placeholder: 'Enter a description…',
		required: true,
	},
};

// ============================================================================
// WITH ERROR
// ============================================================================

export const WithError: Story = {
	args: {
		label: 'Bio',
		placeholder: 'Tell us about yourself…',
		error: 'Bio must be at least 20 characters.',
		defaultValue: 'Too short',
	},
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
	args: {
		label: 'Notes',
		placeholder: 'No input allowed',
		disabled: true,
		defaultValue: 'This field is read-only.',
	},
};

// ============================================================================
// LOADING
// ============================================================================

export const Loading: Story = {
	args: {
		label: 'Comment',
		placeholder: 'Saving…',
		loading: true,
	},
};

// ============================================================================
// WITH CHARACTER COUNT
// ============================================================================

export const WithCount: Story = {
	args: {
		label: 'Tweet',
		placeholder: "What's happening?",
		showCount: true,
		maxLength: 200,
		rows: 3,
	},
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes: Story = {
	render: () => {
		const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
		return (
			<div style={col}>
				<Textarea size="small" label="Small" placeholder="Small textarea…" rows={3} />
				<Textarea size="medium" label="Medium" placeholder="Medium textarea (default)…" rows={3} />
				<Textarea size="large" label="Large" placeholder="Large textarea…" rows={3} />
			</div>
		);
	},
};

// ============================================================================
// FULL WIDTH
// ============================================================================

export const FullWidth: Story = {
	args: {
		label: 'Message',
		placeholder: 'Enter your message…',
		fullWidth: true,
		rows: 5,
	},
};

// ============================================================================
// RESIZE NONE
// ============================================================================

export const ResizeNone: Story = {
	args: {
		label: 'Fixed height area',
		placeholder: 'This textarea cannot be resized.',
		resize: 'none',
		rows: 4,
	},
};

// ============================================================================
// DISCLAIMER ICON (with Tooltip)
// ============================================================================

export const WithDisclaimer: Story = {
	args: {
		label: 'Legal notice',
		placeholder: 'Enter the legal disclaimer…',
		disclaimerIcon: HelpCircle,
		disclaimerContent: 'This text will be displayed publicly.',
		rows: 4,
	},
};
