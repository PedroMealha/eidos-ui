import React, { useCallback, useMemo, useState } from 'react';
import {
  Divider,
  PageLayout,
  Pill,
  SegmentedControl,
  Switch,
  Tooltip,
  useSnackbar,
  useTheme,
} from 'eidos-ui';
import {
  ChevronRight,
  LifeBuoy,
  LogOut,
  Monitor,
  Moon,
  Settings,
  SunMedium,
  User,
} from 'lucide-react';
import type {
  BreadcrumbItem,
  ColorScheme,
  CommandItem,
  MenuItemType,
  NavigationItem,
} from 'eidos-ui';
import { getForceFailures, setForceFailures } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { useRouter } from '../routes/router';
import { buildPath, navRouteFor, navRoutes, routeTrail } from '../routes/routes';
import { useResolvedChrome } from './page-chrome';

const HOME_PATH = '/app/dashboard';

/**
 * The authenticated shell: the app's one and only `PageLayout`.
 *
 * Everything stable across routes (navigation rail, user menu, command
 * palette, footer) is configured here once. Everything per-page arrives via
 * `useResolvedChrome` - the route table's static chrome, refined by whatever
 * the current page registered with `usePageChrome`. Pages render content
 * only; none of them renders a layout, so nested routes never stack two sets
 * of chrome.
 */
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, params, match, navigate } = useRouter();
  const { session, signOut } = useAuth();
  const { showInfo, showWarning } = useSnackbar();
  const { header, breadcrumb } = useResolvedChrome();

  const [failuresOn, setFailuresOn] = useState(getForceFailures);
  const { colorScheme, resolvedColorScheme, setColorScheme } = useTheme();

  const isAdmin = session?.role === 'admin';

  const visibleNav = useMemo(
    () => navRoutes().filter((route) => !route.adminOnly || isAdmin),
    [isAdmin],
  );

  const toggleFailures = useCallback(
    (next: boolean) => {
      setFailuresOn(next);
      setForceFailures(next);
      if (next) showWarning('Every request will now fail - useful for checking error states.');
      else showInfo('Requests are healthy again.');
    },
    [showInfo, showWarning],
  );

  // The navigation entry that owns the current route - its own, or the
  // nearest ancestor that is one. This is what keeps "Team" lit while you
  // are on `/app/team/usr_2`.
  const activeNavPattern = match ? navRouteFor(match.route)?.pattern : undefined;

  const navigationItems = useMemo<NavigationItem[]>(
    () =>
      visibleNav.map((route) => ({
        id: route.pattern,
        label: route.nav.label,
        icon: route.nav.icon,
        active: route.pattern === activeNavPattern,
        onClick: () => navigate(route.pattern),
      })),
    [visibleNav, activeNavPattern, navigate],
  );

  // Trail = the app root, then every ancestor of the current route, then the
  // route itself. The leaf is the only entry a page can rename (a ticket
  // reference, a member's name) and the only one that isn't a link.
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const root: BreadcrumbItem = { label: 'Meridian', onClick: () => navigate(HOME_PATH) };
    if (!match) return [root, { label: 'Not found' }];

    const trail = routeTrail(match.route);
    return [
      root,
      ...trail.map((route, index) => {
        const isLeaf = index === trail.length - 1;
        const label = (isLeaf && breadcrumb) || route.breadcrumb || route.title;
        if (isLeaf) return { label };
        const target = buildPath(route.pattern, params);
        return { label, onClick: () => navigate(target) };
      }),
    ];
  }, [match, params, breadcrumb, navigate]);

  const paletteItems = useMemo<CommandItem[]>(
    () => [
      ...visibleNav.map((route) => ({
        id: route.pattern,
        label: `Go to ${route.nav.label}`,
        group: 'Navigation',
        icon: route.nav.icon,
        action: () => navigate(route.pattern),
      })),
      {
        id: 'toggle-failures',
        label: failuresOn ? 'Stop forcing API errors' : 'Force API errors',
        description: 'Toggle the simulated outage',
        group: 'Demo',
        icon: LifeBuoy,
        action: () => toggleFailures(!failuresOn),
      },
      {
        id: 'toggle-scheme',
        label: resolvedColorScheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        group: 'Preferences',
        icon: resolvedColorScheme === 'dark' ? SunMedium : Moon,
        action: () => setColorScheme(resolvedColorScheme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        group: 'Account',
        icon: LogOut,
        action: () => void signOut(),
      },
    ],
    [
      visibleNav,
      failuresOn,
      navigate,
      toggleFailures,
      signOut,
      resolvedColorScheme,
      setColorScheme,
    ],
  );

  const userMenu = useMemo<MenuItemType[]>(
    () => [
      {
        type: 'component',
        id: 'identity',
        component: (
          <div className="mrd-usercard">
            <span className="mrd-usercard__name">{session?.name}</span>
            <span className="mrd-usercard__email">{session?.email}</span>
          </div>
        ),
      },
      { type: 'separator', id: 'sep-1' },
      {
        type: 'item',
        id: 'account',
        label: 'Account',
        icon: User,
        onClick: () => navigate('/app/account'),
      },
      {
        type: 'item',
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        onClick: () => navigate('/app/settings'),
      },
      {
        type: 'item',
        id: 'sign-out',
        label: 'Sign out',
        icon: LogOut,
        color: 'danger',
        onClick: () => void signOut(),
      },
    ],
    [session, navigate, signOut],
  );

  return (
    <PageLayout
      navigation={{
        brand: { name: 'Meridian', onClick: () => navigate(HOME_PATH) },
        items: navigationItems,
        footer: (
          <div className="mrd-sidebar__role">
            <Divider />
            <Pill color={isAdmin ? 'primary' : 'secondary'} variant="outlined" size="sm">
              {isAdmin ? 'Admin' : 'Member'}
            </Pill>
          </div>
        ),
        collapseBelow: 1024,
      }}
      toolbar={{
        breadcrumbs: { items: breadcrumbItems, separator: <ChevronRight size={14} /> },
        // `Toolbar` embeds `CommandPalette`, which brings its own Cmd/Ctrl+K
        // listener - the app needs no keyboard handling of its own.
        cmdPaletteItems: paletteItems,
        user: { name: session?.name, color: 'primary' },
        userMenu,
        content: (
          <>
            {/* Icon-only segments; each tooltip doubles as its accessible name. */}
            <SegmentedControl
              ariaLabel="Colour scheme"
              size="sm"
              value={colorScheme}
              onChange={(value) => setColorScheme(value as ColorScheme)}
              options={[
                { value: 'light', icon: SunMedium, tooltip: 'Light theme' },
                { value: 'dark', icon: Moon, tooltip: 'Dark theme' },
                { value: 'system', icon: Monitor, tooltip: 'Match the system' },
              ]}
            />
            <Tooltip message="Simulate an outage to exercise error states">
              <Switch
                label="Force API errors"
                color="danger"
                size="sm"
                checked={failuresOn}
                onChange={(event) => toggleFailures(event.target.checked)}
              />
            </Tooltip>
          </>
        ),
      }}
      header={header}
      // Keyed on the path, so each screen remembers its own scroll offset
      // rather than inheriting the previous one - the content region is a
      // single element for the whole session, and only its contents change.
      scrollRestorationKey={path}
      footer={{ copyright: 'Meridian - the local example app for eidos-ui.' }}
    >
      {children}
    </PageLayout>
  );
};
