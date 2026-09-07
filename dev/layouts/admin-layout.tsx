import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  CommandPalette,
  Divider,
  Kbd,
  Menu,
  Pill,
  Switch,
  Tooltip,
  useSnackbar,
} from '@pmealha/eidos-ui';
import {
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react';
import type { CommandItem, MenuItemType } from '@pmealha/eidos-ui';
import { getForceFailures, setForceFailures } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { useRouter } from '../routes/router';

type NavEntry = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  adminOnly?: boolean;
};

const NAV: NavEntry[] = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/tickets', label: 'Tickets', icon: TicketIcon },
  { path: '/app/team', label: 'Team', icon: Users, adminOnly: true },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

const TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/tickets': 'Tickets',
  '/app/team': 'Team',
  '/app/settings': 'Settings',
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, navigate } = useRouter();
  const { session, signOut } = useAuth();
  const { showInfo, showWarning } = useSnackbar();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [failuresOn, setFailuresOn] = useState(getForceFailures);

  const isAdmin = session?.role === 'admin';
  const visibleNav = useMemo(() => NAV.filter((entry) => !entry.adminOnly || isAdmin), [isAdmin]);

  // Cmd/Ctrl+K opens the command palette.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleFailures = useCallback(
    (next: boolean) => {
      setFailuresOn(next);
      setForceFailures(next);
      if (next) showWarning('Every request will now fail - useful for checking error states.');
      else showInfo('Requests are healthy again.');
    },
    [showInfo, showWarning],
  );

  const paletteItems = useMemo<CommandItem[]>(
    () => [
      ...visibleNav.map((entry) => ({
        id: entry.path,
        label: `Go to ${entry.label}`,
        group: 'Navigation',
        icon: entry.icon,
        action: () => navigate(entry.path),
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
        id: 'sign-out',
        label: 'Sign out',
        group: 'Account',
        icon: LogOut,
        action: () => void signOut(),
      },
    ],
    [visibleNav, failuresOn, navigate, toggleFailures, signOut],
  );

  const userMenu: MenuItemType[] = [
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
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onClick: () => navigate('/app/settings'),
    },
    {
      type: 'item',
      id: 'sign-out',
      label: 'Sign out',
      icon: 'log-out',
      color: 'danger',
      onClick: () => void signOut(),
    },
  ];

  const breadcrumbItems = [
    { label: 'Meridian', onClick: () => navigate('/app/dashboard') },
    { label: TITLES[path] ?? 'Not found' },
  ];

  return (
    <div className="mrd-shell">
      <aside className="mrd-sidebar">
        <button
          className="mrd-brand mrd-brand--sidebar"
          type="button"
          onClick={() => navigate('/app/dashboard')}
        >
          <span className="mrd-brand__mark">M</span>
          <span className="mrd-brand__name">Meridian</span>
        </button>

        <nav className="mrd-sidenav">
          {visibleNav.map(({ path: to, label, icon: Icon }) => (
            <button
              key={to}
              type="button"
              className={`mrd-sidenav__item${path === to ? ' mrd-sidenav__item--active' : ''}`}
              onClick={() => navigate(to)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mrd-sidebar__foot">
          <Divider />
          <div className="mrd-sidebar__role">
            <span>Signed in as</span>
            <Pill color={isAdmin ? 'primary' : 'secondary'} variant="outlined" size="sm">
              {isAdmin ? 'Admin' : 'Member'}
            </Pill>
          </div>
        </div>
      </aside>

      <div className="mrd-main">
        <header className="mrd-topbar">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mrd-topbar__right">
            <Tooltip message="Simulate an outage to exercise error states">
              <div className="mrd-topbar__switch">
                <Switch
                  label="Force API errors"
                  color="danger"
                  size="sm"
                  checked={failuresOn}
                  onChange={(event) => toggleFailures(event.target.checked)}
                />
              </div>
            </Tooltip>

            <button className="mrd-cmdk" type="button" onClick={() => setPaletteOpen(true)}>
              <span>Search</span>
              <Kbd size="sm">&#8984;K</Kbd>
            </button>

            <Menu
              trigger={<Avatar name={session?.name} size="sm" color="primary" />}
              items={userMenu}
              minWidth={220}
            />
          </div>
        </header>

        <main className="mrd-content">{children}</main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        items={paletteItems}
        placeholder="Jump to a page or run a command…"
      />
    </div>
  );
};
