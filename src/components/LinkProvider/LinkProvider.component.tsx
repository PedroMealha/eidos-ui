import React from 'react';
import { LinkContext } from './LinkProvider.context';
import type { LinkProviderProps } from './LinkProvider.types';

/**
 * Sets the component every library link renders with.
 *
 * A context rather than a per-component prop because the router is app-wide:
 * one provider at the root reaches every `Button`, `Chip`, `Header` and
 * `Toolbar` action and `Breadcrumb` crumb, including ones built from config
 * objects where there is nowhere to pass a component. Unlike `ThemeProvider`
 * it writes nothing global, so nesting is fine - the nearest one wins.
 */
export const LinkProvider: React.FC<LinkProviderProps> = ({ component, children }) => (
  <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
);

LinkProvider.displayName = 'LinkProvider';
