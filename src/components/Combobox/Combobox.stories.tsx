import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox.component';
import { expectErrorWiring } from '../../story-a11y.docs';
import type { ComboboxOption } from './Combobox.types';
import { expect, screen, waitFor } from 'storybook/test';

// ─── Sample data ──────────────────────────────────────────────────────────────

const COUNTRIES: ComboboxOption[] = [
  { id: '1', value: 'us', label: 'United States', group: 'Americas' },
  { id: '2', value: 'ca', label: 'Canada', group: 'Americas' },
  { id: '3', value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { id: '4', value: 'de', label: 'Germany', group: 'Europe' },
  { id: '5', value: 'fr', label: 'France', group: 'Europe' },
  { id: '6', value: 'jp', label: 'Japan', group: 'Asia' },
];

const FLAT_OPTIONS: ComboboxOption[] = [
  { id: '1', value: 'react', label: 'React' },
  { id: '2', value: 'vue', label: 'Vue' },
  { id: '3', value: 'angular', label: 'Angular' },
  { id: '4', value: 'svelte', label: 'Svelte', description: 'No virtual DOM' },
  { id: '5', value: 'solid', label: 'Solid', description: 'Fine-grained reactivity' },
  { id: '6', value: 'qwik', label: 'Qwik', disabled: true },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Forms/Combobox',
  component: Combobox,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    allowFreeText: {
      control: 'boolean',
      description: 'Allow the user to submit any typed value (not just from options)',
      table: { defaultValue: { summary: 'false' } },
    },
    clearable: {
      control: 'boolean',
      description: 'Show a clear (×) button when a value is present',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the combobox',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner while async results load',
      table: { defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill the parent container',
      table: { defaultValue: { summary: 'false' } },
    },
    label: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    loadingText: { control: 'text' },
    emptyText: { control: 'text' },
    onChange: { control: false },
    onSearch: { control: false },
    renderOption: { control: false },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    options: FLAT_OPTIONS,
    placeholder: 'Search or select…',
  },
};

// ─── With Groups ──────────────────────────────────────────────────────────────

export const WithGroups: Story = {
  args: {
    options: COUNTRIES,
    placeholder: 'Search a country…',
    label: 'Country',
  },
};

// ─── Async Search ─────────────────────────────────────────────────────────────

export const AsyncSearch: Story = {
  render: (args) => {
    const ALL_RESULTS: ComboboxOption[] = [
      { id: 'a1', value: 'typescript', label: 'TypeScript' },
      { id: 'a2', value: 'javascript', label: 'JavaScript' },
      { id: 'a3', value: 'python', label: 'Python' },
      { id: 'a4', value: 'rust', label: 'Rust' },
      { id: 'a5', value: 'go', label: 'Go' },
      { id: 'a6', value: 'java', label: 'Java' },
    ];

    const [options, setOptions] = useState<ComboboxOption[]>(ALL_RESULTS);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState('');

    const handleSearch = (query: string) => {
      if (!query.trim()) {
        setOptions(ALL_RESULTS);
        return;
      }
      setLoading(true);
      // Simulate a 600 ms network request
      setTimeout(() => {
        const q = query.toLowerCase();
        setOptions(ALL_RESULTS.filter((o) => o.label.toLowerCase().includes(q)));
        setLoading(false);
      }, 600);
    };

    return (
      <div style={{ width: 320 }}>
        <Combobox
          {...args}
          options={options}
          loading={loading}
          onSearch={handleSearch}
          onChange={setSelected}
          label="Programming Language"
          hint="Type to search. Results are mocked with a 600 ms delay."
        />
        {selected && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Selected value: <strong>{selected}</strong>
          </p>
        )}
      </div>
    );
  },
  args: {
    placeholder: 'Type to search…',
    loadingText: 'Searching languages…',
  },
};

// ─── Allow Free Text ──────────────────────────────────────────────────────────

export const AllowFreeText: Story = {
  render: (args) => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: 320 }}>
        <Combobox
          {...args}
          value={value}
          onChange={setValue}
          options={FLAT_OPTIONS}
          label="Framework"
          hint="You can pick a suggestion or type a custom value."
        />
        {value && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Committed: <strong>{value}</strong>
          </p>
        )}
      </div>
    );
  },
  args: {
    allowFreeText: true,
    placeholder: 'Pick or type a framework…',
  },
};

// ─── With Label ───────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  args: {
    options: FLAT_OPTIONS,
    label: 'Frontend Framework',
    hint: 'Select the primary framework for this project.',
    placeholder: 'Choose…',
  },
};

// ─── With Error ───────────────────────────────────────────────────────────────

export const WithError: Story = {
  args: {
    options: FLAT_OPTIONS,
    label: 'Frontend Framework',
    error: 'A framework selection is required.',
    placeholder: 'Choose…',
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    options: FLAT_OPTIONS,
    label: 'Frontend Framework',
    defaultValue: 'react',
    disabled: true,
    placeholder: 'Choose…',
  },
};

// ─── Custom Render Option ─────────────────────────────────────────────────────

export const CustomRenderOption: Story = {
  args: {
    options: COUNTRIES,
    label: 'Country',
    placeholder: 'Pick a country…',
    renderOption: (option: ComboboxOption) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#eef2ff',
            color: '#4338ca',
            fontWeight: 700,
            fontSize: '0.7rem',
            flexShrink: 0,
          }}
        >
          {option.value.toUpperCase()}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{option.label}</div>
          {option.group && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{option.group}</div>
          )}
        </div>
      </div>
    ),
  },
};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: 320 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Combobox
          key={size}
          options={FLAT_OPTIONS}
          size={size}
          label={`Size: ${size}`}
          placeholder={`${size} combobox`}
        />
      ))}
    </div>
  ),
};

// ─── Full Width ───────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  args: {
    options: COUNTRIES,
    label: 'Country',
    placeholder: 'Select a country…',
    fullWidth: true,
  },
  parameters: { layout: 'padded' },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('de');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 320 }}>
        <Combobox
          options={COUNTRIES}
          value={value}
          onChange={setValue}
          label="Country (controlled)"
          placeholder="Pick a country…"
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {COUNTRIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setValue(c.value)}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.78rem',
                borderRadius: 6,
                border: '1.5px solid var(--gray-300)',
                background: value === c.value ? '#eef2ff' : '#fff',
                color: value === c.value ? '#4338ca' : '#475569',
                cursor: 'pointer',
                fontWeight: value === c.value ? 600 : 400,
              }}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => setValue('')}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.78rem',
              borderRadius: 6,
              border: '1.5px solid #fca5a5',
              background: '#fff',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Current value: <strong>{value || '(none)'}</strong>
        </p>
      </div>
    );
  },
};

// ============================================================================
// ARIA + KEYBOARD - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `Combobox` is what `Select`, `TagInput` and `DataGrid`'s filters are built
 * on, so its behaviour is pinned here before its ARIA wiring was corrected -
 * the combobox role, `aria-expanded` and `aria-controls` all moved, and this
 * is what proves the interaction survived the move.
 *
 * It also asserts the wiring itself, which axe can only partly see: axe
 * catches `aria-controls` pointing at a missing element, but not the reverse
 * mistake of pointing at the right element under the wrong conditions.
 */
export const AriaAndKeyboard: Story = {
  tags: ['!dev', '!autodocs'],
  args: { options: FLAT_OPTIONS, placeholder: 'Search or select…' },
  play: async ({ canvas, userEvent, step }) => {
    const input = canvas.getByRole('combobox');

    await step('is collapsed, and claims no popup, before it opens', async () => {
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      // `aria-controls` must not name an element that does not exist yet.
      await expect(input).not.toHaveAttribute('aria-controls');
    });

    await step('opens on typing and points at the listbox it rendered', async () => {
      await userEvent.click(input);
      await userEvent.type(input, 'a');
      const listbox = await screen.findByRole('listbox');
      await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
      await expect(input).toHaveAttribute('aria-controls', listbox.id);
    });

    await step('arrow keys move the active option, Enter selects it', async () => {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'));
      const activeId = input.getAttribute('aria-activedescendant')!;
      const active = document.getElementById(activeId);
      expect(active, 'aria-activedescendant must name a real option').not.toBeNull();

      const chosen = active!.textContent!.trim();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect((input as HTMLInputElement).value).toBe(chosen));
    });
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
  args: { options: FLAT_OPTIONS, label: 'Country', error: 'Choose a country' },
  play: async ({ canvas }) => {
    await expectErrorWiring(canvas.getByRole('combobox'), 'Choose a country');
  },
};
