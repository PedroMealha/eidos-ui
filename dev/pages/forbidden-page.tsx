import React from 'react';
import { Button, EmptyState } from 'eidos-ui';
import { ShieldOff } from 'lucide-react';
import { useRouter } from '../routes/router';

/**
 * Shown for an `adminOnly` route reached by a non-admin. The navigation rail
 * hides those routes, but a pasted URL still has to be refused - the guard
 * lives in `App.tsx` so every admin-only route is covered by construction
 * rather than each page remembering to check.
 */
export const ForbiddenPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <EmptyState
      icon={<ShieldOff />}
      title="Admins only"
      description="Your account has the member role, which cannot manage the team. Switch to the admin role by signing in again."
      action={
        <Button variant="outlined" onClick={() => navigate('/app/dashboard')}>
          Back to dashboard
        </Button>
      }
    />
  );
};
