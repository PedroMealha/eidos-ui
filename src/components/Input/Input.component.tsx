import React, { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff, AlertCircle, X, ChevronDown, icons } from 'lucide-react';
import type { InputProps } from './Input.types';
import { Tooltip } from '../Tooltip/Tooltip.component';

/**
 * Helper to render an icon (either string name or component)
 */
const renderIcon = (
	icon: string | React.ComponentType<{ className?: string }>,
	className: string
) => {
	if (!icon) return null;

	if (typeof icon === 'string') {
		// String-based icon name (Lucide dynamic icons)
		// Convert to PascalCase (e.g., "arrow-right" -> "ArrowRight")
		const iconName = icon
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');

		const LucideIcon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];

		if (LucideIcon) {
			return React.createElement(LucideIcon, { className });
		}

		// Fallback: treat as CSS class (for Font Awesome, etc.)
		return <i className={icon} aria-hidden="true" />;
	}

	// Component-based icon (Lucide, MUI, etc.)
	return React.createElement(icon, { className });
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			variant = 'filled',
			color = 'primary',
			size = 'medium',
			disabled = false,
			loading = false,
			className = '',
			width,
			label,
			error,
			disclaimerIcon,
			disclaimerContent,
			preIcon,
			posIcon,
			posIconButton = false,
			onPosIconClick,
			type = 'text',
			id,
			name,
			required,
			isSelect = false,
			clearable = true,
			fullWidth = false,
			...inputProps
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const [localValue, setLocalValue] = useState(inputProps.defaultValue || '');
		const [isFocused, setIsFocused] = useState(false);

		// Auto-generate id and name if not provided
		const generatedId = useId();
		const inputId = id || `input-${generatedId}`;
		const inputName = name || inputId;

		// Determine if using controlled or uncontrolled mode
		const isControlled = inputProps.value !== undefined;
		const currentValue = isControlled ? inputProps.value : localValue;

		// For select inputs, don't manage localValue - let the select component handle it
		// This prevents the Input's clear button from showing

		// Determine if label should float (only when there's content - static behavior)
		// For select inputs, keep label completely static (never float)
		const shouldFloatLabel = isSelect ? false : currentValue || inputProps.defaultValue;

		// Check if field is required (from props or enhanced register function)
		const isRequired = required || Boolean('required' in inputProps && inputProps.required);

		// Handle number input to allow decimals and negative numbers
		const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (type === 'number') {
				const allowedKeys = [
					'Backspace',
					'Delete',
					'Tab',
					'Escape',
					'Enter',
					'ArrowLeft',
					'ArrowRight',
					'ArrowUp',
					'ArrowDown',
				];
				const isNumber = /[0-9]/.test(e.key);
				const isDecimal = /[.,]/.test(e.key);
				const isMinus = e.key === '-';
				const isAllowedKey = allowedKeys.includes(e.key);
				const isControlKey = e.ctrlKey || e.metaKey;

				// Allow minus only at the beginning or when no text is selected
				if (isMinus) {
					const selectionStart = e.currentTarget.selectionStart || 0;
					const selectionEnd = e.currentTarget.selectionEnd || 0;
					const hasSelection = selectionStart !== selectionEnd;

					// Allow if at beginning or if replacing selected text
					if (selectionStart !== 0 && !hasSelection) {
						e.preventDefault();
						return;
					}
				}

				// Allow decimal only once
				if (isDecimal) {
					const currentValue = e.currentTarget.value;
					const hasDecimal = /[.,]/.test(currentValue);
					if (hasDecimal) {
						e.preventDefault();
						return;
					}
				}

				if (!isNumber && !isDecimal && !isMinus && !isAllowedKey && !isControlKey) {
					e.preventDefault();
				}
			}
		};

	// Handle input change for number inputs
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Only update localValue if uncontrolled and not a select input
		if (!isControlled && !isSelect) {
			setLocalValue(value);
		}
		inputProps.onChange?.(e);
	};

	// Handle clear button
	const handleClear = () => {
		// Update localValue if uncontrolled
		if (!isControlled) {
			setLocalValue('');
		}

		// Create a proper synthetic event for React Hook Form
		const syntheticEvent = {
			target: {
				value: '',
				name: inputName,
				id: inputId,
				type: actualType,
			},
		} as React.ChangeEvent<HTMLInputElement>;

		// Call the form's onChange handler
		inputProps.onChange?.(syntheticEvent);

		// Also try to update the input element directly
		if (ref && typeof ref === 'object' && ref.current) {
			ref.current.value = '';
		}
	};

		// Handle focus and blur
		const handleFocus = () => {
			setIsFocused(true);
		};

		const handleBlur = () => {
			setIsFocused(false);
		};

		// Determine actual input type (handle password visibility)
		const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

		// Generate CSS classes
		const inputClasses = [
			'eidos-input',
			`eidos-input--${variant}`,
			`eidos-input--${color}`,
			`eidos-input--${size}`,
			fullWidth && `eidos-input--fullWidth`,
			loading && `eidos-input--loading`,
			error && `eidos-input--error`,
		]
			.filter(Boolean)
			.join(' ');

		const wrapperClasses = [
			'eidos-input-wrapper',
			`eidos-input-wrapper--${variant}`,
			`eidos-input-wrapper--${color}`,
			`eidos-input-wrapper--${size}`,
			fullWidth && `eidos-input-wrapper--fullWidth`,
			loading && `eidos-input-wrapper--loading`,
			isFocused && `eidos-input-wrapper--focused`,
			error && `eidos-input-wrapper--error`,
		]
			.filter(Boolean)
			.join(' ');

		const labelClasses = [
			'eidos-input-label',
			shouldFloatLabel && `eidos-input-label--floating`,
			disclaimerIcon && `eidos-input-label--with-icon`,
			error && `eidos-input-label--error`,
		]
			.filter(Boolean)
			.join(' ');

		return (
			<div className={`eidos-input-container ${fullWidth ? `eidos-input-container--fullWidth` : ''} ${className}`}>
				{label && (
					<label htmlFor={inputId} className={labelClasses}>
						<span className={`eidos-input-label-text`}>{label}</span>
						{isRequired && <span className={`eidos-input-required-asterisk`}>*</span>}
						{disclaimerIcon &&
							(disclaimerContent ? (
								<Tooltip message={disclaimerContent}>
									<span className={`eidos-input-disclaimer-icon`}>
										{renderIcon(disclaimerIcon, `eidos-input-disclaimer-icon-svg`)}
									</span>
								</Tooltip>
							) : (
								<span className={`eidos-input-disclaimer-icon`}>
									{renderIcon(disclaimerIcon, `eidos-input-disclaimer-icon-svg`)}
								</span>
							))}
					</label>
				)}

				<div className={wrapperClasses}>
					{preIcon && (
						<span className={`eidos-input-pre-icon`}>{renderIcon(preIcon, `eidos-input-pre-icon-svg`)}</span>
					)}

					<input
						ref={ref}
						id={inputId}
						name={inputName}
						type={actualType}
						className={inputClasses}
						style={
							width
								? {
										width: typeof width === 'number' ? `${width}px` : width,
										minWidth: typeof width === 'number' ? `${width}px` : width,
										maxWidth: typeof width === 'number' ? `${width}px` : width,
										textAlign: 'center',
									}
								: undefined
						}
						disabled={disabled || loading}
						onKeyDown={handleNumberInput}
						{...inputProps}
						value={currentValue}
						onFocus={e => {
							handleFocus();
							inputProps.onFocus?.(e);
						}}
						onBlur={e => {
							handleBlur();
							inputProps.onBlur?.(e);
						}}
						onChange={handleInputChange}
					/>

					{type === 'password' && (
						<button
							type="button"
							className={`eidos-input-password-toggle`}
							onClick={() => setShowPassword(!showPassword)}
							disabled={disabled || loading}
							tabIndex={-1}
						>
							{showPassword ? (
								<EyeOff className={`eidos-input-password-toggle-icon`} />
							) : (
								<Eye className={`eidos-input-password-toggle-icon`} />
							)}
						</button>
					)}

					{/* Clear button - show when there's content and clearable is enabled (default: true) */}
					{currentValue && String(currentValue).trim().length > 0 && type !== 'password' && !isSelect && clearable !== false && (
						<button
							type="button"
							className={`eidos-input-clear-button`}
							onClick={handleClear}
							disabled={disabled || loading}
							tabIndex={-1}
						>
							<X className={`eidos-input-clear-button-icon`} />
						</button>
					)}

					{posIcon && !posIconButton && (
						<span className={`eidos-input-pos-icon`}>{renderIcon(posIcon, `eidos-input-pos-icon-svg`)}</span>
					)}

					{posIcon && posIconButton && onPosIconClick && (
						<button
							type="button"
							className={`eidos-input-pos-icon-button`}
							onClick={onPosIconClick}
							disabled={disabled || loading}
							tabIndex={-1}
						>
							{renderIcon(posIcon, `eidos-input-pos-icon-svg`)}
						</button>
					)}

					{/* Chevron for select inputs */}
					{isSelect && (
						<span className={`eidos-input-select-chevron`}>
							<ChevronDown className={`eidos-input-pos-icon-svg`} />
						</span>
					)}
				</div>

				{error && (
					<div className={`eidos-input-error-message`}>
						<AlertCircle className={`eidos-input-error-icon`} />
						<span>{error}</span>
					</div>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';
