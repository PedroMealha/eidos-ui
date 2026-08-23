/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type {
  SnackbarContextValue,
  SnackbarItem,
  SnackbarProps,
} from "./Snackbar.types";

const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined
);

export const useSnackbarContext = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error(
      "useSnackbarContext must be used within a SnackbarProvider"
    );
  }
  return context;
};

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);
  // Mirror state in a ref so removeSnackbar can read current items synchronously
  // without placing side-effects inside a setState updater (which StrictMode calls twice).
  const snackbarsRef = useRef<SnackbarItem[]>([]);
  snackbarsRef.current = snackbars;

  const generateId = useCallback((): string => {
    return `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeSnackbar = useCallback((id: string): void => {
    // Read from ref - safe to call outside a setState updater.
    // Calling side-effects inside a setState updater is wrong: React StrictMode
    // deliberately invokes updaters twice, which would fire onClose 2× from here
    // plus 1× from SnackbarComponent.handleClose = 3× total.
    const snackbar = snackbarsRef.current.find((item) => item.id === id);
    if (snackbar?.onClose) {
      snackbar.onClose(id);
    }

    // Transition to exiting state, then remove after the CSS animation (300ms).
    setSnackbars((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, state: "exiting" } : item
      )
    );

    setTimeout(() => {
      setSnackbars((prev) => prev.filter((item) => item.id !== id));
    }, 300);
  }, []);

  const addSnackbar = useCallback(
    (snackbar: Omit<SnackbarProps, "id">): string => {
      const id = generateId();
      const newSnackbar: SnackbarItem = {
        ...snackbar,
        id,
        state: "entering",
        createdAt: Date.now(),
      };

      setSnackbars((prev) => [newSnackbar, ...prev]); // Add to beginning (newest on top)

      // Use requestAnimationFrame to ensure DOM is rendered before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSnackbars((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, state: "entered" } : item
            )
          );
        });
      });

      // Auto-close if duration is set
      if (snackbar.duration && snackbar.duration > 0) {
        setTimeout(() => {
          removeSnackbar(id);
        }, snackbar.duration);
      }

      return id;
    },
    [generateId, removeSnackbar]
  );

  const clearAllSnackbars = useCallback((): void => {
    // Transition all to exiting state
    setSnackbars((prev) => prev.map((item) => ({ ...item, state: "exiting" })));

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
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
    </SnackbarContext.Provider>
  );
};

SnackbarProvider.displayName = "SnackbarProvider";
