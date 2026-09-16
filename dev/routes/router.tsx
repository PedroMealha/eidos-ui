import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { matchRoute, type RouteMatch, type RouteParams } from './routes';

/**
 * Minimal hash-based router.
 *
 * Deliberately hand-rolled: the example app needs a handful of routes, a
 * dynamic segment and a redirect, which is not worth adding a routing
 * dependency to a component library's devDependencies. Hash routing also
 * means the app works when opened from a static file server with no rewrite
 * rules.
 */
type RouterValue = {
  path: string;
  /** The matched route and its params, or `null` for an unknown path. */
  match: RouteMatch | null;
  /** Captured `:param` segments of the current route; empty for static routes. */
  params: RouteParams;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterValue | null>(null);

const readPath = (): string => {
  const raw = window.location.hash.replace(/^#/, '');
  return raw.startsWith('/') ? raw : '/';
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(readPath);

  useEffect(() => {
    const handleChange = () => setPath(readPath());
    window.addEventListener('hashchange', handleChange);
    return () => window.removeEventListener('hashchange', handleChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (readPath() === to) return;
    window.location.hash = to;
  }, []);

  const match = useMemo(() => matchRoute(path), [path]);

  const value = useMemo<RouterValue>(
    () => ({ path, match, params: match?.params ?? {}, navigate }),
    [path, match, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = (): RouterValue => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used inside <RouterProvider>.');
  return context;
};
