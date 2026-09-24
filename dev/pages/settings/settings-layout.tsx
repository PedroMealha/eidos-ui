import React from 'react';
import { Tab, TabPanel, Tabs } from 'eidos-ui';
import { useRouter } from '../../routes/router';
import { Bell, Palette, TriangleAlert, User } from 'lucide-react';

const TABS = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'advanced', label: 'Advanced', icon: TriangleAlert },
  { value: 'theme', label: 'Theme', icon: Palette },
] as const;

/**
 * Shared chrome for the `/app/settings/*` group.
 *
 * The point of this file: a nested layout that renders **no** `PageLayout`.
 * The app's single shell is already above it (see `admin-layout.tsx`), so
 * this only adds what is specific to the settings area - the tab bar - and
 * renders the active child beneath it.
 *
 * The tabs are driven by the route rather than by local state, so each one
 * is a real, deep-linkable URL with working back/forward, while `Tabs` stays
 * a purely presentational control.
 *
 * Mounted by the route table (`RouteDef['layout']`), *not* by each settings
 * page: a layout rendered inside a page is remounted whenever the page
 * component changes, which resets `Tabs` and makes its indicator jump between
 * tabs instead of sliding.
 */
export const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, navigate } = useRouter();

  const active = TABS.find((tab) => path === `/app/settings/${tab.value}`)?.value ?? 'profile';

  return (
    <div className="mrd-page">
      <Tabs value={active} onChange={(value) => navigate(`/app/settings/${value}`)}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon}>
            {tab.label}
          </Tab>
        ))}

        {/* Only the active route is mounted, so there is exactly one panel -
            but it still has to be a real `TabPanel` rather than plain
            content below the bar, or the active `Tab`'s `aria-controls`
            would point at an element that doesn't exist. */}
        <TabPanel value={active}>{children}</TabPanel>
      </Tabs>
    </div>
  );
};
