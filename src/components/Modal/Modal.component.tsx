import React, { useEffect, useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button.component';
import type { ModalProps } from './Modal.types';
import { renderIcon, useDialogFocus, useIsClient } from '../../utils';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  type,
  children,
  actions = [],
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = 'md',
  className = '',
}) => {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();

  // ── Animation state ────────────────────────────────────────────────────────
  // isMounted: whether the portal DOM node exists at all.
  // isVisible: whether the '--is-open' CSS class is applied (drives the transition).
  //
  // On open:  mount first → one rAF → apply --is-open (browser sees the
  //           initial faded/scaled-down state before transitioning, so the
  //           animation fires instead of just painting straight into "open").
  // On close: remove --is-open (CSS transition plays) → after 200 ms unmount.
  //           200 ms matches the CSS `transition: 0.2s` in Modal.scss.
  const TRANSITION_MS = 200;
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
      // The second frame guarantees the modal is rendered in its closed
      // (faded/scaled-down) state before the CSS transition begins.
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

  // Handle escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose],
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose],
  );

  // Add/remove escape key listener (tied to isOpen, not isMounted)
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscapeKey]);

  // Keyed to `isVisible`, not `isOpen` and not `isMounted`.
  //
  // `isOpen` alone is too early: `isMounted` is set in the effect above, one
  // render later, so the dialog element does not exist yet and the trap would
  // run against a null ref.
  //
  // `isMounted` is *also* too early, and fails more quietly. `.eidos-modal`
  // starts at `visibility: hidden` and only becomes visible with
  // `--is-open`, which is two animation frames later - so at mount there is
  // nothing focusable to find and `.focus()` on the dialog itself is a no-op.
  // Focus silently stayed on the trigger.
  // `isClient` is part of the gate, not just the render below: a modal that
  // starts open flips `isVisible` before the portal exists, so the hook would
  // find a null ref, return early, and never re-run - leaving focus outside a
  // dialog claiming `aria-modal`.
  useDialogFocus(isClient && isOpen && isVisible, dialogRef);

  // `isMounted` is initialised to `isOpen`, so a modal that starts open reaches
  // `createPortal` on its very first render - which throws under SSR, where
  // there is no `document`. The animation flag cannot cover that; `isClient`
  // can. See `useIsClient`.
  if (!isClient || !isMounted) return null;

  const modalContent = (
    <div className={`eidos-modal ${isVisible ? 'eidos-modal--is-open' : ''} ${className}`}>
      <div className="eidos-modal-backdrop" onClick={handleBackdropClick} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={bodyId}
        className={`eidos-modal-content eidos-modal-content--${size}`}
      >
        {title && (
          <div className={`eidos-modal-header ${type ? `eidos-modal-header--${type}` : ''}`}>
            <h4 id={titleId}>
              {icon && renderIcon(icon, 'eidos-modal-icon')} {title}
            </h4>
          </div>
        )}

        <div id={bodyId} className="eidos-modal-body">
          {children}
        </div>

        {actions.length > 0 && (
          <div className={`eidos-modal-footer`}>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outlined'}
                size={action.size || 'md'}
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
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';
