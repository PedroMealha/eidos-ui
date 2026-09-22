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
  size = 'md',
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
        next = isOpen ? openValues.filter((v) => v !== itemValue) : [...openValues, itemValue];
      } else {
        next = isOpen ? [] : [itemValue];
      }

      if (!isControlled) setLocalOpen(next);
      onChange?.(multiple ? next : (next[0] ?? ''));
    },
    [openValues, multiple, isControlled, onChange],
  );

  const rootClasses = ['eidos-accordion', `eidos-accordion--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <AccordionContext.Provider value={{ openValues, toggle, variant, size, color }}>
      <div className={rootClasses}>{children}</div>
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
  // The unclipped content itself, not the wrapper around it. The wrapper's own
  // height is what `maxHeight` below sets, so observing it would feed the
  // observer its own output; the inner node is always laid out at its natural
  // height regardless of the wrapper's clipping, so its size genuinely changes
  // when its content does.
  const innerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const panelId = useId();

  // Drives the max-height CSS transition.
  // On open: set to the content's height so the wrapper animates to it.
  // On close: set to 0 so the wrapper animates shut.
  // The CSS transition on .eidos-accordion-content-wrapper handles the animation.
  const [maxHeight, setMaxHeight] = useState<number>(0);

  // `max-height` is a fixed px value, so it goes stale the moment the panel's
  // content reflows after opening - a narrower viewport rewrapping prose, a
  // font finishing loading, an image arriving, a nested collapsible opening.
  // The wrapper is `overflow: hidden` with no scrollbar, so a stale value
  // silently clips the tail of the panel with nothing on screen to suggest
  // content is missing. Tracking the content for as long as the panel stays
  // open is therefore part of the technique, not a refinement of it - which is
  // what `DataGrid`'s row expansion (`useExpandAnimation`) already does.
  useEffect(() => {
    if (!isOpen) {
      setMaxHeight(0);
      return;
    }

    const node = innerRef.current;
    if (!node) return;

    const update = () => setMaxHeight(node.scrollHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
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
        className="eidos-accordion-content-wrapper"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div ref={innerRef} className="eidos-accordion-content">
          {children}
        </div>
      </div>
    </div>
  );
};

AccordionItem.displayName = 'AccordionItem';
