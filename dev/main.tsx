import React from 'react';
import ReactDOM from 'react-dom/client';
import { DropdownProvider, SnackbarContainer, SnackbarProvider } from 'eidos-ui';
import { App } from './App';
import { ThemeProvider } from 'eidos-ui';
import { AuthProvider } from './auth/auth-context';
import { RouterProvider } from './routes/router';
import 'eidos-ui/styles';
// Optional entry point - without it the theme's default families fall back to
// system fonts, since a stack only names a font. See ContentSecurityPolicy.mdx
// for why this is separate from `eidos-ui/styles`.
import 'eidos-ui/fonts';
import './app.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
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
    </ThemeProvider>
  </React.StrictMode>,
);
