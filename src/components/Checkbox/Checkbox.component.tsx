import React, { forwardRef, useId, useRef, useState, useEffect, useCallback } from 'react';
import { Check, Minus, CircleAlert } from 'lucide-react';
import type { CheckboxProps } from './Checkbox.types';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	(
		{
			label,
			error,
			indeterminate = false,
			color = 'primary',
			size = 'medium',
			className = '',
			disabled = false,
			id,
			checked,
			defaultChecked,
			onChange,
			...inputProps
		},
		ref
	) => {
		const generatedId = useId();
		const checkboxId = id || `checkbox-${generatedId}`;

		// Internal ref needed to imperatively set `indeterminate` (not a standard HTML attribute)
		const internalRef = useRef<HTMLInputElement>(null);

		// Track checked state for the visual control:
		//   - controlled mode: `checked` prop drives everything
		//   - uncontrolled mode: local state mirrors the native input
		const isControlled = checked !== undefined;
		const [localChecked, setLocalChecked] = useState<boolean>(defaultChecked ?? false);

		// `??` correctly handles `false` (falsy but defined): only falls back when `checked` is undefined
		const isChecked = checked ?? localChecked;

		// Imperatively set the indeterminate property – it has no HTML attribute equivalent
		useEffect(() => {
			if (internalRef.current) {
				internalRef.current.indeterminate = indeterminate;
			}
		}, [indeterminate]);

		// Merge the forwarded ref with our internal ref so callers can still access the input.
		// useCallback(_, [ref]) prevents the ref callback from being a new function identity
		// every render, which would cause React to detach/re-attach the ref unnecessarily.
		const mergedRef = useCallback(
			(node: HTMLInputElement | null) => {
				internalRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
				}
			},
			[ref]
		);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (!isControlled) {
				setLocalChecked(e.target.checked);
			}
			onChange?.(e);
		};

		const wrapperClasses = [
			'eidos-checkbox-wrapper',
			`eidos-checkbox-wrapper--${color}`,
			`eidos-checkbox-wrapper--${size}`,
			disabled && 'eidos-checkbox-wrapper--disabled',
			error && 'eidos-checkbox-wrapper--error',
		]
			.filter(Boolean)
			.join(' ');

		const controlClasses = [
			'eidos-checkbox-control',
			isChecked && 'eidos-checkbox-control--checked',
			indeterminate && 'eidos-checkbox-control--indeterminate',
			disabled && 'eidos-checkbox-control--disabled',
			error && !disabled && 'eidos-checkbox-control--error',
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div className={['eidos-checkbox-container', className].filter(Boolean).join(' ')}>
				<label className={wrapperClasses}>
					<input
						ref={mergedRef}
						type="checkbox"
						id={checkboxId}
						className="eidos-checkbox-input"
						disabled={disabled}
						onChange={handleChange}
						{...(isControlled ? { checked } : { defaultChecked })}
						{...inputProps}
					/>
					<span className={controlClasses}>
						{isChecked && !indeterminate && <Check className="eidos-checkbox-icon" />}
						{indeterminate && <Minus className="eidos-checkbox-icon" />}
					</span>
					{label && <span className="eidos-checkbox-label">{label}</span>}
				</label>

				{error && (
					<div className="eidos-checkbox-error-message">
						<CircleAlert />
						<span>{error}</span>
					</div>
				)}
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';
