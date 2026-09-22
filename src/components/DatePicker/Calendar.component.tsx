import React, { useMemo, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Initialize dayjs plugins
dayjs.extend(weekOfYear);
import { Select } from '../Select/Select.component';
import type { CalendarProps } from './DatePicker.types';
import { Button } from '../Button/Button.component';

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  selectedDates,
  rangeStart,
  rangeEnd,
  // mode, // TODO: Use this for different selection behaviors
  granularity = 'day',
  onDateSelect,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  showWeekNumbers = false,
  firstDayOfWeek = 1, // Monday
  showNavigation = true,
}) => {
  // Generate month options (12 months)
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i.toString(),
      label: dayjs().month(i).format('MMMM'),
      value: i.toString(),
    }));
  }, []);

  // Generate year options (current year ± 50 years)
  const yearOptions = useMemo(() => {
    const currentYear = dayjs().year();
    const years = [];
    for (let year = currentYear - 50; year <= currentYear + 50; year++) {
      years.push({
        id: year.toString(),
        label: year.toString(),
        value: year.toString(),
      });
    }
    return years;
  }, []);

  // Handle month selection
  const handleMonthSelect = useCallback(
    (value: string | string[]) => {
      if (typeof value === 'string') {
        const newDate = currentDate.month(parseInt(value));
        onMonthChange(newDate);
      }
    },
    [currentDate, onMonthChange],
  );

  // Handle year selection
  const handleYearSelect = useCallback(
    (value: string | string[]) => {
      if (typeof value === 'string') {
        const newDate = currentDate.year(parseInt(value));
        onMonthChange(newDate);
      }
    },
    [currentDate, onMonthChange],
  );

  // Handle navigation arrows
  const handlePrevMonth = useCallback(() => {
    onMonthChange(currentDate.subtract(1, 'month'));
  }, [currentDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    onMonthChange(currentDate.add(1, 'month'));
  }, [currentDate, onMonthChange]);

  const handlePrevYear = useCallback(() => {
    onMonthChange(currentDate.subtract(1, 'year'));
  }, [currentDate, onMonthChange]);

  const handleNextYear = useCallback(() => {
    onMonthChange(currentDate.add(1, 'year'));
  }, [currentDate, onMonthChange]);

  // Generate the 12 months of `currentDate`'s year - used instead of
  // `calendarDays` when `granularity === 'month'`.
  const monthCells = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = currentDate.month(i).startOf('month');
      const isToday = monthDate.isSame(dayjs(), 'month');
      const isSelected = selectedDates.some((date) => date.isSame(monthDate, 'month'));
      const isDisabled =
        (minDate && monthDate.endOf('month').isBefore(minDate, 'month')) ||
        (maxDate && monthDate.isAfter(maxDate, 'month'));

      const isRangeStart = rangeStart?.isSame(monthDate, 'month') || false;
      const isRangeEnd = rangeEnd?.isSame(monthDate, 'month') || false;
      const isInRange =
        rangeStart &&
        rangeEnd &&
        monthDate.isAfter(rangeStart, 'month') &&
        monthDate.isBefore(rangeEnd, 'month');

      return {
        date: monthDate,
        isToday,
        isSelected,
        isDisabled,
        isRangeStart,
        isRangeEnd,
        isInRange,
      };
    });
  }, [currentDate, selectedDates, rangeStart, rangeEnd, minDate, maxDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');

    // Get the first day of the week for the first day of the month
    let startOfCalendar = startOfMonth.startOf('week');
    if (firstDayOfWeek === 1) {
      // Monday
      startOfCalendar =
        startOfMonth.day() === 0
          ? startOfMonth.subtract(6, 'day')
          : startOfMonth.startOf('week').add(1, 'day');
    }

    // Generate 42 days (6 weeks * 7 days)
    const days = [];
    let current = startOfCalendar;

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = current.month() === currentDate.month();
      const isToday = current.isSame(dayjs(), 'day');
      const isSelected = selectedDates.some((date) => date.isSame(current, 'day'));
      const isDisabled =
        (minDate && current.isBefore(minDate, 'day')) ||
        (maxDate && current.isAfter(maxDate, 'day')) ||
        disabledDates.some((date) => date.isSame(current, 'day')) ||
        disabledDaysOfWeek.includes(current.day());

      // Range logic
      const isRangeStart = rangeStart?.isSame(current, 'day') || false;
      const isRangeEnd = rangeEnd?.isSame(current, 'day') || false;
      const isInRange =
        rangeStart &&
        rangeEnd &&
        current.isAfter(rangeStart, 'day') &&
        current.isBefore(rangeEnd, 'day');

      days.push({
        date: current,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
        isRangeStart,
        isRangeEnd,
        isInRange,
      });

      current = current.add(1, 'day');
    }

    return days;
  }, [
    currentDate,
    selectedDates,
    rangeStart,
    rangeEnd,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    firstDayOfWeek,
  ]);

  // Generate weekday headers
  const weekDays = useMemo(() => {
    const days = [];
    let start =
      firstDayOfWeek === 0 ? dayjs().startOf('week') : dayjs().startOf('week').add(1, 'day');

    for (let i = 0; i < 7; i++) {
      days.push(start.format('dd'));
      start = start.add(1, 'day');
    }
    return days;
  }, [firstDayOfWeek]);

  // Handle date click
  const handleDateClick = useCallback(
    (date: Dayjs) => {
      onDateSelect(date);
    },
    [onDateSelect],
  );

  return (
    <div className={'eidos-calendar'}>
      {/* Header with navigation - only interactive when this calendar actually
			    navigates independently of its neighbors (see `showNavigation` doc).
			    Showing editable, interactive controls that silently move a sibling
			    calendar instead of themselves is exactly the confusing behavior this
			    is meant to avoid; a plain label is honest about what will happen. */}
      <div className={'eidos-calendar-header'}>
        {showNavigation ? (
          granularity === 'month' ? (
            <>
              <Button
                variant="text"
                icon={ChevronLeft}
                onClick={handlePrevYear}
                aria-label="Previous year"
              />

              <div className={'eidos-calendar-selectors'}>
                <Select
                  options={yearOptions}
                  value={currentDate.year().toString()}
                  onChange={handleYearSelect}
                  clearable={false}
                  inputProps={{ 'aria-label': 'Year' }}
                  dropdownProps={{
                    dropdownGroup: 'calendar-navigation',
                  }}
                />
              </div>

              <Button
                variant="text"
                icon={ChevronRight}
                onClick={handleNextYear}
                aria-label="Next year"
              />
            </>
          ) : (
            <>
              <Button
                variant="text"
                icon={ChevronLeft}
                onClick={handlePrevMonth}
                aria-label="Previous month"
              />

              <div className={'eidos-calendar-selectors'}>
                <Select
                  options={monthOptions}
                  value={currentDate.month().toString()}
                  onChange={handleMonthSelect}
                  clearable={false}
                  inputProps={{ 'aria-label': 'Month' }}
                  dropdownProps={{
                    dropdownGroup: 'calendar-navigation',
                  }}
                />
                <Select
                  options={yearOptions}
                  value={currentDate.year().toString()}
                  onChange={handleYearSelect}
                  clearable={false}
                  inputProps={{ 'aria-label': 'Year' }}
                  dropdownProps={{
                    dropdownGroup: 'calendar-navigation',
                  }}
                />
              </div>

              <Button
                variant="text"
                icon={ChevronRight}
                onClick={handleNextMonth}
                aria-label="Next month"
              />
            </>
          )
        ) : (
          <div className={'eidos-calendar-label'}>
            {currentDate.format(granularity === 'month' ? 'YYYY' : 'MMMM YYYY')}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      {granularity === 'month' ? (
        <div className={'eidos-calendar-month-cells'}>
          {monthCells.map((month, index) => (
            <button
              key={index}
              type="button"
              className={`eidos-calendar-date-cell eidos-calendar-month-cell ${month.isToday ? 'eidos-calendar-today' : ''} ${month.isSelected ? 'eidos-calendar-selected' : ''} ${month.isDisabled ? 'eidos-calendar-disabled' : ''} ${month.isRangeStart ? 'eidos-calendar-range-start' : ''} ${month.isRangeEnd ? 'eidos-calendar-range-end' : ''} ${month.isInRange ? 'eidos-calendar-in-range' : ''}`.trim()}
              onClick={() => !month.isDisabled && handleDateClick(month.date)}
              disabled={month.isDisabled}
            >
              {month.date.format('MMM')}
            </button>
          ))}
        </div>
      ) : (
        <div className={'eidos-calendar-grid'}>
          {/* Week numbers column (optional) */}
          {showWeekNumbers && (
            <div className={'eidos-calendar-week-numbers-column'}>
              <div className={'eidos-calendar-week-number-header'}></div>
              {Array.from({ length: 6 }, (_, weekIndex) => {
                const weekStart = calendarDays[weekIndex * 7].date;
                return (
                  <div key={weekIndex} className={'eidos-calendar-week-number'}>
                    {weekStart.format('W')}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main calendar content */}
          <div className={'eidos-calendar-content'}>
            {/* Weekday headers */}
            <div className={'eidos-calendar-week-days'}>
              {weekDays.map((day, index) => (
                <div key={index} className={'eidos-calendar-week-day'}>
                  {day}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className={'eidos-calendar-date-cells'}>
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  className={`eidos-calendar-date-cell ${!day.isCurrentMonth ? 'eidos-calendar-other-month' : ''} ${day.isToday ? 'eidos-calendar-today' : ''} ${day.isSelected ? 'eidos-calendar-selected' : ''} ${day.isDisabled ? 'eidos-calendar-disabled' : ''} ${day.isRangeStart ? 'eidos-calendar-range-start' : ''} ${day.isRangeEnd ? 'eidos-calendar-range-end' : ''} ${day.isInRange ? 'eidos-calendar-in-range' : ''}`.trim()}
                  onClick={() => !day.isDisabled && handleDateClick(day.date)}
                  disabled={day.isDisabled}
                >
                  {day.date.date()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
