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
  useEffect(() => {
    const element = node.current;
    if (!element || key === undefined) return;

    const record = () => offsets.current.set(key, element.scrollTop);
    element.addEventListener('scroll', record, { passive: true });
    return () => element.removeEventListener('scroll', record);
  }, [key]);

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
