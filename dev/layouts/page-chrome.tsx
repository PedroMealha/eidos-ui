import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { HeaderActionProps, HeaderProps } from 'eidos-ui';
import { useRouter } from '../routes/router';

/**
 * How a page tells the shell what chrome to draw for it.
 *
 * The app renders exactly one `PageLayout` (see `admin-layout.tsx`). Pages
 * therefore cannot render their own header - they declare it here instead,
 * and the shell picks it up. This is what keeps a single layout instance
 * serving every route, including nested ones, without each page having to
 * restate the whole navigation/toolbar/footer configuration.
 *
 * Only the *dynamic* half belongs here - anything knowable from the URL
 * alone (title, breadcrumb label) lives in the route table and is applied
 * first, so a route paints correct chrome immediately. Registering happens
 * in an effect, one commit after the page renders; without those route-level
 * defaults underneath, every navigation would briefly show the previous
 * page's title.
 *
 * Considered and rejected: portalling JSX into slots in the layout.
 * `PageLayout` takes `header` as data (`HeaderProps`, with `actions` as an
 * array of button descriptors), not as children - there is no DOM slot to
 * portal into, and portalled markup would bypass `Header`'s own layout.
 */
export type PageChrome = {
  /** Overrides the route's static title - for titles that depend on loaded data. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Page-level actions, rendered in the shell's `Header`. */
  actions?: HeaderActionProps[];
  /** Overrides the last breadcrumb label - the counterpart to a dynamic `title`. */
  breadcrumb?: string;
};

type Registration = { path: string; chrome: PageChrome };

type PageChromeContextValue = {
  registration: Registration | null;
  register: (path: string, chrome: PageChrome) => void;
  clear: (path: string) => void;
};

const PageChromeContext = createContext<PageChromeContextValue | null>(null);

const usePageChromeContext = (): PageChromeContextValue => {
  const context = useContext(PageChromeContext);
  if (!context) throw new Error('Page chrome hooks must be used inside <PageChromeProvider>.');
  return context;
};

export const PageChromeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registration, setRegistration] = useState<Registration | null>(null);

  const register = useCallback(
    (path: string, chrome: PageChrome) => setRegistration({ path, chrome }),
    [],
  );

  // Only clears if the outgoing page is still the one registered: during a
  // navigation React runs the old tree's cleanup and the new tree's effects
  // in the same commit, and a blind reset here could discard the incoming
  // page's registration depending on which ran last.
  const clear = useCallback(
    (path: string) => setRegistration((current) => (current?.path === path ? null : current)),
    [],
  );

  const value = useMemo<PageChromeContextValue>(
    () => ({ registration, register, clear }),
    [registration, register, clear],
  );

  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>;
};

/**
 * Registers this page's chrome with the shell for as long as it is mounted.
 *
 * `chrome` **must be referentially stable** - wrap it in `useMemo`. It is an
 * effect dependency, so a fresh object every render re-registers every
 * render, which re-renders the shell, forever. Taking the object directly
 * (rather than a value + dependency array) is what keeps
 * `react-hooks/exhaustive-deps` able to verify the call site, which matters
 * because `npm run lint` runs with `--max-warnings 0`. Same contract as
 * `useAsync`'s memoized loader.
 *
 * ```tsx
 * usePageChrome(
 *   useMemo(() => ({ title: member?.name, actions: [...] }), [member]),
 * );
 * ```
 */
export const usePageChrome = (chrome: PageChrome): void => {
  const { path } = useRouter();
  const { register, clear } = usePageChromeContext();

  useEffect(() => {
    register(path, chrome);
    return () => clear(path);
  }, [register, clear, path, chrome]);
};

export type ResolvedChrome = {
  header: HeaderProps;
  /** Label for the final breadcrumb, once a page has refined it. */
  breadcrumb?: string;
};

/**
 * Merges the route table's static chrome with whatever the current page has
 * registered on top of it. Page values win, but only where actually
 * provided - a page whose title depends on data it hasn't loaded yet leaves
 * `title` undefined and keeps the route's own, rather than blanking the
 * header while the request is in flight.
 */
export const useResolvedChrome = (): ResolvedChrome => {
  const { path, match } = useRouter();
  const { registration } = usePageChromeContext();

  // A registration from the page we just navigated away from must never be
  // applied to the incoming one.
  const override = registration?.path === path ? registration.chrome : undefined;
  const route = match?.route;

  return {
    header: {
      title: override?.title ?? route?.title ?? 'Not found',
      subtitle: override?.subtitle ?? route?.subtitle,
      actions: override?.actions,
    },
    breadcrumb: override?.breadcrumb,
  };
};
