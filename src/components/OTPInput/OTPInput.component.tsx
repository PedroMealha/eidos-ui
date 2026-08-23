import React, { useState, useEffect, useRef, useId } from 'react';
import { CircleAlert } from 'lucide-react';
import type { OTPInputProps } from './OTPInput.types';
import './OTPInput.scss';

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  type = 'numeric',
  mask = false,
  size = 'medium',
  disabled = false,
  error,
  label,
  hint,
  autoFocus = false,
  className = '',
}) => {
  const generatedId = useId();
  const labelId = `otp-label-${generatedId}`;
  const hintId = `otp-hint-${generatedId}`;
  const errorId = `otp-error-${generatedId}`;

  const isControlled = value !== undefined;

  // Split a string into an array of `length` single characters, padding with ''
  const splitToSlots = (src: string): string[] =>
    Array.from({ length }, (_v, i) => src[i] ?? '');

  const [slots, setSlots] = useState<string[]>(() =>
    splitToSlots(isControlled ? (value ?? '') : defaultValue),
  );

  // A ref that always mirrors the latest slots value so that event handlers
  // never operate on stale closure state during rapid sequential keystrokes.
  const slotsRef = useRef<string[]>(slots);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Array of refs - one per slot input
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Sync internal slots when the controlled `value` prop changes
  useEffect(() => {
    if (isControlled) {
      const synced = splitToSlots(value ?? '');
      slotsRef.current = synced;
      setSlots(synced);
    }
    // splitToSlots is stable within a render; length is in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length, isControlled]);

  // AutoFocus: focus first empty slot on mount
  useEffect(() => {
    if (!autoFocus) return;
    const firstEmptyIdx = slots.findIndex((s) => s === '');
    const targetIdx = firstEmptyIdx === -1 ? 0 : firstEmptyIdx;
    inputRefs.current[targetIdx]?.focus();
    // Intentionally runs only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core state update ──────────────────────────────────────────────────────

  /**
   * Apply a new slots array, propagate onChange, and fire onComplete if every
   * slot is filled. In controlled mode we do NOT call setSlots - the parent
   * drives state via the `value` prop.
   */
  const commitChange = (newSlots: string[]) => {
    // Keep the ref in sync BEFORE state update so the next synchronous
    // handler (rapid typing) reads the correct value from the ref.
    slotsRef.current = newSlots;
    if (!isControlled) setSlots(newSlots);
    const fullValue = newSlots.join('');
    onChange?.(fullValue);
    if (newSlots.every((s) => s !== '')) {
      onComplete?.(fullValue);
    }
  };

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const rawValue = e.target.value;
    // When maxLength=1 is enforced, rawValue is 0–1 chars.
    // When the browser transiently allows 2 chars (typed over existing), we
    // take the last character - that's always the newly entered one.
    const char = rawValue.slice(-1);

    if (!char) return; // Deletes are handled by onKeyDown

    // Guard: numeric mode rejects non-digit characters
    if (type === 'numeric' && !/^\d$/.test(char)) return;

    // Read from slotsRef (not the stale `slots` closure) so rapid keystrokes
    // don't overwrite each other when React hasn't re-rendered yet.
    const newSlots = [...slotsRef.current];
    newSlots[index] = char;
    commitChange(newSlots);

    // Advance focus to the next slot
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // ── Numeric mode: block non-digit, non-control key presses ──────────────
    if (type === 'numeric') {
      const controlKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ];
      const isDigit = /^\d$/.test(e.key);
      const isControlKey = e.ctrlKey || e.metaKey;
      if (!isDigit && !controlKeys.includes(e.key) && !isControlKey) {
        e.preventDefault();
        return;
      }
    }

    // ── Backspace ────────────────────────────────────────────────────────────
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent the browser from also firing onChange
      if (slotsRef.current[index] !== '') {
        // Clear the current slot
        const newSlots = [...slotsRef.current];
        newSlots[index] = '';
        commitChange(newSlots);
      } else if (index > 0) {
        // Move focus to the previous slot and clear it
        const newSlots = [...slotsRef.current];
        newSlots[index - 1] = '';
        commitChange(newSlots);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // ── Arrow navigation ─────────────────────────────────────────────────────
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain');
    // Strip non-digits in numeric mode
    const filtered = type === 'numeric' ? pasted.replace(/\D/g, '') : pasted;
    if (!filtered) return;

    const newSlots = [...slotsRef.current];
    let charsPlaced = 0;
    for (let i = index; i < length && charsPlaced < filtered.length; i++) {
      newSlots[i] = filtered[charsPlaced];
      charsPlaced++;
    }
    commitChange(newSlots);

    // Focus the slot after the last pasted character
    const nextFocusIdx = Math.min(index + charsPlaced, length - 1);
    inputRefs.current[nextFocusIdx]?.focus();
  };

  // ── CSS class builders ─────────────────────────────────────────────────────

  const containerClasses = [
    'eidos-otp',
    `eidos-otp--${size}`,
    disabled && 'eidos-otp--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const slotClasses = (index: number) =>
    [
      'eidos-otp-slot',
      // Show "filled" accent only when there's no error overriding the colour
      slots[index] !== '' && !error && 'eidos-otp-slot--filled',
      focusedIndex === index && 'eidos-otp-slot--focused',
      error && 'eidos-otp-slot--error',
      disabled && 'eidos-otp-slot--disabled',
    ]
      .filter(Boolean)
      .join(' ');

  // Accessible description: prefer error, fall back to hint
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={containerClasses}>
      {label && (
        <label id={labelId} className="eidos-otp-label">
          {label}
        </label>
      )}

      <div
        className="eidos-otp-slots"
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
      >
        {Array.from({ length }, (_v, index) => (
          <div key={index} className={slotClasses(index)}>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type={mask ? 'password' : 'text'}
              inputMode={type === 'numeric' ? 'numeric' : 'text'}
              maxLength={2}
              value={slots[index]}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => handlePaste(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
            />
          </div>
        ))}
      </div>

      {hint && !error && (
        <span id={hintId} className="eidos-otp-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="eidos-otp-error-message" role="alert">
          <CircleAlert aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
};

OTPInput.displayName = 'OTPInput';
