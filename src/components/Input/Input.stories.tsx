import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Search, User, HelpCircle, DollarSign, Calendar } from 'lucide-react';
import { Input } from './Input.component';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
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
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem', maxWidth: '600px' }}>
      <div>
        <h3>Basic Inputs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Email" type="email" placeholder="Enter your email" preIcon={Mail} />
          <Input label="Password" type="password" placeholder="Enter password" />
          <Input label="Username" placeholder="Choose a username" preIcon={User} />
        </div>
      </div>

      <div>
        <h3>Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input variant="filled" placeholder="Filled variant (default)" label="Filled" />
          <Input variant="outlined" placeholder="Outlined variant" label="Outlined" />
          <Input variant="text" placeholder="Text variant" label="Text" />
        </div>
      </div>

      <div>
        <h3>Colors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input color="primary" label="Primary" placeholder="Primary color" />
          <Input color="secondary" label="Secondary" placeholder="Secondary color" />
          <Input color="success" label="Success" placeholder="Success color" />
          <Input color="danger" label="Danger" placeholder="Danger color" />
        </div>
      </div>

      <div>
        <h3>Sizes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input size="small" label="Small" placeholder="Small input" />
          <Input size="medium" label="Medium" placeholder="Medium input (default)" />
          <Input size="large" label="Large" placeholder="Large input" />
        </div>
      </div>

      <div>
        <h3>With Icons (Component-based)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Search" type="search" placeholder="Search..." preIcon={Search} />
          <Input label="Email" type="email" placeholder="you@example.com" preIcon={Mail} />
          <Input label="Amount" type="number" placeholder="0.00" preIcon={DollarSign} />
          <Input label="Date" type="date" posIcon={Calendar} />
        </div>
      </div>

      <div>
        <h3>With Icons (String-based Lucide)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Search" type="search" placeholder="Search..." preIcon="search" />
          <Input label="Email" type="email" placeholder="you@example.com" preIcon="mail" />
          <Input label="Amount" type="number" placeholder="0.00" preIcon="dollar-sign" />
          <Input label="Username" placeholder="@username" preIcon="user" />
        </div>
      </div>

      <div>
        <h3>Search with Icon Button</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Search"
            type="search"
            placeholder="Type to search..."
            posIcon={Search}
            posIconButton
            onPosIconClick={() => alert('Search clicked!')}
          />
        </div>
      </div>

      <div>
        <h3>States</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Required Field" placeholder="This field is required" required />
          <Input label="Disabled" placeholder="Disabled input" disabled />
          <Input label="Loading" placeholder="Loading..." loading />
          <Input label="Error" placeholder="Invalid input" error="This field is required" />
        </div>
      </div>

      <div>
        <h3>With Disclaimer</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="API Key (component icon)"
            placeholder="Enter your API key"
            disclaimerIcon={HelpCircle}
            disclaimerContent="Your API key can be found in your account settings"
          />
          <Input
            label="Secret Token (string icon)"
            placeholder="Enter your token"
            disclaimerIcon="help-circle"
            disclaimerContent="This token is used for authentication"
          />
        </div>
      </div>

      <div>
        <h3>Number Input</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Price"
            type="number"
            placeholder="0.00"
            preIcon={DollarSign}
            min={0}
            step={0.01}
          />
          <Input
            label="Quantity"
            type="number"
            placeholder="0"
            min={1}
            max={100}
          />
        </div>
      </div>

      <div>
        <h3>Select Style</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Category"
            placeholder="Select a category"
            isSelect
            clearable={false}
          />
        </div>
      </div>

      <div>
        <h3>Full Width</h3>
        <Input
          label="Full Width Input"
          placeholder="This input spans the full width"
          fullWidth
        />
      </div>

      <div>
        <h3>Custom Width</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <Input
            label="PIN"
            type="number"
            placeholder="0000"
            width={100}
            maxLength={4}
          />
          <Input
            label="Year"
            type="number"
            placeholder="2025"
            width={120}
          />
        </div>
      </div>

      <div>
        <h3>Clearable Input</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="With Clear Button"
            placeholder="Type something..."
            clearable={true}
          />
          <Input
            label="No Clear Button"
            placeholder="Type something..."
            clearable={false}
          />
        </div>
      </div>
    </div>
  ),
};

