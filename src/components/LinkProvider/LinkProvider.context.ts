import { createContext, useContext } from 'react';
import type { LinkComponent } from './LinkProvider.types';

/**
 * Defaults to a plain anchor rather than `undefined`: unlike `useTheme`, a
 * missing provider is not a misconfiguration - it is the ordinary case for a
 * site without client-side routing.
 */
export const LinkContext = createContext<LinkComponent>('a');

/** The link component set by the nearest `LinkProvider`, or `'a'`. */
export const useLinkComponent = (): LinkComponent => useContext(LinkContext);
