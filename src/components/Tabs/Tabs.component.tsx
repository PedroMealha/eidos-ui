import React, { useState, useRef, useContext, useEffect, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { renderIcon } from '../../utils';
import type { TabsProps, TabProps, TabPanelProps, TabsContextValue } from './Tabs.types';

// ============================================================================
// CONTEXT
// ============================================================================

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab/TabPanel must be used inside <Tabs>');
  return ctx;
};

// ============================================================================
// TAB - individual tab trigger button
// Defined before Tabs so Tabs can use `child.type === Tab` for child separation.
// ============================================================================

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  disabled = false,
  icon,
  className = '',
}) => {
  const { activeValue, onSelect, size, fullWidth, listRef } = useTabsContext();
  const isActive = activeValue === value;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const list = listRef.current;
    if (!list) return;

    const allTabs = Array.from(
      list.querySelectorAll('[role="tab"]:not([disabled])'),
    ) as HTMLElement[];
    const currentIndex = allTabs.indexOf(e.currentTarget);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight') targetIndex = (currentIndex + 1) % allTabs.length;
    else if (e.key === 'ArrowLeft')
      targetIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
    else if (e.key === 'Home') targetIndex = 0;
    else if (e.key === 'End') targetIndex = allTabs.length - 1;

    if (targetIndex !== -1) {
      e.preventDefault();
      allTabs[targetIndex].focus();
    }
  };

  const tabClasses = [
    'eidos-tab',
    `eidos-tab--${size}`,
    isActive && 'eidos-tab--active',
    disabled && 'eidos-tab--disabled',
    fullWidth && 'eidos-tab--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      id={`eidos-tab-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`eidos-tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={tabClasses}
      onClick={() => !disabled && onSelect(value)}
      onKeyDown={handleKeyDown}
      type="button"
    >
      {icon && <span className="eidos-tab-icon">{renderIcon(icon, 'eidos-tab-icon-svg')}</span>}
      <span className="eidos-tab-label">{children}</span>
    </button>
  );
};

Tab.displayName = 'Tab';

// ============================================================================
// TAB PANEL - content region shown when its value matches the active tab
// Defined before Tabs for the same `child.type === TabPanel` check.
// ============================================================================

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '' }) => {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div
      id={`eidos-tabpanel-${value}`}
      role="tabpanel"
      aria-labelledby={`eidos-tab-${value}`}
      tabIndex={0}
      className={['eidos-tab-panel', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
};

TabPanel.displayName = 'TabPanel';

// ============================================================================
// TABS - root container; provides context, separates tab/panel children
// ============================================================================

export const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onChange,
  variant = 'line',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  scrollButtons = 'auto',
  className = '',
  children,
}) => {
  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const activeValue = isControlled ? value! : localValue;

  // Separate Tab and TabPanel children so the list and panels render in
  // distinct DOM regions, regardless of how the consumer orders them.
  const tabChildren: React.ReactElement[] = [];
  const panelChildren: React.ReactElement[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Tab) {
      tabChildren.push(child);
    } else if (child.type === TabPanel) {
      panelChildren.push(child);
    }
  });

  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  // Tracks whether the indicator has been positioned at least once so we can
  // skip the CSS transition on the very first render and avoid it animating
  // from the top-left corner to the initial tab.
  const hasPositioned = useRef(false);

  useLayoutEffect(() => {
    if (variant !== 'line') return;
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const activeTab = list.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (!activeTab) return;

    // Suppress the CSS transition on the initial paint so the indicator snaps
    // into place rather than sliding from 0.
    if (!hasPositioned.current) {
      indicator.style.transition = 'none';
    }

    indicator.style.left = `${activeTab.offsetLeft}px`;
    indicator.style.width = `${activeTab.offsetWidth}px`;

    if (!hasPositioned.current) {
      // Force a synchronous reflow so the browser commits the no-transition
      // position before we re-enable the transition for future clicks.
      void indicator.offsetWidth;
      indicator.style.transition = '';
      hasPositioned.current = true;
    }
  }, [activeValue, variant, fullWidth]);

  // The list scrolls horizontally when the strip is wider than its container,
  // so an activated tab can sit outside the scrollport - reachable by keyboard
  // (`End`) or by a controlled `value` change, but invisible. `scrollLeft` is
  // adjusted directly rather than via `scrollIntoView`, which walks the whole
  // ancestor chain and would scroll the page vertically when the strip is below
  // the fold.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const activeTab = list.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (!activeTab) return;

    const left = activeTab.offsetLeft;
    const right = left + activeTab.offsetWidth;

    if (left < list.scrollLeft) {
      list.scrollLeft = left;
    } else if (right > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = right - list.clientWidth;
    }
  }, [activeValue]);

  // Whether either end of the strip has content hidden past it. Drives both
  // the presence of the scroll buttons (neither end scrollable = the strip
  // fits, so no buttons) and their disabled state at the extremes.
  const [scrollState, setScrollState] = useState({ canScrollPrev: false, canScrollNext: false });
  const hasScrollButtons = scrollButtons !== 'none';

  useEffect(() => {
    if (!hasScrollButtons) return;
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const maxScroll = list.scrollWidth - list.clientWidth;
      // 1px of tolerance: fractional layout widths leave a sub-pixel remainder
      // at either end that would otherwise keep a button enabled for a scroll
      // that can no longer move anything.
      const canScrollPrev = list.scrollLeft > 1;
      const canScrollNext = list.scrollLeft < maxScroll - 1;
      setScrollState((previous) =>
        previous.canScrollPrev === canScrollPrev && previous.canScrollNext === canScrollNext
          ? previous
          : { canScrollPrev, canScrollNext },
      );
    };

    update();
    list.addEventListener('scroll', update, { passive: true });

    // The list's own box stays the same width when a tab's label reflows or a
    // font finishes loading, so the tabs have to be observed as well as the
    // container - only their sizes tell us the strip started overflowing.
    const observer = new ResizeObserver(update);
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));

    return () => {
      list.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [hasScrollButtons, tabChildren.length, size, variant, fullWidth]);

  const scrollByStep = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;

    // A step just short of a full page keeps a tab of context on screen, the
    // same way a paged scrollbar click does.
    const step = list.clientWidth * 0.8;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const onSelect = (newValue: string) => {
    if (!isControlled) {
      setLocalValue(newValue);
    }
    onChange?.(newValue);
  };

  const rootClasses = ['eidos-tabs', `eidos-tabs--${variant}`, `eidos-tabs--${color}`, className]
    .filter(Boolean)
    .join(' ');

  const listClasses = [
    'eidos-tabs-list',
    `eidos-tabs-list--${size}`,
    fullWidth && 'eidos-tabs-list--full-width',
    // With buttons, they are the affordance - a native scrollbar underneath
    // them is redundant, and on a space-taking one it would also sit over the
    // `line` variant's rule.
    hasScrollButtons && 'eidos-tabs-list--hide-scrollbar',
  ]
    .filter(Boolean)
    .join(' ');

  // Each button exists only while its own direction has somewhere to go: none
  // at all when the strip fits, and none at the end you have reached. A
  // disabled button would be pointing at nothing. They are positioned
  // absolutely, so appearing and disappearing never moves the tabs.
  const showPrevButton = hasScrollButtons && scrollState.canScrollPrev;
  const showNextButton = hasScrollButtons && scrollState.canScrollNext;

  const scrollButtonClasses = (direction: 'prev' | 'next') =>
    [
      'eidos-tabs-scroll-button',
      `eidos-tabs-scroll-button--${direction}`,
      `eidos-tabs-scroll-button--${size}`,
    ].join(' ');

  const contextValue: TabsContextValue = {
    activeValue,
    onSelect,
    variant,
    size,
    color,
    fullWidth,
    listRef,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={rootClasses}>
        {/* The buttons are siblings of the tab list, never children of it:
            `role="tablist"` only accepts tabs. They are also hidden from
            assistive tech and skipped by Tab, because they are a pointer
            affordance for something the keyboard already does - arrow keys
            move between tabs and scroll the active one into view. */}
        <div className="eidos-tabs-bar">
          {showPrevButton && (
            <button
              type="button"
              className={scrollButtonClasses('prev')}
              onClick={() => scrollByStep(-1)}
              // `tabIndex={-1}` keeps these out of the tab order but does not
              // stop a click from focusing them, and focus inside an
              // `aria-hidden` subtree is an error the browser reports
              // ("Blocked aria-hidden on an element because its descendant
              // retained focus"). Suppressing the default mousedown keeps
              // them unfocusable by pointer too; the click still fires.
              // `inert` would prevent the click as well, so it is no help.
              onMouseDown={(event) => event.preventDefault()}
              tabIndex={-1}
              aria-hidden="true"
            >
              <ChevronLeft className="eidos-tabs-scroll-button-icon" />
            </button>
          )}

          <div ref={listRef} className={listClasses} role="tablist">
            {tabChildren}
            {variant === 'line' && (
              <span ref={indicatorRef} className="eidos-tabs-indicator" aria-hidden="true" />
            )}
          </div>

          {showNextButton && (
            <button
              type="button"
              className={scrollButtonClasses('next')}
              onClick={() => scrollByStep(1)}
              onMouseDown={(event) => event.preventDefault()} // see the prev button
              tabIndex={-1}
              aria-hidden="true"
            >
              <ChevronRight className="eidos-tabs-scroll-button-icon" />
            </button>
          )}
        </div>

        <div className="eidos-tabs-panels">{panelChildren}</div>
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';
