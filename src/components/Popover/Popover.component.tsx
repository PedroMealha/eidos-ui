import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PopoverProps, PopoverState, PopoverPlacement } from './Popover.types';

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
    [preferredPlacement]
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
  }, [popoverState.isVisible, popoverState.isPositioned, calculateOptimalPosition]);

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
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.body.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('scroll', handleScroll);
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
    [closeOnClickOutside, popoverState.isVisible, close]
  );

  // ── Escape key handler ────────────────────────────────────────────────────
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && popoverState.isVisible) {
        close();
      }
    },
    [closeOnEscape, popoverState.isVisible, close]
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
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger wrapper */}
      <div
        ref={triggerRef}
        className={['eidos-popover-trigger', className].filter(Boolean).join(' ')}
        onClick={toggle}
        aria-expanded={popoverState.isVisible}
        aria-haspopup="dialog"
      >
        {trigger}
      </div>

      {/* Portal: floating panel */}
      {popoverState.isVisible &&
        createPortal(
          <div
            ref={contentRef}
            role="dialog"
            aria-modal="false"
            aria-label={title ?? 'Popover'}
            className={[
              'eidos-popover-content',
              `eidos-popover-content--${popoverState.position.placement}`,
              popoverState.isPositioned ? 'eidos-popover-content--visible' : '',
              contentClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              position: 'fixed',
              top: popoverState.position.top,
              left: popoverState.position.left,
              maxWidth: maxWidth,
              zIndex: 9999,
            }}
          >
            {(title || showCloseButton) && (
              <div className="eidos-popover-header">
                {title && <span className="eidos-popover-title">{title}</span>}
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
          document.body
        )}
    </>
  );
};

Popover.displayName = 'Popover';
