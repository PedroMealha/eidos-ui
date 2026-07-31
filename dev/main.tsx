import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider, SnackbarContainer } from '../src/components/Snackbar';
import { DropdownProvider } from '../src/components/Dropdown';
import { App } from './App';
import '../src/styles/index.scss';
import './demo.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <DropdownProvider>
        <App />
        <SnackbarContainer />
      </DropdownProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);
