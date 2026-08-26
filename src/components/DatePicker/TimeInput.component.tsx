import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../Input/Input.component';
import type { TimeValue } from './DatePicker.types';

export interface TimeInputProps {
	value: TimeValue;
	onChange: (time: TimeValue) => void;
	includeSeconds?: boolean;
	disabled?: boolean;
	label?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
	value,
	onChange,
	includeSeconds = false,
	disabled = false,
	label = 'Time',
}) => {
	const [hours, setHours] = useState(value.hours.toString().padStart(2, '0'));
	const [minutes, setMinutes] = useState(value.minutes.toString().padStart(2, '0'));
	const [seconds, setSeconds] = useState((value.seconds || 0).toString().padStart(2, '0'));

	// Update local state when value prop changes
	useEffect(() => {
		setHours(value.hours.toString().padStart(2, '0'));
		setMinutes(value.minutes.toString().padStart(2, '0'));
		setSeconds((value.seconds || 0).toString().padStart(2, '0'));
	}, [value]);

	const handleTimeChange = useCallback(
		(newHours: number, newMinutes: number, newSeconds: number) => {
			onChange({
				hours: newHours,
				minutes: newMinutes,
				seconds: newSeconds,
			});
		},
		[onChange]
	);

	const handleHoursChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newHours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
			setHours(newHours.toString().padStart(2, '0'));
			handleTimeChange(newHours, value.minutes, value.seconds || 0);
		},
		[handleTimeChange, value.minutes, value.seconds]
	);

	const handleMinutesChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newMinutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
			setMinutes(newMinutes.toString().padStart(2, '0'));
			handleTimeChange(value.hours, newMinutes, value.seconds || 0);
		},
		[handleTimeChange, value.hours, value.seconds]
	);

	const handleSecondsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newSeconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
			setSeconds(newSeconds.toString().padStart(2, '0'));
			handleTimeChange(value.hours, value.minutes, newSeconds);
		},
		[handleTimeChange, value.hours, value.minutes]
	);

	return (
		<div className={'eidos-time-input'}>
			{label && <label className={'eidos-time-input-label'}>{label}</label>}
			<div className={'eidos-time-input-inputs'}>
				<div className={'eidos-time-input-input-group'}>
					<Input
						type="number"
						value={hours}
						onChange={handleHoursChange}
						disabled={disabled}
						min={0}
						max={23}
						placeholder="HH"
						size="sm"
						className={'eidos-time-input-time-field'}
					/>
					<span className={'eidos-time-input-separator'}>:</span>
				</div>
				<div className={'eidos-time-input-input-group'}>
					<Input
						type="number"
						value={minutes}
						onChange={handleMinutesChange}
						disabled={disabled}
						min={0}
						max={59}
						placeholder="MM"
						size="sm"
						className={'eidos-time-input-time-field'}
					/>
					{includeSeconds && <span className={'eidos-time-input-separator'}>:</span>}
				</div>
				{includeSeconds && (
					<div className={'eidos-time-input-input-group'}>
						<Input
							type="number"
							value={seconds}
							onChange={handleSecondsChange}
							disabled={disabled}
							min={0}
							max={59}
							placeholder="SS"
							size="sm"
							className={'eidos-time-input-time-field'}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
