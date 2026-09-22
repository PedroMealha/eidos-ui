import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select.component';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { StoryStack, StoryValue } from '../../story-layout.docs';
import { expect, screen, waitFor } from 'storybook/test';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of options to display in the select dropdown',
      table: {
        type: { summary: 'SelectOption[]' },
      },
    },
    value: {
      control: 'text',
      description: 'Selected value(s). Can be a string or array of strings for multiple selection',
      table: {
        type: { summary: 'string | string[]' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the selection changes',
      table: {
        type: { summary: '(value: string | string[]) => void' },
      },
    },
    multiple: {
      control: 'boolean',
      description: 'Enable multiple selection',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Select an option...' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select input',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    clearable: {
      control: 'boolean',
      description: 'Show a clear button when a value is selected',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make the select take full width of its container',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoWidth: {
      control: 'boolean',
      description: 'Automatically match dropdown width to trigger width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      control: 'text',
      description: 'Name attribute for form submission',
      table: {
        type: { summary: 'string' },
      },
    },
    id: {
      control: 'text',
      description: 'ID attribute for the select',
      table: {
        type: { summary: 'string' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Mark the select as required in a form',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of the dropdown',
      table: {
        type: { summary: 'number | string' },
      },
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of the dropdown',
      table: {
        type: { summary: 'number | string' },
      },
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of the dropdown (enables scrolling)',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: '300px' },
      },
    },
    inputProps: {
      control: 'object',
      description: 'Additional props to pass to the underlying Input component',
      table: {
        type: { summary: 'Partial<InputProps>' },
      },
    },
    dropdownProps: {
      control: 'object',
      description: 'Additional props to pass to the underlying Dropdown component',
      table: {
        type: { summary: 'object' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic options without icons
const basicOptions = [
  { id: '1', label: 'Apple', value: 'apple' },
  { id: '2', label: 'Banana', value: 'banana' },
  { id: '3', label: 'Cherry', value: 'cherry' },
  { id: '4', label: 'Date', value: 'date' },
  { id: '5', label: 'Elderberry', value: 'elderberry' },
];

// Options with component-based icons
const optionsWithComponentIcons = [
  { id: '1', label: 'John Doe', value: 'john', icon: User },
  { id: '2', label: 'jane@example.com', value: 'jane', icon: Mail },
  { id: '3', label: '+1 234 567 890', value: 'phone', icon: Phone },
  { id: '4', label: 'New York, USA', value: 'ny', icon: MapPin },
  { id: '5', label: '2025-10-12', value: 'date', icon: Calendar },
];

// Options with disabled state
const optionsWithDisabled = [
  { id: '1', label: 'Available Option', value: 'available' },
  { id: '2', label: 'Disabled Option', value: 'disabled', disabled: true },
  { id: '3', label: 'Another Available', value: 'available2' },
  { id: '4', label: 'Also Disabled', value: 'disabled2', disabled: true },
];

// `SingleSelect` was byte-identical to this and referenced by no .mdx.
export const Default: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Select a fruit...',
    // A placeholder is not an accessible name - it vanishes on selection.
    // `Select` has no `label` prop of its own (unlike `Input`, `Checkbox`,
    // `Radio` and `Textarea`), so the label goes through `inputProps`, which
    // is forwarded to the underlying `Input`.
    inputProps: { label: 'Fruit' },
  },
};

export const WithComponentIcons: Story = {
  args: {
    options: optionsWithComponentIcons,
    placeholder: 'Select an option...',
  },
};

export const MultipleSelect: Story = {
  args: {
    options: basicOptions,
    multiple: true,
    placeholder: 'Select multiple fruits...',
  },
};

export const MultipleSelectCompactLabel: Story = {
  name: 'Multiple select (compact label)',
  args: {
    options: basicOptions,
    multiple: true,
    defaultValue: ['apple', 'banana', 'cherry'],
    placeholder: 'Select multiple fruits...',
    inputProps: { label: 'Fruit' },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Past 2 selections the trigger switches from a comma-joined label list to a compact ' +
          '"N selected" label, so the field stays readable regardless of how many options are picked.',
      },
    },
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: optionsWithDisabled,
    placeholder: 'Some options are disabled...',
  },
};

export const Disabled: Story = {
  args: {
    options: basicOptions,
    disabled: true,
    placeholder: 'This select is disabled...',
  },
};

export const NotClearable: Story = {
  args: {
    options: basicOptions,
    clearable: false,
    placeholder: 'Select without clear button...',
  },
};

export const FullWidth: Story = {
  args: {
    options: basicOptions,
    fullWidth: true,
    placeholder: 'Full width select...',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ControlledExample: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = useState<string>('');

    return (
      <StoryStack gap="md">
        <Select
          {...args}
          options={basicOptions}
          value={value}
          onChange={(newValue) => setValue(newValue as string)}
          placeholder="Select a fruit..."
        />
        <StoryValue label="Selected value" value={value || 'None'} />
      </StoryStack>
    );
  },
};

export const MultipleControlled: Story = {
  render: function MultipleControlledStory(args) {
    const [values, setValues] = useState<string[]>([]);

    return (
      <StoryStack gap="md">
        <Select
          {...args}
          options={basicOptions}
          multiple
          value={values}
          onChange={(newValues) => setValues(newValues as string[])}
          placeholder="Select multiple fruits..."
        />
        <StoryValue
          label="Selected values"
          value={values.length > 0 ? values.join(', ') : 'None'}
        />
      </StoryStack>
    );
  },
};

// The `Examples` grid that used to live here duplicated every story above and
// was referenced by no .mdx section. `CustomInputStyling` was the one thing it
// showed that nothing else did, so it survives as a focused story.
export const CustomInputStyling: Story = {
  args: {
    options: optionsWithComponentIcons,
    placeholder: 'Success variant...',
    inputProps: { variant: 'filled', color: 'success' },
  },
};

// ============================================================================
// CHARACTERISATION - behaviour pinned before `Dropdown` gains a controlled
// `open` API, so that refactor can be shown to preserve what works.
// ============================================================================
//
// Only currently-correct behaviour is asserted here. `Select`'s keyboard path is
// measurably broken (the listbox cannot be opened from the keyboard at all, and
// focus is lost to `<body>` after a selection) - that is recorded in
// `ACCESSIBILITY.md` and is fixed, test-first, when `Select` stops mirroring
// `Dropdown`'s private state. Writing it down as an assertion here would pin a
// defect in place, which is the opposite of the point.

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `Select` is a **select-only** combobox: the field is not editable, so the
 * ARIA APG's select-only pattern applies - ArrowDown/ArrowUp, Enter and Space
 * open the listbox, and Escape closes it. Deliberately *not* open-on-focus,
 * which `Combobox` does: that is right for an editable combobox, where the list
 * filters as you type, and wrong here, because tabbing through a form would pop
 * a listbox over the fields that follow it.
 *
 * Before this worked, none of it did. `Select` kept its own `isOpen` flag that
 * reached nothing - the underlying `Dropdown` owned the real state privately and
 * only a click on the trigger could change it - so the keyboard moved a
 * highlight through a list that never appeared, while `Enter` committed the
 * option at that invisible index. WCAG 2.1.1, Level A.
 */
export const KeyboardOperation: StoryObj<typeof Select> = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Select
      inputProps={{ label: 'Fruit' }}
      options={[
        { id: 'a', value: 'a', label: 'Apple' },
        { id: 'b', value: 'b', label: 'Banana' },
        { id: 'c', value: 'c', label: 'Cherry' },
      ]}
    />
  ),
  play: async ({ canvas, userEvent, step }) => {
    const field = () => canvas.getByRole('textbox');
    const combobox = () => canvas.getByRole('combobox');
    const listbox = () => screen.queryByRole('listbox');

    await step('focus alone does not open it', async () => {
      field().focus();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(listbox(), 'focus should not open a select-only combobox').toBeNull();
      expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    });

    await step('ArrowDown opens the listbox and marks the first option active', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(listbox()).not.toBeNull());
      expect(combobox()).toHaveAttribute('aria-expanded', 'true');

      const active = combobox().getAttribute('aria-activedescendant');
      expect(active, 'no active option was advertised').toBeTruthy();
      expect(
        document.getElementById(active!),
        'aria-activedescendant pointed at an element that does not exist',
      ).not.toBeNull();
      expect(document.getElementById(active!)).toHaveTextContent('Apple');
    });

    await step('ArrowDown moves the active option', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() =>
        expect(
          document.getElementById(combobox().getAttribute('aria-activedescendant')!),
        ).toHaveTextContent('Banana'),
      );
    });

    await step('Escape closes it and leaves focus on the field', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(listbox()).toBeNull());
      expect(document.activeElement).toBe(field());
    });

    await step('Enter reopens it', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(listbox()).not.toBeNull());
    });

    await step('Enter commits the active option, keeping focus on the field', async () => {
      // Reopening starts at the first option, so one step down is "Banana".
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(listbox()).toBeNull());

      expect(field()).toHaveValue('Banana');
      expect(
        document.activeElement,
        'focus was dropped when the selection committed, so the control went keyboard-dead',
      ).toBe(field());
    });

    await step('and it is still operable afterwards', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(listbox()).not.toBeNull());
      await userEvent.keyboard('{Escape}');
    });

    await step('Space opens it too', async () => {
      await userEvent.keyboard(' ');
      await waitFor(() => expect(listbox()).not.toBeNull());
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `autoOpen` is what `DataGrid`'s select cell editor uses so that the one click
 * which enters edit mode also opens the list. It used to reach `Dropdown`'s
 * `defaultOpen`; now that `Select` owns the open state it seeds that instead, so
 * this pins the behaviour across the change - a regression here would cost that
 * editor a second click, in a component no story drives this deeply.
 */
export const AutoOpensOnMount: StoryObj<typeof Select> = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Select
      autoOpen
      inputProps={{ label: 'Fruit' }}
      options={[
        { id: 'a', value: 'a', label: 'Apple' },
        { id: 'b', value: 'b', label: 'Banana' },
      ]}
    />
  ),
  play: async ({ canvas, step }) => {
    await step('the listbox is open with no interaction at all', async () => {
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
      expect(canvas.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      // Not just mounted - actually painted. The panel is `visibility: hidden`
      // until it has been positioned, and an overlay that starts open reaches
      // that pass through a different route than one opened by a click.
      const panel = document.querySelector<HTMLElement>('[data-dropdown-content]');
      await waitFor(() => expect(getComputedStyle(panel!).visibility).toBe('visible'));
    });
  },
};

export const OpensAndCommitsByMouse: StoryObj<typeof Select> = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Select
      // `Select` has no `label` prop of its own - the accessible name has to go
      // through `inputProps`. Leaving it off makes the field unlabelled, which
      // is a fault in the story rather than in the component, and it is why this
      // story added a `label` violation before the name was passed.
      inputProps={{ label: 'Fruit' }}
      options={[
        { id: 'a', value: 'a', label: 'Apple' },
        { id: 'b', value: 'b', label: 'Banana' },
      ]}
    />
  ),
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = canvas.getByRole('textbox');

    await step('clicking the field opens the listbox', async () => {
      await userEvent.click(field);
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    await step('choosing an option commits it and closes the listbox', async () => {
      await userEvent.click(screen.getByRole('option', { name: 'Banana' }));
      await waitFor(() => expect(panels()).toHaveLength(0));
      // Queried afresh: closing remounts the dropdown subtree, which replaces
      // this very input node - the reason focus is lost, and why phase 2 of the
      // refactor removes the remount.
      await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue('Banana'));
    });

    await step('reopening shows the committed option as selected', async () => {
      await userEvent.click(canvas.getByRole('textbox'));
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  },
};
