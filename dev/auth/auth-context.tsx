import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi, readStoredSession } from '../api/auth';
import type { Role, Session } from '../api/types';

type AuthValue = {
  session: Session | null;
  /** Called by the sign-in flow once the (fake) code has been verified. */
  completeSignIn: (session: Session) => void;
  signOut: () => Promise<void>;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(readStoredSession);

  const completeSignIn = useCallback((next: Session) => setSession(next), []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setSession(null);
  }, []);

  const setRole = useCallback((role: Role) => {
    setSession((current) => (current ? { ...current, role } : current));
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ session, completeSignIn, signOut, setRole }),
    [session, completeSignIn, signOut, setRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
};
