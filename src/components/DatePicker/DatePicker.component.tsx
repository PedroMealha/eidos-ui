import React, { useState, useCallback, useRef, useMemo, useId, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '../Button/Button.component';
import { Input } from '../Input/Input.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { Calendar } from './Calendar.component';
import { TimeInput } from './TimeInput.component';
import { useDialogFocus, devWarn } from '../../utils';
import type {
  DatePickerProps,
  DatePickerPreset,
  DateSelectionMode,
  DateTimeValue,
  TimeValue,
  RangeTimeValue,
} from './DatePicker.types';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Whether a preset's `date` equals the picker's current `date`, compared at
// a shared key ('YYYY-MM' or 'YYYY-MM-DD') rather than by string equality -
// a consumer's stored ISO formatting needn't match what the picker produces
// (Cabinet stores `YYYY-MM-DD`, hands the picker `...T00:00:00.000Z`), and a
// month-granularity preset must match any instant inside the month.
function presetDateEquals(
  presetDate: DateTimeValue<DateSelectionMode>['date'] | undefined,
  currentDate: DateTimeValue<DateSelectionMode>['date'] | undefined,
  mode: DateSelectionMode,
  toKey: (iso: string) => string,
): boolean {
  const key = (iso: unknown): string | null => (typeof iso === 'string' ? toKey(iso) : null);
  switch (mode) {
    case 'range': {
      const a = presetDate as { start?: string | null; end?: string | null } | undefined;
      const b = currentDate as { start?: string | null; end?: string | null } | undefined;
      return key(a?.start) === key(b?.start) && key(a?.end) === key(b?.end);
    }
    case 'multiple': {
      const a = (Array.isArray(presetDate) ? presetDate : []).map(key).sort();
      const b = (Array.isArray(currentDate) ? currentDate : []).map(key).sort();
      return a.length === b.length && a.every((k, i) => k === b[i]);
    }
    default:
      return key(presetDate) === key(currentDate);
  }
}

export const DatePicker = <T extends DateSelectionMode = 'single'>({
  mode,
  value,
  onChange,
  granularity = 'day',
  showActions = false,
  presets,
  time = { enabled: false },
  calendar = { numberOfCalendars: 2 },
  format = {
    displayFormat: 'MMM DD, YYYY',
    inputFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    timezone: 'UTC',
  },
  label,
  placeholder = 'Select date...',
  disabled = false,
  required = false,
  name,
  id,
  inputProps = {},
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  className = '',
  fullWidth = false,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  autoWidth = false,
}: DatePickerProps<T>) => {
  // The picker owns whether it is open and hands it to `Dropdown` as a
  // controlled value. It used to force a close by incrementing a `key`, which
  // remounted the whole subtree - the only lever available while the overlay
  // kept that state private.
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `${useId()}-date-panel`;
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves into the calendar when it opens, and back to the field when it
  // closes. Not optional: the panel is portaled to `document.body`, so `Tab`
  // from the field would otherwise walk the rest of the page before reaching
  // it. `trapTab: false` because this is not a modal dialog - the page stays
  // available.
  useDialogFocus(isOpen, panelRef, { trapTab: false });

  // A field with no accessible name is announced as just "combobox". Measured
  // from the DOM rather than from props, so naming it from outside - a wrapping
  // `<label>`, or a `<label for>` - counts. Mirrors `Select`.
  const fieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const element = fieldRef.current;
    if (!element) return;
    const named =
      (element.labels?.length ?? 0) > 0 ||
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby');
    if (!named) {
      devWarn(
        'date-picker-missing-label',
        'DatePicker: no accessible name. Pass `label` for a visible one, or `inputProps={{ "aria-label": "..." }}` where it must stay visually unlabelled - otherwise the field is announced as just "combobox". A placeholder is not a label, and disappears as soon as a date is chosen.',
      );
    }
  }, []);
  // Two different, deliberately different, notions of "timezone" are in
  // play here, matching two genuinely different kinds of value:
  //
  // - Date-only (time.enabled === false): a pure calendar date has no
  //   wall-clock moment attached to it, so there's nothing for a timezone
  //   to sensibly represent. It's anchored to a fixed `pickerTimezone`
  //   (default UTC) so the same calendar date always serializes to the
  //   same ISO instant no matter which machine picks it - see
  //   `composeDateOnly`.
  // - Date + time (time.enabled === true): this genuinely represents a
  //   real-world instant, e.g. a meeting at a specific wall-clock time -
  //   exactly the case a timezone exists to disambiguate. That instant
  //   should be computed from *the picking user's own local offset*
  //   (someone in UTC+3 typing "15:00" means 12:00 UTC), and later
  //   displayed by converting that same UTC instant into *each viewer's
  //   own* local offset (that same instant shows as "12:00" to a UTC+0
  //   viewer). That's exactly plain, un-anchored dayjs/Date behavior with
  //   no explicit timezone forcing at all, so this path intentionally
  //   does not use `pickerTimezone` anywhere.
  const pickerTimezone = format.timezone || 'UTC';
  // Combines a calendar date (only its Y-M-D is read, so it's timezone-
  // agnostic going in) with a start/end-of-day boundary, anchored to
  // `pickerTimezone` - only ever used for date-only values.
  const composeDateOnly = useCallback(
    (date: Dayjs, boundary: 'start' | 'end' = 'start') => {
      const anchored = dayjs.tz(date.format('YYYY-MM-DD'), pickerTimezone);
      return boundary === 'end' ? anchored.endOf('day') : anchored.startOf('day');
    },
    [pickerTimezone],
  );
  // Combines a calendar date with a time-of-day using plain local
  // semantics (no timezone forcing) - only ever used for date+time values,
  // see the note above.
  const composeLocalDateTime = useCallback(
    (date: Dayjs, t: TimeValue): Dayjs =>
      date
        .hour(t.hours)
        .minute(t.minutes)
        .second(t.seconds || 0),
    [],
  );
  // Re-anchors an already-stored ISO instant's calendar day (read in the
  // browser's own local timezone, matching how it was written) onto a new
  // time-of-day - used when the user edits a TimeInput without re-picking
  // the date, so that edit actually changes the returned value instead of
  // only updating the separate `value.time` field alongside an unchanged
  // `value.date`. Deliberately local, not anchored to `pickerTimezone` -
  // see the note above.
  const recomposeIsoWithTime = useCallback(
    (isoString: string, t: TimeValue): string =>
      dayjs(isoString)
        .hour(t.hours)
        .minute(t.minutes)
        .second(t.seconds || 0)
        .toISOString(),
    [],
  );
  // Month granularity always shows a single year/month grid - side-by-side
  // "next month" calendars don't make sense once there are no day cells.
  const numberOfCalendars = granularity === 'month' ? 1 : calendar.numberOfCalendars || 2;
  const independentCalendars = calendar.independent ?? false;
  // One entry per visible calendar. In the default (non-independent) mode
  // these always stay consecutive months, kept in sync from a single shared
  // control (see `handleCalendarMonthChange`) - the array shape is the same
  // either way, only how a change to one entry propagates differs.
  const [calendarDates, setCalendarDates] = useState<Dayjs[]>(() =>
    Array.from({ length: numberOfCalendars }, (_, i) => dayjs().add(i, 'month')),
  );
  const handleCalendarMonthChange = useCallback(
    (index: number, newDate: Dayjs) => {
      // `calendarDates` is internal state - once an Invalid dayjs lands in
      // it, every cell formats as NaN/Invalid and nothing a consumer can
      // pass recovers it. Refuse it here no matter what produced it.
      if (!newDate.isValid()) return;
      if (!independentCalendars) {
        // Coupled: every calendar shifts together, re-anchored so `index`
        // lands on `newDate` - e.g. moving calendar 1 to November re-anchors
        // calendar 0 to October, same as before this was array-based.
        const anchor = newDate.subtract(index, 'month');
        setCalendarDates(
          Array.from({ length: numberOfCalendars }, (_, i) => anchor.add(i, 'month')),
        );
        return;
      }

      // Independent: only this calendar moves, clamped so it can never reach
      // or cross an immediate neighbor's month - two calendars both landing
      // on (or swapping past) the same month would be exactly the confusing
      // state independent mode exists to let users avoid, just self-inflicted
      // instead of automatic.
      setCalendarDates((prev) => {
        const next = [...prev];
        let clamped = newDate;
        const left = prev[index - 1];
        const right = prev[index + 1];
        if (left && !clamped.isAfter(left, 'month')) {
          clamped = left.add(1, 'month');
        }
        if (right && !clamped.isBefore(right, 'month')) {
          clamped = right.subtract(1, 'month');
        }
        next[index] = clamped;
        return next;
      });
    },
    [independentCalendars, numberOfCalendars],
  );
  const triggerRef = useRef<HTMLDivElement>(null);

  // Convert the string-based constraint props to the Dayjs objects Calendar
  // actually consumes for its `isBefore`/`isAfter`/`isSame` comparisons.
  const minDateObj = useMemo(() => (minDate ? dayjs(minDate) : undefined), [minDate]);
  const maxDateObj = useMemo(() => (maxDate ? dayjs(maxDate) : undefined), [maxDate]);
  const disabledDatesObj = useMemo(() => disabledDates.map((d) => dayjs(d)), [disabledDates]);

  // Default time values
  const defaultStartTime = useMemo<TimeValue>(() => ({ hours: 0, minutes: 0, seconds: 0 }), []);
  const defaultEndTime = useMemo<TimeValue>(() => ({ hours: 23, minutes: 59, seconds: 59 }), []);

  // Helper function to convert stored ISO strings back to the calendar date
  // they represent, for calendar-grid display (which day to highlight).
  const toLocalDateString = useCallback(
    (isoString: string | null): string | null => {
      if (!isoString) return null;
      const parsed = dayjs(isoString);
      // Date-only values were anchored to `pickerTimezone` when stored (see
      // `composeDateOnly`) - reading them back via the browser's ambient
      // timezone instead would recover the wrong calendar day for anyone
      // not in that same timezone. Date+time values were deliberately
      // never anchored (see the note above `pickerTimezone`), so they stay
      // on local interpretation, matching how they were written.
      return (time.enabled ? parsed : parsed.tz(pickerTimezone)).format('YYYY-MM-DD');
    },
    [time.enabled, pickerTimezone],
  );

  // Deferred-commit draft: while `showActions` is on, calendar clicks and
  // TimeInput edits land here instead of `onChange`, and only Apply emits.
  // The effect acts ONLY on the open/close transition - `value` is in the
  // deps so the lint rule stays satisfied, but a consumer passing an inline
  // object gets a fresh reference every parent render, and keying the
  // re-seed on that would wipe the pending selection mid-pick. It is also
  // what makes Escape and outside-click behave as Cancel for free.
  const [draft, setDraft] = useState<DateTimeValue<T> | undefined>(undefined);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!showActions) return;
    if (isOpen && !wasOpen.current)
      setDraft(value); // opening: seed from committed value
    else if (!isOpen && wasOpen.current) setDraft(undefined); // closing: discard
    wasOpen.current = isOpen;
  }, [isOpen, showActions, value]);

  // What the panel edits and renders from: the draft while one is pending,
  // the committed value otherwise. When `showActions` is off there is never
  // a draft, so this collapses to `value` - every immediate-commit path
  // below is bit-identical to before.
  const effectiveValue = showActions ? (draft ?? value) : value;

  // Routes a produced value to the pending draft (deferred) or straight to
  // `onChange` (immediate). Everything downstream - calendars, time inputs,
  // the clear affordance - goes through this single switch.
  const commit = useCallback(
    (newValue: DateTimeValue<T>) => {
      if (showActions) setDraft(newValue);
      else onChange?.(newValue);
    },
    [showActions, onChange],
  );

  // Convert current value to calendar-compatible format
  const { selectedDates, rangeStart, rangeEnd } = useMemo(() => {
    if (!effectiveValue?.date) {
      return { selectedDates: [], rangeStart: null, rangeEnd: null };
    }

    switch (mode) {
      case 'single': {
        const isoString = effectiveValue.date as string | null;
        const localDateStr = toLocalDateString(isoString);
        return {
          selectedDates: localDateStr ? [dayjs(localDateStr)] : [],
          rangeStart: null,
          rangeEnd: null,
        };
      }
      case 'multiple': {
        const isoStrings = effectiveValue.date as string[];
        const localDateStrings = isoStrings
          .map((d) => toLocalDateString(d))
          .filter(Boolean) as string[];
        return {
          selectedDates: localDateStrings.map((d) => dayjs(d)),
          rangeStart: null,
          rangeEnd: null,
        };
      }
      case 'range': {
        const range = effectiveValue.date as { start: string | null; end: string | null };
        const startStr = toLocalDateString(range.start);
        const endStr = toLocalDateString(range.end);
        return {
          selectedDates: [],
          rangeStart: startStr ? dayjs(startStr) : null,
          rangeEnd: endStr ? dayjs(endStr) : null,
        };
      }
      default:
        return { selectedDates: [], rangeStart: null, rangeEnd: null };
    }
  }, [effectiveValue, mode, toLocalDateString]);

  // Handle date selection from calendar - always return ISO strings. Uses
  // `composeDateOnly` (fixed `pickerTimezone` anchor) when time.enabled is
  // false, `composeLocalDateTime` (plain local semantics) when true - see
  // the note above `pickerTimezone` for why these need to differ.
  const handleDateSelect = useCallback(
    (selectedDate: Dayjs) => {
      // `granularity === 'month'` means the calendar only ever hands us a
      // day *within* the picked month (see Calendar's month grid) - the
      // stored/returned value is always that month's last day, while the
      // day-of-week boundary semantics below ('start' of day vs 'end' of
      // day) are unaffected. Range *starts* are the exception: collapsing
      // the picked month to its last day would silently drop everything
      // earlier in the start month, so they anchor to the first instead.
      const effectiveDate = granularity === 'month' ? selectedDate.endOf('month') : selectedDate;
      const effectiveRangeStart =
        granularity === 'month' ? selectedDate.startOf('month') : selectedDate;
      const compareUnit = granularity === 'month' ? 'month' : 'day';

      switch (mode) {
        case 'single': {
          let dateWithTime: Dayjs;
          // Preserve whatever time the user already configured via
          // TimeInput rather than resetting to the default every time a
          // different date is picked.
          const activeTime = (effectiveValue?.time as TimeValue) ?? defaultStartTime;
          if (time.enabled) {
            dateWithTime = composeLocalDateTime(effectiveDate, activeTime);
          } else {
            dateWithTime = composeDateOnly(effectiveDate, 'start');
          }

          const newValue: DateTimeValue<T> = {
            date: dateWithTime.toISOString() as DateTimeValue<T>['date'],
            time: time.enabled ? (activeTime as DateTimeValue<T>['time']) : undefined,
          };

          commit(newValue);
          if (!showActions) setIsOpen(false);
          break;
        }

        case 'multiple': {
          const currentDates = (effectiveValue?.date as string[]) || [];
          const currentDayjs = currentDates.map((d) => dayjs(d));

          // Check if date is already selected
          const existingIndex = currentDayjs.findIndex((d) => d.isSame(effectiveDate, compareUnit));
          let newDates: Dayjs[];

          if (existingIndex >= 0) {
            // Remove if already selected
            newDates = currentDayjs.filter((_, index) => index !== existingIndex);
          } else {
            // Add new date, preserving the shared time already configured.
            const activeTime = (effectiveValue?.time as TimeValue) ?? defaultStartTime;
            const dateWithTime = time.enabled
              ? composeLocalDateTime(effectiveDate, activeTime)
              : composeDateOnly(effectiveDate, 'start');
            newDates = [...currentDayjs, dateWithTime];
          }

          // Always return ISO strings
          const newValue: DateTimeValue<T> = {
            date: newDates.map((d) => d.toISOString()) as DateTimeValue<T>['date'],
            time: time.enabled
              ? (((effectiveValue?.time as TimeValue) ??
                  defaultStartTime) as DateTimeValue<T>['time'])
              : undefined,
          };

          commit(newValue);
          break;
        }

        case 'range': {
          const currentRange = (effectiveValue?.date as {
            start: string | null;
            end: string | null;
          }) || {
            start: null,
            end: null,
          };
          const currentRangeTime = (effectiveValue?.time as RangeTimeValue) || {
            start: defaultStartTime,
            end: defaultEndTime,
          };

          if (!currentRange.start || (currentRange.start && currentRange.end)) {
            // Start new range, preserving the already-configured start time.
            // `effectiveRangeStart` anchors a month-granularity pick to the
            // month's FIRST day - the same pick that ends a range anchors to
            // its last, see `effectiveDate` above.
            const startWithTime = time.enabled
              ? composeLocalDateTime(effectiveRangeStart, currentRangeTime.start)
              : composeDateOnly(effectiveRangeStart, 'start');

            // Always return ISO string
            const newValue: DateTimeValue<T> = {
              date: { start: startWithTime.toISOString(), end: null } as DateTimeValue<T>['date'],
              time: time.enabled ? (currentRangeTime as DateTimeValue<T>['time']) : undefined,
            };

            commit(newValue);
          } else {
            // Complete the range. Date-only starts were anchored to
            // `pickerTimezone` when stored (see `composeDateOnly`) -
            // re-read it the same way so the "is end before start"
            // comparison below lines up with the day it actually
            // represents. Date+time starts were never anchored, so
            // they stay on local interpretation, matching how they
            // were written.
            const start = time.enabled
              ? dayjs(currentRange.start)
              : dayjs(currentRange.start).tz(pickerTimezone);
            let end = effectiveDate;

            // Ensure end is after start
            if (end.isBefore(start, compareUnit)) {
              end = start;
            }

            end = time.enabled
              ? composeLocalDateTime(end, currentRangeTime.end)
              : composeDateOnly(end, 'end');

            // Always return ISO strings
            const newValue: DateTimeValue<T> = {
              date: {
                start: currentRange.start,
                end: end.toISOString(),
              } as DateTimeValue<T>['date'],
              time: time.enabled ? (currentRangeTime as DateTimeValue<T>['time']) : undefined,
            };

            commit(newValue);
            if (!showActions) setIsOpen(false); // the range is complete
          }
          break;
        }
      }
    },
    [
      mode,
      time,
      effectiveValue,
      commit,
      showActions,
      defaultStartTime,
      defaultEndTime,
      composeDateOnly,
      composeLocalDateTime,
      pickerTimezone,
      granularity,
    ],
  );

  // Format display value
  const displayValue = useMemo(() => {
    if (!value?.date) return '';

    const displayFmt =
      format.displayFormat || (granularity === 'month' ? 'MMM YYYY' : 'MMM DD, YYYY');
    // Date-only values were anchored to `pickerTimezone` when stored (see
    // `composeDateOnly`) - display them in that same timezone rather than
    // the viewer's ambient one, so the trigger shows the actual calendar
    // date that was picked. Date+time values were deliberately never
    // anchored (see the note above `pickerTimezone`) - the viewer's own
    // local timezone is exactly what should convert that instant for
    // display, e.g. a UTC+3-scheduled 15:00 meeting showing as 12:00 to a
    // UTC+0 viewer.
    const parseDateOnlyAware = (iso: string) =>
      time.enabled ? dayjs(iso) : dayjs(iso).tz(pickerTimezone);

    switch (mode) {
      case 'single': {
        const date = parseDateOnlyAware(value.date as string);
        let result = date.format(displayFmt);
        if (time.enabled) {
          const timeStr = time.includeSeconds ? date.format('HH:mm:ss') : date.format('HH:mm');
          result += ` ${timeStr}`;
        }
        return result;
      }

      case 'multiple': {
        const dates = value.date as string[];
        if (time.enabled) {
          const formattedDates = dates.map((d) => {
            const date = parseDateOnlyAware(d);
            const dateStr = date.format(displayFmt);
            const timeStr = time.includeSeconds ? date.format('HH:mm:ss') : date.format('HH:mm');
            return `${dateStr} ${timeStr}`;
          });
          return formattedDates.join(', ');
        } else {
          const formattedDates = dates.map((d) => parseDateOnlyAware(d).format(displayFmt));
          return formattedDates.join(', ');
        }
      }

      case 'range': {
        const rangeValue = value.date as { start: string | null; end: string | null };
        const parts: string[] = [];

        if (rangeValue.start) {
          const startDate = parseDateOnlyAware(rangeValue.start);
          let startStr = startDate.format(displayFmt);
          if (time.enabled) {
            const timeStr = time.includeSeconds
              ? startDate.format('HH:mm:ss')
              : startDate.format('HH:mm');
            startStr += ` ${timeStr}`;
          }
          parts.push(startStr);
        }

        if (rangeValue.end) {
          const endDate = parseDateOnlyAware(rangeValue.end);
          let endStr = endDate.format(displayFmt);
          if (time.enabled) {
            const timeStr = time.includeSeconds
              ? endDate.format('HH:mm:ss')
              : endDate.format('HH:mm');
            endStr += ` ${timeStr}`;
          }
          parts.push(endStr);
        }

        return parts.join(' - ');
      }

      default:
        return '';
    }
  }, [value, mode, time, format, pickerTimezone, granularity]);

  // Handle clear
  const handleClear = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      const clearedValue = (() => {
        if (mode === 'multiple') {
          return {
            date: [] as unknown as DateTimeValue<T>['date'],
            time: time.enabled
              ? (defaultStartTime as unknown as DateTimeValue<T>['time'])
              : undefined,
          } as DateTimeValue<T>;
        } else if (mode === 'range') {
          return {
            date: { start: null, end: null } as unknown as DateTimeValue<T>['date'],
            time: time.enabled
              ? ({
                  start: defaultStartTime,
                  end: defaultEndTime,
                } as unknown as DateTimeValue<T>['time'])
              : undefined,
          } as DateTimeValue<T>;
        } else {
          return {
            date: null as unknown as DateTimeValue<T>['date'],
            time: time.enabled
              ? (defaultStartTime as unknown as DateTimeValue<T>['time'])
              : undefined,
          } as DateTimeValue<T>;
        }
      })();

      if (showActions && isOpen) {
        // A draft is in play: discard just the pending selection and stay
        // open - committing the clear still needs Apply.
        setDraft(clearedValue);
      } else {
        // No draft to discard (immediate mode, or the field X pressed
        // while the panel is closed): clear the committed value for real.
        onChange?.(clearedValue);
        setIsOpen(false);
      }
    },
    [mode, time, onChange, showActions, isOpen, defaultStartTime, defaultEndTime],
  );

  // Deferred-commit footer: Apply emits the draft (or the unchanged value
  // when nothing was picked), Cancel simply closes - the draft is dropped
  // by the close effect either way.
  const applyDraft = useCallback(() => {
    const next = draft ?? value;
    // `value` is optional and `applyDisabled` only guards an incomplete
    // range - with neither a draft nor a value there is nothing to emit,
    // so close without calling `onChange` rather than passing undefined.
    if (next !== undefined) onChange?.(next);
    setIsOpen(false);
  }, [onChange, draft, value]);

  const cancelDraft = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Preset active-state key: the calendar day (or month) an ISO string
  // represents, via the same timezone-aware read the calendar highlight
  // uses, so the comparison lands on the same day the grid shows.
  const presetCompareKey = useCallback(
    (iso: string) => {
      const day = toLocalDateString(iso);
      return day ? (granularity === 'month' ? day.slice(0, 7) : day) : '';
    },
    [toLocalDateString, granularity],
  );

  // A preset routes through the same `commit` switch as a calendar pick:
  // immediate mode commits and closes (the range is complete by
  // definition); `showActions` drafts it and Apply commits. The time half
  // of the effective value is carried over - a preset changes *which*
  // dates, not *when* in them.
  const handlePresetSelect = useCallback(
    (preset: DatePickerPreset<T>) => {
      const newValue = {
        date: preset.getValue(),
        time: time.enabled ? effectiveValue?.time : undefined,
      } as DateTimeValue<T>;
      commit(newValue);
      if (!showActions) setIsOpen(false);
    },
    [time.enabled, effectiveValue, commit, showActions],
  );

  // A range with a start but no end is a selection in progress - committing
  // it would emit a half-range, so Apply waits for the second pick.
  const applyDisabled =
    mode === 'range' &&
    !!draft &&
    !!(draft.date as { start: string | null; end: string | null }).start &&
    !(draft.date as { start: string | null; end: string | null }).end;

  // Create trigger element
  const triggerElement = (
    <div
      ref={triggerRef}
      className={`eidos-date-picker-trigger${fullWidth ? ` eidos-date-picker-trigger--full-width` : ''}`}
      // Handled here rather than on the `Input` so the keys work wherever inside
      // the field they are pressed. A click opens the calendar because it
      // bubbles to the overlay's trigger wrapper; a keypress has nothing
      // equivalent, so without this the field can be focused and cannot be
      // opened at all.
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
        } else if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          setIsOpen(false);
        }
      }}
    >
      <Input
        ref={fieldRef}
        value={displayValue}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        // A read-only field that opens a calendar is a combobox with a dialog
        // popup. `aria-controls` is gated on the panel existing - it is only
        // rendered while open, and naming an absent element is invalid.
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        // Forwarded, not just set on the wrapper above: the wrapper stretching
        // to 100% does nothing on its own while the Input inside it keeps its
        // own intrinsic width. Mirrors Select, which forwards it the same way.
        fullWidth={fullWidth}
        readOnly={true}
        preIcon={CalendarIcon}
        posIcon={displayValue ? X : undefined}
        posIconButton={!!displayValue}
        onPosIconClick={displayValue ? handleClear : undefined}
        // Latent until a date is picked, which is why no story caught it:
        // the button only renders once `displayValue` exists.
        posIconLabel="Clear date"
        {...inputProps}
        clearable={false}
      />
    </div>
  );

  // Create dropdown content with calendar(s) and time inputs
  const dropdownContent = (
    <div ref={panelRef} id={panelId} className={'eidos-date-picker-content'}>
      {/* Quick ranges - a wrapping row above the calendars, separated by a
          rule. It must not contribute to the panel's intrinsic width (the
          panel is `width: max-content`), which is what the SCSS rule's
          `width: 0` / `min-width: 100%` pair is for - see DatePicker.scss. */}
      {presets && presets.length > 0 && (
        <div className={'eidos-date-picker-presets'} role="group" aria-label="Quick ranges">
          {presets.map((preset) => {
            // Compared against the effective value so the highlight
            // follows a pending draft under `showActions`, not just the
            // committed one.
            const active = presetDateEquals(
              preset.getValue(),
              effectiveValue?.date,
              mode,
              presetCompareKey,
            );
            return (
              <Button
                key={preset.id}
                variant={active ? 'filled' : 'text'}
                color={active ? 'primary' : 'info'}
                size="sm"
                aria-pressed={active}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Multiple calendars with container-level navigation */}
      <div className={'eidos-date-picker-calendars-wrapper'}>
        {Array.from({ length: numberOfCalendars }, (_, index) => {
          const calendarDate = calendarDates[index] ?? dayjs().add(index, 'month');
          return (
            <Calendar
              key={index}
              currentDate={calendarDate}
              selectedDates={selectedDates}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              mode={mode}
              granularity={granularity}
              onDateSelect={handleDateSelect}
              onMonthChange={(newDate) => handleCalendarMonthChange(index, newDate)}
              minDate={minDateObj}
              maxDate={maxDateObj}
              disabledDates={disabledDatesObj}
              disabledDaysOfWeek={disabledDaysOfWeek}
              showWeekNumbers={calendar.showWeekNumbers}
              firstDayOfWeek={calendar.firstDayOfWeek}
              // Non-independent: only the first calendar's control is
              // interactive, since it's the one every other calendar
              // actually follows. Independent: every calendar gets one.
              showNavigation={independentCalendars || index === 0}
            />
          );
        })}
      </div>

      {/* Time inputs */}
      {time.enabled && (
        <div className={'eidos-date-picker-time-container'}>
          {mode === 'single' && (
            <TimeInput
              value={(effectiveValue?.time as TimeValue) || defaultStartTime}
              onChange={(newTime) => {
                // Recompose the actual returned value with the new
                // time, not just the separate `time` field - see
                // `recomposeIsoWithTime`.
                const currentIso = effectiveValue?.date as string | null;
                const newValue = {
                  ...effectiveValue,
                  date: (currentIso
                    ? recomposeIsoWithTime(currentIso, newTime)
                    : currentIso) as DateTimeValue<T>['date'],
                  time: newTime,
                } as DateTimeValue<T>;
                commit(newValue);
              }}
              includeSeconds={time.includeSeconds}
              disabled={disabled}
              label="Time"
            />
          )}

          {mode === 'multiple' && (
            <TimeInput
              value={(effectiveValue?.time as TimeValue) || defaultStartTime}
              onChange={(newTime) => {
                // Recompose every selected date with the new shared
                // time - see `recomposeIsoWithTime`.
                const currentDates = (effectiveValue?.date as string[]) || [];
                const newValue = {
                  ...effectiveValue,
                  date: currentDates.map((d) =>
                    recomposeIsoWithTime(d, newTime),
                  ) as DateTimeValue<T>['date'],
                  time: newTime,
                } as DateTimeValue<T>;
                commit(newValue);
              }}
              includeSeconds={time.includeSeconds}
              disabled={disabled}
              label="Time for all dates"
            />
          )}

          {mode === 'range' && (
            <div className={'eidos-date-picker-range-time-inputs'}>
              <TimeInput
                value={(effectiveValue?.time as RangeTimeValue)?.start || defaultStartTime}
                onChange={(newTime) => {
                  const currentRangeTime = (effectiveValue?.time as RangeTimeValue) || {
                    start: defaultStartTime,
                    end: defaultEndTime,
                  };
                  // Recompose just the start of the range with the new
                  // time - see `recomposeIsoWithTime`.
                  const currentRange = (effectiveValue?.date as {
                    start: string | null;
                    end: string | null;
                  }) || {
                    start: null,
                    end: null,
                  };
                  const newValue = {
                    ...effectiveValue,
                    date: {
                      ...currentRange,
                      start: currentRange.start
                        ? recomposeIsoWithTime(currentRange.start, newTime)
                        : currentRange.start,
                    } as DateTimeValue<T>['date'],
                    time: {
                      ...currentRangeTime,
                      start: newTime,
                    },
                  } as DateTimeValue<T>;
                  commit(newValue);
                }}
                includeSeconds={time.includeSeconds}
                disabled={disabled}
                label="Start time"
              />
              <TimeInput
                value={(effectiveValue?.time as RangeTimeValue)?.end || defaultEndTime}
                onChange={(newTime) => {
                  const currentRangeTime = (effectiveValue?.time as RangeTimeValue) || {
                    start: defaultStartTime,
                    end: defaultEndTime,
                  };
                  // Recompose just the end of the range with the new
                  // time - see `recomposeIsoWithTime`.
                  const currentRange = (effectiveValue?.date as {
                    start: string | null;
                    end: string | null;
                  }) || {
                    start: null,
                    end: null,
                  };
                  const newValue = {
                    ...effectiveValue,
                    date: {
                      ...currentRange,
                      end: currentRange.end
                        ? recomposeIsoWithTime(currentRange.end, newTime)
                        : currentRange.end,
                    } as DateTimeValue<T>['date'],
                    time: {
                      ...currentRangeTime,
                      end: newTime,
                    },
                  } as DateTimeValue<T>;
                  commit(newValue);
                }}
                includeSeconds={time.includeSeconds}
                disabled={disabled}
                label="End time"
              />
            </div>
          )}
        </div>
      )}

      {/* Deferred-commit actions - only rendered when showActions is on */}
      {showActions && (
        <div className={'eidos-date-picker-actions'}>
          <Button variant="text" color="secondary" onClick={cancelDraft}>
            Cancel
          </Button>
          <Button variant="filled" color="primary" disabled={applyDisabled} onClick={applyDraft}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`eidos-date-picker-container${fullWidth ? ` eidos-date-picker-container--full-width` : ''} ${className}`.trim()}
    >
      <Dropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={triggerElement}
        content={dropdownContent}
        placement="bottom"
        minWidth={minWidth}
        maxWidth={maxWidth || 'none'}
        minHeight={minHeight}
        maxHeight={maxHeight || 'none'}
        autoWidth={autoWidth}
        // Dropdown wraps `trigger` in its own `.eidos-dropdown-trigger` div,
        // which stays shrink-to-fit unless told otherwise - so without this,
        // `fullWidth` stopped at that wrapper and the trigger input never
        // stretched. Select forwards it here for the same reason.
        fullWidth={fullWidth}
        triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
      />
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
