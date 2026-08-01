import React, { useEffect, useCallback, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../Button';
import type { DrawerProps } from './Drawer.types';

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  title,
  children,
  actions,
  size = 'medium',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const titleId = useId();
  const bodyId = useId();

  // ── Animation state ────────────────────────────────────────────────────────
  // isMounted: whether the portal DOM node exists at all.
  // isVisible: whether the '--open' CSS class is applied (drives the transition).
  //
  // On open:  mount first → one rAF → apply --open (browser sees initial
  //           closed position before transitioning, so the animation fires).
  // On close: remove --open (CSS transition plays) → after 300 ms unmount.
  //           300 ms matches the CSS `transition: 0.3s` in Drawer.scss.
  const TRANSITION_MS = 300;
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timerId: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsMounted(true);
      // Double rAF: React 18 automatic batching means setIsMounted(true) may
      // not produce a committed browser paint before the first rAF fires.
      // The second frame guarantees the panel is rendered in its off-screen
      // (closed) position before the CSS transition begins.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      timerId = setTimeout(() => setIsMounted(false), TRANSITION_MS);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timerId);
    };
  }, [isOpen]);

  // ── Escape key + scroll lock (tied to isOpen, not isMounted) ───────────────
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscapeKey]);

  // ── Backdrop click ─────────────────────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!isMounted) return null;

  return createPortal(
    <div
      className={[
        'eidos-drawer',
        `eidos-drawer--${placement}`,
        isVisible && 'eidos-drawer--open',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Backdrop */}
      <div
        className="eidos-drawer-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={bodyId}
        className={[
          'eidos-drawer-panel',
          `eidos-drawer-panel--${size}`,
          `eidos-drawer-panel--${placement}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        <div className="eidos-drawer-header">
          {title && (
            <h3 id={titleId} className="eidos-drawer-title">
              {title}
            </h3>
          )}
          <button
            type="button"
            className="eidos-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div id={bodyId} className="eidos-drawer-body">
          {children}
        </div>

        {/* Footer — only rendered when actions are provided */}
        {actions && actions.length > 0 && (
          <div className="eidos-drawer-footer">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant ?? 'outlined'}
                color={action.color}
                disabled={action.disabled}
                loading={action.loading}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Drawer.displayName = 'Drawer';
