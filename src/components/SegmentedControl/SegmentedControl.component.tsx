import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { renderIcon, devWarn } from '../../utils';
import type { SegmentedControlProps } from './SegmentedControl.types';

/**
 * SegmentedControl - a compact, single-select toggle group rendered as a pill.
 *
 * Semantics: `role="radiogroup"` on the container, `role="radio"` on each
 * segment. Supports controlled and uncontrolled usage.
 *
 * @example
 * ```tsx
 * // Controlled
 * const [view, setView] = useState('list');
 * <SegmentedControl
 *   options={[
 *     { value: 'list',  icon: List,       tooltip: 'List view' },
 *     { value: 'grid',  icon: LayoutGrid, tooltip: 'Grid view' },
 *     { value: 'table', icon: Table2,     tooltip: 'Table view' },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 *
 * // With labels
 * <SegmentedControl
 *   options={[
 *     { value: 'day',   label: 'Day' },
 *     { value: 'week',  label: 'Week' },
 *     { value: 'month', label: 'Month' },
 *   ]}
 *   defaultValue="week"
 *   onChange={console.log}
 * />
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  color = 'primary',
  disabled = false,
  fullWidth = false,
  scrollButtons = 'auto',
  className = '',
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options[0]?.value ?? '',
  );

  const activeValue = isControlled ? value : internalValue;

  const handleSelect = (optValue: string) => {
    if (disabled) return;
    if (optValue === activeValue) return; // already selected
    if (!isControlled) setInternalValue(optValue);
    onChange?.(optValue);
  };

  const trackRef = useRef<HTMLDivElement>(null);

  // Roving tabindex: the group is a single tab stop, and arrow keys move
  // within it - the WAI-ARIA radiogroup pattern, which this had none of.
  // Every segment used to be its own tab stop, so a six-option control cost
  // six presses to skip past.
  //
  // The tabbable segment is the selected one; if nothing is selected (a
  // controlled `value` matching no option), the first enabled segment takes
  // the stop so the group can still be reached at all.
  const selectableValues = options.filter((opt) => !opt.disabled).map((opt) => opt.value);
  const hasSelection = selectableValues.includes(activeValue);
  const fallbackTabbableValue = selectableValues[0];

  const isTabbable = (optValue: string) =>
    hasSelection ? optValue === activeValue : optValue === fallbackTabbableValue;

  // Selection follows focus, which is what the radio pattern specifies -
  // unlike `Tabs`, where arrow keys only move focus. Disabled segments are
  // skipped rather than selected-and-ignored, and both ends wrap.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || selectableValues.length === 0) return;

    const currentIndex = selectableValues.indexOf(activeValue);
    const from = currentIndex === -1 ? 0 : currentIndex;
    let targetIndex = -1;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      targetIndex = (from + 1) % selectableValues.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      targetIndex = (from - 1 + selectableValues.length) % selectableValues.length;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = selectableValues.length - 1;
    }

    if (targetIndex === -1) return;

    event.preventDefault();
    const targetValue = selectableValues[targetIndex];
    handleSelect(targetValue);

    // Focus has to follow the selection explicitly: the segment that was
    // focused is about to lose its `tabIndex={0}` to the newly selected one,
    // and focus does not move on its own.
    const target = trackRef.current?.querySelector<HTMLElement>(
      `[data-value="${CSS.escape(targetValue)}"]`,
    );
    target?.focus();
  };

  // The selected segment can sit outside the scrollport - after a controlled
  // `value` change, or once focus moves to a segment off screen. `scrollLeft`
  // is set directly rather than through `scrollIntoView`, which walks the
  // whole ancestor chain and would scroll the page vertically when the
  // control is below the fold.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const activeItem = track.querySelector('[aria-checked="true"]') as HTMLElement | null;
    if (!activeItem) return;

    const left = activeItem.offsetLeft;
    const right = left + activeItem.offsetWidth;

    if (left < track.scrollLeft) {
      track.scrollLeft = left;
    } else if (right > track.scrollLeft + track.clientWidth) {
      track.scrollLeft = right - track.clientWidth;
    }
  }, [activeValue]);

  // Whether either end has segments hidden past it. Drives the presence of
  // each button: none at all when the track fits, and none at the end already
  // reached, since a button there would point at nothing.
  const [scrollState, setScrollState] = useState({ canScrollPrev: false, canScrollNext: false });
  const hasScrollButtons = scrollButtons !== 'none';

  useEffect(() => {
    if (!hasScrollButtons) return;
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      // 1px of tolerance: fractional layout widths leave a sub-pixel
      // remainder at either end that would otherwise keep a button enabled
      // for a scroll that can no longer move anything.
      const canScrollPrev = track.scrollLeft > 1;
      const canScrollNext = track.scrollLeft < maxScroll - 1;
      setScrollState((previous) =>
        previous.canScrollPrev === canScrollPrev && previous.canScrollNext === canScrollNext
          ? previous
          : { canScrollPrev, canScrollNext },
      );
    };

    update();
    track.addEventListener('scroll', update, { passive: true });

    // The track's own box stays the same width when a label reflows or a font
    // finishes loading, so the segments have to be observed as well as the
    // container - only their sizes tell us the track started overflowing.
    const observer = new ResizeObserver(update);
    observer.observe(track);
    Array.from(track.children).forEach((child) => observer.observe(child));

    return () => {
      track.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [hasScrollButtons, options.length, size, fullWidth]);

  const scrollByStep = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    // A step just short of a full page keeps a segment of context on screen,
    // the same way a paged scrollbar click does.
    const step = track.clientWidth * 0.8;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const barClasses = [
    'eidos-segmented-bar',
    fullWidth && 'eidos-segmented-bar--full-width',
    disabled && 'eidos-segmented-bar--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'eidos-segmented',
    `eidos-segmented--${size}`,
    `eidos-segmented--${color}`,
    disabled && 'eidos-segmented--disabled',
    fullWidth && 'eidos-segmented--full-width',
    // With buttons, they are the affordance - a native scrollbar under a
    // compact pill control is redundant and would break its shape.
    hasScrollButtons && 'eidos-segmented--hide-scrollbar',
  ]
    .filter(Boolean)
    .join(' ');

  const showPrevButton = hasScrollButtons && scrollState.canScrollPrev;
  const showNextButton = hasScrollButtons && scrollState.canScrollNext;

  const scrollButtonClasses = (direction: 'prev' | 'next') =>
    [
      'eidos-segmented-scroll-button',
      `eidos-segmented-scroll-button--${direction}`,
      `eidos-segmented-scroll-button--${size}`,
    ].join(' ');

  const track = (
    <div ref={trackRef} className={containerClasses} role="radiogroup">
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        const isDisabled = disabled || !!opt.disabled;

        // An icon-only segment has no text to be named by. `tooltip` wraps
        // it in a `Tooltip`, which contributes nothing to the accessible
        // name, so such a segment was announced as just "radio" - identical
        // to every other segment, making the group unusable by voice or
        // screen reader. Same fallback as `Button`.
        if (!opt.label && !opt.tooltip) {
          devWarn(
            'segmented-icon-only-name',
            `SegmentedControl: option "${opt.value}" has an icon but no \`label\` or \`tooltip\`, so it has no accessible name.`,
          );
        }

        const segment = (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={isDisabled}
            // Read back by the keyboard handler to move focus onto the newly
            // selected segment, which `value` alone can't identify in the DOM.
            data-value={opt.value}
            tabIndex={isTabbable(opt.value) ? 0 : -1}
            className={['eidos-segmented-item', isActive && 'eidos-segmented-item--active']
              .filter(Boolean)
              .join(' ')}
            onClick={() => !isDisabled && handleSelect(opt.value)}
            onKeyDown={handleKeyDown}
            aria-label={!opt.label ? opt.tooltip : undefined}
          >
            {opt.icon && renderIcon(opt.icon, 'eidos-segmented-icon')}
            {opt.label && <span className="eidos-segmented-label">{opt.label}</span>}
          </button>
        );

        return opt.tooltip ? (
          <Tooltip key={opt.value} message={opt.tooltip}>
            {segment}
          </Tooltip>
        ) : (
          React.cloneElement(segment, { key: opt.value })
        );
      })}
    </div>
  );

  // The buttons are siblings of the track, never children of it:
  // `role="radiogroup"` only accepts radios. They are also hidden from
  // assistive tech and skipped by Tab, because they are a pointer affordance
  // for something the keyboard already does - tabbing to a segment scrolls it
  // into view. Same arrangement as `Tabs`.
  return (
    <div className={barClasses}>
      {showPrevButton && (
        <button
          type="button"
          className={scrollButtonClasses('prev')}
          onClick={() => scrollByStep(-1)}
          // `tabIndex={-1}` keeps these out of the tab order, but it does not
          // stop a *click* from focusing them - and focus landing inside an
          // `aria-hidden` subtree is an error the browser reports ("Blocked
          // aria-hidden on an element because its descendant retained
          // focus"). Suppressing the default mousedown behaviour keeps the
          // button unfocusable by pointer as well, while the click still
          // fires. `inert` would also prevent the click, so it is not an
          // option here.
          onMouseDown={(event) => event.preventDefault()}
          tabIndex={-1}
          aria-hidden="true"
        >
          <ChevronLeft className="eidos-segmented-scroll-button-icon" />
        </button>
      )}

      {track}

      {showNextButton && (
        <button
          type="button"
          className={scrollButtonClasses('next')}
          onClick={() => scrollByStep(1)}
          onMouseDown={(event) => event.preventDefault()} // see the prev button
          tabIndex={-1}
          aria-hidden="true"
        >
          <ChevronRight className="eidos-segmented-scroll-button-icon" />
        </button>
      )}
    </div>
  );
};
