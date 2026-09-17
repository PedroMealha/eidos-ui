import { createContext, useContext } from 'react';
import type { ThemeContextValue } from './ThemeProvider.types';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Reads the active theme. Throws outside a `ThemeProvider`, matching
 * `useSnackbarContext` - a silent fallback would make a missing provider look
 * like a theme that simply is not applying.
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
