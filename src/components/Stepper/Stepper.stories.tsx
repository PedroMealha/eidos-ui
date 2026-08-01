import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Star, Zap, Circle } from 'lucide-react';
import { Stepper } from './Stepper.component';

// ============================================================================
// Shared fixtures
// ============================================================================

const steps = [
  { label: 'Account', description: 'Enter your account details' },
  { label: 'Profile', description: 'Set up your profile' },
  { label: 'Review', description: 'Review your information' },
  { label: 'Confirm', description: 'Confirm and submit' },
];

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    activeStep: {
      control: 'number',
      description: 'Zero-based index of the currently active step.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction.',
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color of the active/completed steps.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger"' },
        defaultValue: { summary: 'primary' },
      },
    },
    showNumbers: {
      control: 'boolean',
      description: 'Whether to show step numbers inside the dot.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    steps: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    steps,
    activeStep: 1,
    orientation: 'horizontal',
    color: 'primary',
    showNumbers: true,
  },
};

// ============================================================================
// VERTICAL
// ============================================================================

export const Vertical: Story = {
  args: {
    steps,
    activeStep: 1,
    orientation: 'vertical',
    color: 'primary',
    showNumbers: true,
  },
};

// ============================================================================
// COMPLETED — all steps done
// ============================================================================

export const Completed: Story = {
  args: {
    steps,
    activeStep: 4,
    orientation: 'horizontal',
    color: 'primary',
    showNumbers: true,
  },
};

// ============================================================================
// WITH ERROR — step 2 carries an explicit error status
// ============================================================================

export const WithError: Story = {
  args: {
    steps: [
      { label: 'Account' },
      { label: 'Profile' },
      { label: 'Verification', status: 'error' as const },
      { label: 'Confirm' },
    ],
    activeStep: 2,
    orientation: 'horizontal',
    color: 'primary',
    showNumbers: true,
  },
};

// ============================================================================
// COLORS — all four color variants stacked
// ============================================================================

export const Colors = {
  render: () => {
    const colors = ['primary', 'secondary', 'success', 'danger'] as const;
    const label: React.CSSProperties = {
      margin: '0 0 0.5rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.07em',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {colors.map((color) => (
          <div key={color}>
            <p style={label}>{color}</p>
            <Stepper steps={steps} activeStep={2} color={color} />
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// NO NUMBERS — custom icons replace step numbers
// ============================================================================

export const NoNumbers: Story = {
  args: {
    steps: [
      { label: 'Start',   icon: <Star   size={14} /> },
      { label: 'Process', icon: <Zap    size={14} /> },
      { label: 'Review',  icon: <Circle size={14} /> },
      { label: 'Done',    icon: <Star   size={14} /> },
    ],
    activeStep: 1,
    showNumbers: false,
    color: 'primary',
    orientation: 'horizontal',
  },
};

// ============================================================================
// INTERACTIVE — prev / next controls
// ============================================================================

export const Interactive: Story = {
  render: (args) => {
    const [activeStep, setActiveStep] = React.useState(0);
    const totalSteps = args.steps.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Stepper {...args} activeStep={activeStep} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            style={{ padding: '0.5rem 1rem', cursor: activeStep === 0 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.min(totalSteps, s + 1))}
            disabled={activeStep === totalSteps}
            style={{ padding: '0.5rem 1rem', cursor: activeStep === totalSteps ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  },
  args: {
    steps,
    color: 'primary',
    showNumbers: true,
    orientation: 'horizontal',
  },
};
