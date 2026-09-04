import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker.component';
import { useState } from 'react';
import type { DateTimeValue } from './DatePicker.types';

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
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          placeholder="Select a date..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          placeholder="Select date range..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          placeholder="Select multiple dates..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date and time..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date range with time..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
  parameters: {
    docs: {
      description: {
        story:
          "By default, one shared month/year control drives every calendar - the others just follow along a consecutive month apart, rather than each showing its own (misleadingly editable) control. Setting `calendar={{ independent: true }}` gives every calendar its own control instead, clamped so a calendar can never reach or cross its neighbor's month - e.g. the left calendar here can't be navigated to the same month as the right one, or past it.",
      },
    },
  },
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
          placeholder="Select date range..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
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
          mode="single"
          value={value}
          onChange={setValue}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Today → +3 months only..."
        />
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          Selected: <strong>{value.date ?? 'None'}</strong>
        </div>
      </div>
    );
  },
};
