import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { SnackbarContextValue, SnackbarItem, SnackbarProps } from './Snackbar.types';

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbarContext = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbarContext must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);
  // Mirror state in a ref so removeSnackbar can read current items synchronously
  // without placing side-effects inside a setState updater (which StrictMode calls twice).
  const snackbarsRef = useRef<SnackbarItem[]>([]);
  snackbarsRef.current = snackbars;

  // ── Pausable auto-dismiss timers (SC 2.2.1 Timing Adjustable) ─────────────
  //
  // Auto-dismiss used to be a bare `setTimeout` that nothing could stop. That
  // is a Level A failure: a time limit the user can neither turn off, adjust
  // nor extend. It bites hardest exactly where a snackbar is most useful -
  // `action` puts a control (typically "Undo") inside something that deletes
  // itself on a stopwatch, so anyone reading slowly, using a screen reader,
  // or driving by keyboard can lose it mid-reach.
  //
  // Each timer therefore records when it started and how long is left, so it
  // can be cancelled on hover or focus and restarted with the remainder.
  const timers = useRef(
    new Map<string, { timeout: number; remaining: number; startedAt: number }>(),
  );

  const clearTimer = useCallback((id: string): void => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer.timeout);
      timers.current.delete(id);
    }
  }, []);

  // `startTimer` needs `removeSnackbar`, and `removeSnackbar` needs
  // `clearTimer`. A ref breaks the cycle without reordering the file or
  // making every callback depend on the others' identity.
  const removeSnackbarRef = useRef<(id: string) => void>(() => {});

  const generateId = useCallback((): string => {
    return `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeSnackbar = useCallback(
    (id: string): void => {
      // Read from ref - safe to call outside a setState updater.
      // Calling side-effects inside a setState updater is wrong: React StrictMode
      // deliberately invokes updaters twice, which would fire onClose 2× from here
      // plus 1× from SnackbarComponent.handleClose = 3× total.
      clearTimer(id);

      const snackbar = snackbarsRef.current.find((item) => item.id === id);
      if (snackbar?.onClose) {
        snackbar.onClose(id);
      }

      // Transition to exiting state, then remove after the CSS animation (300ms).
      setSnackbars((prev) =>
        prev.map((item) => (item.id === id ? { ...item, state: 'exiting' } : item)),
      );

      setTimeout(() => {
        setSnackbars((prev) => prev.filter((item) => item.id !== id));
      }, 300);
    },
    [clearTimer],
  );

  const startTimer = useCallback(
    (id: string, ms: number): void => {
      clearTimer(id);
      timers.current.set(id, {
        timeout: window.setTimeout(() => removeSnackbarRef.current(id), ms),
        remaining: ms,
        startedAt: Date.now(),
      });
    },
    [clearTimer],
  );

  const addSnackbar = useCallback(
    (snackbar: Omit<SnackbarProps, 'id'>): string => {
      const id = generateId();
      const newSnackbar: SnackbarItem = {
        ...snackbar,
        id,
        state: 'entering',
        createdAt: Date.now(),
      };

      setSnackbars((prev) => [newSnackbar, ...prev]); // Add to beginning (newest on top)

      // Use requestAnimationFrame to ensure DOM is rendered before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSnackbars((prev) =>
            prev.map((item) => (item.id === id ? { ...item, state: 'entered' } : item)),
          );
        });
      });

      // Auto-close if duration is set
      if (snackbar.duration && snackbar.duration > 0) {
        startTimer(id, snackbar.duration);
      }

      return id;
    },
    [generateId, startTimer],
  );

  // Pause on hover or focus, resume on leave or blur. Wired up by
  // `SnackbarContainer` - see the handlers there.
  const pauseSnackbar = useCallback((id: string): void => {
    const timer = timers.current.get(id);
    if (!timer) return;
    window.clearTimeout(timer.timeout);
    timers.current.set(id, {
      ...timer,
      // What is left of the countdown at the moment of pausing, floored at 0
      // so a timer that was already due does not resume with a negative delay.
      remaining: Math.max(0, timer.remaining - (Date.now() - timer.startedAt)),
    });
  }, []);

  const resumeSnackbar = useCallback(
    (id: string): void => {
      const timer = timers.current.get(id);
      if (!timer) return;
      startTimer(id, timer.remaining);
    },
    [startTimer],
  );

  removeSnackbarRef.current = removeSnackbar;

  const clearAllSnackbars = useCallback((): void => {
    // Transition all to exiting state
    setSnackbars((prev) => prev.map((item) => ({ ...item, state: 'exiting' })));

    // Remove all after animation completes (300ms to match CSS animation)
    setTimeout(() => {
      setSnackbars([]);
    }, 300);
  }, []);

  const contextValue: SnackbarContextValue = {
    snackbars,
    addSnackbar,
    removeSnackbar,
    clearAllSnackbars,
    pauseSnackbar,
    resumeSnackbar,
  };

  return <SnackbarContext.Provider value={contextValue}>{children}</SnackbarContext.Provider>;
};

SnackbarProvider.displayName = 'SnackbarProvider';
