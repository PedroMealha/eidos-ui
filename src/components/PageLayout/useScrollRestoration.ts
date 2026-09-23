import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Remembers the content region's scroll offset per key, and applies the
 * stored offset whenever the key changes.
 *
 * The key is supplied by the consumer rather than derived here, because only
 * they know what counts as a navigation - this library has no router opinion.
 * That also decides the semantics, exactly as React Router's `getKey` does:
 * a per-path key gives "this path always reopens where you left it", while a
 * per-history-entry key gives the browser's own behaviour, where Back
 * restores but a fresh link to the same URL starts at the top.
 *
 * Returns a ref callback for the scroll container, which also forwards the
 * node to the caller's own `contentRef`.
 */
export const useScrollRestoration = (
  key: string | number | undefined,
  forwardTo: React.Ref<HTMLElement> | undefined,
): ((node: HTMLElement | null) => void) => {
  const node = useRef<HTMLElement | null>(null);
  const offsets = useRef(new Map<string | number, number>());
  const appliedKey = useRef(key);

  // Held in a ref so the ref callback below can keep a stable identity. A
  // callback ref that changes identity is invoked with `null` and then the
  // node again on every render that changes it, which would detach and
  // reattach the caller's ref for no reason.
  const forwarded = useRef(forwardTo);
  useEffect(() => {
    forwarded.current = forwardTo;
  }, [forwardTo]);

  const setNode = useCallback((element: HTMLElement | null) => {
    node.current = element;
    const ref = forwarded.current;
    if (typeof ref === 'function') ref(element);
    else if (ref) (ref as React.RefObject<HTMLElement | null>).current = element;
  }, []);

  // Recorded as it happens rather than when the key changes: by the time a
  // navigation commits, the new page's content is already in the DOM and the
  // browser has clamped `scrollTop` to the new, possibly shorter, height. The
  // outgoing offset is no longer readable at that point.
  //
  // **The key is read from a ref, and the listener is registered once.** Both
  // halves matter. A listener re-subscribed per key closes over the key it was
  // created with, and restoring the incoming page's offset sets `scrollTop`,
  // which makes the browser dispatch a `scroll` event - so the two race:
  //
  //   1. the layout effect below sets `scrollTop` for the incoming key
  //   2. passive effects swap the listener from the outgoing key to it
  //   3. the browser dispatches the scroll event from step 1
  //
  // React flushes passive effects through the scheduler and the browser
  // dispatches `scroll` at its own rendering opportunity, so nothing orders 2
  // before 3. When 3 won, the still-attached *outgoing* listener recorded the
  // incoming page's offset under the outgoing page's key - overwriting a real
  // offset with 0 and losing the position it exists to keep. It passed locally
  // and failed in CI, which is what a race of this shape looks like.
  //
  // Reading `appliedKey` instead means whichever order those steps take, the
  // offset is filed under the key that is actually on screen: the layout effect
  // updates the ref before it touches `scrollTop`.
  useEffect(() => {
    const element = node.current;
    if (!element) return;

    const record = () => {
      const current = appliedKey.current;
      if (current !== undefined) offsets.current.set(current, element.scrollTop);
    };

    element.addEventListener('scroll', record, { passive: true });
    return () => element.removeEventListener('scroll', record);
    // Registered once, for the same reason: re-subscribing is what created the
    // window where a stale key could be recorded.
  }, []);

  // Layout effect so the offset is applied before paint - in a passive effect
  // the new page is visible at the previous page's offset for a frame first.
  // It does not run on the server, which is correct here: there is no scroll
  // position to restore in static markup, and the client applies it on mount.
  useLayoutEffect(() => {
    const element = node.current;
    if (!element || key === undefined || appliedKey.current === key) return;

    appliedKey.current = key;
    element.scrollTop = offsets.current.get(key) ?? 0;
  }, [key]);

  return setNode;
};
