import React, { forwardRef, useState, useId } from 'react';
import type { SwitchProps } from './Switch.types';

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      labelPosition = 'right',
      color = 'primary',
      size = 'md',
      disabled = false,
      className = '',
      checked,
      defaultChecked,
      onChange,
      id,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id || `switch-${generatedId}`;

    // Determine if using controlled or uncontrolled mode
    const isControlled = checked !== undefined;
    const [localChecked, setLocalChecked] = useState(defaultChecked ?? false);

    const isChecked = isControlled ? checked : localChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setLocalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const wrapperClasses = [
      'eidos-switch-wrapper',
      `eidos-switch-wrapper--${color}`,
      `eidos-switch-wrapper--${size}`,
      `eidos-switch-wrapper--label-${labelPosition}`,
      disabled && 'eidos-switch-wrapper--disabled',
      isChecked && 'eidos-switch-wrapper--checked',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const trackClasses = [
      'eidos-switch-track',
      isChecked && 'eidos-switch-track--checked',
      disabled && 'eidos-switch-track--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={wrapperClasses} htmlFor={switchId}>
        {labelPosition === 'left' && label && <span className="eidos-switch-label">{label}</span>}

        {/*
         * The input is visually hidden via .eidos-switch-input but remains
         * focusable and keyboard-operable. We always render it as controlled
         * (checked={isChecked}) so the transition from uncontrolled → controlled
         * never fires, avoiding the React mixed-mode warning.
         * Note: `defaultChecked` is intentionally NOT spread - we consumed it
         * to seed localChecked, and we never want React to see it alongside
         * our explicit `checked` prop.
         */}
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={switchId}
          className="eidos-switch-input"
          disabled={disabled}
          {...inputProps}
          checked={isChecked}
          onChange={handleChange}
        />

        <span className={trackClasses}>
          <span className="eidos-switch-thumb" />
        </span>

        {labelPosition !== 'left' && label && <span className="eidos-switch-label">{label}</span>}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
