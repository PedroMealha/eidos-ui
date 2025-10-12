import type { Dayjs } from "dayjs";
import type { InputProps } from "../Input/Input.types";

// Date selection modes
type DateSelectionMode = "single" | "multiple" | "range";

// Time configuration
interface TimeConfig {
  enabled: boolean;
  includeSeconds?: boolean; // Default: false
  format?: string; // Default: 'HH:mm' or 'HH:mm:ss'
}

// Date value types based on selection mode - always ISO strings for consistency
type SingleDateValue = string | null;
type MultipleDateValue = string[];
type RangeDateValue = {
  start: string | null;
  end: string | null;
};

// Union type for date values
type DateValue<T extends DateSelectionMode> = T extends "single"
  ? SingleDateValue
  : T extends "multiple"
  ? MultipleDateValue
  : T extends "range"
  ? RangeDateValue
  : never;

// Time value types
interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

interface RangeTimeValue {
  start: TimeValue;
  end: TimeValue;
}

// Combined date and time value
interface DateTimeValue<T extends DateSelectionMode> {
  date: DateValue<T>;
  time?: T extends "range" ? RangeTimeValue : TimeValue;
}

// Calendar configuration
interface CalendarConfig {
  numberOfCalendars?: number; // Default: 2
  showWeekNumbers?: boolean; // Default: false
  firstDayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc. Default: 1 (Monday)
}

// Formatting options
interface DateFormatConfig {
  displayFormat?: string; // Default: 'MMM DD, YYYY'
  inputFormat?: string; // Default: 'YYYY-MM-DD'
  timeFormat?: string; // Default: 'HH:mm'
  timezone?: string; // Default: 'UTC'
}

// Main DatePicker props
interface DatePickerProps<T extends DateSelectionMode = "single"> {
  // Core functionality
  mode: T;
  value?: DateTimeValue<T>;
  onChange?: (value: DateTimeValue<T>) => void;

  // Time configuration
  time?: TimeConfig;

  // Calendar configuration
  calendar?: CalendarConfig;

  // Formatting
  format?: DateFormatConfig;

  // Input integration
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  inputProps?: Partial<InputProps>;

  // Validation
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDaysOfWeek?: number[]; // 0-6, Sunday = 0

  // Styling
  className?: string;

  // Dropdown sizing (inherited from our design system)
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  autoWidth?: boolean;
}

// Calendar component props
interface CalendarProps {
  currentDate: Dayjs;
  selectedDates: Dayjs[];
  rangeStart?: Dayjs | null;
  rangeEnd?: Dayjs | null;
  mode: DateSelectionMode;
  onDateSelect: (date: Dayjs) => void;
  onMonthChange: (date: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabledDates?: Dayjs[];
  disabledDaysOfWeek?: number[];
  showWeekNumbers?: boolean;
  firstDayOfWeek?: number;
  showNavigation?: boolean; // Whether to show month navigation arrows
}

// Time selector props
interface TimeSelectorProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  includeSeconds?: boolean;
  disabled?: boolean;
  format?: string;
}

// Month/Year selector props
interface MonthYearSelectorProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

export type {
  DateSelectionMode,
  TimeConfig,
  SingleDateValue,
  MultipleDateValue,
  RangeDateValue,
  TimeValue,
  RangeTimeValue,
  DateTimeValue,
  CalendarConfig,
  DateFormatConfig,
  DatePickerProps,
  CalendarProps,
  TimeSelectorProps,
  MonthYearSelectorProps,
};
