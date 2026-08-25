import React, { useState, useCallback, useRef, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Input } from '../Input/Input.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { Calendar } from './Calendar.component';
import { TimeInput } from './TimeInput.component';
import type { DatePickerProps, DateSelectionMode, DateTimeValue, TimeValue, RangeTimeValue } from './DatePicker.types';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const DatePicker = <T extends DateSelectionMode = 'single'>({
	mode,
	value,
	onChange,
	time = { enabled: false },
	calendar = { numberOfCalendars: 2 },
	format = {
		displayFormat: 'MMM DD, YYYY',
		inputFormat: 'YYYY-MM-DD',
		timeFormat: 'HH:mm',
		timezone: 'UTC',
	},
	placeholder = 'Select date...',
	disabled = false,
	required = false,
	name,
	id,
	inputProps = {},
	// minDate,
	// maxDate,
	// disabledDates = [],
	// disabledDaysOfWeek = [],
	className = '',
	fullWidth = false,
	minWidth,
	maxWidth,
	minHeight,
	maxHeight,
	autoWidth = false,
}: DatePickerProps<T>) => {
	const [dropdownKey, setDropdownKey] = useState(0);
	const [currentCalendarDate, setCurrentCalendarDate] = useState(dayjs());
	const triggerRef = useRef<HTMLDivElement>(null);

	// Default time values
	const defaultStartTime = useMemo<TimeValue>(() => ({ hours: 0, minutes: 0, seconds: 0 }), []);
	const defaultEndTime = useMemo<TimeValue>(() => ({ hours: 23, minutes: 59, seconds: 59 }), []);

	// Helper function to convert ISO strings to local date strings for calendar display
	const toLocalDateString = (isoString: string | null): string | null => {
		if (!isoString) return null;
		// Extract just the date part from ISO string for calendar display
		return dayjs(isoString).format('YYYY-MM-DD');
	};

	// Convert current value to calendar-compatible format
	const { selectedDates, rangeStart, rangeEnd } = useMemo(() => {
		if (!value?.date) {
			return { selectedDates: [], rangeStart: null, rangeEnd: null };
		}

		switch (mode) {
			case 'single': {
				const isoString = value.date as string | null;
				const localDateStr = toLocalDateString(isoString);
				return {
					selectedDates: localDateStr ? [dayjs(localDateStr)] : [],
					rangeStart: null,
					rangeEnd: null,
				};
			}
			case 'multiple': {
				const isoStrings = value.date as string[];
				const localDateStrings = isoStrings.map(d => toLocalDateString(d)).filter(Boolean) as string[];
				return {
					selectedDates: localDateStrings.map(d => dayjs(d)),
					rangeStart: null,
					rangeEnd: null,
				};
			}
			case 'range': {
				const range = value.date as { start: string | null; end: string | null };
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
	}, [value, mode]);

	// Handle date selection from calendar - always return ISO strings
	const handleDateSelect = useCallback(
		(selectedDate: Dayjs) => {
			switch (mode) {
				case 'single': {
					// Apply default time if time is enabled
					let dateWithTime: Dayjs;
					if (time.enabled) {
						dateWithTime = selectedDate
							.hour(defaultStartTime.hours)
							.minute(defaultStartTime.minutes)
							.second(defaultStartTime.seconds || 0);
					} else {
						// Set to start of day in local timezone for consistent ISO string
						// Create a new date at midnight in local timezone
						const year = selectedDate.year();
						const month = selectedDate.month();
						const date = selectedDate.date();
						dateWithTime = dayjs(new Date(year, month, date, 0, 0, 0));
					}

					// Always return ISO string
					const newValue: DateTimeValue<T> = {
						date: dateWithTime.toISOString() as DateTimeValue<T>['date'],
						time: time.enabled ? (defaultStartTime as DateTimeValue<T>['time']) : undefined,
					};

					onChange?.(newValue);
					setDropdownKey(prev => prev + 1); // Close dropdown
					break;
				}

				case 'multiple': {
					const currentDates = (value?.date as string[]) || [];
					const currentDayjs = currentDates.map(d => dayjs(d));

					// Check if date is already selected
					const existingIndex = currentDayjs.findIndex(d => d.isSame(selectedDate, 'day'));
					let newDates: Dayjs[];

					if (existingIndex >= 0) {
						// Remove if already selected
						newDates = currentDayjs.filter((_, index) => index !== existingIndex);
					} else {
						// Add new date
						let dateWithTime: Dayjs;
						if (time.enabled) {
							dateWithTime = selectedDate
								.hour(defaultStartTime.hours)
								.minute(defaultStartTime.minutes)
								.second(defaultStartTime.seconds || 0);
						} else {
							// Set to start of day for consistent ISO string
							dateWithTime = selectedDate.startOf('day');
						}
						newDates = [...currentDayjs, dateWithTime];
					}

					// Always return ISO strings
					const newValue: DateTimeValue<T> = {
						date: newDates.map(d => d.toISOString()) as DateTimeValue<T>['date'],
						time: time.enabled ? (defaultStartTime as DateTimeValue<T>['time']) : undefined,
					};

					onChange?.(newValue);
					break;
				}

				case 'range': {
					const currentRange = (value?.date as { start: string | null; end: string | null }) || {
						start: null,
						end: null,
					};

					if (!currentRange.start || (currentRange.start && currentRange.end)) {
						// Start new range
						let startWithTime: Dayjs;
						if (time.enabled) {
							startWithTime = selectedDate
								.hour(defaultStartTime.hours)
								.minute(defaultStartTime.minutes)
								.second(defaultStartTime.seconds || 0);
						} else {
							// Set to start of day for consistent ISO string
							startWithTime = selectedDate.startOf('day');
						}

						// Always return ISO string
						const newValue: DateTimeValue<T> = {
							date: { start: startWithTime.toISOString(), end: null } as DateTimeValue<T>['date'],
							time: time.enabled
								? ({
										start: defaultStartTime,
										end: defaultEndTime,
									} as DateTimeValue<T>['time'])
								: undefined,
						};

						onChange?.(newValue);
					} else {
						// Complete the range
						const start = dayjs(currentRange.start);
						let end = selectedDate;

						// Ensure end is after start
						if (end.isBefore(start, 'day')) {
							end = start;
						}

						if (time.enabled) {
							end = end
								.hour(defaultEndTime.hours)
								.minute(defaultEndTime.minutes)
								.second(defaultEndTime.seconds || 0);
						} else {
							// Set to end of day for consistent ISO string
							end = end.endOf('day');
						}

						// Always return ISO strings
						const newValue: DateTimeValue<T> = {
							date: {
								start: currentRange.start,
								end: end.toISOString(),
							} as DateTimeValue<T>['date'],
							time: time.enabled
								? ({
										start: defaultStartTime,
										end: defaultEndTime,
									} as DateTimeValue<T>['time'])
								: undefined,
						};

						onChange?.(newValue);
						setDropdownKey(prev => prev + 1); // Close dropdown after completing range
					}
					break;
				}
			}
		},
		[mode, time, value, onChange, defaultStartTime, defaultEndTime]
	);

	// Format display value
	const displayValue = useMemo(() => {
		if (!value?.date) return '';

		const displayFmt = format.displayFormat || 'MMM DD, YYYY';

		switch (mode) {
			case 'single': {
				const date = dayjs(value.date as string);
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
					const formattedDates = dates.map(d => {
						const date = dayjs(d);
						const dateStr = date.format(displayFmt);
						const timeStr = time.includeSeconds ? date.format('HH:mm:ss') : date.format('HH:mm');
						return `${dateStr} ${timeStr}`;
					});
					return formattedDates.join(', ');
				} else {
					const formattedDates = dates.map(d => dayjs(d).format(displayFmt));
					return formattedDates.join(', ');
				}
			}

			case 'range': {
				const rangeValue = value.date as { start: string | null; end: string | null };
				const parts: string[] = [];

				if (rangeValue.start) {
					const startDate = dayjs(rangeValue.start);
					let startStr = startDate.format(displayFmt);
					if (time.enabled) {
						const timeStr = time.includeSeconds ? startDate.format('HH:mm:ss') : startDate.format('HH:mm');
						startStr += ` ${timeStr}`;
					}
					parts.push(startStr);
				}

				if (rangeValue.end) {
					const endDate = dayjs(rangeValue.end);
					let endStr = endDate.format(displayFmt);
					if (time.enabled) {
						const timeStr = time.includeSeconds ? endDate.format('HH:mm:ss') : endDate.format('HH:mm');
						endStr += ` ${timeStr}`;
					}
					parts.push(endStr);
				}

				return parts.join(' - ');
			}

			default:
				return '';
		}
	}, [value, mode, time, format]);

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
						time: time.enabled ? (defaultStartTime as unknown as DateTimeValue<T>['time']) : undefined,
					} as DateTimeValue<T>;
				} else if (mode === 'range') {
					return {
						date: { start: null, end: null } as unknown as DateTimeValue<T>['date'],
						time: time.enabled
							? ({ start: defaultStartTime, end: defaultEndTime } as unknown as DateTimeValue<T>['time'])
							: undefined,
					} as DateTimeValue<T>;
				} else {
					return {
						date: null as unknown as DateTimeValue<T>['date'],
						time: time.enabled ? (defaultStartTime as unknown as DateTimeValue<T>['time']) : undefined,
					} as DateTimeValue<T>;
				}
			})();

			onChange?.(clearedValue);
			setDropdownKey(prev => prev + 1); // Close dropdown
		},
		[mode, time, onChange, defaultStartTime, defaultEndTime]
	);

	// Create trigger element
	const triggerElement = (
		<div ref={triggerRef} className={`eidos-date-picker-trigger${fullWidth ? ' eidos-date-picker-trigger--fullWidth' : ''}`}>
			<Input
				value={displayValue}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				name={name}
				id={id}
				readOnly={true}
				preIcon={CalendarIcon}
				posIcon={displayValue ? X : undefined}
				posIconButton={!!displayValue}
				onPosIconClick={displayValue ? handleClear : undefined}
				{...inputProps}
				clearable={false}
			/>
		</div>
	);

	// Create dropdown content with calendar(s) and time inputs
	const dropdownContent = (
		<div className={'eidos-date-picker-content'}>
			{/* Multiple calendars with container-level navigation */}
			<div className={'eidos-date-picker-calendars-wrapper'}>
				{Array.from({ length: calendar.numberOfCalendars || 2 }, (_, index) => {
					const calendarDate = currentCalendarDate.add(index, 'month');
					return (
						<Calendar
							key={index}
							currentDate={calendarDate}
							selectedDates={selectedDates}
							rangeStart={rangeStart}
							rangeEnd={rangeEnd}
							mode={mode}
							onDateSelect={handleDateSelect}
							onMonthChange={newDate => {
								// Update the current calendar date based on which calendar was changed
								if (index === 0) {
									setCurrentCalendarDate(newDate);
								} else {
									// For subsequent calendars, adjust the first calendar accordingly
									setCurrentCalendarDate(newDate.subtract(index, 'month'));
								}
							}}
							showWeekNumbers={calendar.showWeekNumbers}
							firstDayOfWeek={calendar.firstDayOfWeek}
							showNavigation={(calendar.numberOfCalendars || 2) === 1} // Show navigation only for single calendar
						/>
					);
				})}
			</div>

			{/* Time inputs */}
			{time.enabled && (
				<div className={'eidos-date-picker-time-container'}>
					{mode === 'single' && (
						<TimeInput
							value={(value?.time as TimeValue) || defaultStartTime}
							onChange={newTime => {
								const newValue = {
									...value,
									time: newTime,
								} as DateTimeValue<T>;
								onChange?.(newValue);
							}}
							includeSeconds={time.includeSeconds}
							disabled={disabled}
							label="Time"
						/>
					)}

					{mode === 'multiple' && (
						<TimeInput
							value={(value?.time as TimeValue) || defaultStartTime}
							onChange={newTime => {
								const newValue = {
									...value,
									time: newTime,
								} as DateTimeValue<T>;
								onChange?.(newValue);
							}}
							includeSeconds={time.includeSeconds}
							disabled={disabled}
							label="Time for all dates"
						/>
					)}

					{mode === 'range' && (
						<div className={'eidos-date-picker-range-time-inputs'}>
							<TimeInput
								value={(value?.time as RangeTimeValue)?.start || defaultStartTime}
								onChange={newTime => {
									const currentRangeTime = (value?.time as RangeTimeValue) || {
										start: defaultStartTime,
										end: defaultEndTime,
									};
									const newValue = {
										...value,
										time: {
											...currentRangeTime,
											start: newTime,
										},
									} as DateTimeValue<T>;
									onChange?.(newValue);
								}}
								includeSeconds={time.includeSeconds}
								disabled={disabled}
								label="Start time"
							/>
							<TimeInput
								value={(value?.time as RangeTimeValue)?.end || defaultEndTime}
								onChange={newTime => {
									const currentRangeTime = (value?.time as RangeTimeValue) || {
										start: defaultStartTime,
										end: defaultEndTime,
									};
									const newValue = {
										...value,
										time: {
											...currentRangeTime,
											end: newTime,
										},
									} as DateTimeValue<T>;
									onChange?.(newValue);
								}}
								includeSeconds={time.includeSeconds}
								disabled={disabled}
								label="End time"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div className={`eidos-date-picker-container${fullWidth ? ' eidos-date-picker-container--fullWidth' : ''} ${className}`.trim()}>
			<Dropdown
				key={dropdownKey}
				trigger={triggerElement}
				content={dropdownContent}
				placement="bottom"
				minWidth={minWidth}
				maxWidth={maxWidth || 'none'}
				minHeight={minHeight}
				maxHeight={maxHeight || 'none'}
				autoWidth={autoWidth}
				triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
			/>
		</div>
	);
};

DatePicker.displayName = 'DatePicker';
