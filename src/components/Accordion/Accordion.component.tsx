import React, { useState, useRef, useContext, useId, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AccordionProps, AccordionItemProps, AccordionContextValue } from './Accordion.types';

// ============================================================================
// HELPERS
// ============================================================================

/** Normalise a controlled/default value (string | string[] | undefined) to string[]. */
const toArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

// ============================================================================
// CONTEXT
// ============================================================================

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const useAccordion = (): AccordionContextValue => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used inside <Accordion>');
  return ctx;
};

// ============================================================================
// ACCORDION - root container; owns open state; provides context
// ============================================================================

export const Accordion: React.FC<AccordionProps> = ({
  multiple = false,
  value,
  defaultValue,
  onChange,
  variant = 'default',
  size = 'medium',
  color = 'primary',
  className = '',
  children,
}) => {
  const isControlled = value !== undefined;

  const [localOpen, setLocalOpen] = useState<string[]>(() => toArray(defaultValue));
  const openValues = isControlled ? toArray(value) : localOpen;

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = openValues.includes(itemValue);
      let next: string[];

      if (multiple) {
        next = isOpen
          ? openValues.filter((v) => v !== itemValue)
          : [...openValues, itemValue];
      } else {
        next = isOpen ? [] : [itemValue];
      }

      if (!isControlled) setLocalOpen(next);
      onChange?.(multiple ? next : (next[0] ?? ''));
    },
    [openValues, multiple, isControlled, onChange],
  );

  const rootClasses = [
    'eidos-accordion',
    `eidos-accordion--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AccordionContext.Provider value={{ openValues, toggle, variant, size, color }}>
      <div className={rootClasses}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = 'Accordion';

// ============================================================================
// ACCORDION ITEM - individual item; reads context; renders trigger + animated panel
// ============================================================================

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  label,
  icon,
  disabled = false,
  className = '',
  children,
}) => {
  const { openValues, toggle, size, color } = useAccordion();
  const isOpen = openValues.includes(value);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const panelId = useId();

  // Drives the max-height CSS transition.
  // On open: set to scrollHeight so the wrapper animates to its natural height.
  // On close: set to 0 so the wrapper animates shut.
  // The CSS transition on .eidos-accordion-content-wrapper handles the animation.
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    if (!contentRef.current) return;
    setMaxHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen]);

  const itemClasses = [
    'eidos-accordion-item',
    isOpen && 'eidos-accordion-item--open',
    disabled && 'eidos-accordion-item--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClasses = [
    'eidos-accordion-trigger',
    `eidos-accordion-trigger--${size}`,
    isOpen && 'eidos-accordion-trigger--open',
    isOpen && `eidos-accordion-trigger--${color}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClasses}>
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => !disabled && toggle(value)}
        className={triggerClasses}
      >
        {icon && <span className="eidos-accordion-trigger-icon">{icon}</span>}
        <span className="eidos-accordion-trigger-label">{label}</span>
        <ChevronDown className="eidos-accordion-chevron" aria-hidden="true" />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        ref={contentRef}
        className="eidos-accordion-content-wrapper"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div className="eidos-accordion-content">
          {children}
        </div>
      </div>
    </div>
  );
};

AccordionItem.displayName = 'AccordionItem';
