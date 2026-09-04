import { ApiError, request } from './client';
import type { Role, Session } from './types';

/**
 * FAKE AUTHENTICATION - DEMO ONLY.
 *
 * This is not an auth pattern to copy. There is no server, no token, no
 * signature and no verification: the code is hardcoded below and the whole
 * flow runs in the browser. It exists purely to give the example app a
 * realistic public/authenticated split so the shell, guards and redirects
 * have something to react to.
 */
export const DEMO_OTP_CODE = '123456';

const SESSION_KEY = 'meridian.session';

const nameFromEmail = (email: string): string => {
  const [local] = email.split('@');
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Demo User'
  );
};

export const readStoredSession = (): Session | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.email || !parsed.role) return null;
    return {
      email: parsed.email,
      name: parsed.name ?? nameFromEmail(parsed.email),
      role: parsed.role,
    };
  } catch {
    // Corrupt or unavailable storage should never block the demo.
    return null;
  }
};

const storeSession = (session: Session | null): void => {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage disabled - session stays in memory only */
  }
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authApi = {
  /** "Sends" a one-time code. Any well-formed address is accepted. */
  requestCode: (email: string): Promise<{ sentTo: string }> =>
    request('Sending your code', () => {
      if (!EMAIL_PATTERN.test(email)) {
        throw new ApiError('Enter a valid email address.', 400);
      }
      return { sentTo: email };
    }),

  verifyCode: (email: string, code: string, role: Role): Promise<Session> =>
    request('Verifying your code', () => {
      if (code !== DEMO_OTP_CODE) {
        throw new ApiError('That code is not valid. Use 123456 for this demo.', 401);
      }
      const session: Session = { email, name: nameFromEmail(email), role };
      storeSession(session);
      return session;
    }),

  signOut: (): Promise<void> =>
    request('Signing out', () => {
      storeSession(null);
    }),
};
