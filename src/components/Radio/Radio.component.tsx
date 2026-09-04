import React, { forwardRef, useId, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import type { RadioProps, RadioGroupProps } from './Radio.types';

// ============================================================================
// Radio
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      color = 'primary',
      size = 'md',
      className = '',
      disabled = false,
      id,
      checked,
      defaultChecked,
      onChange,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const radioId = id || `radio-${generatedId}`;

    // Track checked state for the visual control:
    //   - controlled mode: `checked` prop drives the visual
    //   - uncontrolled mode (standalone Radio): local state mirrors the native input
    const isControlled = checked !== undefined;
    const [localChecked, setLocalChecked] = useState<boolean>(defaultChecked ?? false);

    // `??` only falls back when `checked` is undefined – `false` is kept as-is
    const isChecked = checked ?? localChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setLocalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const wrapperClasses = [
      'eidos-radio-wrapper',
      `eidos-radio-wrapper--${color}`,
      `eidos-radio-wrapper--${size}`,
      disabled && 'eidos-radio-wrapper--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const controlClasses = [
      'eidos-radio-control',
      isChecked && 'eidos-radio-control--checked',
      disabled && 'eidos-radio-control--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={wrapperClasses}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className="eidos-radio-input"
          disabled={disabled}
          onChange={handleChange}
          {...(isControlled ? { checked } : { defaultChecked })}
          {...inputProps}
        />
        <span className={controlClasses}>
          <span className="eidos-radio-dot" />
        </span>
        {label && <span className="eidos-radio-label">{label}</span>}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

// ============================================================================
// RadioGroup
//
// Design note: RadioGroup always passes a controlled `checked` prop to every
// Radio child so that the selection dot stays in sync across the full group.
// For the "uncontrolled" case (defaultValue), RadioGroup owns the state
// internally – individual Radios never need to manage it themselves.
// ============================================================================

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value: valueProp,
  defaultValue,
  onChange,
  options,
  direction = 'vertical',
  color = 'primary',
  size = 'md',
  disabled = false,
  error,
  className = '',
}) => {
  const isControlled = valueProp !== undefined;
  const [localValue, setLocalValue] = useState<string | undefined>(defaultValue);

  // currentValue is always defined when valueProp is provided (controlled)
  const currentValue = isControlled ? valueProp : localValue;

  const handleOptionChange = (optionValue: string) => {
    if (!isControlled) {
      setLocalValue(optionValue);
    }
    onChange?.(optionValue);
  };

  const groupClasses = ['eidos-radio-group', `eidos-radio-group--${direction}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <div className={groupClasses}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={currentValue === option.value}
            onChange={(e) => {
              if (e.target.checked) handleOptionChange(option.value);
            }}
            disabled={disabled || option.disabled}
            label={option.label}
            color={color}
            size={size}
          />
        ))}
      </div>

      {error && (
        <div className="eidos-radio-error-message">
          <CircleAlert />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
