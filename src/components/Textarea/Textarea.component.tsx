import React, { forwardRef, useState, useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { renderIcon } from '../../utils';
import type { TextareaProps } from './Textarea.types';
import { Tooltip } from '../Tooltip/Tooltip.component';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'filled',
      color = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      className = '',
      fullWidth = false,
      label,
      error,
      disclaimerIcon,
      disclaimerContent,
      required,
      rows = 4,
      resize = 'vertical',
      showCount = false,
      maxLength,
      id,
      ...textareaProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;

    // Extract defaultValue so it never reaches the native <textarea> alongside `value`.
    // Same reasoning as Input: we always set value={currentValue}, so having defaultValue
    // in the spread as well triggers React's controlled/uncontrolled warning.
    const { defaultValue, ...restTextareaProps } = textareaProps;

    // Determine if using controlled or uncontrolled mode
    const isControlled = restTextareaProps.value !== undefined;
    const [localValue, setLocalValue] = useState(defaultValue != null ? String(defaultValue) : '');
    const [isFocused, setIsFocused] = useState(false);

    const currentValue = isControlled ? restTextareaProps.value : localValue;

    // Label floats when the field has content (same logic as Input)
    const shouldFloatLabel = Boolean(currentValue) || Boolean(defaultValue);

    const isRequired =
      required || Boolean('required' in restTextareaProps && restTextareaProps.required);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setLocalValue(e.target.value);
      }
      restTextareaProps.onChange?.(e);
    };

    // ── Class lists ──────────────────────────────────────────────────────────

    const containerClasses = [
      'eidos-textarea-container',
      fullWidth && 'eidos-textarea-container--fullWidth',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      'eidos-textarea-wrapper',
      `eidos-textarea-wrapper--${variant}`,
      `eidos-textarea-wrapper--${color}`,
      `eidos-textarea-wrapper--${size}`,
      fullWidth && 'eidos-textarea-wrapper--fullWidth',
      loading && 'eidos-textarea-wrapper--loading',
      isFocused && 'eidos-textarea-wrapper--focused',
      error && 'eidos-textarea-wrapper--error',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [
      'eidos-textarea',
      `eidos-textarea--${variant}`,
      `eidos-textarea--${color}`,
      `eidos-textarea--${size}`,
      `eidos-textarea--resize-${resize}`,
      fullWidth && 'eidos-textarea--fullWidth',
      loading && 'eidos-textarea--loading',
      error && 'eidos-textarea--error',
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = [
      'eidos-textarea-label',
      shouldFloatLabel && 'eidos-textarea-label--floating',
      disclaimerIcon && 'eidos-textarea-label--with-icon',
      error && 'eidos-textarea-label--error',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={textareaId} className={labelClasses}>
            <span className="eidos-textarea-label-text">{label}</span>
            {isRequired && <span className="eidos-textarea-required-asterisk">*</span>}
            {disclaimerIcon &&
              (disclaimerContent ? (
                <Tooltip message={disclaimerContent}>
                  <span className="eidos-textarea-disclaimer-icon">
                    {renderIcon(disclaimerIcon, 'eidos-textarea-disclaimer-icon-svg')}
                  </span>
                </Tooltip>
              ) : (
                <span className="eidos-textarea-disclaimer-icon">
                  {renderIcon(disclaimerIcon, 'eidos-textarea-disclaimer-icon-svg')}
                </span>
              ))}
          </label>
        )}

        <div className={wrapperClasses}>
          <textarea
            ref={ref}
            id={textareaId}
            className={textareaClasses}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled || loading}
            {...restTextareaProps}
            value={currentValue}
            onFocus={(e) => {
              setIsFocused(true);
              restTextareaProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              restTextareaProps.onBlur?.(e);
            }}
            onChange={handleChange}
          />

          {showCount && maxLength && (
            <span className="eidos-textarea-count">
              {String(currentValue ?? '').length}/{maxLength}
            </span>
          )}
        </div>

        {error && (
          <div className="eidos-textarea-error-message">
            <CircleAlert className="eidos-textarea-error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
