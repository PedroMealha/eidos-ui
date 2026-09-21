import { useEffect, type RefObject } from 'react';

/**
 * Focus management for a dialog: move focus in on open, optionally trap Tab
 * inside it, and restore focus to the opener on close.
 *
 * Named for the job rather than the mechanism because the trap is optional.
 * `Popover` declares `aria-modal="false"` - an honest non-modal dialog - so
 * trapping Tab in it would be wrong, but it still needs the other two: its
 * panel is portaled to `document.body`, so without moving focus in, Tab from
 * the trigger goes to whatever follows it in the page and the panel's own
 * controls are unreachable by keyboard entirely.
 *
 * ## Why this exists
 *
 * `Modal`, `Drawer` and `CommandPalette` all rendered
 * `role="dialog" aria-modal="true"` with no focus management whatsoever. That
 * attribute is a **promise to assistive technology that the rest of the page
 * is inert**, and it was false: measured in a browser, focus never entered the
 * dialog, and Tab moved to the page behind the scrim on the first press
 * (Drawer on the second). Drawer additionally dropped focus onto `<body>` when
 * it closed, so a keyboard user was returned to the top of the document.
 *
 * That is WCAG 2.4.3 Focus Order (Level A), and it is invisible to axe - a
 * static snapshot of the DOM looks perfectly correct.
 *
 * ## Nesting
 *
 * Traps register on a module-level stack and only the innermost one acts, so a
 * dialog opened from a dialog behaves correctly. Without this, both listeners
 * fire for the same Tab and fight over where focus lands.
 *
 * ## What this does *not* do
 *
 * It does not mark the background `inert`. A trap plus `aria-modal` is the
 * widely-supported approach and is what screen readers act on; `inert` on
 * every sibling of the portal root would be stronger, but it needs the
 * component to know about DOM it does not own. Worth revisiting if a
 * consumer reports a screen reader escaping the dialog in browse mode.
 */

/**
 * Deliberately not `[tabindex]` in general - that would match `tabindex="-1"`,
 * which is programmatically focusable but explicitly removed from the Tab
 * sequence, so including it would make Tab stop somewhere the user cannot
 * reach by tabbing in the first place.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'details > summary:first-of-type',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

/**
 * `offsetParent === null` is the usual visibility check and is wrong here: it
 * is also null for `position: fixed` elements, which is exactly what a modal
 * is. `getClientRects()` is empty only when the element genuinely does not
 * render.
 */
const isVisible = (element: HTMLElement): boolean =>
  element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => isVisible(element) && element.closest('[aria-hidden="true"]') === null,
  );

/** Innermost trap last. Only the last entry responds to Tab. */
const trapStack: HTMLElement[] = [];

export interface UseDialogFocusOptions {
  /** Focused when the trap activates. Defaults to the first focusable child. */
  initialFocus?: RefObject<HTMLElement | null>;
  /**
   * Whether to return focus to whatever had it when the trap activated.
   * Defaults to `true`; pass `false` when the caller restores focus itself.
   */
  restoreFocus?: boolean;
  /**
   * Whether Tab is confined to the container. Defaults to `true`.
   *
   * Set `false` for a non-modal dialog (`aria-modal="false"`), where the rest
   * of the page stays available and trapping would strand the user.
   */
  trapTab?: boolean;
}

export const useDialogFocus = (
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  { initialFocus, restoreFocus = true, trapTab = true }: UseDialogFocusOptions = {},
): void => {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    // Captured before focus moves. The caller must only flip `active` to true
    // once the container is in the DOM - for the animated overlays that means
    // `isOpen && isMounted`, since `isMounted` is set in an effect one render
    // later and the container does not exist before it.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    trapStack.push(container);

    // Moving focus in is retried across a few frames rather than attempted
    // once.
    //
    // These overlays animate open, and `.focus()` on an element that is still
    // `visibility: hidden` is a silent no-op - it does not throw, it just
    // leaves focus where it was. `Modal` sets its `--is-open` class two
    // animation frames after mounting, and the computed style has not caught
    // up at the moment the effect runs, so a single attempt focused nothing
    // and the trap looked broken.
    //
    // Retrying is better than keying off any particular animation: the hook
    // stays ignorant of each component's transition duration, and simply
    // stops as soon as focus has actually landed inside.
    const MAX_FRAMES = 10;
    let frame = 0;
    let attempts = 0;

    const tryFocus = () => {
      const target = initialFocus?.current ?? getFocusable(container)[0];
      if (target) {
        target.focus();
      } else {
        // A dialog with nothing focusable in it still must not leave focus on
        // the page behind, so the container takes it. `tabindex="-1"` keeps
        // it out of the Tab sequence while allowing `.focus()`.
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
        container.focus();
      }

      if (!container.contains(document.activeElement) && attempts < MAX_FRAMES) {
        attempts += 1;
        frame = requestAnimationFrame(tryFocus);
      }
    };

    tryFocus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Only the innermost trap acts.
      if (trapStack[trapStack.length - 1] !== container) return;

      // Re-queried on every Tab rather than cached: dialog contents change
      // (a disabled Confirm button becoming enabled, a list filtering down),
      // and a stale list sends focus to an element that is no longer there.
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      // Focus outside the container - e.g. a click landed on the backdrop.
      // Pull it back in rather than letting Tab continue through the page.
      if (!activeElement || !container.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    if (trapTab) document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);

      const index = trapStack.lastIndexOf(container);
      if (index !== -1) trapStack.splice(index, 1);

      // Restore only if focus still belongs to the closing dialog.
      //
      // Two cases count as "belongs":
      //
      // 1. Focus is still inside the container.
      // 2. Focus has been lost to `<body>`. When the overlay hides, the
      //    browser blurs whatever was focused inside it, so by the time this
      //    cleanup runs `activeElement` is often already `<body>` - checking
      //    only case 1 meant `CommandPalette` never restored at all.
      //
      // Anything else means something took focus deliberately - a confirm
      // action moving to a new region, say - and stealing it back would be
      // worse than doing nothing.
      const active = document.activeElement;
      const focusIsOurs = container.contains(active) || active === document.body || active === null;

      if (restoreFocus && focusIsOurs && previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, initialFocus, restoreFocus, trapTab]);
};
