import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./DatePicker.component";
import { useState } from "react";
import type { DateTimeValue } from "./DatePicker.types";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive date picker component supporting single date, multiple dates, and date range selection. Built with dayjs and supports time selection, custom formatting, week numbers, and more.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleDate: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          placeholder="Select a date..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Selected: <strong>{value.date || "None"}</strong>
        </div>
      </div>
    );
  },
};

export const SingleDateWithTime: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
      time: { hours: 12, minutes: 0, seconds: 0 },
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date and time..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Selected: <strong>{value.date || "None"}</strong>
          {value.time && (
            <div>
              Time: {value.time.hours}:{value.time.minutes.toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const MultipleDates: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"multiple">>({
      date: [],
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="multiple"
          value={value}
          onChange={setValue}
          placeholder="Select multiple dates..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Selected: <strong>{value.date.length} date(s)</strong>
          {value.date.length > 0 && (
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              {value.date.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

export const DateRange: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"range">>({
      date: { start: null, end: null },
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="range"
          value={value}
          onChange={setValue}
          placeholder="Select date range..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          <div>
            Start: <strong>{value.date.start || "Not selected"}</strong>
          </div>
          <div>
            End: <strong>{value.date.end || "Not selected"}</strong>
          </div>
        </div>
      </div>
    );
  },
};

export const DateRangeWithTime: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"range">>({
      date: { start: null, end: null },
      time: {
        start: { hours: 9, minutes: 0, seconds: 0 },
        end: { hours: 17, minutes: 0, seconds: 0 },
      },
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="range"
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: false }}
          placeholder="Select date range with time..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          <div>
            Start: <strong>{value.date.start || "Not selected"}</strong>
          </div>
          <div>
            End: <strong>{value.date.end || "Not selected"}</strong>
          </div>
        </div>
      </div>
    );
  },
};

export const SingleCalendar: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          calendar={{ numberOfCalendars: 1 }}
          placeholder="Single calendar view..."
        />
      </div>
    );
  },
};

export const WithWeekNumbers: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          calendar={{ numberOfCalendars: 1, showWeekNumbers: true }}
          placeholder="With week numbers..."
        />
      </div>
    );
  },
};

export const SundayFirstDayOfWeek: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          calendar={{ numberOfCalendars: 1, firstDayOfWeek: 0 }}
          placeholder="Sunday as first day..."
        />
      </div>
    );
  },
};

export const CustomFormat: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          format={{
            displayFormat: "DD/MM/YYYY",
            inputFormat: "YYYY-MM-DD",
          }}
          placeholder="Custom format (DD/MM/YYYY)..."
        />
      </div>
    );
  },
};

export const WithSeconds: Story = {
  render: () => {
    const [value, setValue] = useState<DateTimeValue<"single">>({
      date: null,
      time: { hours: 12, minutes: 30, seconds: 45 },
    });

    return (
      <div style={{ width: "300px" }}>
        <DatePicker
          mode="single"
          value={value}
          onChange={setValue}
          time={{ enabled: true, includeSeconds: true }}
          placeholder="Select date with seconds..."
        />
        <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Selected: <strong>{value.date || "None"}</strong>
          {value.time && (
            <div>
              Time: {value.time.hours}:{value.time.minutes.toString().padStart(2, "0")}:
              {value.time.seconds?.toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const Examples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "600px" }}>
      {/* Single Date */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Single Date Selection
        </h3>
        <SingleDate.render />
      </div>

      {/* Date Range */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Date Range Selection
        </h3>
        <DateRange.render />
      </div>

      {/* Multiple Dates */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Multiple Dates Selection
        </h3>
        <MultipleDates.render />
      </div>

      {/* With Time */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Single Date with Time
        </h3>
        <SingleDateWithTime.render />
      </div>

      {/* Single Calendar */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Single Calendar View
        </h3>
        <SingleCalendar.render />
      </div>

      {/* With Week Numbers */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          With Week Numbers
        </h3>
        <WithWeekNumbers.render />
      </div>
    </div>
  ),
};

export const UsageExample: Story = {
  render: () => (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "16px" }}>DatePicker Usage Example</h2>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        The DatePicker component provides flexible date selection with multiple modes:
      </p>

      <pre
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "13px",
          lineHeight: "1.6",
          marginBottom: "24px",
        }}
      >
        {`// Single date selection
import { DatePicker } from '@pmea/eidos-ui';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState({
    date: null,
  });

  return (
    <DatePicker
      mode="single"
      value={value}
      onChange={setValue}
      placeholder="Select a date..."
    />
  );
}

// Date range selection
const [rangeValue, setRangeValue] = useState({
  date: { start: null, end: null },
});

<DatePicker
  mode="range"
  value={rangeValue}
  onChange={setRangeValue}
  placeholder="Select date range..."
/>

// With time selection
const [dateTime, setDateTime] = useState({
  date: null,
  time: { hours: 12, minutes: 0, seconds: 0 },
});

<DatePicker
  mode="single"
  value={dateTime}
  onChange={setDateTime}
  time={{ enabled: true, includeSeconds: false }}
  placeholder="Select date and time..."
/>

// Multiple dates
const [multipleDates, setMultipleDates] = useState({
  date: [],
});

<DatePicker
  mode="multiple"
  value={multipleDates}
  onChange={setMultipleDates}
  placeholder="Select multiple dates..."
/>

// Custom configuration
<DatePicker
  mode="range"
  value={value}
  onChange={setValue}
  calendar={{
    numberOfCalendars: 2,
    showWeekNumbers: true,
    firstDayOfWeek: 1, // Monday
  }}
  format={{
    displayFormat: "MMM DD, YYYY",
    inputFormat: "YYYY-MM-DD",
  }}
/>`}
      </pre>

      <div style={{ marginTop: "24px" }}>
        <Examples.render />
      </div>
    </div>
  ),
};

