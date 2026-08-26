import React, { forwardRef, useState, useEffect, useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { NumberInputProps } from './NumberInput.types';

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
	(
		{
			value,
			defaultValue = 0,
			onChange,
			min,
			max,
			step = 1,
			precision = 0,
			placeholder,
			disabled = false,
			readOnly = false,
			label,
			helperText,
			error = false,
			errorMessage,
			size = 'md',
			fullWidth = false,
			allowTyping = true,
			className = '',
			id,
			name,
		},
		ref
	) => {
		const generatedId = useId();
		const inputId = id || `number-input-${generatedId}`;

		// Controlled / uncontrolled bridge
		const isControlled = value !== undefined;
		const [localValue, setLocalValue] = useState<number>(defaultValue);

		// Intermediate text while the user is actively typing
		const [inputText, setInputText] = useState<string>(defaultValue.toFixed(precision));
		const [isFocused, setIsFocused] = useState(false);

		const currentValue = isControlled ? value! : localValue;

		// When min/max props change (e.g. via Storybook controls), clamp the
		// uncontrolled localValue so the display never shows an out-of-range value.
		useEffect(() => {
			if (isControlled) return;
			setLocalValue((prev) => {
				let result = prev;
				if (min !== undefined) result = Math.max(min, result);
				if (max !== undefined) result = Math.min(max, result);
				return parseFloat(result.toFixed(precision));
			});
		}, [min, max, precision, isControlled]);

		// Clamp to [min, max] and apply precision rounding
		const clampValue = (raw: number): number => {
			let result = raw;
			if (min !== undefined) result = Math.max(min, result);
			if (max !== undefined) result = Math.min(max, result);
			return parseFloat(result.toFixed(precision));
		};

		const commitValue = (newVal: number) => {
			const clamped = clampValue(newVal);
			if (!isControlled) setLocalValue(clamped);
			onChange?.(clamped);
		};

		// ── Stepper buttons ────────────────────────────────────────────────────
		const handleDecrement = () => {
			if (disabled || readOnly) return;
			commitValue(currentValue - step);
		};

		const handleIncrement = () => {
			if (disabled || readOnly) return;
			commitValue(currentValue + step);
		};

		// ── Typing mode handlers ───────────────────────────────────────────────
		const handleTextFocus = () => {
			setInputText(currentValue.toFixed(precision));
			setIsFocused(true);
		};

		const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setInputText(e.target.value);
		};

		const handleTextBlur = () => {
			setIsFocused(false);
			const parsed = parseFloat(inputText);
			if (!isNaN(parsed)) {
				const clamped = clampValue(parsed);
				if (!isControlled) setLocalValue(clamped);
				onChange?.(clamped);
				setInputText(clamped.toFixed(precision));
			} else {
				// Revert to the last known-good value
				setInputText(currentValue.toFixed(precision));
			}
		};

		// ArrowUp / ArrowDown keyboard support for both display modes
		const handleDisplayKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				handleIncrement();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				handleDecrement();
			}
		};

		// ── Display value ──────────────────────────────────────────────────────
		// Show intermediate inputText while focused in typing mode;
		// otherwise always derive from the real (controlled/uncontrolled) value.
		const formattedValue = currentValue.toFixed(precision);
		const displayedText = allowTyping && isFocused ? inputText : formattedValue;

		// ── Disabled states for buttons ────────────────────────────────────────
		const isDecrementDisabled =
			disabled || readOnly || (min !== undefined && currentValue <= min);
		const isIncrementDisabled =
			disabled || readOnly || (max !== undefined && currentValue >= max);

		// ── CSS classes ────────────────────────────────────────────────────────
		const rootClasses = [
			'eidos-number-input',
			`eidos-number-input--${size}`,
			fullWidth && 'eidos-number-input--fullWidth',
			error && 'eidos-number-input--error',
			className,
		]
			.filter(Boolean)
			.join(' ');

		const controlClasses = [
			'eidos-number-input-control',
			disabled && 'eidos-number-input-control--disabled',
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div className={rootClasses}>
				{label && (
					<label
						htmlFor={allowTyping ? inputId : undefined}
						className="eidos-number-input-label"
					>
						{label}
					</label>
				)}

				<div
					className={controlClasses}
					role={allowTyping ? undefined : 'spinbutton'}
					aria-valuemin={allowTyping ? undefined : min}
					aria-valuemax={allowTyping ? undefined : max}
					aria-valuenow={allowTyping ? undefined : currentValue}
					aria-label={allowTyping ? undefined : (label ?? 'Number input')}
					aria-disabled={disabled || undefined}
					tabIndex={!allowTyping && !disabled ? 0 : undefined}
					onKeyDown={!allowTyping ? handleDisplayKeyDown : undefined}
				>
					<button
						type="button"
						className="eidos-number-input-btn"
						onClick={handleDecrement}
						disabled={isDecrementDisabled}
						aria-label="Decrease"
					>
						<Minus />
					</button>

					<div className="eidos-number-input-divider" aria-hidden="true" />

					{allowTyping ? (
						<input
							id={inputId}
							type="text"
							className="eidos-number-input-display"
							value={displayedText}
							onChange={handleTextChange}
							onFocus={handleTextFocus}
							onBlur={handleTextBlur}
							onKeyDown={handleDisplayKeyDown}
							placeholder={placeholder}
							disabled={disabled}
							readOnly={readOnly}
							inputMode="decimal"
							role="spinbutton"
							aria-valuemin={min}
							aria-valuemax={max}
							aria-valuenow={currentValue}
							aria-label={label ?? 'Number input'}
						/>
					) : (
						<span
							className="eidos-number-input-display"
							aria-hidden="true"
						>
							{placeholder && formattedValue === (0).toFixed(precision) && !isFocused
								? placeholder
								: formattedValue}
						</span>
					)}

					<div className="eidos-number-input-divider" aria-hidden="true" />

					<button
						type="button"
						className="eidos-number-input-btn"
						onClick={handleIncrement}
						disabled={isIncrementDisabled}
						aria-label="Increase"
					>
						<Plus />
					</button>
				</div>

				{/* Hidden native <input type="number"> for form integration */}
				<input
					ref={ref}
					type="number"
					name={name}
					value={currentValue}
					onChange={() => {}}
					className="eidos-number-input-hidden"
					tabIndex={-1}
					aria-hidden="true"
					disabled={disabled}
					readOnly={readOnly}
					min={min}
					max={max}
					step={step}
				/>

				{helperText && !error && (
					<span className="eidos-number-input-helper">{helperText}</span>
				)}

				{error && errorMessage && (
					<span className="eidos-number-input-error" role="alert">
						{errorMessage}
					</span>
				)}
			</div>
		);
	}
);

NumberInput.displayName = 'NumberInput';
