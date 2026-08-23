import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider.component';

const meta = {
	title: 'Forms/Slider',
	component: Slider,
	parameters: { layout: 'padded' },
	argTypes: {
		value: {
			control: { type: 'number', min: 0, max: 100 },
			description: 'Controlled value. Omit to use uncontrolled mode.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: 'undefined' },
			},
		},
		defaultValue: {
			control: { type: 'number', min: 0, max: 100 },
			description: 'Initial value for uncontrolled usage.',
			table: {
				type: { summary: 'number' },
			},
		},
		min: {
			control: 'number',
			description: 'Minimum value.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '0' },
			},
		},
		max: {
			control: 'number',
			description: 'Maximum value.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '100' },
			},
		},
		step: {
			control: 'number',
			description: 'Step increment.',
			table: {
				type: { summary: 'number' },
				defaultValue: { summary: '1' },
			},
		},
		color: {
			control: 'select',
			options: ['primary', 'secondary', 'success', 'danger'],
			description: 'Color theme applied to the filled track and thumb.',
			table: {
				type: { summary: '"primary" | "secondary" | "success" | "danger"' },
				defaultValue: { summary: 'primary' },
			},
		},
		size: {
			control: 'select',
			options: ['small', 'medium', 'large'],
			description: 'Track height and thumb diameter.',
			table: {
				type: { summary: '"small" | "medium" | "large"' },
				defaultValue: { summary: 'medium' },
			},
		},
		disabled: {
			control: 'boolean',
			description: 'Prevents interaction and dims the slider.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		showValue: {
			control: 'boolean',
			description: 'Display the current numeric value above the thumb.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		showMinMax: {
			control: 'boolean',
			description: 'Display min/max labels below the track.',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
		label: {
			control: 'text',
			description: 'Accessible label; displayed above the track when provided.',
			table: { type: { summary: 'string' } },
		},
		unit: {
			control: 'text',
			description: 'Unit appended to value and min/max labels (e.g. \'%\', \'px\', \'kg\').',
			table: { type: { summary: 'string' } },
		},
		blockedRange: {
			control: 'object',
			description: 'Range where the thumb is blocked. Shown in danger-red. Format: { min: number; max: number }',
			table: { type: { summary: '{ min: number; max: number }' } },
		},
		className: { table: { disable: true } },
	},
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - fully interactive, all controls active
// ============================================================================

export const Default: Story = {
	args: {
		defaultValue: 50,
		color: 'primary',
		size: 'medium',
		disabled: false,
		showValue: false,
		showMinMax: false,
	},
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes: Story = {
	render: () => {
		const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '360px' };
		const label: React.CSSProperties = { marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' };
		return (
			<div style={col}>
				<div>
					<p style={label}>Small</p>
					<Slider size="small" defaultValue={30} />
				</div>
				<div>
					<p style={label}>Medium</p>
					<Slider size="medium" defaultValue={50} />
				</div>
				<div>
					<p style={label}>Large</p>
					<Slider size="large" defaultValue={70} />
				</div>
			</div>
		);
	},
};

// ============================================================================
// COLORS
// ============================================================================

export const Colors: Story = {
	render: () => {
		const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '360px' };
		const label: React.CSSProperties = { marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' };
		return (
			<div style={col}>
				<div>
					<p style={label}>Primary</p>
					<Slider color="primary" defaultValue={40} />
				</div>
				<div>
					<p style={label}>Secondary</p>
					<Slider color="secondary" defaultValue={55} />
				</div>
				<div>
					<p style={label}>Success</p>
					<Slider color="success" defaultValue={70} />
				</div>
				<div>
					<p style={label}>Danger</p>
					<Slider color="danger" defaultValue={85} />
				</div>
			</div>
		);
	},
};

// ============================================================================
// WITH LABEL + VALUE DISPLAY
// ============================================================================

export const WithLabel: Story = {
	args: {
		label: 'Volume',
		showValue: true,
		defaultValue: 60,
		color: 'primary',
		size: 'medium',
	},
};

// ============================================================================
// WITH MIN/MAX LABELS
// ============================================================================

export const WithMinMax: Story = {
	args: {
		min: 0,
		max: 200,
		step: 10,
		defaultValue: 80,
		showMinMax: true,
		showValue: true,
		label: 'Budget ($)',
	},
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
	args: {
		value: 30,
		disabled: true,
		label: 'Brightness',
		showValue: true,
	},
};

// ============================================================================
// WITH UNIT
// ============================================================================

export const WithUnit: Story = {
	render: () => {
		const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '360px' };
		const label: React.CSSProperties = { marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' };
		return (
			<div style={col}>
				<div>
					<p style={label}>Percentage (%)</p>
					<Slider defaultValue={60} unit="%" showValue showMinMax label="Disk usage" />
				</div>
				<div>
					<p style={label}>Pixels (px)</p>
					<Slider defaultValue={240} min={0} max={1920} step={10} unit="px" showValue showMinMax label="Width" />
				</div>
				<div>
					<p style={label}>Weight (kg)</p>
					<Slider defaultValue={75} min={40} max={150} unit=" kg" showValue showMinMax label="Body weight" />
				</div>
			</div>
		);
	},
};

// ============================================================================
// BLOCKED RANGE
// ============================================================================

export const BlockedRange: Story = {
	render: () => {
		const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '360px' };
		const label: React.CSSProperties = { marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' };
		return (
			<div style={col}>
				<div>
					<p style={label}>80–100 blocked (quota limit)</p>
					<Slider
						defaultValue={50}
						blockedRange={{ min: 80, max: 100 }}
						showValue
						showMinMax
						unit="%"
						label="Storage quota"
					/>
				</div>
				<div>
					<p style={label}>60–100 blocked</p>
					<Slider
						defaultValue={30}
						blockedRange={{ min: 60, max: 100 }}
						color="success"
						showValue
						showMinMax
						label="CPU threshold"
					/>
				</div>
				<div>
					<p style={label}>Near-max range blocked</p>
					<Slider
						defaultValue={100}
						min={0}
						max={500}
						step={10}
						blockedRange={{ min: 400, max: 500 }}
						color="secondary"
						showValue
						showMinMax
						unit=" ms"
						label="Response time limit"
					/>
				</div>
			</div>
		);
	},
};
