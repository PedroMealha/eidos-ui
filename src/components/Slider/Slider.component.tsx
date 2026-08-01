import React, { forwardRef, useState } from 'react';
import type { SliderProps } from './Slider.types';

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
	(
		{
			value,
			defaultValue,
			min,
			max,
			step,
			onChange,
			color = 'primary',
			size = 'medium',
			disabled = false,
			showValue = false,
			showMinMax = false,
			label,
			unit,
			blockedRange,
			className = '',
		},
		ref
	) => {
		const minVal = min ?? 0;
		const maxVal = max ?? 100;

		// Clamp a raw value against the blocked range boundary.
		const clamp = (v: number) =>
			blockedRange && v > blockedRange.min ? blockedRange.min : v;

		const isControlled = value !== undefined;
		const [localValue, setLocalValue] = useState<number>(
			clamp(defaultValue ?? minVal)
		);
		const currentValue = isControlled ? clamp(value!) : localValue;

		const fillPct = ((currentValue - minVal) / (maxVal - minVal)) * 100;
		const blockedStartPct = blockedRange
			? ((blockedRange.min - minVal) / (maxVal - minVal)) * 100
			: null;

		// CSS custom properties drive the track gradient via the
		// ::-webkit-slider-runnable-track pseudo-element in Slider.scss.
		// --s-block defaults to 100% so the danger segment collapses to zero
		// width when there is no blocked range.
		const sliderStyle: React.CSSProperties = {
			'--s-fill' : `${fillPct}%`,
			'--s-color': `var(--${color}-color)`,
			'--s-empty': 'var(--gray-200)',
			...(blockedStartPct !== null && { '--s-block': `${blockedStartPct}%` }),
		} as React.CSSProperties;

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = clamp(Number(e.target.value));
			if (!isControlled) setLocalValue(newValue);
			onChange?.(newValue);
		};

		// Effective max for ARIA — the blocked zone is not a valid value.
		const effectiveMax = blockedRange ? blockedRange.min : maxVal;

		const fmt = (v: number) => `${v}${unit ?? ''}`;

		const rootClasses = [
			'eidos-slider',
			`eidos-slider--${color}`,
			`eidos-slider--${size}`,
			disabled && 'eidos-slider--disabled',
			className,
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div className={rootClasses}>
				{(label || showValue) && (
					<div className="eidos-slider-top">
						{label && <span className="eidos-slider-label">{label}</span>}
						{showValue && (
							<span className="eidos-slider-value">{fmt(currentValue)}</span>
						)}
					</div>
				)}

				<input
					ref={ref}
					type="range"
					className="eidos-slider-input"
					min={minVal}
					max={maxVal}
					step={step ?? 1}
					value={currentValue}
					disabled={disabled}
					onChange={handleChange}
					aria-label={label ?? 'Slider'}
					aria-valuemin={minVal}
					aria-valuemax={effectiveMax}
					aria-valuenow={currentValue}
					style={sliderStyle}
				/>

				{showMinMax && (
					<div className="eidos-slider-minmax">
						<span>{fmt(minVal)}</span>
						<span>{fmt(maxVal)}</span>
					</div>
				)}
			</div>
		);
	}
);

Slider.displayName = 'Slider';
