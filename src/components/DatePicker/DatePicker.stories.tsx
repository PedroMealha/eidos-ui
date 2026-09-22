import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker.component';
import { useState } from 'react';
import type { DateTimeValue } from './DatePicker.types';
import { expect, waitFor } from 'storybook/test';

const meta: Meta<typeof DatePicker> = {
  title: 'Data/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive date picker supporting single date, multiple dates, and date range selection. Built with dayjs - supports time selection, custom formatting, week numbers, and more.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
      description: 'Date selection mode',
      table: { type: { summary: '"single" | "multiple" | "range"' } },
    },
    label: {
      control: 'text',
      description:
        'Visible label, rendered as a real `<label>` bound to the field. For a field that must stay visually unlabelled, pass `inputProps={{ "aria-label": "..." }}` instead.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
      table: { defaultValue: { summary: "'Select date...'" } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the picker',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required',
      table: { defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expand to fill container width',
      table: { defaultValue: { summary: 'false' } },
    },
    autoWidth: {
      control: 'boolean',
      description: 'Let the dropdown match trigger width automatically',
      table: { defaultValue: { summary: 'false' } },
    },
    minDate: {
      control: 'text',
      description: 'Earliest selectable date (ISO string, e.g. 2024-01-01)',
    },
    maxDate: {
      control: 'text',
      description: 'Latest selectable date (ISO string, e.g. 2024-12-31)',
    },
    name: { control: 'text', description: 'Hidden input name for form submission' },
    id: { control: 'text', description: 'ID attribute for the underlying input' },
    // Complex / callback props - hide controls, keep in docs table
    value: { control: false },
    onChange: { control: false },
    time: { control: false, description: 'Time selection config `{ enabled, includeSeconds }`' },
    calendar: {
      control: false,
      description:
        'Calendar layout config `{ numberOfCalendars, showWeekNumbers, firstDayOfWeek, independent }`. `independent` (default `false`) gives every calendar its own month/year control instead of one shared control driving them all - see the Independent Calendars story.',
    },
    format: {
      control: false,
      description: 'Format config `{ displayFormat, inputFormat, timeFormat, timezone }`',
    },
    inputProps: { control: false },
    disabledDates: { control: false },
    disabledDaysOfWeek: { control: false },
    minWidth: { control: false },
    maxWidth: { control: false },
    minHeight: { control: false },
    maxHeight: { control: false },
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - interactive controls; handles all three modes so you can switch
// between them in the Controls panel without leaving this story.
// The docs source override shows a clean real-world usage snippet.
// ============================================================================

export const Default: Story = {
  args: {
    mode: 'single',
    label: 'Date',
    placeholder: 'Select a date...',
    disabled: false,
    required: false,
    fullWidth: false,
    autoWidth: false,
  },
  render: ({ mode, value: _v, onChange: _oc, ...rest }) => {
    // Three independent state values so switching mode via controls works correctly.
    const [single, setSingle] = useState<DateTimeValue<'single'>>({ date: null });
    const [multiple, setMultiple] = useState<DateTimeValue<'multiple'>>({ date: [] });
    const [range, setRange] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });

    const effectiveMode = mode ?? 'single';

    const preview =
      effectiveMode === 'multiple'
        ? `${multiple.date.length} date(s) selected`
        : effectiveMode === 'range'
          ? `${range.date.start ?? 'None'} → ${range.date.end ?? 'None'}`
          : (single.date ?? 'None');

    return (
      <div style={{ minWidth: '300px' }}>
        {effectiveMode === 'multiple' ? (
          <DatePicker mode="multiple" value={multiple} onChange={setMultiple} {...rest} />
        ) : effectiveMode === 'range' ? (
          <DatePicker mode="range" value={range} onChange={setRange} {...rest} />
        ) : (
          <DatePicker mode="single" value={single} onChange={setSingle} {...rest} />
        )}
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Selected: <strong>{preview}</strong>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [value, setValue] = useState({ date: null });

<DatePicker
  mode="single"
  value={value}
  onChange={setValue}
  placeholder="Select a date..."
/>`.trim(),
      },
    },
  },
};

// ============================================================================
// MODE EXAMPLES - one story per selection mode showing a realistic setup
// ============================================================================

export const SingleDate: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'single'>>({ date: null });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          label="Date"
          placeholder="Select a date..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Selected: <strong>{value.date ?? 'None'}</strong>
        </div>
      </div>
    );
  },
};

export const DateRange: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="range"
          value={value}
          onChange={setValue}
          label="Date range"
          placeholder="Select date range..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>
            Start: <strong>{value.date.start ?? 'Not selected'}</strong>
          </div>
          <div>
            End: <strong>{value.date.end ?? 'Not selected'}</strong>
          </div>
        </div>
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'multiple'>>({ date: [] });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="multiple"
          value={value}
          onChange={setValue}
          label="Dates"
          placeholder="Select multiple dates..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Selected: <strong>{value.date.length} date(s)</strong>
          {value.date.length > 0 && (
            <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
              {value.date.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

// ============================================================================
// FEATURE EXAMPLES
// ============================================================================

export const WithTime: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'single'>>({
      date: null,
      time: { hours: 12, minutes: 0, seconds: 0 },
    });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="single"
          label="Date and time"
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date and time..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Date: <strong>{value.date ?? 'None'}</strong>
          {value.time && (
            <div>
              Time:{' '}
              <strong>
                {value.time.hours}:{value.time.minutes.toString().padStart(2, '0')}
              </strong>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const DateRangeWithTime: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
      time: {
        start: { hours: 9, minutes: 0, seconds: 0 },
        end: { hours: 17, minutes: 0, seconds: 0 },
      },
    });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="range"
          label="Date range and time"
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date range with time..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>
            Start: <strong>{value.date.start ?? 'Not selected'}</strong>
          </div>
          <div>
            End: <strong>{value.date.end ?? 'Not selected'}</strong>
          </div>
        </div>
      </div>
    );
  },
};

export const IndependentCalendars: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="range"
          value={value}
          onChange={setValue}
          calendar={{ independent: true }}
          label="Date range"
          placeholder="Select date range..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>
            Start: <strong>{value.date.start ?? 'Not selected'}</strong>
          </div>
          <div>
            End: <strong>{value.date.end ?? 'Not selected'}</strong>
          </div>
        </div>
      </div>
    );
  },
};

export const DateConstraints: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Restrict the selectable range with `minDate` / `maxDate`. Dates outside the range are disabled in the calendar.',
      },
    },
  },
  render: () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const minDate = fmt(today);
    const maxDate = fmt(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()));

    const [value, setValue] = useState<DateTimeValue<'single'>>({ date: null });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          label="Date"
          mode="single"
          value={value}
          onChange={setValue}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Today → +3 months only..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Selected: <strong>{value.date ?? 'None'}</strong>
        </div>
      </div>
    );
  },
};

// ============================================================================
// CHARACTERISATION - pinned before the picker stops closing itself by remounting
// ============================================================================
//
// `DatePicker` forced its dropdown shut by incrementing a `key`, because the
// overlay's open state was private. Replacing that with a controlled open state
// must not change any of what follows.

export const ClosesOnCommit: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function CharacterisationStory() {
    const [value, setValue] = useState<DateTimeValue<'single'> | undefined>(undefined);
    return (
      // Named through `inputProps` - `DatePicker` has no `label` prop of its
      // own, and without a name the field is an unlabelled input, which is the
      // story's fault rather than the component's.
      <DatePicker mode="single" value={value} onChange={setValue} inputProps={{ label: 'Date' }} />
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    // The field is a `combobox`: read-only, and it opens a dialog.
    const field = () => canvas.getByRole('combobox');

    await step('clicking the field opens the calendar', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
    });

    await step('picking a day commits it and closes the calendar', async () => {
      const days = document.querySelectorAll<HTMLButtonElement>(
        '.eidos-calendar-date-cell:not(.eidos-calendar-other-month):not([disabled])',
      );
      expect(days.length, 'no selectable day was rendered').toBeGreaterThan(0);
      await userEvent.click(days[10]);

      await waitFor(() => expect(panels()).toHaveLength(0));
      await waitFor(() => expect(field()).not.toHaveValue(''));
    });

    await step('and it can be reopened afterwards', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * The field is read-only and opens a calendar, so it is a combobox with a dialog
 * popup: arrow keys, `Enter` and `Space` open it, `Escape` closes it and returns
 * focus to the field. Focus moves into the panel on open, because the panel is
 * portaled to `document.body` - leaving focus on the field would put the whole
 * rest of the page between the two in the tab order.
 */
export const KeyboardOperation: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function KeyboardStory() {
    const [value, setValue] = useState<DateTimeValue<'single'> | undefined>(undefined);
    return (
      <DatePicker mode="single" value={value} onChange={setValue} inputProps={{ label: 'Date' }} />
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = () => canvas.getByRole('combobox');

    await step('the field announces that it opens a dialog, and is collapsed', async () => {
      expect(field()).toHaveAttribute('aria-haspopup', 'dialog');
      expect(field()).toHaveAttribute('aria-expanded', 'false');
    });

    await step('Enter opens the calendar and moves focus into it', async () => {
      field().focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(field()).toHaveAttribute('aria-expanded', 'true');
      await waitFor(() =>
        expect(
          panels()[0].contains(document.activeElement),
          'focus stayed on the field, so the calendar is unreachable by keyboard',
        ).toBe(true),
      );
    });

    await step('Escape closes it and returns focus to the field', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(panels()).toHaveLength(0));
      await waitFor(() => expect(document.activeElement).toBe(field()));
    });

    await step('Space and ArrowDown open it too', async () => {
      await userEvent.keyboard(' ');
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(panels()).toHaveLength(0));

      field().focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(panels()).toHaveLength(1));
    });
  },
};
