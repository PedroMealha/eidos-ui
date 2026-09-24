import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { devWarn, useIsClient } from '../../utils';
import type { DropdownProps, DropdownState } from './Dropdown.types';
import { DropdownProvider } from './Dropdown.context';
import { useDropdownContext } from './Dropdown.hooks';

const DropdownInternal: React.FC<DropdownProps> = ({
  trigger,
  content,
  placement: preferredPlacement = 'bottom',
  align = 'start',
  delay = 0,
  disabled = false,
  defaultOpen = false,
  open,
  onOpenChange,
  triggerClassName = '',
  contentClassName = '',
  role,
  closeOnClickOutside = true,
  closeOnEscape = true,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  autoWidth = true,
  fullWidth = false,
  triggerRef: externalTriggerRef,
  isNested = false,
  dropdownLevel,
  dropdownGroup,
}) => {
  const context = useDropdownContext();
  const actualLevel = dropdownLevel !== undefined ? dropdownLevel : context.level;
  // `defaultOpen` makes the portal reachable on the first render, which cannot
  // happen on a server - see `useIsClient`.
  const isClient = useIsClient();
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    isVisible: defaultOpen,
    isPositioned: false,
    position: { top: 0, left: 0, placement: preferredPlacement },
  });

  // ── Controlled / uncontrolled open state ──────────────────────────────────
  //
  // `dropdownState.isVisible` stays the *uncontrolled* value and is kept in
  // step even while controlled, so removing `open` later leaves coherent state.
  // Everything downstream reads `isVisible` below, never the field directly.
  //
  // `DropdownState` is exported from the package root, so it keeps its shape:
  // splitting `isVisible` out of it would be a breaking type change for a
  // consumer who imports it, in exchange for nothing a reader of this file
  // needs.
  const isControlled = open !== undefined;
  const isVisible = isControlled ? open : dropdownState.isVisible;

  const wasControlled = useRef(isControlled);
  if (wasControlled.current !== isControlled) {
    devWarn(
      'dropdown-controlled-switch',
      'Dropdown: `open` switched between controlled and uncontrolled. Pick one for the lifetime of the component - the dropdown keeps its own state as a fallback, so switching makes it jump to whatever that happens to be.',
    );
    wasControlled.current = isControlled;
  }

  /**
   * The single place the open state changes. Every route - trigger click,
   * click-outside, Escape, a group sibling, the `delay` timer - goes through
   * here, so a controlled consumer sees all of them and cannot desync.
   */
  const setOpen = useCallback(
    (next: boolean) => {
      setDropdownState((prev) => ({ ...prev, isVisible: next, isPositioned: false }));
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  // A controlled caller can flip `open` without going through `setOpen`, which
  // would leave `isPositioned` true from the previous open and paint the panel
  // at its old coordinates for a frame. Re-arm the positioning pass from the
  // transition itself.
  useEffect(() => {
    if (!isVisible) {
      setDropdownState((prev) => (prev.isPositioned ? { ...prev, isPositioned: false } : prev));
    }
  }, [isVisible]);

  // A pending `delay` timer outlives a controlled close otherwise, and reopens
  // the panel a moment after the consumer closed it.
  useEffect(() => {
    if (!isVisible && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [isVisible]);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isScrollingRef = useRef(false);

  // The element to actually measure/anchor against. When a consumer passes
  // `triggerRef`, that's an explicit statement of "this is what I want the
  // dropdown positioned relative to" - it must win over the internal wrapper
  // div, not just inform sizing. Consumers occasionally need `trigger` to be
  // a small anchor node (e.g. a 0-height span) sitting inside a larger,
  // variable-content field (chips, wrapped text); anchoring position to the
  // wrapper instead of that field silently drifts as soon as the field's
  // internal layout changes, since the wrapper only ever contains `trigger`
  // itself, never the field around it.
  const getTriggerElement = useCallback(
    (): HTMLElement | null => externalTriggerRef?.current ?? triggerRef.current,
    [externalTriggerRef],
  );

  const calculateDynamicSizing = useCallback(
    // Only the width is read, so the parameter is the narrowest shape that
    // satisfies it rather than a `DOMRect`. The caller used to fall back to
    // `new DOMRect()`, which is a browser-only global evaluated *during
    // render* - it was the first thing to throw when an open dropdown was
    // server-rendered, before `document.body` ever got a chance to.
    (triggerRect: { width: number } | null) => {
      // Shrink the panel to its content by default. This prevents the
      // position:fixed element from expanding to viewport width when children
      // use `width:100%` or `flex:1`. `minWidth` (set below) still wins when
      // the trigger is wider than the content, as CSS min-width overrides width.
      const styles: Record<string, string | number> = { width: 'max-content' };

      if (autoWidth && triggerRect && (externalTriggerRef?.current || triggerRef.current)) {
        const triggerWidth = triggerRect.width;
        styles.minWidth = triggerWidth;
      }

      if (minWidth !== undefined) {
        styles.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
      }
      if (maxWidth !== undefined) {
        if (maxWidth === 'auto') {
          styles.maxWidth = 'none';
        } else {
          styles.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
        }
      }
      if (minHeight !== undefined) {
        styles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
      }
      if (maxHeight !== undefined) {
        if (maxHeight === 'auto') {
          styles.maxHeight = 'none';
        } else {
          styles.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
        }
      }

      const hasHeightConstraint = minHeight !== undefined || maxHeight !== undefined;
      if (hasHeightConstraint) {
        styles.overflowY = 'auto';
      } else {
        styles.overflowY = 'visible';
      }

      return styles;
    },
    [autoWidth, externalTriggerRef, minWidth, maxWidth, minHeight, maxHeight],
  );

  const calculateOptimalPosition = useCallback(
    (triggerRect: DOMRect, contentRect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let placement: 'top' | 'bottom' | 'left' | 'right' = preferredPlacement;
      let top = 0;
      let left = 0;

      // Helpers for cross-axis alignment
      const alignedLeft = (() => {
        switch (align) {
          case 'end':
            return triggerRect.right - contentRect.width;
          case 'center':
            return triggerRect.left + (triggerRect.width - contentRect.width) / 2;
          default:
            return triggerRect.left; // "start"
        }
      })();
      const alignedTop = (() => {
        switch (align) {
          case 'end':
            return triggerRect.bottom - contentRect.height;
          case 'center':
            return triggerRect.top + (triggerRect.height - contentRect.height) / 2;
          default:
            return triggerRect.top; // "start"
        }
      })();

      switch (preferredPlacement) {
        case 'top':
          top = triggerRect.top - contentRect.height - gap;
          left = alignedLeft;
          break;
        case 'bottom':
          top = triggerRect.bottom + gap;
          left = alignedLeft;
          break;
        case 'left':
          top = alignedTop;
          left = triggerRect.left - contentRect.width - gap;
          break;
        case 'right':
          top = alignedTop;
          left = triggerRect.right + gap;
          break;
      }

      if (placement === 'top' && top < gap) {
        placement = 'bottom';
        top = triggerRect.bottom + gap;
      } else if (placement === 'bottom' && top + contentRect.height > viewportHeight - gap) {
        placement = 'top';
        top = triggerRect.top - contentRect.height - gap;
      } else if (placement === 'left' && left < gap) {
        placement = 'right';
        left = triggerRect.right + gap;
      } else if (placement === 'right' && left + contentRect.width > viewportWidth - gap) {
        placement = 'left';
        left = triggerRect.left - contentRect.width - gap;
      }

      // Always clamp to both viewport edges - not just the near one - regardless
      // of whether an explicit min/max size was passed. `autoWidth` consumers
      // (Combobox, Select, TagInput suggestions, Menu, ...) never set
      // minWidth/maxWidth, so gating this on those props left the far edge
      // (right/bottom) completely unclamped and let content overflow the
      // viewport whenever it rendered wider/taller than its trigger.
      top = Math.max(gap, Math.min(top, viewportHeight - contentRect.height - gap));

      left = Math.max(gap, Math.min(left, viewportWidth - contentRect.width - gap));

      return { top, left, placement };
    },
    [preferredPlacement, align],
  );

  const handleScroll = useCallback(() => {
    if (!isVisible || !dropdownState.isPositioned || isScrollingRef.current) return;

    isScrollingRef.current = true;

    animationFrameRef.current = requestAnimationFrame(() => {
      const triggerElement = getTriggerElement();
      if (triggerElement && contentRef.current) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

        setDropdownState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }

      isScrollingRef.current = false;
    });
  }, [isVisible, dropdownState.isPositioned, calculateOptimalPosition, getTriggerElement]);

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;

    if (isVisible) {
      setOpen(false);
    } else {
      if (dropdownGroup) {
        const siblingDropdowns = document.querySelectorAll(
          `[data-dropdown-group="${dropdownGroup}"][data-dropdown-content]`,
        );
        siblingDropdowns.forEach((dropdown) => {
          const dropdownElement = dropdown as HTMLElement;

          dropdownElement.dispatchEvent(new CustomEvent('closeSibling'));
        });
      }

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => setOpen(true), delay);
      } else {
        setOpen(true);
      }
    }
  }, [disabled, isVisible, delay, dropdownGroup, setOpen]);

  useEffect(() => {
    const handleCloseSibling = () => {
      if (isVisible) setOpen(false);
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener('closeSibling', handleCloseSibling);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('closeSibling', handleCloseSibling);
      }
    };
  }, [isVisible, setOpen]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !isVisible) return;

      const target = event.target as Node;

      if (contentRef.current?.contains(target)) {
        return;
      }

      if (getTriggerElement()?.contains(target)) {
        return;
      }

      const allDropdowns = document.querySelectorAll('[data-dropdown-content]');
      for (const dropdown of allDropdowns) {
        if (dropdown === contentRef.current) continue;

        if (dropdown.contains(target)) {
          const clickedDropdownLevel = parseInt(
            dropdown.getAttribute('data-dropdown-level') || '0',
          );

          if (clickedDropdownLevel > actualLevel) {
            return;
          }
        }
      }

      setOpen(false);
    },
    [closeOnClickOutside, isVisible, actualLevel, getTriggerElement, setOpen],
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isVisible) {
        setOpen(false);
      }
    },
    [closeOnEscape, isVisible, setOpen],
  );

  useEffect(() => {
    const triggerElement = getTriggerElement();
    if (isVisible && !dropdownState.isPositioned && contentRef.current && triggerElement) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

      setDropdownState((prev) => ({
        ...prev,
        position: { top, left, placement },
        isPositioned: true,
      }));
    }
  }, [
    isVisible,
    dropdownState.isPositioned,
    calculateOptimalPosition,
    getTriggerElement,
    // Load-bearing, not incidental. With `defaultOpen` the panel is "visible"
    // from the first render, but the portal is deferred one render for SSR
    // safety - so this effect's first run finds `contentRef.current` still
    // null, measures nothing, and without `isClient` in the deps it would never
    // run again. The panel then stays `visibility: hidden` forever: mounted,
    // unpositioned, invisible. Caught by `OpensOnMountWithDefaultOpen`.
    isClient,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const triggerElement = getTriggerElement();
      if (isVisible && dropdownState.isPositioned && contentRef.current && triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

        setDropdownState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, dropdownState.isPositioned, calculateOptimalPosition, getTriggerElement]);

  useEffect(() => {
    if (isVisible) {
      // Capture phase on `document`, which is the only way to see scrolling in
      // an arbitrary ancestor: `scroll` does not bubble from an element, so the
      // previous listeners on `window` and `document.body` only ever fired for
      // the page itself. Any other scroll container - `PageLayout`'s
      // `&__content` is the layout's scrollport, so this is every dropdown
      // inside it - moved the trigger while the portaled, `position: fixed`
      // content stayed at its original viewport coordinates.
      document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isVisible, handleScroll]);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isVisible, handleClickOutside, handleEscapeKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/*
        A positioning and click-capturing wrapper, and nothing more - it
        deliberately carries no `role` and no `tabIndex`.

        It used to be `role="button" tabIndex={-1}`, which was wrong in both
        directions at once. `tabIndex={-1}` with no key handler meant the
        wrapper was never keyboard-operable, so the button role it advertised
        could not be activated by anyone using a keyboard - it promised a
        control that did not exist. Meanwhile, because `trigger` is virtually
        always a real control (Select and Combobox pass an `<input>`, Menu and
        SplitButton a `<button>`, ...), the role wrapped an interactive element
        in another interactive element: invalid ARIA, flagged by axe as
        `nested-interactive`, and announced by screen readers as a button
        inside a button. One attribute did this across every component built
        on Dropdown - Select, Combobox, Menu, Popover, ContextMenu,
        ColorPicker and TagInput - 212 violations in a single axe run.

        Semantics belong to whatever is passed as `trigger`, which is the only
        element that can actually own them. A consumer passing a
        non-interactive node should pass a `<button>` instead; it was never
        keyboard-accessible under the old markup either.
      */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={`eidos-dropdown-trigger ${fullWidth ? 'eidos-dropdown-trigger--full-width' : ''} ${triggerClassName}`}
      >
        {trigger}
      </div>
      {isClient &&
        isVisible &&
        createPortal(
          <div
            ref={contentRef}
            data-dropdown-content
            data-dropdown-level={actualLevel}
            data-dropdown-group={dropdownGroup || ''}
            className={`eidos-dropdown-content eidos-dropdown-content--${dropdownState.position.placement} ${isNested ? 'eidos-dropdown-content--nested' : ''} ${dropdownState.isPositioned ? 'eidos-dropdown-content--positioned' : ''} ${contentClassName || ''}`}
            style={{
              top: dropdownState.position.top,
              left: dropdownState.position.left,
              ...calculateDynamicSizing(getTriggerElement()?.getBoundingClientRect() ?? null),
            }}
            // No default role: see the `role` prop's note in `Dropdown.types`.
            // This was `role="menu"` unconditionally, which made a menu out of
            // every `Select` listbox, date picker and toolbar panel in the
            // library.
            role={role}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};

export const Dropdown: React.FC<DropdownProps> = (props) => {
  const context = useDropdownContext();
  const nextLevel = props.dropdownLevel !== undefined ? props.dropdownLevel : context.level + 1;

  return (
    <DropdownProvider level={nextLevel}>
      <DropdownInternal {...props} />
    </DropdownProvider>
  );
};

Dropdown.displayName = 'Dropdown';
