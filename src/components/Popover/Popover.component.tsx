import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PopoverProps, PopoverState, PopoverPlacement } from './Popover.types';
import { useDialogFocus, useIsClient } from '../../utils';

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  title,
  placement: preferredPlacement = 'bottom',
  showCloseButton = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  disabled = false,
  isOpen,
  defaultOpen,
  onOpenChange,
  maxWidth = 320,
  className,
  contentClassName,
}) => {
  // `isOpen`/`defaultOpen` make the portal reachable on the first render,
  // which cannot happen on a server - see `useIsClient`.
  const isClient = useIsClient();

  // ── Controlled / uncontrolled bridge ──────────────────────────────────────
  const isControlled = isOpen !== undefined;
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
  const isVisible = isControlled ? isOpen! : localOpen;

  // ── Positioning state ─────────────────────────────────────────────────────
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    isPositioned: false,
    position: { top: 0, left: 0, placement: preferredPlacement },
  });

  // Names the dialog by pointing at the rendered title, the same way `Modal`
  // and `Drawer` do. This was an `aria-label={title ?? 'Popover'}`, which
  // both duplicated the visible text into a second, invisible copy and hard
  // limited `title` to a string - `aria-label` takes only a string, so a
  // `ReactNode` title would have been stringified to "[object Object]" and
  // silently destroyed the accessible name.
  const titleId = useId();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isScrollingRef = useRef(false);

  // ── Open / close helpers ──────────────────────────────────────────────────
  const open = useCallback(() => {
    if (disabled) return;
    if (!isControlled) setLocalOpen(true);
    onOpenChange?.(true);
  }, [disabled, isControlled, onOpenChange]);

  const close = useCallback(() => {
    if (!isControlled) setLocalOpen(false);
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, open, close]);

  // ── Positioning calculation ───────────────────────────────────────────────
  const calculateOptimalPosition = useCallback(
    (triggerRect: DOMRect, contentRect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let placement: PopoverPlacement = preferredPlacement;
      let top = 0;
      let left = 0;

      switch (preferredPlacement) {
        case 'top':
          top = triggerRect.top - contentRect.height - gap;
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + gap;
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.left - contentRect.width - gap;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.right + gap;
          break;
      }

      // Flip if it doesn't fit in the preferred direction
      if (placement === 'top' && top < gap) {
        placement = 'bottom';
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      } else if (placement === 'bottom' && top + contentRect.height > viewportHeight - gap) {
        placement = 'top';
        top = triggerRect.top - contentRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      } else if (placement === 'left' && left < gap) {
        placement = 'right';
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        left = triggerRect.right + gap;
      } else if (placement === 'right' && left + contentRect.width > viewportWidth - gap) {
        placement = 'left';
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        left = triggerRect.left - contentRect.width - gap;
      }

      // Clamp to viewport
      top = Math.max(gap, Math.min(top, viewportHeight - contentRect.height - gap));
      left = Math.max(gap, Math.min(left, viewportWidth - contentRect.width - gap));

      return { top, left, placement };
    },
    [preferredPlacement],
  );

  // ── Sync isVisible → popoverState ─────────────────────────────────────────
  useEffect(() => {
    if (isVisible) {
      setPopoverState((prev) => ({ ...prev, isVisible: true, isPositioned: false }));
    } else {
      setPopoverState((prev) => ({ ...prev, isVisible: false, isPositioned: false }));
    }
  }, [isVisible]);

  // ── Two-pass positioning (Pass 2: measure then commit) ────────────────────
  useEffect(() => {
    if (
      popoverState.isVisible &&
      !popoverState.isPositioned &&
      contentRef.current &&
      triggerRef.current
    ) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

      setPopoverState((prev) => ({
        ...prev,
        position: { top, left, placement },
        isPositioned: true,
      }));
    }
    // `isClient` for the same reason as `Dropdown`: with `defaultOpen` the
    // portal arrives one render after this effect first runs, and without it in
    // the deps the panel is never measured and never becomes visible.
  }, [popoverState.isVisible, popoverState.isPositioned, calculateOptimalPosition, isClient]);

  // ── Scroll repositioning ─────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!popoverState.isVisible || !popoverState.isPositioned || isScrollingRef.current) return;

    isScrollingRef.current = true;

    animationFrameRef.current = requestAnimationFrame(() => {
      if (triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

        setPopoverState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }

      isScrollingRef.current = false;
    });
  }, [popoverState.isVisible, popoverState.isPositioned, calculateOptimalPosition]);

  // ── Resize repositioning ──────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (
        popoverState.isVisible &&
        popoverState.isPositioned &&
        contentRef.current &&
        triggerRef.current
      ) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, contentRect);

        setPopoverState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [popoverState.isVisible, popoverState.isPositioned, calculateOptimalPosition]);

  // ── Scroll listener registration ─────────────────────────────────────────
  useEffect(() => {
    if (popoverState.isVisible) {
      // Capture phase on `document` - see the note in `Dropdown`. `scroll` does
      // not bubble, so listeners on `window`/`document.body` miss every
      // ancestor scroll container and the portaled panel detaches from its
      // trigger.
      document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [popoverState.isVisible, handleScroll]);

  // ── Click-outside handler ─────────────────────────────────────────────────
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !popoverState.isVisible) return;

      const target = event.target as Node;

      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      close();
    },
    [closeOnClickOutside, popoverState.isVisible, close],
  );

  // ── Escape key handler ────────────────────────────────────────────────────
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && popoverState.isVisible) {
        close();
      }
    },
    [closeOnEscape, popoverState.isVisible, close],
  );

  // ── Register global event listeners ──────────────────────────────────────
  useEffect(() => {
    if (popoverState.isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [popoverState.isVisible, handleClickOutside, handleEscapeKey]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    const timeoutId = timeoutRef.current;
    const animationFrameId = animationFrameRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Non-modal focus handling: move focus into the panel and return it to the
  // trigger on close, but leave Tab free.
  //
  // `trapTab: false` because this dialog is honestly `aria-modal="false"` -
  // the rest of the page stays available, so confining Tab would strand the
  // user. Moving focus in is still required: the panel is portaled to
  // `document.body`, so Tab from the trigger continues into whatever follows
  // it in the page and the panel's own controls cannot be reached at all.
  //
  // Keyed to `isPositioned`, not `isVisible`: the panel renders off-screen
  // for one frame while its placement is measured, and focusing it in that
  // state scrolls the page to wherever it was parked.
  useDialogFocus(popoverState.isVisible && popoverState.isPositioned, contentRef, {
    trapTab: false,
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger wrapper.

          The wrapper carries no ARIA. It had `aria-expanded` and
          `aria-haspopup` while having no role, which is invalid - both need
          a role that supports them, and adding `role="button"` here would be
          worse still, since the trigger inside is usually a real button
          (that is the `nested-interactive` shape already fixed on
          `Dropdown`).

          Instead the state is cloned onto the trigger element, which is the
          thing a user actually activates. Guarded by `isValidElement`
          because `trigger` is typed as `ReactNode` and may be a bare string,
          in which case there is nothing to annotate and the wrapper stays
          exactly as it was. */}
      <div
        ref={triggerRef}
        className={['eidos-popover-trigger', className].filter(Boolean).join(' ')}
        onClick={toggle}
      >
        {React.isValidElement(trigger)
          ? React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
              'aria-expanded': popoverState.isVisible,
              'aria-haspopup': 'dialog',
            })
          : trigger}
      </div>

      {/* Portal: floating panel */}
      {isClient &&
        popoverState.isVisible &&
        createPortal(
          <div
            ref={contentRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={title ? titleId : undefined}
            // Only the untitled case still needs a literal label - there is
            // no visible text to point at.
            aria-label={title ? undefined : 'Popover'}
            className={[
              'eidos-popover-content',
              `eidos-popover-content--${popoverState.position.placement}`,
              popoverState.isPositioned ? 'eidos-popover-content--visible' : '',
              contentClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              top: popoverState.position.top,
              left: popoverState.position.left,
              maxWidth: maxWidth,
            }}
          >
            {(title || showCloseButton) && (
              <div className="eidos-popover-header">
                {title && (
                  <span id={titleId} className="eidos-popover-title">
                    {title}
                  </span>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="eidos-popover-close"
                    onClick={close}
                    aria-label="Close popover"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
            <div className="eidos-popover-body">{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
};

Popover.displayName = 'Popover';
