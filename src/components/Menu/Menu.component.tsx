import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MenuProps, MenuItemType, MenuItem, MenuWrapperProps } from './Menu.types';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { Tooltip } from '../Tooltip/Tooltip.component';
import { Kbd } from '../Kbd/Kbd.component';
import { renderIcon, useDialogFocus } from '../../utils';

/**
 * MenuPanel - the bare menu list, without any trigger or dropdown wrapper.
 * Exported for use in SplitButton, ContextMenu, and other consumers that need
 * to render the menu content inside their own Dropdown / portal.
 *
 * ## This element owns the menu semantics, not the overlay around it
 *
 * `role="menu"` belongs on the element that directly contains the items, which
 * is this `<ul>`. It used to sit on `Dropdown`'s content `<div>` instead, one
 * level further out, so the menu's only child was a list and the items were
 * `listitem`s - `aria-required-children`, and a structure no screen reader
 * could present as a menu.
 *
 * ## The keyboard model is not optional
 *
 * The items were plain `<li onClick>`: no role, no `tabIndex`, no key handler.
 * Every menu in the library - `Menu`, `ContextMenu`, `SplitButton`, `Table` and
 * `DataGrid` row actions - was therefore **operable by mouse only**, which is
 * WCAG 2.1.1 (Level A). Axe reported none of it, because every menu story
 * renders closed and axe only sees what is on screen.
 *
 * A `menuitem` role is a promise that arrow keys work, so the two land
 * together: roving `tabIndex` (one tab stop for the whole menu), Up/Down to
 * move, Home/End to jump, Enter/Space to activate, ArrowRight to open a
 * submenu. Focus enters on open and returns to the trigger on close.
 */
export const MenuPanel: React.FC<MenuProps> = ({ items, className = '', onItemClick }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element) itemRefs.current.set(id, element);
    else itemRefs.current.delete(id);
  }, []);

  // Moves focus into the menu when it opens and back to the trigger when it
  // closes. `trapTab: false` - a menu is not a dialog, and confining Tab to it
  // would strand the user; the hook's frame-retry loop is what matters here,
  // because `Dropdown`'s content is `visibility: hidden` until it has been
  // positioned and `.focus()` on a hidden element is a silent no-op.
  //
  // `active` is unconditionally true: this panel is only ever mounted by an
  // open overlay (`Dropdown` and `ContextMenu` both render content
  // conditionally), so mounting *is* opening.
  useDialogFocus(true, listRef, { trapTab: false });

  // Handle menu item click
  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.disabled) return;

      // Execute the item's onClick handler first
      if (item.onClick) {
        item.onClick();
      }

      // Then call the onItemClick callback (which will close the dropdown)
      if (onItemClick) {
        onItemClick(item);
      }
    },
    [onItemClick],
  );

  // The items arrow keys move between, in visual order. Separators are not
  // stops, `component` items own their own focusable content, and a disabled
  // item is skipped rather than being a dead stop.
  const navigableIds = useMemo(
    () =>
      items
        .filter((item) => (item.type === 'item' || item.type === 'nested') && !item.disabled)
        .map((item) => item.id),
    [items],
  );

  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Validated rather than trusted: `items` can change while the menu is open
  // (a filtered list, an action that disables its neighbour), which would
  // otherwise leave the roving tabIndex on an id that no longer renders - and
  // therefore no tab stop in the menu at all.
  const activeId =
    focusedId && navigableIds.includes(focusedId) ? focusedId : (navigableIds[0] ?? null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      // A `component` item may hold a real control - a text field, a switch -
      // whose own arrow keys must not be hijacked for menu navigation. Only
      // keys pressed on a menuitem drive the menu.
      if (!(event.target as HTMLElement).closest('[role="menuitem"]')) return;
      if (navigableIds.length === 0) return;

      const focusAt = (index: number) => {
        const id = navigableIds[(index + navigableIds.length) % navigableIds.length];
        setFocusedId(id);
        itemRefs.current.get(id)?.focus();
      };
      const current = Math.max(0, navigableIds.indexOf(activeId ?? ''));

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focusAt(current + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusAt(current - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusAt(0);
          break;
        case 'End':
          event.preventDefault();
          focusAt(navigableIds.length - 1);
          break;
        default:
          break;
      }
    },
    [navigableIds, activeId],
  );

  // Render individual menu item
  const renderMenuItem = (item: MenuItemType): React.ReactNode => {
    switch (item.type) {
      case 'item':
        return (
          <li
            key={item.id}
            ref={(element) => registerItem(item.id, element)}
            role="menuitem"
            // Roving tabIndex: the menu is one tab stop and arrows move within
            // it. Making every item a tab stop would bury whatever follows a
            // ten-item menu ten presses deep.
            tabIndex={!item.disabled && item.id === activeId ? 0 : -1}
            // `aria-disabled`, not the `disabled` attribute, which an `li` does
            // not have. The click handler already returns early.
            aria-disabled={item.disabled || undefined}
            className={[
              'eidos-menu-item',
              item.disabled ? 'eidos-menu-item--disabled' : '',
              item.color ? `eidos-menu-item--${item.color}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleItemClick(item)}
            onKeyDown={(event) => {
              // An `li` is not a button, so Enter and Space produce no click of
              // their own - activation has to be wired by hand. Space is
              // prevented to stop the page scrolling underneath.
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleItemClick(item);
              }
            }}
          >
            {item.icon && renderIcon(item.icon, 'eidos-menu-icon')}
            <span className={`eidos-menu-label`}>{item.label}</span>
            {item.shortcut && (
              <Kbd size="sm" className="eidos-menu-shortcut">
                {item.shortcut}
              </Kbd>
            )}
          </li>
        );

      case 'component':
        // `role="none"` because the `li` is a wrapper: whatever the consumer
        // renders owns its own semantics, and calling it a `menuitem` would nest
        // that control inside an interactive role.
        return (
          <li key={item.id} role="none" className={`eidos-menu-component-item`}>
            {item.component}
          </li>
        );

      case 'separator':
        return <li key={item.id} role="separator" className={`eidos-menu-separator`} />;

      case 'nested': {
        const triggerElement = (
          <div
            ref={(element) => registerItem(item.id, element)}
            role="menuitem"
            // Honest but static. `aria-expanded` would be better still, and
            // cannot be set from here: `Dropdown` owns the open state and
            // exposes no controlled `open`/`onOpenChange` API to read it from.
            aria-haspopup="menu"
            aria-disabled={item.disabled || undefined}
            tabIndex={!item.disabled && item.id === activeId ? 0 : -1}
            className={[
              'eidos-menu-nested-trigger',
              item.disabled ? 'eidos-menu-nested-trigger--disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onKeyDown={(event) => {
              if (item.disabled) return;
              // ArrowRight is the menu idiom for "open this submenu"; Enter and
              // Space do the same. Clicking the element is what opens it -
              // `Dropdown`'s trigger wrapper is the click target - and the
              // submenu's own `MenuPanel` then moves focus into itself.
              if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.currentTarget.click();
              }
            }}
          >
            {item.icon && renderIcon(item.icon, 'eidos-menu-icon')}
            <span className={`eidos-menu-label`}>{item.label}</span>
            <ChevronRight className={`eidos-menu-nested-arrow`} />
          </div>
        );

        return (
          <li key={item.id} role="none" className={`eidos-menu-nested-item`}>
            <Dropdown
              trigger={triggerElement}
              content={<MenuPanel items={item.items} onItemClick={onItemClick} />}
              placement="right"
              isNested={true}
              fullWidth
              // `disabled` was accepted on a nested item and then ignored, so a
              // disabled submenu opened like any other.
              disabled={item.disabled}
            />
          </li>
        );
      }

      default:
        return null;
    }
  };

  return (
    <ul ref={listRef} role="menu" className={`eidos-menu ${className}`} onKeyDown={handleKeyDown}>
      {items.map(renderMenuItem)}
    </ul>
  );
};

export const Menu: React.FC<MenuWrapperProps> = ({
  trigger,
  items,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  autoWidth = true,
  triggerRef,
  closeOnItemClick = true,
  tooltip,
}) => {
  const handleItemClick = useCallback(
    (_item: MenuItem) => {
      // Note: item.onClick is already called in MenuPanel's handleItemClick
      // Here we only handle closing the dropdown if needed

      if (closeOnItemClick) {
        // Use a small delay to ensure the onClick handler completes
        setTimeout(() => {
          // Create a synthetic click event outside the dropdown to close it
          const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          document.dispatchEvent(event);
        }, 10);
      }
    },
    [closeOnItemClick],
  );

  // The trigger opens a menu, and nothing said so: `Dropdown` adds no ARIA to
  // its trigger (deliberately - it does not know what its content is), so a
  // screen reader announced a plain button. `Menu` does know, so it clones the
  // one attribute that is true regardless of state.
  //
  // `aria-expanded` is the missing half and needs `Dropdown` to expose its open
  // state; see the note on the nested trigger above.
  const describedTrigger = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<{ 'aria-haspopup'?: string }>, {
        'aria-haspopup': 'menu',
      })
    : trigger;

  const dropdown = (
    <Dropdown
      trigger={describedTrigger}
      content={<MenuPanel items={items} onItemClick={handleItemClick} />}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      autoWidth={autoWidth}
      triggerRef={triggerRef}
    />
  );

  return tooltip ? <Tooltip message={tooltip}>{dropdown}</Tooltip> : dropdown;
};
