import type React from 'react';
import { LayoutDashboard, Settings, Ticket as TicketIcon, Users } from 'lucide-react';
import { DashboardPage } from '../pages/dashboard-page';
import { TeamPage } from '../pages/team-page';
import { TeamMemberPage } from '../pages/team-member-page';
import { TicketsPage } from '../pages/tickets-page';
import { AdvancedPage } from '../pages/settings/advanced-page';
import { NotificationsPage } from '../pages/settings/notifications-page';
import { ProfilePage } from '../pages/settings/profile-page';
import { SettingsLayout } from '../pages/settings/settings-layout';
import { ThemePage } from '../pages/settings/theme-page';
import { AccountPage } from '../pages/account-page';

/**
 * The authenticated route table - the single source of truth for what exists
 * at each path and what chrome the shell should draw for it.
 *
 * The chrome here is the *static* half: the title and breadcrumb label that
 * are knowable from the URL alone. It exists so the shell can render correct
 * chrome on the very first paint of a route. The dynamic half (a title that
 * depends on loaded data, actions wired to page state) is layered on top by
 * the page itself via `usePageChrome` - see `layouts/page-chrome.tsx`.
 *
 * Deliberately hand-rolled rather than pulling in a router: the example app
 * needs pattern matching over a handful of routes, which is not worth a
 * dependency in a component library's devDependencies.
 */

export type RouteParams = Record<string, string>;

/**
 * Icon shape accepted by *both* consumers of these icons: `Navigation`'s
 * `IconType` (which also allows a string name, resolved via `renderIcon`) and
 * `CommandItem.icon` (which does not - `CommandPalette` renders the component
 * directly as `<Icon size={16} />`). Typing the table against the narrower of
 * the two means neither call site needs a cast.
 */
type RouteIcon = React.ComponentType<{ className?: string; size?: number }>;

type BaseRoute = {
  /** Path pattern. A `:name` segment matches anything and is captured into `params`. */
  pattern: string;
  /** Default `Header` title. Pages may override it with something data-dependent. */
  title: string;
  /** Default `Header` subtitle. */
  subtitle?: string;
  /** Breadcrumb trail label. Defaults to `title` when omitted. */
  breadcrumb?: string;
  /** Pattern of the parent route; drives both the breadcrumb trail and navigation ownership. */
  parent?: string;
  /** Hidden from navigation and refused on direct URL entry for non-admins. */
  adminOnly?: boolean;
  /** Present only on routes that are themselves a navigation rail entry. */
  nav?: { label: string; icon: RouteIcon };
  /**
   * Chrome shared by a group of sibling routes, mounted *around* the page.
   *
   * It has to be declared here rather than rendered by each page, because a
   * page component is swapped wholesale on navigation: a layout rendered
   * inside it is a different element on every route and React remounts it,
   * losing its state. `SettingsLayout`'s `Tabs` is the visible symptom - a
   * remounted `Tabs` has no previous indicator position to animate from, so
   * the underline snapped between tabs instead of sliding. Rendered from here
   * it keeps the same position in the element tree across the whole group,
   * so React preserves the instance and only the page beneath it changes.
   */
  layout?: React.ComponentType<{ children: React.ReactNode }>;
};

/**
 * A route either renders a page or redirects elsewhere - never both. Mirrors
 * the discriminated-union style the library's own props use (`Footer`'s
 * `copyright`/`component`, `Navigation`'s `name`/`logo`).
 */
export type RouteDef = BaseRoute &
  (
    | { component: React.ComponentType; redirectTo?: never }
    | { redirectTo: string; component?: never }
  );

export const ROUTES: RouteDef[] = [
  {
    pattern: '/app/dashboard',
    title: 'Dashboard',
    subtitle: 'Support performance for the current week.',
    nav: { label: 'Dashboard', icon: LayoutDashboard },
    component: DashboardPage,
  },
  {
    pattern: '/app/tickets',
    title: 'Tickets',
    nav: { label: 'Tickets', icon: TicketIcon },
    component: TicketsPage,
  },
  {
    pattern: '/app/team',
    title: 'Team',
    subtitle: 'Edit cells directly, then save. At least one active admin must remain.',
    nav: { label: 'Team', icon: Users },
    adminOnly: true,
    component: TeamPage,
  },
  {
    // The breadcrumb label and title are both placeholders until the member
    // loads - the page replaces them with the real name via `usePageChrome`.
    pattern: '/app/team/:memberId',
    title: 'Team member',
    parent: '/app/team',
    adminOnly: true,
    component: TeamMemberPage,
  },
  {
    // Index route for the settings group: the navigation rail points here and
    // this sends you on to the first tab, so `/app/settings` stays a valid,
    // shareable URL rather than a dead path.
    pattern: '/app/settings',
    title: 'Settings',
    nav: { label: 'Settings', icon: Settings },
    redirectTo: '/app/settings/profile',
  },
  {
    pattern: '/app/settings/profile',
    title: 'Settings',
    subtitle: 'Your profile and how you appear to teammates.',
    breadcrumb: 'Profile',
    parent: '/app/settings',
    layout: SettingsLayout,
    component: ProfilePage,
  },
  {
    pattern: '/app/settings/notifications',
    title: 'Settings',
    subtitle: 'Choose what Meridian emails you about.',
    breadcrumb: 'Notifications',
    parent: '/app/settings',
    layout: SettingsLayout,
    component: NotificationsPage,
  },
  {
    pattern: '/app/settings/advanced',
    title: 'Settings',
    subtitle: 'Demo environment details.',
    breadcrumb: 'Advanced',
    parent: '/app/settings',
    layout: SettingsLayout,
    component: AdvancedPage,
  },
  {
    pattern: '/app/settings/theme',
    title: 'Settings',
    subtitle: 'Customize your theme.',
    breadcrumb: 'Theme',
    parent: '/app/settings',
    layout: SettingsLayout,
    component: ThemePage,
  },
  {
    pattern: '/app/account',
    title: 'Account',
    subtitle: 'Manage your account settings.',
    component: AccountPage,
  },
];

export type RouteMatch = { route: RouteDef; params: RouteParams };

const segments = (path: string): string[] => path.split('/').filter(Boolean);

const matchPattern = (pattern: string, path: string): RouteParams | null => {
  const patternParts = segments(pattern);
  const pathParts = segments(path);
  if (patternParts.length !== pathParts.length) return null;

  const params: RouteParams = {};
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathParts[i]);
      continue;
    }
    if (patternPart !== pathParts[i]) return null;
  }
  return params;
};

/**
 * Resolves a path against the table. Literal patterns are tried before
 * parameterised ones, so a future `/app/team/invite` would win over
 * `/app/team/:memberId` regardless of their order in `ROUTES`.
 */
export const matchRoute = (path: string): RouteMatch | null => {
  const bySpecificity = [
    ...ROUTES.filter((route) => !route.pattern.includes(':')),
    ...ROUTES.filter((route) => route.pattern.includes(':')),
  ];

  for (const route of bySpecificity) {
    const params = matchPattern(route.pattern, path);
    if (params) return { route, params };
  }
  return null;
};

/** Substitutes `:name` segments so a parent pattern becomes a navigable path. */
export const buildPath = (pattern: string, params: RouteParams): string =>
  pattern
    .split('/')
    .map((part) => (part.startsWith(':') ? encodeURIComponent(params[part.slice(1)] ?? '') : part))
    .join('/');

/**
 * The matched route and its ancestors, outermost first - the breadcrumb trail.
 */
export const routeTrail = (route: RouteDef): RouteDef[] => {
  const trail: RouteDef[] = [route];
  const seen = new Set<string>([route.pattern]);
  let current = route;

  while (current.parent) {
    const parent = ROUTES.find((candidate) => candidate.pattern === current.parent);
    // Both of these mean a typo in the table above rather than a runtime
    // condition, but bail out rather than either crashing or - in the cyclical
    // case - hanging the app in a loop that would be thoroughly confusing to
    // trace back to a `parent` string.
    if (!parent || seen.has(parent.pattern)) break;
    seen.add(parent.pattern);
    trail.unshift(parent);
    current = parent;
  }
  return trail;
};

/** A route that is itself a navigation rail entry, with `nav` proven present. */
export type NavRoute = RouteDef & { nav: NonNullable<BaseRoute['nav']> };

const isNavRoute = (route: RouteDef): route is NavRoute => route.nav !== undefined;

/**
 * The navigation entry a route belongs to: itself if it is one, otherwise the
 * nearest ancestor that is. This is what keeps "Team" lit while you are on
 * `/app/team/usr_2`, with no prefix-matching special case at the call site.
 */
export const navRouteFor = (route: RouteDef): NavRoute | undefined =>
  routeTrail(route).reverse().find(isNavRoute);

export const navRoutes = (): NavRoute[] => ROUTES.filter(isNavRoute);
