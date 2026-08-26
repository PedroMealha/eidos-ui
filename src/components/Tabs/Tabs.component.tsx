import React, { useState, useRef, useContext, useLayoutEffect } from 'react';
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
      list.querySelectorAll('[role="tab"]:not([disabled])')
    ) as HTMLElement[];
    const currentIndex = allTabs.indexOf(e.currentTarget);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight') targetIndex = (currentIndex + 1) % allTabs.length;
    else if (e.key === 'ArrowLeft') targetIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
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
    fullWidth && 'eidos-tab--fullWidth',
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
      {icon && (
        <span className="eidos-tab-icon">
          {renderIcon(icon, 'eidos-tab-icon-svg')}
        </span>
      )}
      <span className="eidos-tab-label">{children}</span>
    </button>
  );
};

Tab.displayName = 'Tab';

// ============================================================================
// TAB PANEL - content region shown when its value matches the active tab
// Defined before Tabs for the same `child.type === TabPanel` check.
// ============================================================================

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = '',
}) => {
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
  className = '',
  children,
}) => {
  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const activeValue = isControlled ? value! : localValue;

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

  const onSelect = (newValue: string) => {
    if (!isControlled) {
      setLocalValue(newValue);
    }
    onChange?.(newValue);
  };

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

  const rootClasses = [
    'eidos-tabs',
    `eidos-tabs--${variant}`,
    `eidos-tabs--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const listClasses = [
    'eidos-tabs-list',
    `eidos-tabs-list--${size}`,
    fullWidth && 'eidos-tabs-list--fullWidth',
  ]
    .filter(Boolean)
    .join(' ');

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
        <div ref={listRef} className={listClasses} role="tablist">
          {tabChildren}
          {variant === 'line' && (
            <span ref={indicatorRef} className="eidos-tabs-indicator" aria-hidden="true" />
          )}
        </div>
        <div className="eidos-tabs-panels">
          {panelChildren}
        </div>
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';
