import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagInput } from './TagInput.component';

const meta = {
  title: 'Forms/TagInput',
  component: TagInput,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the field and chips',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire component',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    allowDuplicates: {
      control: 'boolean',
      description: 'Allow the same tag to be added more than once',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    maxTags: {
      control: 'number',
      description: 'Maximum number of tags allowed',
      table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown when no tags are present',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Add tag…' } },
    },
    label: {
      control: 'text',
      description: 'Label rendered above the field',
      table: { type: { summary: 'string' } },
    },
    error: {
      control: 'text',
      description: 'Error message shown below the field',
      table: { type: { summary: 'string' } },
    },
    hint: {
      control: 'text',
      description: 'Hint text shown below the field when there is no error',
      table: { type: { summary: 'string' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch the field to fill its container',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onChange: { control: false },
    validate: { control: false },
    separators: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithValues: Story = {
  args: {
    defaultValue: ['React', 'TypeScript', 'Design System'],
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Technologies',
    placeholder: 'Add a technology…',
    hint: 'Press Enter, comma, or Tab to add a tag.',
    defaultValue: ['React'],
  },
};

export const WithError: Story = {
  args: {
    label: 'Tags',
    error: 'Please add at least one tag.',
    defaultValue: [],
  },
};

export const WithValidation: Story = {
  args: {
    label: 'Tags (min 2 chars)',
    hint: 'Each tag must be at least 2 characters long.',
    validate: (tag: string) =>
      tag.length >= 2 || 'Tag must be at least 2 characters.',
  },
};

export const WithMaxTags: Story = {
  args: {
    label: 'Tags (max 3)',
    maxTags: 3,
    hint: 'You can add up to 3 tags.',
    defaultValue: ['One', 'Two'],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Tags',
    defaultValue: ['React', 'TypeScript'],
    disabled: true,
  },
};
