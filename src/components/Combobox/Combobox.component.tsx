import React, { useState, useCallback, useRef, useEffect, useMemo, useId } from 'react';
import { Check, ChevronDown, X, Loader2, CircleAlert } from 'lucide-react';
import { Input } from '../Input/Input.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { fullWidthModifier } from '../../utils';
import type { ComboboxProps, ComboboxOption } from './Combobox.types';
import './Combobox.scss';

// ─── Types ───────────────────────────────────────────────────────────────────

type OptionEntry =
  | { type: 'group'; group: string; key: string }
  | { type: 'option'; option: ComboboxOption; index: number; key: string };

// ─── Component ───────────────────────────────────────────────────────────────

export const Combobox: React.FC<ComboboxProps> = ({
  options = [],
  value,
  defaultValue,
  onChange,
  onSearch,
  placeholder = 'Search or select…',
  loading = false,
  loadingText = 'Searching…',
  emptyText = 'No results found',
  allowFreeText = false,
  clearable = true,
  disabled = false,
  size = 'md',
  label,
  error,
  hint,
  fullWidth = false,
  className = '',
  maxHeight = '300px',
  renderOption,
}) => {
  const uid = useId();

  // ─── Refs ─────────────────────────────────────────────────────────────────

  /** Entire combobox wrapper - used for click-outside detection */
  const containerRef = useRef<HTMLDivElement>(null);

  /** The trigger wrapper div - passed to Dropdown as externalTriggerRef for width */
  const comboboxTriggerRef = useRef<HTMLDivElement>(null);

  /** The 0-height span that IS the Dropdown trigger element - programmatically clicked to open */
  const dropdownSpanRef = useRef<HTMLSpanElement>(null);

  /** Native input element */
  const inputRef = useRef<HTMLInputElement>(null);

  /** Focusable option divs for scroll-into-view */
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Synchronous open-state flag.
   * React state updates are async; reading this ref inside event handlers
   * gives us the true current value without waiting for a re-render.
   */
  const isOpenRef = useRef(false);

  // ─── State ────────────────────────────────────────────────────────────────

  const isControlled = value !== undefined;

  const getInitialInputValue = (): string => {
    const seed = isControlled ? value : defaultValue;
    if (!seed) return '';
    const match = options.find((o) => o.value === seed);
    return match ? match.label : allowFreeText ? seed : '';
  };

  const getInitialCommittedValue = (): string => {
    return isControlled ? (value ?? '') : (defaultValue ?? '');
  };

  const [inputValue, _setInputValue] = useState<string>(getInitialInputValue);
  const inputValueRef = useRef<string>(inputValue);
  const setInputValue = useCallback((v: string) => {
    inputValueRef.current = v;
    _setInputValue(v);
  }, []);

  const [committedValue, _setCommittedValue] = useState<string>(getInitialCommittedValue);
  const committedValueRef = useRef<string>(committedValue);
  const setCommittedValue = useCallback((v: string) => {
    committedValueRef.current = v;
    _setCommittedValue(v);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [menuKey, setMenuKey] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // ─── Sync controlled value ────────────────────────────────────────────────

  useEffect(() => {
    if (!isControlled) return;
    const v = value ?? '';
    const match = options.find((o) => o.value === v);
    const label = match ? match.label : allowFreeText ? v : '';
    setInputValue(label);
    setCommittedValue(v);
  }, [value, isControlled, options, allowFreeText, setInputValue, setCommittedValue]);

  // ─── Derived: filtered options ────────────────────────────────────────────

  const filteredOptions = useMemo<ComboboxOption[]>(() => {
    const q = inputValue.toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, inputValue]);

  // Reset focused index when the filtered set changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions]);

  // Keep optionRefs array in sync with filteredOptions length
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, filteredOptions.length);
  }, [filteredOptions.length]);

  // ─── Derived: option entries (with group headers) ─────────────────────────

  const optionEntries = useMemo<OptionEntry[]>(() => {
    const entries: OptionEntry[] = [];
    const hasGroups = filteredOptions.some((o) => o.group);

    if (!hasGroups) {
      filteredOptions.forEach((option, index) => {
        entries.push({ type: 'option', option, index, key: option.id });
      });
      return entries;
    }

    // Build ordered group map while preserving insertion order
    const groupMap = new Map<string | null, ComboboxOption[]>();
    for (const option of filteredOptions) {
      const g = option.group ?? null;
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g)!.push(option);
    }

    let optionIndex = 0;
    for (const [group, opts] of groupMap.entries()) {
      if (group !== null) {
        entries.push({ type: 'group', group, key: `group-${group}` });
      }
      for (const option of opts) {
        entries.push({ type: 'option', option, index: optionIndex++, key: option.id });
      }
    }

    return entries;
  }, [filteredOptions]);

  // ─── Open / Close helpers ─────────────────────────────────────────────────

  /**
   * Open the dropdown by programmatically clicking the 0-height span trigger.
   * The click bubbles to div.eidos-dropdown-trigger → Dropdown.handleTriggerClick → opens.
   *
   * We set isOpenRef AFTER the synthetic click so that the Dropdown's toggle
   * handler fires while isOpenRef is still false (allowing it to open).
   */
  const openDropdown = useCallback(() => {
    if (isOpenRef.current || disabled) return;
    dropdownSpanRef.current?.click(); // opens the Dropdown (bubbles to trigger)
    isOpenRef.current = true;
    setIsOpen(true);
  }, [disabled]);

  /**
   * Close the dropdown by remounting it (menuKey increment resets internal state).
   * Optionally revert inputValue to the last committed value.
   */
  const closeDropdown = useCallback(
    (revertInput = false) => {
      isOpenRef.current = false;
      setIsOpen(false);
      setFocusedIndex(-1);
      setMenuKey((prev) => prev + 1);

      if (revertInput) {
        const match = options.find((o) => o.value === committedValueRef.current);
        setInputValue(match ? match.label : allowFreeText ? committedValueRef.current : '');
      }
    },
    [options, allowFreeText, setInputValue],
  );

  // ─── Click-outside detection ──────────────────────────────────────────────

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isOpenRef.current) return;
      // defaultPrevented is set by the listbox's onMouseDown - means the user
      // clicked an option in the portal, not truly outside the combobox.
      if (e.defaultPrevented) return;
      if (containerRef.current?.contains(e.target as Node)) return;

      // Focus leaving to a non-focusable target: validate and close
      isOpenRef.current = false;
      setIsOpen(false);
      setFocusedIndex(-1);
      setMenuKey((prev) => prev + 1);

      const current = inputValueRef.current;
      const committed = committedValueRef.current;

      if (!allowFreeText) {
        const match = options.find((o) => o.label.toLowerCase() === current.toLowerCase());
        if (match) {
          if (match.value !== committed) {
            setCommittedValue(match.value);
            onChange?.(match.value);
            setInputValue(match.label);
          }
        } else {
          const revertMatch = options.find((o) => o.value === committed);
          setInputValue(revertMatch ? revertMatch.label : '');
        }
      } else {
        if (current !== committed) {
          setCommittedValue(current);
          onChange?.(current);
        }
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [allowFreeText, options, onChange, setCommittedValue, setInputValue]);

  // ─── Input handlers ───────────────────────────────────────────────────────

  const handleFocus = useCallback(() => {
    openDropdown();
  }, [openDropdown]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setInputValue(query);
      onSearch?.(query);
      if (!isOpenRef.current) openDropdown();
    },
    [setInputValue, onSearch, openDropdown],
  );

  /**
   * On blur, validate the typed value against options.
   * A 0ms defer ensures a click on a posIcon button (X / chevron) inside the
   * Input completes its onClick before we run close logic, so we can check
   * document.activeElement reliably.
   */
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      // If focus came back inside the container (e.g., posIcon button clicked),
      // don't close or validate yet.
      if (containerRef.current?.contains(document.activeElement)) return;

      // Read both refs *inside* the deferred callback, never captured at blur
      // time - that's the whole reason they're kept in sync by the setters.
      // Anything can run in the gap this 0ms defer opens, including the click
      // that caused the blur: a controlled consumer clearing `value` from
      // another control (e.g. DataGrid's "Clear filters", which resets every
      // quick filter at once) updates the refs via the sync effect, and stale
      // captured values would then resurrect the label that was just cleared.
      const current = inputValueRef.current;
      const committed = committedValueRef.current;

      // Close
      isOpenRef.current = false;
      setIsOpen(false);
      setFocusedIndex(-1);
      setMenuKey((prev) => prev + 1);

      // Validate
      if (!allowFreeText) {
        const match = options.find((o) => o.label.toLowerCase() === current.toLowerCase());
        if (match) {
          if (match.value !== committed) {
            setCommittedValue(match.value);
            onChange?.(match.value);
            setInputValue(match.label);
          } else {
            // Normalize the display label (fix casing)
            setInputValue(match.label);
          }
        } else {
          // No match - revert to last committed value
          const revertMatch = options.find((o) => o.value === committed);
          setInputValue(revertMatch ? revertMatch.label : '');
        }
      } else {
        // allowFreeText: commit whatever the user typed
        if (current !== committed) {
          setCommittedValue(current);
          onChange?.(current);
        }
      }
    }, 0);
  }, [allowFreeText, options, onChange, setCommittedValue, setInputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpenRef.current) {
            openDropdown();
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => {
              const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
              setTimeout(
                () =>
                  optionRefs.current[next]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  }),
                0,
              );
              return next;
            });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isOpenRef.current) {
            openDropdown();
            setFocusedIndex(filteredOptions.length - 1);
          } else {
            setFocusedIndex((prev) => {
              const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
              setTimeout(
                () =>
                  optionRefs.current[next]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  }),
                0,
              );
              return next;
            });
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (isOpenRef.current && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          } else if (allowFreeText && inputValue.trim()) {
            const trimmed = inputValue.trim();
            setCommittedValue(trimmed);
            onChange?.(trimmed);
            closeDropdown();
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (isOpenRef.current) {
            closeDropdown(true /* revert */);
          }
          break;

        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      disabled,
      filteredOptions,
      focusedIndex,
      allowFreeText,
      inputValue,
      onChange,
      openDropdown,
      closeDropdown,
      setCommittedValue,
    ],
  );

  // ─── Option selection ─────────────────────────────────────────────────────

  const handleOptionSelect = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      setInputValue(option.label);
      setCommittedValue(option.value);
      onChange?.(option.value);
      closeDropdown();
      // Return focus to the input so the user can continue interacting
      inputRef.current?.focus();
    },
    [onChange, closeDropdown, setInputValue, setCommittedValue],
  );

  // ─── Clear ────────────────────────────────────────────────────────────────

  const handleClearClick = useCallback(() => {
    setInputValue('');
    setCommittedValue('');
    onChange?.('');
    // Re-focus input so the user can immediately start typing again
    inputRef.current?.focus();
  }, [onChange, setInputValue, setCommittedValue]);

  // ─── Chevron toggle ───────────────────────────────────────────────────────

  const handleChevronClick = useCallback(() => {
    if (isOpenRef.current) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [closeDropdown, openDropdown]);

  // ─── Render: individual option ────────────────────────────────────────────

  const renderOptionItem = useCallback(
    (option: ComboboxOption, index: number): React.ReactNode => {
      const isSelected = option.value === committedValue;
      const isFocused = index === focusedIndex;

      const classes = [
        'eidos-combobox-option',
        isSelected && 'eidos-combobox-option--selected',
        isFocused && 'eidos-combobox-option--focused',
        option.disabled && 'eidos-combobox-option--disabled',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <div
          key={option.id}
          ref={(el) => {
            optionRefs.current[index] = el;
          }}
          className={classes}
          onClick={() => handleOptionSelect(option)}
          onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
          id={`${uid}-option-${index}`}
        >
          {renderOption ? (
            renderOption(option)
          ) : (
            <>
              <Check
                className={`eidos-combobox-option-icon${
                  !isSelected ? ' eidos-combobox-option-icon--hidden' : ''
                }`}
              />
              <span className="eidos-combobox-option-label">{option.label}</span>
              {option.description && (
                <span className="eidos-combobox-option-description">{option.description}</span>
              )}
            </>
          )}
        </div>
      );
    },
    [committedValue, focusedIndex, handleOptionSelect, renderOption, uid],
  );

  // ─── Render: dropdown content ─────────────────────────────────────────────

  const dropdownContent = useMemo(() => {
    if (loading) {
      return (
        <div className="eidos-combobox-loading">
          <Loader2 className="eidos-combobox-loading-icon" />
          <span>{loadingText}</span>
        </div>
      );
    }

    if (filteredOptions.length === 0) {
      return <div className="eidos-combobox-empty">{emptyText}</div>;
    }

    return optionEntries.map((entry) => {
      if (entry.type === 'group') {
        return (
          <div key={entry.key} className="eidos-combobox-option-group-label">
            {entry.group}
          </div>
        );
      }
      return renderOptionItem(entry.option, entry.index);
    });
  }, [loading, loadingText, filteredOptions.length, emptyText, optionEntries, renderOptionItem]);

  // ─── posIcon / posIconButton wiring ───────────────────────────────────────

  const hasClearableValue = clearable && !!inputValue;
  const posIcon = hasClearableValue ? X : ChevronDown;
  const posIconClick = hasClearableValue ? handleClearClick : handleChevronClick;

  // ─── CSS classes ──────────────────────────────────────────────────────────

  const containerClasses = [
    'eidos-combobox',
    fullWidth && fullWidthModifier('eidos-combobox'),
    error && 'eidos-combobox--error',
    disabled && 'eidos-combobox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <div ref={comboboxTriggerRef} className="eidos-combobox-trigger">
        {/*
          The Input is a direct child of eidos-combobox-trigger.
          It is NOT inside the Dropdown trigger div, so clicking it
          never bubbles to Dropdown.handleTriggerClick and never
          accidentally toggles the dropdown closed mid-edit.
        */}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          fullWidth
          label={label}
          clearable={false} // we render our own clear via posIcon
          isSelect={false}
          posIcon={posIcon}
          posIconButton
          onPosIconClick={posIconClick}
          aria-autocomplete="list"
          aria-controls={`${uid}-listbox`}
          aria-activedescendant={focusedIndex >= 0 ? `${uid}-option-${focusedIndex}` : undefined}
        />

        {/*
          The Dropdown trigger is a 0-height span placed AFTER the Input
          in the normal document flow. Its getBoundingClientRect sits at
          exactly the bottom edge of the Input, giving the Dropdown correct
          placement without any click-toggle collision with the Input above.
          closeOnClickOutside and closeOnEscape are disabled because we own
          those interactions in our mousedown listener and onKeyDown handler.
        */}
        <Dropdown
          key={menuKey}
          trigger={
            <span
              ref={dropdownSpanRef}
              className="eidos-combobox-dropdown-anchor"
              aria-hidden="true"
            />
          }
          content={
            <div
              id={`${uid}-listbox`}
              className="eidos-combobox-options"
              role="listbox"
              aria-label={label ?? 'Options'}
              // Prevent the input from blurring when the user clicks an option,
              // and mark this event so the click-outside handler ignores it.
              onMouseDown={(e) => e.preventDefault()}
            >
              {dropdownContent}
            </div>
          }
          triggerRef={comboboxTriggerRef as React.RefObject<HTMLElement | null>}
          maxHeight={maxHeightValue}
          autoWidth
          closeOnClickOutside={false}
          closeOnEscape={false}
        />
      </div>

      {hint && !error && <span className="eidos-combobox-hint">{hint}</span>}
      {error && (
        <span className="eidos-combobox-error-message">
          <CircleAlert className="eidos-combobox-error-icon" />
          {error}
        </span>
      )}
    </div>
  );
};

Combobox.displayName = 'Combobox';
