import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Search, User, HelpCircle, DollarSign, Calendar } from 'lucide-react';
import { Input } from './Input.component';

const meta = {
  title: 'Forms/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: {
    label: undefined,
    placeholder: undefined,
    preIcon: undefined,
    posIcon: undefined,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: { type: { summary: '"filled" | "outlined" | "text"' }, defaultValue: { summary: 'filled' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color theme',
      table: { type: { summary: '"primary" | "secondary" | "success" | "danger"' }, defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the input',
      table: { type: { summary: '"small" | "medium" | "large"' }, defaultValue: { summary: 'medium' } },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'date', 'tel', 'url', 'search'],
      description: 'HTML input type',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'text' } },
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    error: {
      control: 'text',
      description: 'Error message to display',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required (shows asterisk)',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make input full width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    clearable: {
      control: 'boolean',
      description: 'Show clear button when input has value',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    preIcon: {
      control: 'text',
      description: 'Icon to display before input. Pass Lucide component (Mail) or string ("mail")',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    posIcon: {
      control: 'text',
      description: 'Icon to display after input. Pass Lucide component (Search) or string ("search")',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    disclaimerIcon: {
      control: 'text',
      description: 'Icon to display next to label. Pass Lucide component (HelpCircle) or string ("help-circle")',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons', defaultValue: { summary: 'undefined' } },
    },
    disclaimerContent: {
      control: 'text',
      description: 'Tooltip content for disclaimer icon',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    posIconButton: {
      control: 'boolean',
      description: 'Make posIcon clickable as a button',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    width: {
      control: 'text',
      description: 'Custom width (number in px or string with units)',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    isSelect: {
      control: 'boolean',
      description: 'Style as select input (shows chevron)',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
    onPosIconClick: { table: { disable: true } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Examples = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '2rem 2.5rem',
        padding: '1.5rem',
      }}>
        {/* ── Row 1 ── */}
        <div>
          <p style={label}>Basic</p>
          <div style={col}>
            <Input label="Email" type="email" placeholder="Enter your email" preIcon={Mail} />
            <Input label="Password" type="password" placeholder="Enter password" />
            <Input label="Username" placeholder="Choose a username" preIcon={User} />
          </div>
        </div>

        <div>
          <p style={label}>Variants</p>
          <div style={col}>
            <Input variant="filled" label="Filled" placeholder="Filled (default)" />
            <Input variant="outlined" label="Outlined" placeholder="Outlined" />
            <Input variant="text" label="Text" placeholder="Text" />
          </div>
        </div>

        <div>
          <p style={label}>Colors</p>
          <div style={col}>
            <Input color="primary" label="Primary" placeholder="Primary" />
            <Input color="secondary" label="Secondary" placeholder="Secondary" />
            <Input color="success" label="Success" placeholder="Success" />
            <Input color="danger" label="Danger" placeholder="Danger" />
          </div>
        </div>

        {/* ── Row 2 ── */}
        <div>
          <p style={label}>Sizes</p>
          <div style={col}>
            <Input size="small" label="Small" placeholder="Small" />
            <Input size="medium" label="Medium" placeholder="Medium (default)" />
            <Input size="large" label="Large" placeholder="Large" />
          </div>
        </div>

        <div>
          <p style={label}>States</p>
          <div style={col}>
            <Input label="Required" placeholder="Required field" required />
            <Input label="Disabled" placeholder="Disabled" disabled />
            <Input label="Loading" placeholder="Loading..." loading />
            <Input label="Error" placeholder="Invalid" error="This field is required" />
            <Input label="No Clear" placeholder="Type something..." clearable={false} />
          </div>
        </div>

        <div>
          <p style={label}>Icons &amp; Actions</p>
          <div style={col}>
            <Input label="Pre-icon" placeholder="Search..." preIcon={Search} />
            <Input label="Post-icon" type="date" posIcon={Calendar} />
            <Input label="Amount" type="number" placeholder="0.00" preIcon={DollarSign} />
            <Input
              label="Clickable icon"
              placeholder="Type to search..."
              posIcon={Search}
              posIconButton
              onPosIconClick={() => alert('Search clicked!')}
            />
          </div>
        </div>

        {/* ── Row 3 ── */}
        <div>
          <p style={label}>Disclaimer</p>
          <div style={col}>
            <Input
              label="API Key"
              placeholder="Enter your API key"
              disclaimerIcon={HelpCircle}
              disclaimerContent="Found in your account settings"
            />
          </div>
        </div>

        <div>
          <p style={label}>Select Style</p>
          <div style={col}>
            <Input label="Category" placeholder="Select a category" isSelect clearable={false} />
          </div>
        </div>

        <div>
          <p style={label}>Custom Width</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <Input label="PIN" type="number" placeholder="0000" width={100} maxLength={4} />
            <Input label="Year" type="number" placeholder="2025" width={120} />
          </div>
        </div>

        {/* ── Full Width — spans all columns ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={label}>Full Width</p>
          <Input label="Full Width Input" placeholder="This input spans the full container width" fullWidth />
        </div>
      </div>
    );
  },
};

