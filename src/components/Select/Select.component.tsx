import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { Input } from '../Input/Input.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import type { SelectProps, SelectOption } from './Select.types';
import { renderIcon, devWarn } from '../../utils';

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      className = '',
      multiple = false,
      label,
      placeholder = 'Select an option...',
      disabled = false,
      inputProps = {},
      name,
      id,
      required = false,
      fullWidth = false,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight = '300px',
      autoWidth = true,
      clearable = true,
      autoOpen = false,
      dropdownProps = {},
    },
    ref,
  ) => {
    const isControlled = value !== undefined;

    // Lazy initializer: seed from defaultValue in uncontrolled mode.
    const [selectedValues, setSelectedValues] = useState<Set<string>>(() => {
      if (defaultValue !== undefined) {
        const vals = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
        return new Set(vals.filter((v) => v !== ''));
      }
      return new Set();
    });

    const [focusedIndex, setFocusedIndex] = useState(-1);
    // `Select` owns the open state and hands it to `Dropdown` as a controlled
    // value. It used to keep this flag *and* force the dropdown closed by
    // remounting it through a changing `key`, because `Dropdown`'s own state was
    // private - which meant this flag drove the ARIA attributes while reaching
    // nothing that renders, so the keyboard could not open the listbox at all.
    const [isOpen, setIsOpen] = useState(autoOpen);

    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Kept in sync every render so the mount-only callback ref below can
    // read the latest values without needing them in its dependency array
    // (see `handleOptionsMount`).
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const selectedValuesRef = useRef(selectedValues);
    selectedValuesRef.current = selectedValues;

    useEffect(() => {
      if (value !== undefined) {
        const values = Array.isArray(value) ? value : [value];

        const validValues = values.filter((v) => v !== '');
        setSelectedValues(new Set(validValues));
      }
    }, [value]);

    useEffect(() => {
      setFocusedIndex(-1);
    }, [options]);

    useEffect(() => {
      optionRefs.current = optionRefs.current.slice(0, options.length);
    }, [options.length]);

    const handleOptionSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        const newSelectedValues = new Set(selectedValues);

        if (multiple) {
          if (newSelectedValues.has(option.value)) {
            newSelectedValues.delete(option.value);
          } else {
            newSelectedValues.add(option.value);
          }
        } else {
          if (newSelectedValues.has(option.value)) {
            newSelectedValues.clear();
          } else {
            newSelectedValues.clear();
            newSelectedValues.add(option.value);
          }
        }

        // In uncontrolled mode, own the state directly.
        // In controlled mode, let the parent drive via value prop + useEffect sync.
        if (!isControlled) {
          setSelectedValues(newSelectedValues);
        }

        if (onChange) {
          const newValue = multiple
            ? Array.from(newSelectedValues)
            : Array.from(newSelectedValues)[0] || '';
          onChange(newValue);
        }

        if (!multiple) {
          setIsOpen(false);
          // Focus is returned explicitly because a click lands on an option
          // `div`, which is not focusable - without this, choosing with the
          // mouse would leave focus on `<body>` and the field would be
          // unreachable by keyboard until tabbed to again.
          inputRef.current?.focus();
        }
      },
      [multiple, onChange, selectedValues, isControlled],
    );

    const handleClear = useCallback(
      (e?: React.MouseEvent) => {
        if (e) {
          e.stopPropagation();
        }
        if (!isControlled) {
          setSelectedValues(new Set());
        }

        setIsOpen(false);
        inputRef.current?.focus();
        if (onChange) {
          onChange(multiple ? [] : '');
        }
      },
      [multiple, onChange, isControlled],
    );

    // A form control with no accessible name is announced as just "combobox".
    // `Select` was the only field in the library that could not be labelled
    // without knowing about `inputProps`, and three call sites duly shipped
    // without one - so the gap is closed from both ends: a first-class `label`
    // prop, and this warning.
    //
    // Measured from the DOM rather than from props, because a caller may name
    // the field with an external `<label for>` - `Pagination`'s page-size
    // picker does exactly that, and a props-only check would cry wolf at it.
    // `HTMLInputElement.labels` covers both wrapping and `for` labels.
    useEffect(() => {
      const element = inputRef.current;
      if (!element) return;
      const named =
        (element.labels?.length ?? 0) > 0 ||
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby');
      if (!named) {
        devWarn(
          'select-missing-label',
          'Select: no accessible name. Pass `label` for a visible one, or `inputProps={{ "aria-label": "..." }}` where it must stay visually unlabelled - otherwise the field is announced as just "combobox". A placeholder is not a label, and disappears as soon as something is chosen.',
        );
      }
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
              setFocusedIndex(0);
            } else {
              setFocusedIndex((prev) => {
                const nextIndex = prev < options.length - 1 ? prev + 1 : 0;

                setTimeout(() => {
                  optionRefs.current[nextIndex]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }, 0);
                return nextIndex;
              });
            }
            break;

          case 'ArrowUp':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
              setFocusedIndex(options.length - 1);
            } else {
              setFocusedIndex((prev) => {
                const nextIndex = prev > 0 ? prev - 1 : options.length - 1;

                setTimeout(() => {
                  optionRefs.current[nextIndex]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }, 0);
                return nextIndex;
              });
            }
            break;

          case 'Enter':
          case ' ':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
              setFocusedIndex(0);
            } else if (focusedIndex >= 0 && focusedIndex < options.length) {
              const focusedOption = options[focusedIndex];
              handleOptionSelect(focusedOption);
            }
            break;

          case 'Escape':
            e.preventDefault();
            if (isOpen) {
              setIsOpen(false);
              setFocusedIndex(-1);
            }
            break;

          case 'Home':
            e.preventDefault();
            if (isOpen) {
              setFocusedIndex(0);
              optionRefs.current[0]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
              });
            }
            break;

          case 'End':
            e.preventDefault();
            if (isOpen) {
              const lastIndex = options.length - 1;
              setFocusedIndex(lastIndex);
              optionRefs.current[lastIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
              });
            }
            break;

          default:
            if (isOpen && e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
              const searchChar = e.key.toLowerCase();
              const foundIndex = options.findIndex(
                (option, index) =>
                  index > focusedIndex && option.label.toLowerCase().startsWith(searchChar),
              );

              if (foundIndex !== -1) {
                setFocusedIndex(foundIndex);
                optionRefs.current[foundIndex]?.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth',
                });
              } else {
                const foundFromStart = options.findIndex((option) =>
                  option.label.toLowerCase().startsWith(searchChar),
                );
                if (foundFromStart !== -1) {
                  setFocusedIndex(foundFromStart);
                  optionRefs.current[foundFromStart]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }
              }
            }
            break;
        }
      },
      [disabled, isOpen, options, focusedIndex, handleOptionSelect],
    );

    // Scrolls the first selected option into view. Attached as the options
    // list's own ref below with an empty dependency array, so its identity
    // never changes and React only invokes it on genuine DOM mount/unmount -
    // i.e. exactly when the dropdown opens/closes (Dropdown unmounts its
    // `content` entirely while closed), not on every re-render while open.
    const handleOptionsMount = useCallback((el: HTMLDivElement | null) => {
      if (!el) return;
      const idx = optionsRef.current.findIndex((option) =>
        selectedValuesRef.current.has(option.value),
      );
      if (idx === -1) return;
      optionRefs.current[idx]?.scrollIntoView({ block: 'nearest' });
    }, []);

    // Past this many selections the full comma-joined label list becomes
    // unreadable in the trigger, so we switch to a compact "N selected" label.
    const COMPACT_LABEL_THRESHOLD = 2;

    const displayValue = useMemo(() => {
      if (selectedValues.size === 0) return '';

      if (multiple && selectedValues.size > COMPACT_LABEL_THRESHOLD) {
        return `${selectedValues.size} selected`;
      }

      const selectedOptions = options.filter((option) => selectedValues.has(option.value));
      const text = selectedOptions.map((option) => option.label).join(', ');
      return text;
    }, [options, selectedValues, multiple]);

    const selectContent = useMemo(
      () => (
        <div className={'eidos-select-options'} ref={handleOptionsMount}>
          {options.map((option, index) => {
            const isSelected = selectedValues.has(option.value);
            const isFocused = index === focusedIndex;
            return (
              <div
                key={option.id}
                // The trigger points `aria-activedescendant` at
                // `${id}-option-${focusedIndex}`, and nothing carried that id -
                // so the moment an option was hovered or arrowed to, the
                // attribute referenced an element that did not exist
                // (`aria-valid-attr-value`, critical). Invisible to axe until a
                // story left the listbox open, because the attribute is only
                // set once something is focused.
                id={`${id || 'select'}-option-${index}`}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                className={`
										${'eidos-select-option'}
										${isSelected ? 'eidos-select-option--selected' : ''}
										${option.disabled ? 'eidos-select-option--disabled' : ''}
										${isFocused ? 'eidos-select-option--focused' : ''}
									`.trim()}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
              >
                {option.icon && renderIcon(option.icon, 'eidos-select-option-icon')}
                <span className={'eidos-select-option-label'}>{option.label}</span>
                {isSelected && <Check className={'eidos-select-option-check-icon'} />}
              </div>
            );
          })}
        </div>
      ),
      [options, selectedValues, focusedIndex, handleOptionSelect, handleOptionsMount, id],
    );

    const triggerElement = (
      <div
        ref={triggerRef}
        className={`eidos-select-trigger ${fullWidth ? 'eidos-select-trigger--full-width' : ''}`}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : undefined}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        // Only while the listbox exists. An `aria-controls` pointing at an id
        // that is not in the document is invalid, and the listbox only renders
        // while open - `Combobox`, `TagInput` and `CommandPalette` already gate
        // theirs this way. It could not be gated here before, because `isOpen`
        // did not track whether the panel had actually rendered.
        aria-controls={isOpen ? `${id || 'select'}-options` : undefined}
        aria-activedescendant={
          focusedIndex >= 0 ? `${id || 'select'}-option-${focusedIndex}` : undefined
        }
      >
        <Input
          ref={inputRef}
          value={selectedValues.size > 0 ? displayValue : ''}
          placeholder={selectedValues.size === 0 ? placeholder : ''}
          posIcon={selectedValues.size > 0 && clearable ? X : undefined}
          posIconButton={selectedValues.size > 0 && clearable}
          onPosIconClick={selectedValues.size > 0 && clearable ? handleClear : undefined}
          posIconLabel="Clear selection"
          disabled={disabled}
          readOnly={true}
          isSelect={true}
          label={label}
          name={name}
          id={id}
          required={required}
          fullWidth={fullWidth}
          {...inputProps}
        />
      </div>
    );

    return (
      <div
        ref={ref}
        className={`${'eidos-select-container'} ${
          fullWidth ? 'eidos-select-container--full-width' : ''
        } ${className}`}
      >
        <Dropdown
          open={isOpen}
          onOpenChange={setIsOpen}
          trigger={triggerElement}
          content={
            <div id={`${id || 'select'}-options`} role="listbox" aria-multiselectable={multiple}>
              {selectContent}
            </div>
          }
          minWidth={minWidth}
          maxWidth={maxWidth}
          minHeight={minHeight}
          maxHeight={maxHeight}
          autoWidth={autoWidth}
          fullWidth={fullWidth}
          triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
          {...dropdownProps}
        />
      </div>
    );
  },
);

Select.displayName = 'Select';
