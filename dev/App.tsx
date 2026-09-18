import React, { useEffect } from 'react';
import { useAuth } from './auth/auth-context';
import { SignInPage } from './auth/sign-in-page';
import { AdminLayout } from './layouts/admin-layout';
import { PageChromeProvider } from './layouts/page-chrome';
import { PublicLayout } from './layouts/public-layout';
import { LandingPage } from './pages/landing-page';
import { NotFoundPage } from './pages/not-found-page';
import { ForbiddenPage } from './pages/forbidden-page';
import { useRouter } from './routes/router';

const HOME_PATH = '/app/dashboard';

export const App: React.FC = () => {
  const { path, match, navigate } = useRouter();
  const { session } = useAuth();

  const isAppRoute = path.startsWith('/app');
  const redirectTo = match?.route.redirectTo;

  useEffect(() => {
    if (isAppRoute && !session) {
      navigate('/sign-in');
    } else if (session && (path === '/sign-in' || path === '/')) {
      navigate(HOME_PATH);
    }
  }, [isAppRoute, session, path, navigate]);

  // Index routes (`/app/settings`) forward to their first child. Done here
  // rather than in the route table's own resolution so the URL actually
  // changes, keeping the visited path shareable and the back button honest.
  useEffect(() => {
    if (session && redirectTo) navigate(redirectTo);
  }, [session, redirectTo, navigate]);

  if (isAppRoute) {
    // The redirect above is already queued; render nothing for that one frame.
    if (!session) return null;

    const Page = match?.route.component;
    // Group chrome (`SettingsLayout`) is rendered here rather than by the page
    // so it keeps its position - and therefore its React instance and state -
    // while the page beneath it changes. See `RouteDef['layout']`.
    const Layout = match?.route.layout ?? React.Fragment;
    // The navigation rail hides admin-only routes, but a pasted URL must
    // still be refused - one guard here rather than repeated per page.
    const forbidden = match?.route.adminOnly && session.role !== 'admin';

    return (
      <PageChromeProvider>
        <AdminLayout>
          {redirectTo ? null : forbidden ? (
            <ForbiddenPage />
          ) : Page ? (
            <Layout>
              <Page />
            </Layout>
          ) : (
            <NotFoundPage homePath={HOME_PATH} />
          )}
        </AdminLayout>
      </PageChromeProvider>
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
