import { useEffect, useState } from 'react';

/**
 * `false` on the server and on the very first client render, `true` from the
 * first effect onwards.
 *
 * ## Why this exists
 *
 * Every overlay in this library renders through `createPortal(…,
 * document.body)`. A portal is a client-only construct: there is no
 * `document` during `renderToString`, so any overlay that is *already open on
 * its first render* does not merely render oddly - it throws, and takes the
 * whole server render down with it. Measured against the built package:
 *
 * ```
 * renderToString(<Modal isOpen>)          ReferenceError: document is not defined
 * renderToString(<Dropdown defaultOpen>)  ReferenceError: DOMRect is not defined
 * renderToString(<Select autoOpen>)       ReferenceError: DOMRect is not defined
 * ```
 *
 * `Modal`, `Drawer` and `CommandPalette` each keep an `isMounted` flag, which
 * looks like it would prevent this and does not: it is initialised to
 * `useState(isOpen)`, so it is already `true` on the first render. It exists
 * to sequence the open/close *animation*, not to defer the portal.
 *
 * With this hook the server renders nothing for the panel, and the portal
 * appears on the client after mount.
 *
 * ## Why a state flag rather than `typeof document !== 'undefined'`
 *
 * That check is `true` during hydration, so the client's first render would
 * produce the portal while the server's produced nothing - a hydration
 * mismatch, which React resolves by discarding and re-rendering the subtree.
 * A state flag set in an effect makes the first client render agree with the
 * server by construction, and the portal arrive one render later.
 *
 * ## Scope
 *
 * Only for components that can be open on their first render - `Dropdown`
 * (`defaultOpen`), `Popover`, `Modal`, `Drawer`, `CommandPalette`. `Tooltip`,
 * `ContextMenu` and `Snackbar` can only open in response to an event, which
 * cannot happen during a server render, so they need nothing. `check-ssr.js`
 * asserts all of them either way.
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
