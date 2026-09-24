import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { expectErrorWiring } from '../../story-a11y.docs';
import { Mail, Search, User, HelpCircle, DollarSign, Calendar } from 'lucide-react';
import { Input } from './Input.component';
import { StoryRow, StoryStack } from '../../story-layout.docs';

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
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
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
      description: 'Icon before the input: a component (`Mail`), or a registered name.',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    posIcon: {
      control: 'text',
      description: 'Icon after the input: a component (`Search`), or a registered name.',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
    },
    disclaimerIcon: {
      control: 'text',
      description: 'Icon next to the label: a component (`HelpCircle`), or a registered name.',
      table: {
        type: { summary: 'React.ComponentType | string' },
        category: 'Icons',
        defaultValue: { summary: 'undefined' },
      },
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
    posIconLabel: {
      control: 'text',
      description:
        'Accessible name for the `posIconButton`. Required in practice whenever that button is shown - an icon-only button with no name is announced as just "button". Omitting it logs a dev warning.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
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

export const Playground: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const CommonFields: Story = {
  render: () => (
    <StoryStack>
      <Input label="Email" type="email" placeholder="Enter your email" preIcon={Mail} />
      <Input label="Password" type="password" placeholder="Enter password" />
      <Input label="Username" placeholder="Choose a username" preIcon={User} />
    </StoryStack>
  ),
};

export const Variants: Story = {
  render: () => (
    <StoryStack>
      <Input variant="filled" label="Filled" placeholder="Filled (default)" />
      <Input variant="outlined" label="Outlined" placeholder="Outlined" />
      <Input variant="text" label="Text" placeholder="Text" />
    </StoryStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <StoryStack>
      <Input color="primary" label="Primary" placeholder="Primary" />
      <Input color="secondary" label="Secondary" placeholder="Secondary" />
      <Input color="success" label="Success" placeholder="Success" />
      <Input color="danger" label="Danger" placeholder="Danger" />
    </StoryStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <StoryStack>
      <Input size="sm" label="Small" placeholder="Small" />
      <Input size="md" label="Medium" placeholder="Medium (default)" />
      <Input size="lg" label="Large" placeholder="Large" />
    </StoryStack>
  ),
};

export const States: Story = {
  render: () => (
    <StoryStack>
      <Input label="Required" placeholder="Required field" required />
      <Input label="Disabled" placeholder="Disabled" disabled />
      <Input label="Loading" placeholder="Loading..." loading />
      <Input label="Error" placeholder="Invalid" error="This field is required" />
      <Input label="Not clearable" placeholder="Type something..." clearable={false} />
    </StoryStack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StoryStack>
      <Input label="Pre-icon" placeholder="Search..." preIcon={Search} />
      <Input label="Post-icon" type="date" posIcon={Calendar} />
      <Input label="Amount" type="number" placeholder="0.00" preIcon={DollarSign} />
      <Input
        label="Clickable icon"
        placeholder="Type to search..."
        posIcon={Search}
        posIconButton
        onPosIconClick={action('Search clicked')}
        posIconLabel="Search"
      />
    </StoryStack>
  ),
};

export const WithDisclaimer: Story = {
  args: {
    label: 'API key',
    placeholder: 'Enter your API key',
    disclaimerIcon: HelpCircle,
    disclaimerContent: 'Found in your account settings',
  },
};

export const SelectStyle: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select a category',
    isSelect: true,
    clearable: false,
  },
};

export const CustomWidth: Story = {
  render: () => (
    <StoryRow align="flex-end">
      <Input label="PIN" type="number" placeholder="0000" width={100} maxLength={4} />
      <Input label="Year" type="number" placeholder="2025" width={120} />
    </StoryRow>
  ),
};

export const FullWidth: Story = {
  args: {
    label: 'Full width input',
    placeholder: 'This input spans the full container width',
    fullWidth: true,
  },
  parameters: { layout: 'padded' },
};

// ============================================================================
// ERROR WIRING - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Nothing here is visible to axe - a red border beside an unassociated
 * message is valid DOM. It is also a SC 3.3.1 failure: the error was
 * conveyed by colour and proximity only, so a screen reader user was told
 * nothing at all.
 */
export const ErrorWiring: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    label: 'Email',
    error: 'Enter a valid email address',
  },
  play: async ({ canvas }) => {
    await expectErrorWiring(
      canvas.getByRole('textbox', { name: 'Email' }),
      'Enter a valid email address',
    );
  },
};
