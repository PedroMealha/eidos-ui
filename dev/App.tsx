import React, { useEffect } from 'react';
import { useAuth } from './auth/auth-context';
import { SignInPage } from './auth/sign-in-page';
import { AdminLayout } from './layouts/admin-layout';
import { PublicLayout } from './layouts/public-layout';
import { DashboardPage } from './pages/dashboard-page';
import { LandingPage } from './pages/landing-page';
import { NotFoundPage } from './pages/not-found-page';
import { SettingsPage } from './pages/settings-page';
import { TeamPage } from './pages/team-page';
import { TicketsPage } from './pages/tickets-page';
import { useRouter } from './routes/router';

const APP_ROUTES: Record<string, React.ReactNode> = {
  '/app/dashboard': <DashboardPage />,
  '/app/tickets': <TicketsPage />,
  '/app/team': <TeamPage />,
  '/app/settings': <SettingsPage />,
};

export const App: React.FC = () => {
  const { path, navigate } = useRouter();
  const { session } = useAuth();

  const isAppRoute = path.startsWith('/app');

  useEffect(() => {
    if (isAppRoute && !session) {
      navigate('/sign-in');
    } else if (session && (path === '/sign-in' || path === '/')) {
      navigate('/app/dashboard');
    }
  }, [isAppRoute, session, path, navigate]);

  if (isAppRoute) {
    // The redirect above is already queued; render nothing for that one frame.
    if (!session) return null;
    return (
      <AdminLayout>{APP_ROUTES[path] ?? <NotFoundPage homePath="/app/dashboard" />}</AdminLayout>
    );
  }

  return (
    <PublicLayout>
      {path === '/' ? (
        <LandingPage />
      ) : path === '/sign-in' ? (
        <SignInPage />
      ) : (
        <NotFoundPage homePath="/" />
      )}
    </PublicLayout>
  );
};
