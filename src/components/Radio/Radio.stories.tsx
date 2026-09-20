import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from './Radio.component';

const meta = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: { layout: 'padded' },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'undefined' } },
    },
    label: {
      control: 'text',
      description: 'Label content rendered beside the control',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the radio button',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme applied when checked',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the radio control and label',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    defaultChecked: { table: { disable: true } },
    value: { table: { disable: true } },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT – interactive playground with all controls
// ============================================================================

export const Default: Story = {
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};

// ============================================================================
// INDIVIDUAL STATES
// ============================================================================

export const Checked: Story = {
  args: {
    label: 'Selected option',
    checked: true,
    color: 'primary',
    size: 'md',
    // onChange provided to satisfy React controlled-input requirement
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled radio button',
    disabled: true,
  },
};

// ============================================================================
// GROUP STORIES
// ============================================================================

export const Group: Story = {
  render: () => (
    <RadioGroup
      name="group-vertical"
      defaultValue="option2"
      direction="vertical"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2 (default)' },
        { value: 'option3', label: 'Option 3' },
      ]}
    />
  ),
};

export const GroupHorizontal: Story = {
  render: () => (
    <RadioGroup
      name="group-horizontal"
      defaultValue="option1"
      direction="horizontal"
      options={[
        { value: 'option1', label: 'Option A' },
        { value: 'option2', label: 'Option B' },
        { value: 'option3', label: 'Option C' },
      ]}
    />
  ),
};

export const GroupWithError: Story = {
  render: () => (
    <RadioGroup
      name="group-error"
      direction="vertical"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ]}
      error="Please select one of the options above"
    />
  ),
};

// ============================================================================
// SHOWCASE STORIES
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={col}>
        <Radio size="sm" label="Small radio" defaultChecked />
        <Radio size="md" label="Medium radio (default)" defaultChecked />
        <Radio size="lg" label="Large radio" defaultChecked />
      </div>
    );
  },
};

export const Colors: Story = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
    return (
      <div style={col}>
        <Radio color="primary" label="Primary" checked onChange={() => {}} />
        <Radio color="secondary" label="Secondary" checked onChange={() => {}} />
        <Radio color="success" label="Success" checked onChange={() => {}} />
        <Radio color="danger" label="Danger" checked onChange={() => {}} />
      </div>
    );
  },
};
