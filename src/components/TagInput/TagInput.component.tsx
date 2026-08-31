import React, { useState, useId, useRef, useCallback, useMemo, useEffect } from 'react';
import { CircleAlert } from 'lucide-react';
import { Chip } from '../Chip/Chip.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import type { TagInputProps } from './TagInput.types';
import './TagInput.scss';

export const TagInput: React.FC<TagInputProps> = ({
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Add tag…',
  size = 'md',
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
  suggestions,
  onSearch,
  suggestionsEmptyText = 'No matches',
}) => {
  const generatedId = useId();
  const inputId = `tag-input-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  /** Entire component wrapper - used for click-outside detection on the suggestions dropdown */
  const containerRef = useRef<HTMLDivElement>(null);

  /** The field wrapper - passed to Dropdown as externalTriggerRef for width/anchoring */
  const fieldRef = useRef<HTMLDivElement>(null);

  /** The 0-height span that IS the Dropdown trigger element - programmatically clicked to open */
  const dropdownSpanRef = useRef<HTMLSpanElement>(null);

  const hasSuggestions = suggestions !== undefined;
  const isSuggestionsOpenRef = useRef(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestionsMenuKey, setSuggestionsMenuKey] = useState(0);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

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

  // ─── Suggestions dropdown (autocomplete) ───────────────────────────────────

  const filteredSuggestions = useMemo<string[]>(() => {
    if (!suggestions) return [];
    const query = inputValue.trim().toLowerCase();
    return suggestions.filter(suggestion => {
      if (!allowDuplicates && tags.includes(suggestion)) return false;
      if (!query) return true;
      return suggestion.toLowerCase().includes(query);
    });
  }, [suggestions, inputValue, tags, allowDuplicates]);

  useEffect(() => {
    setFocusedSuggestionIndex(-1);
  }, [filteredSuggestions]);

  const openSuggestions = useCallback(() => {
    if (isSuggestionsOpenRef.current || disabled || !hasSuggestions) return;
    dropdownSpanRef.current?.click(); // opens the Dropdown (bubbles to trigger)
    isSuggestionsOpenRef.current = true;
    setIsSuggestionsOpen(true);
  }, [disabled, hasSuggestions]);

  const closeSuggestions = useCallback(() => {
    isSuggestionsOpenRef.current = false;
    setIsSuggestionsOpen(false);
    setFocusedSuggestionIndex(-1);
    setSuggestionsMenuKey(prev => prev + 1);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      addTag(suggestion);
      closeSuggestions();
      inputRef.current?.focus();
    },
    [addTag, closeSuggestions],
  );

  // Click-outside detection for the suggestions dropdown.
  useEffect(() => {
    if (!hasSuggestions) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!isSuggestionsOpenRef.current) return;
      if (e.defaultPrevented) return; // click inside the portal-rendered listbox
      if (containerRef.current?.contains(e.target as Node)) return;
      closeSuggestions();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [hasSuggestions, closeSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasSuggestions && isSuggestionsOpenRef.current && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev + 1 < filteredSuggestions.length ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
        return;
      }
      if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[focusedSuggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSuggestions();
        return;
      }
    }

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
    const query = e.target.value;
    setInputValue(query);
    if (validationError) {
      setValidationError(null);
    }
    onSearch?.(query);
    if (hasSuggestions && !isSuggestionsOpenRef.current) openSuggestions();
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (hasSuggestions) openSuggestions();
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

  const uid = generatedId;

  return (
    <div
      className={containerClasses}
      ref={containerRef}
      aria-expanded={hasSuggestions ? isSuggestionsOpen : undefined}
      aria-haspopup={hasSuggestions ? 'listbox' : undefined}
    >
      {label && (
        <label htmlFor={inputId} className="eidos-tag-input-label">
          {label}
        </label>
      )}

      <div
        className={fieldClasses}
        onClick={handleFieldClick}
        ref={fieldRef}
      >
        {tags.map((tag, index) => (
          <Chip
            key={`${tag}-${index}`}
            variant="text"
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
          onFocus={handleInputFocus}
          onBlur={() => setIsFocused(false)}
          aria-label={label ? undefined : 'Tag input'}
          aria-describedby={
            hasError ? errorId : hint ? hintId : undefined
          }
          aria-autocomplete={hasSuggestions ? 'list' : undefined}
          aria-controls={hasSuggestions ? `${uid}-tag-suggestions` : undefined}
          aria-activedescendant={
            hasSuggestions && focusedSuggestionIndex >= 0
              ? `${uid}-tag-suggestion-${focusedSuggestionIndex}`
              : undefined
          }
        />

        {hasSuggestions && (
          <Dropdown
            key={suggestionsMenuKey}
            trigger={
              <span
                ref={dropdownSpanRef}
                style={{ display: 'block', height: 0 }}
                aria-hidden="true"
              />
            }
            content={
              <div
                id={`${uid}-tag-suggestions`}
                className="eidos-tag-input-suggestions"
                role="listbox"
                aria-label={label ?? 'Suggestions'}
                onMouseDown={e => e.preventDefault()}
              >
                {filteredSuggestions.length === 0 ? (
                  <div className="eidos-tag-input-suggestions-empty">{suggestionsEmptyText}</div>
                ) : (
                  filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      id={`${uid}-tag-suggestion-${index}`}
                      className={[
                        'eidos-tag-input-suggestion',
                        index === focusedSuggestionIndex && 'eidos-tag-input-suggestion--focused',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="option"
                      aria-selected={index === focusedSuggestionIndex}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseEnter={() => setFocusedSuggestionIndex(index)}
                    >
                      {suggestion}
                    </div>
                  ))
                )}
              </div>
            }
            triggerRef={fieldRef as React.RefObject<HTMLElement | null>}
            autoWidth
            closeOnClickOutside={false}
            closeOnEscape={false}
          />
        )}
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
