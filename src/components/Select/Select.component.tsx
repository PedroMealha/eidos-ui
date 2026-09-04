import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { Input } from '../Input/Input.component';
import { Dropdown } from '../Dropdown/Dropdown.component';
import type { SelectProps, SelectOption } from './Select.types';
import { renderIcon } from '../../utils';

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      className = '',
      multiple = false,
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
    const [searchQuery, setSearchQuery] = useState('');
    const [menuKey, setMenuKey] = useState(0);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isOpen, setIsOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
      if (value !== undefined) {
        const values = Array.isArray(value) ? value : [value];

        const validValues = values.filter((v) => v !== '');
        setSelectedValues(new Set(validValues));
      }
    }, [value]);

    const filteredOptions = useMemo(() => {
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [options, searchQuery]);

    useEffect(() => {
      setFocusedIndex(-1);
    }, [filteredOptions]);

    useEffect(() => {
      optionRefs.current = optionRefs.current.slice(0, filteredOptions.length);
    }, [filteredOptions.length]);

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
          setMenuKey((prev) => prev + 1);
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
        setMenuKey((prev) => prev + 1);
        if (onChange) {
          onChange(multiple ? [] : '');
        }
      },
      [multiple, onChange, isControlled],
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
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
                const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;

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
              setFocusedIndex(filteredOptions.length - 1);
            } else {
              setFocusedIndex((prev) => {
                const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;

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
            } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
              const focusedOption = filteredOptions[focusedIndex];
              handleOptionSelect(focusedOption);
            }
            break;

          case 'Escape':
            e.preventDefault();
            if (isOpen) {
              setIsOpen(false);
              setFocusedIndex(-1);
              setMenuKey((prev) => prev + 1);
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
              const lastIndex = filteredOptions.length - 1;
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
              const foundIndex = filteredOptions.findIndex(
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
                const foundFromStart = filteredOptions.findIndex((option) =>
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
      [disabled, isOpen, filteredOptions, focusedIndex, handleOptionSelect],
    );

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
        <div className={'eidos-select-options'}>
          {filteredOptions.map((option, index) => {
            const isSelected = selectedValues.has(option.value);
            const isFocused = index === focusedIndex;
            return (
              <div
                key={option.id}
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
                {isSelected && <Check className={'eidos-select-option-icon'} />}
                {!isSelected && option.icon && renderIcon(option.icon, 'eidos-select-option-icon')}
                <span className={'eidos-select-option-label'}>{option.label}</span>
              </div>
            );
          })}
        </div>
      ),
      [filteredOptions, selectedValues, focusedIndex, handleOptionSelect],
    );

    const triggerElement = (
      <div
        ref={triggerRef}
        className={'eidos-select-trigger'}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : undefined}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id || 'select'}-options`}
        aria-activedescendant={
          focusedIndex >= 0 ? `${id || 'select'}-option-${focusedIndex}` : undefined
        }
      >
        <Input
          ref={inputRef}
          value={selectedValues.size > 0 ? displayValue : ''}
          onChange={handleSearchChange}
          placeholder={selectedValues.size === 0 ? placeholder : ''}
          posIcon={selectedValues.size > 0 && clearable ? X : undefined}
          posIconButton={selectedValues.size > 0 && clearable}
          onPosIconClick={selectedValues.size > 0 && clearable ? handleClear : undefined}
          disabled={disabled}
          readOnly={true}
          isSelect={true}
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
          fullWidth ? 'eidos-select-container--fullWidth' : ''
        } ${className}`}
      >
        <Dropdown
          key={menuKey}
          defaultOpen={autoOpen}
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
          triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
          {...dropdownProps}
        />
      </div>
    );
  },
);

Select.displayName = 'Select';
