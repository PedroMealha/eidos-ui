import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagInput } from './TagInput.component';
import { expectErrorWiring } from '../../story-a11y.docs';
import { expect, waitFor } from 'storybook/test';

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
    suggestions: { control: false },
    onSearch: { control: false },
    suggestionsEmptyText: {
      control: 'text',
      description: 'Message shown when `suggestions` is set but nothing matches the current input',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'No matches' } },
    },
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

const TECH_SUGGESTIONS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Vue',
  'Angular',
  'Svelte',
  'Node.js',
  'GraphQL',
  'Design System',
  'Storybook',
];

export const WithSuggestions: Story = {
  args: {
    label: 'Technologies',
    placeholder: 'Add a technology…',
    hint: 'Type to see matching suggestions, or press Enter to add free text.',
    suggestions: TECH_SUGGESTIONS,
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
    validate: (tag: string) => tag.length >= 2 || 'Tag must be at least 2 characters.',
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

// ============================================================================
// ERROR WIRING - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 * Axe cannot see any of this - see the note on `Input`'s equivalent story.
 */
export const ErrorWiring: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Tags', error: 'Add at least one tag' },
  play: async ({ canvas }) => {
    await expectErrorWiring(canvas.getByRole('textbox', { name: 'Tags' }), 'Add at least one tag');
  },
};

// ============================================================================
// CHARACTERISATION - pinned before the suggestions stop being opened by a fake
// click and closed by a remount
// ============================================================================

export const SuggestionsOpenAndClose: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Tags', suggestions: ['react', 'redux', 'remix'] },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = canvas.getByRole('combobox', { name: 'Tags' });

    await step('typing opens the suggestion list', async () => {
      await userEvent.click(field);
      await userEvent.type(field, 're');
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(field).toHaveAttribute('aria-expanded', 'true');
    });

    await step('ArrowDown moves through the suggestions', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(field.getAttribute('aria-activedescendant')).toBeTruthy());
      const active = field.getAttribute('aria-activedescendant')!;
      expect(document.getElementById(active)).not.toBeNull();
    });

    await step('Enter commits the focused suggestion and closes the list', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(field).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.getByText('react')).toBeInTheDocument();
    });

    await step('typing again reopens it', async () => {
      await userEvent.type(field, 'red');
      await waitFor(() => expect(panels()).toHaveLength(1));
    });

    await step('Escape closes it, keeping focus in the field', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(document.activeElement).toBe(field);
    });
  },
};
