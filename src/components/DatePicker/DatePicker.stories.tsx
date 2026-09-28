import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker.component';
import { useEffect, useState } from 'react';
import type { DatePickerPreset, DateTimeValue } from './DatePicker.types';
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
    showActions: {
      control: 'boolean',
      description:
        'Show Cancel/Apply actions and defer `onChange` until Apply is pressed. `false` commits every selection immediately.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    presets: {
      control: false,
      description:
        'Quick-range shortcuts rendered inside the panel: `{ id, label, getValue }[]`. Clicking applies the computed value like a selection - it commits immediately, or drafts under `showActions`.',
    },
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

export const Playground: Story = {
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

export const WithActions: Story = {
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
          showActions
          label="Date range"
          placeholder="Select date range..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Committed:{' '}
          <strong>
            {value.date.start ?? 'None'} → {value.date.end ?? 'None'}
          </strong>
        </div>
      </div>
    );
  },
};

export const WithPresets: Story = {
  render: () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const utc = (date: string) => `${date}T00:00:00.000Z`;
    const presets: DatePickerPreset<'range'>[] = [
      {
        id: 'this-year',
        label: 'This year',
        getValue: () => {
          const y = new Date().getFullYear();
          return { start: utc(`${y}-01-01`), end: utc(`${y}-12-31`) };
        },
      },
      {
        id: 'next-year',
        label: 'Next year',
        getValue: () => {
          const y = new Date().getFullYear() + 1;
          return { start: utc(`${y}-01-01`), end: utc(`${y}-12-31`) };
        },
      },
      {
        id: 'next-6-months',
        label: 'Next 6 months',
        getValue: () => {
          const now = new Date();
          // Day 0 of the month six ahead = last day of the month five
          // ahead: six calendar months inclusive, starting at the first of
          // this month.
          const end = new Date(now.getFullYear(), now.getMonth() + 6, 0);
          const fmt = (d: Date) =>
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          return {
            start: utc(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`),
            end: utc(fmt(end)),
          };
        },
      },
    ];
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    return (
      <div style={{ width: '300px' }}>
        <DatePicker
          mode="range"
          granularity="month"
          value={value}
          onChange={setValue}
          presets={presets}
          label="Expires between"
          placeholder="Any date"
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

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `showActions` defers the commit: calendar clicks must not call `onChange`
 * and must not close the panel, Apply emits exactly once, and Escape /
 * outside-click discard the pending range instead of committing it.
 */
export const ActionsDeferCommit: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function ActionsDeferStory() {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    const [commits, setCommits] = useState(0);
    return (
      <div>
        <DatePicker
          mode="range"
          showActions
          value={value}
          onChange={(next) => {
            setCommits((c) => c + 1);
            setValue(next);
          }}
          inputProps={{ label: 'Range' }}
        />
        <span data-testid="commits">{commits}</span>
      </div>
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = () => canvas.getByRole('combobox');
    const commits = () => canvas.getByTestId('commits').textContent;
    const apply = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-actions button:last-child');
    const cancel = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-actions button:first-child');
    const dayCells = () =>
      document.querySelectorAll<HTMLButtonElement>(
        'button.eidos-calendar-date-cell:not(.eidos-calendar-other-month):not(.eidos-calendar-disabled)',
      );

    await step('the panel opens with the actions footer', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(apply(), 'no Apply button rendered').not.toBeNull();
      expect(cancel(), 'no Cancel button rendered').not.toBeNull();
    });

    await step('picking a range drafts it without committing or closing', async () => {
      const cells = dayCells();
      expect(cells.length, 'no day cells rendered').toBeGreaterThan(0);
      await userEvent.click(cells[10]);
      expect(commits()).toBe('0');
      expect(panels()).toHaveLength(1);
      await waitFor(() => expect(apply()).toBeDisabled());

      await userEvent.click(dayCells()[15]);
      expect(commits()).toBe('0');
      expect(panels()).toHaveLength(1);
      await waitFor(() => expect(apply()).not.toBeDisabled());
    });

    await step('Apply commits the draft once and closes', async () => {
      await userEvent.click(apply()!);
      await waitFor(() => expect(commits()).toBe('1'));
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(field()).not.toHaveValue('');
    });
    const committed = () => (field() as HTMLInputElement).value;

    await step('Escape discards the next draft like Cancel', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(dayCells()[5]);
      expect(commits()).toBe('1');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(commits()).toBe('1');
      expect(committed()).toBe((field() as HTMLInputElement).value);
    });

    await step('outside-click discards too', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(dayCells()[8]);
      expect(commits()).toBe('1');
      await userEvent.click(document.body);
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(commits()).toBe('1');
    });

    await step('Cancel closes without committing', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(dayCells()[3]);
      await userEvent.click(cancel()!);
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(commits()).toBe('1');
      expect(committed()).not.toBe('');
    });

    await step('the field X with the panel closed clears for real', async () => {
      // No draft is in play, so the clear commits directly - a visibly
      // enabled affordance that only wrote a discarded draft would be a
      // dead control.
      await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
      await waitFor(() => expect(commits()).toBe('2'));
      expect(field()).toHaveValue('');
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `value` is a fresh inline object on every render - the shape Cabinet's
 * expiry filter actually passes - and an interval forces parent re-renders
 * while the panel is open (the equivalent of a Firestore listener update).
 * A re-render mid-pick must not wipe the pending selection: keying the
 * draft re-seed on `value`'s reference identity would reset it. The
 * interval, not a clicked button, drives the re-renders because a DOM
 * click would also be an outside-click that closes the panel.
 */
export const ActionsDraftSurvivesRerender: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function RerenderStory() {
    const [ticks, setTicks] = useState(0);
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    const [commits, setCommits] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => setTicks((t) => t + 1), 150);
      return () => clearInterval(interval);
    }, []);
    return (
      <div>
        <span data-testid="ticks">{ticks}</span>
        <DatePicker
          mode="range"
          showActions
          // Deliberately inline: a new object identity every render, so any
          // effect keyed on `value` would fire on each parent render.
          value={{ date: { start: value.date.start, end: value.date.end } }}
          onChange={(next) => {
            setCommits((c) => c + 1);
            setValue(next);
          }}
          inputProps={{ label: 'Range' }}
        />
        <span data-testid="commits">{commits}</span>
      </div>
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = () => canvas.getByRole('combobox');
    const commits = () => canvas.getByTestId('commits').textContent;
    const apply = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-actions button:last-child');
    const rangeStart = () => document.querySelector('.eidos-calendar-range-start');
    const dayCells = () =>
      document.querySelectorAll<HTMLButtonElement>(
        'button.eidos-calendar-date-cell:not(.eidos-calendar-other-month):not(.eidos-calendar-disabled)',
      );

    await step('a pending pick survives parent re-renders', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(dayCells()[10]);
      await waitFor(() => expect(rangeStart(), 'no range-start cell rendered').not.toBeNull());
      await waitFor(() => expect(apply()).toBeDisabled());

      // Let several interval ticks pass while the pick is pending - each one
      // is a parent re-render with a fresh `value` object identity.
      await waitFor(() =>
        expect(Number(canvas.getByTestId('ticks').textContent)).toBeGreaterThan(2),
      );

      // The draft is still there: the start cell stays highlighted and the
      // pending range can still be completed.
      expect(rangeStart(), 'draft was reset by the re-renders').not.toBeNull();
      expect(commits()).toBe('0');
      await userEvent.click(dayCells()[15]);
      await waitFor(() => expect(apply()).not.toBeDisabled());
    });

    await step('Apply still commits the surviving draft', async () => {
      await userEvent.click(apply()!);
      await waitFor(() => expect(commits()).toBe('1'));
      expect(field()).not.toHaveValue('');
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * With no `value` prop and nothing picked, Apply must close without calling
 * `onChange` at all - emitting `undefined` would crash any consumer that
 * destructures its argument.
 */
export const ActionsApplyWithoutValue: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function ApplyWithoutValueStory() {
    const [commits, setCommits] = useState(0);
    return (
      <div>
        <DatePicker
          mode="single"
          showActions
          onChange={() => setCommits((c) => c + 1)}
          inputProps={{ label: 'Date' }}
        />
        <span data-testid="commits">{commits}</span>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const apply = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-actions button:last-child');

    await userEvent.click(canvas.getByRole('combobox'));
    await waitFor(() => expect(panels()).toHaveLength(1));
    await userEvent.click(apply()!);
    await waitFor(() => expect(panels()).toHaveLength(0));
    expect(canvas.getByTestId('commits').textContent).toBe('0');
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Re-clicking the already-selected year in a `granularity="month"` picker used
 * to emit `''` from `Select` (re-click deselected even with `clearable=false`),
 * which `Calendar` parsed as `NaN` and stored as an Invalid dayjs - bricking
 * the calendar permanently. The story ends with the picker reopened so the
 * panel stays in the DOM for the axe pass.
 */
export const MonthGranularityReselect: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function MonthGranularityStory() {
    const [value, setValue] = useState<DateTimeValue<'single'> | undefined>(undefined);
    return (
      <DatePicker
        mode="single"
        granularity="month"
        value={value}
        onChange={setValue}
        inputProps={{ label: 'Month' }}
      />
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = () => canvas.getByRole('combobox');
    const yearField = () => document.querySelector<HTMLInputElement>('[aria-label="Year"]');
    const currentYear = String(new Date().getFullYear());

    await step('the picker opens on the month grid', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels().length).toBeGreaterThan(0));
      expect(yearField(), 'no Year select rendered').not.toBeNull();
    });

    await step('re-clicking the selected year keeps it selected', async () => {
      await userEvent.click(yearField()!);
      await waitFor(() =>
        expect(document.querySelectorAll('.eidos-select-option').length).toBeGreaterThan(0),
      );
      const selected = document.querySelector<HTMLElement>('.eidos-select-option--selected');
      expect(selected, 'no selected year option rendered').not.toBeNull();
      await userEvent.click(selected!);

      await waitFor(() => expect(yearField()).toHaveValue(currentYear));
    });

    await step('no calendar cell shows NaN', async () => {
      const cells = document.querySelectorAll('.eidos-calendar-month-cell');
      expect(cells.length, 'no month cells rendered').toBe(12);
      cells.forEach((cell) => expect(cell.textContent).not.toContain('NaN'));
    });

    await step('picking a month still works', async () => {
      const cells = document.querySelectorAll<HTMLButtonElement>(
        '.eidos-calendar-month-cell:not([disabled])',
      );
      expect(cells.length, 'no selectable month cell was rendered').toBeGreaterThan(0);
      await userEvent.click(cells[0]);
      await waitFor(() => expect(field()).not.toHaveValue(''));
    });

    await step('and it can be reopened afterwards', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels().length).toBeGreaterThan(0));
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Immediate mode: a preset click goes through the same commit path as a
 * completed range - `onChange` fires and the panel closes. The active
 * highlight is a granularity comparison, not string equality: it must
 * follow the preset click AND an equivalent hand-picked range, whose
 * stored instants (picker-produced end-of-day/month boundaries) differ
 * from the preset's own ISO strings.
 */
export const PresetsCommit: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function PresetsCommitStory() {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    const presets: DatePickerPreset<'range'>[] = [
      {
        id: 'first-half',
        label: 'First half',
        getValue: () => ({
          start: '2026-01-01T00:00:00.000Z',
          end: '2026-06-30T00:00:00.000Z',
        }),
      },
      {
        id: 'second-half',
        label: 'Second half',
        getValue: () => ({
          start: '2026-07-01T00:00:00.000Z',
          end: '2026-12-31T00:00:00.000Z',
        }),
      },
    ];
    return (
      <DatePicker
        mode="range"
        granularity="month"
        value={value}
        onChange={setValue}
        presets={presets}
        inputProps={{ label: 'Range' }}
      />
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const field = () => canvas.getByRole('combobox');
    const presetByName = (name: string) =>
      [...document.querySelectorAll<HTMLButtonElement>('.eidos-date-picker-presets button')].find(
        (b) => b.textContent === name,
      );
    const monthCells = () =>
      document.querySelectorAll<HTMLButtonElement>(
        'button.eidos-calendar-month-cell:not(.eidos-calendar-disabled)',
      );

    await step('the presets render as a named group', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(
        document.querySelector('[role="group"][aria-label="Quick ranges"]'),
        'no named preset group rendered',
      ).not.toBeNull();
      expect(presetByName('First half'), 'no preset buttons rendered').not.toBeNull();
    });

    await step('a preset click commits and closes the panel', async () => {
      await userEvent.click(presetByName('First half')!);
      await waitFor(() => expect(panels()).toHaveLength(0));
      expect(field()).not.toHaveValue('');
    });

    await step('the matching preset shows as active', async () => {
      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(presetByName('First half')).toHaveAttribute('aria-pressed', 'true');
      expect(presetByName('Second half')).toHaveAttribute('aria-pressed', 'false');
    });

    await step('the highlight follows an equivalent hand-picked range', async () => {
      // Pick Jan → Jun by hand. The stored end is the picker's own
      // end-of-month boundary, not the preset's T00:00 instant - only a
      // month-granularity comparison keeps the preset active here.
      const cells = monthCells();
      expect(cells.length, 'no month cells rendered').toBe(12);
      await userEvent.click(cells[0]); // January -> range start
      await userEvent.click(monthCells()[5]); // June -> range end, commits + closes
      await waitFor(() => expect(panels()).toHaveLength(0));

      await userEvent.click(field());
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(
        presetByName('First half'),
        'a hand-picked Jan-Jun range did not light its matching preset',
      ).toHaveAttribute('aria-pressed', 'true');
      expect(presetByName('Second half')).toHaveAttribute('aria-pressed', 'false');
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * Under `showActions` a preset click must draft, not commit: the panel
 * stays open, the highlight moves to the pending selection, and only
 * Apply emits `onChange`.
 */
export const PresetsDraftWithActions: StoryObj<typeof DatePicker> = {
  tags: ['!dev', '!autodocs'],
  render: function PresetsDraftStory() {
    const [value, setValue] = useState<DateTimeValue<'range'>>({
      date: { start: null, end: null },
    });
    const [commits, setCommits] = useState(0);
    const presets: DatePickerPreset<'range'>[] = [
      {
        id: 'first-half',
        label: 'First half',
        getValue: () => ({
          start: '2026-01-01T00:00:00.000Z',
          end: '2026-06-30T00:00:00.000Z',
        }),
      },
    ];
    return (
      <div>
        <DatePicker
          mode="range"
          showActions
          value={value}
          onChange={(next) => {
            setCommits((c) => c + 1);
            setValue(next);
          }}
          presets={presets}
          inputProps={{ label: 'Range' }}
        />
        <span data-testid="commits">{commits}</span>
      </div>
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');
    const commits = () => canvas.getByTestId('commits').textContent;
    const preset = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-presets button');
    const apply = () =>
      document.querySelector<HTMLButtonElement>('.eidos-date-picker-actions button:last-child');

    await step('a preset click drafts without committing or closing', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(preset()!);
      expect(commits()).toBe('0');
      expect(panels()).toHaveLength(1);
      // The highlight already tracks the pending selection.
      await waitFor(() => expect(preset()).toHaveAttribute('aria-pressed', 'true'));
    });

    await step('Apply commits the drafted preset', async () => {
      await userEvent.click(apply()!);
      await waitFor(() => expect(commits()).toBe('1'));
      await waitFor(() => expect(panels()).toHaveLength(0));
    });
  },
};
