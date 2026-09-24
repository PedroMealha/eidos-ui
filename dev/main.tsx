import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DropdownProvider, SnackbarContainer, SnackbarProvider } from 'eidos-ui';
import { App } from './App';
import { ThemeProvider } from 'eidos-ui';
import type { ColorScheme } from 'eidos-ui';
import { AuthProvider } from './auth/auth-context';
import { RouterProvider } from './routes/router';
import 'eidos-ui/styles';
// Optional entry point - without it the theme's default families fall back to
// system fonts, since a stack only names a font. See ContentSecurityPolicy.mdx
// for why this is separate from `eidos-ui/styles`.
import 'eidos-ui/fonts';
import './app.scss';

/**
 * The user's light/dark/system choice, persisted in `localStorage`.
 *
 * `system` is the default: it is resolved by a media query, so it needs no
 * JavaScript and cannot flash. A stored `light`/`dark` is applied to `<html>`
 * *before* React renders, for the same reason - a real app would render the
 * attribute on the server from the user's saved preference instead.
 */
const SCHEME_KEY = 'meridian:color-scheme';

const readStoredScheme = (): ColorScheme => {
  const stored = localStorage.getItem(SCHEME_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

document.documentElement.setAttribute('data-color-scheme', readStoredScheme());

const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheme, setScheme] = useState<ColorScheme>(readStoredScheme);
  const persist = useCallback((next: ColorScheme) => {
    setScheme(next);
    localStorage.setItem(SCHEME_KEY, next);
  }, []);
  return (
    <ThemeProvider colorScheme={scheme} onColorSchemeChange={persist}>
      {children}
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <SnackbarProvider>
        <DropdownProvider>
          <RouterProvider>
            <AuthProvider>
              <App />
              <SnackbarContainer />
            </AuthProvider>
          </RouterProvider>
        </DropdownProvider>
      </SnackbarProvider>
    </AppThemeProvider>
  </React.StrictMode>,
);
