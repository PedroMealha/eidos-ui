import React from 'react';
import ReactDOM from 'react-dom/client';
import { DropdownProvider, SnackbarContainer, SnackbarProvider } from 'eidos-ui';
import { App } from './App';
import { ThemeProvider } from 'eidos-ui';
import { AuthProvider } from './auth/auth-context';
import { RouterProvider } from './routes/router';
import 'eidos-ui/styles';
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
