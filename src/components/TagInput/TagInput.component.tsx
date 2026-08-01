import React, { useState, useId, useRef, useCallback } from 'react';
import { CircleAlert } from 'lucide-react';
import { Chip } from '../Chip/Chip.component';
import type { TagInputProps } from './TagInput.types';
import './TagInput.scss';

export const TagInput: React.FC<TagInputProps> = ({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add tag…',
  size = 'medium',
  disabled = false,
  label,
  error,
  hint,
  allowDuplicates = false,
  maxTags,
  separators = ['Enter', ',', 'Tab'],
  validate,
  className = '',
  fullWidth = false,
}) => {
  const generatedId = useId();
  const inputId = `tag-input-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;

  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const tags = isControlled ? (value as string[]) : internalTags;

  const updateTags = useCallback(
    (newTags: string[]) => {
      if (!isControlled) {
        setInternalTags(newTags);
      }
      onChange?.(newTags);
    },
    [isControlled, onChange],
  );

  const addTag = useCallback(
    (rawTag: string) => {
      const tag = rawTag.trim();

      if (!tag) return;

      if (!allowDuplicates && tags.includes(tag)) return;

      if (maxTags !== undefined && tags.length >= maxTags) return;

      if (validate) {
        const result = validate(tag);
        if (result === false) return;
        if (typeof result === 'string') {
          setValidationError(result);
          return;
        }
        // result === true → valid, fall through
      }

      setValidationError(null);
      updateTags([...tags, tag]);
      setInputValue('');
    },
    [tags, allowDuplicates, maxTags, validate, updateTags],
  );

  const removeTag = useCallback(
    (index: number) => {
      updateTags(tags.filter((_, i) => i !== index));
    },
    [tags, updateTags],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (separators.includes(e.key)) {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't steal focus from interactive child elements
    if ((e.target as HTMLElement).closest('button, input')) return;
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const displayError = validationError ?? error;
  const hasError = !!displayError;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const containerClasses = [
    'eidos-tag-input',
    hasError && 'eidos-tag-input--error',
    disabled && 'eidos-tag-input--disabled',
    fullWidth && 'eidos-tag-input--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const fieldClasses = [
    'eidos-tag-input-field',
    `eidos-tag-input-field--${size}`,
    isFocused && 'eidos-tag-input-field--focused',
    hasError && 'eidos-tag-input-field--error',
    disabled && 'eidos-tag-input-field--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="eidos-tag-input-label">
          {label}
        </label>
      )}

      <div
        className={fieldClasses}
        onClick={handleFieldClick}
      >
        {tags.map((tag, index) => (
          <Chip
            key={`${tag}-${index}`}
            variant="soft"
            color="primary"
            size={size}
            onRemove={disabled ? undefined : () => removeTag(index)}
          >
            {tag}
          </Chip>
        ))}

        <input
          ref={inputRef}
          id={inputId}
          className="eidos-tag-input-input"
          type="text"
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={label ? undefined : 'Tag input'}
          aria-describedby={
            hasError ? errorId : hint ? hintId : undefined
          }
        />
      </div>

      {hint && !hasError && (
        <p className="eidos-tag-input-hint" id={hintId}>
          {hint}
        </p>
      )}

      {hasError && (
        <p
          className="eidos-tag-input-error-message"
          id={errorId}
          role="alert"
        >
          <CircleAlert />
          {displayError}
        </p>
      )}
    </div>
  );
};

TagInput.displayName = 'TagInput';
