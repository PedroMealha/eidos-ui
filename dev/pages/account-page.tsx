import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Pill,
  Progress,
  SegmentedControl,
  Skeleton,
  useSnackbar,
} from 'eidos-ui';
import { PLAN_LABELS, PLAN_SEATS, accountApi } from '../api/account';
import { errorMessage } from '../api/client';
import type { Organization, Plan } from '../api/types';
import { usePageChrome } from '../layouts/page-chrome';
import { useAsync } from '../lib/use-async';
import { useRouter } from '../routes/router';
import { Calendar, Clock, Mail, TriangleAlert, UserPlus, Users } from 'lucide-react';

type AccountData = { organization: Organization; seatsUsed: number };

const PLAN_OPTIONS = (['starter', 'business', 'enterprise'] as const).map((plan) => ({
  value: plan,
  label: PLAN_LABELS[plan],
}));

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString();

/**
 * The workspace, not the person.
 *
 * `/app/settings/profile` already owns the signed-in user's own details, so
 * this page deliberately covers the organisation instead - plan, seats,
 * billing - and the two never edit the same thing.
 *
 * It is also the app's one identity-style header. Note that it is declared as
 * **data**, not as an `IdentityHeader` element: Meridian renders exactly one
 * `PageLayout` (see `admin-layout.tsx`) and that renders a `Header`, so a page
 * contributes `media`/`meta`/`variant` through the chrome contract rather than
 * rendering a header of its own. `IdentityHeader` is the component to reach
 * for when a page owns its header directly.
 */
export const AccountPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showSuccess, showError } = useSnackbar();

  const loadAccount = useCallback(
    (): Promise<AccountData> =>
      Promise.all([accountApi.get(), accountApi.seatsUsed()]).then(([organization, seatsUsed]) => ({
        organization,
        seatsUsed,
      })),
    [],
  );
  const { data, loading, error, reload } = useAsync<AccountData>(loadAccount);

  const [changingPlan, setChangingPlan] = useState(false);
  const [closing, setClosing] = useState(false);

  const organization = data?.organization;
  const seatsUsed = data?.seatsUsed ?? 0;
  const seatsIncluded = organization ? PLAN_SEATS[organization.plan] : 0;

  usePageChrome(
    useMemo(
      () => ({
        // Left undefined while loading so the route table's own "Account"
        // default stands in, rather than blanking the header mid-request.
        title: organization ? (
          <>
            {organization.name}
            <Pill color="primary" variant="outlined" size="sm">
              {PLAN_LABELS[organization.plan]}
            </Pill>
          </>
        ) : undefined,
        subtitle: organization
          ? `${organization.slug} · ${seatsUsed} of ${seatsIncluded} seats in use`
          : undefined,
        // The identity treatment, reached as data. `IdentityHeader` would
        // give `avatar={{ ... }}` instead of this line; everything else here
        // is identical.
        variant: organization ? ('hero' as const) : undefined,
        media: organization ? (
          <Avatar name={organization.name} size="lg" color="primary" shape="square" />
        ) : undefined,
        meta: organization
          ? [
              { label: 'Owner', value: organization.ownerEmail, icon: Mail },
              { label: 'Renews', value: formatDate(organization.renewsAt), icon: Calendar },
              { label: 'Created', value: formatDate(organization.createdAt), icon: Clock },
            ]
          : undefined,
        actions: [
          {
            children: 'Manage team',
            preIcon: Users,
            variant: 'outlined' as const,
            onClick: () => navigate('/app/team'),
          },
        ],
      }),
      [organization, seatsUsed, seatsIncluded, navigate],
    ),
  );

  const changePlan = (plan: string) => {
    if (!organization || plan === organization.plan) return;

    setChangingPlan(true);
    accountApi
      .changePlan(plan as Plan)
      .then((next) => {
        showSuccess(`Switched to the ${PLAN_LABELS[next.plan]} plan.`);
        reload();
      })
      .catch((cause: unknown) => showError(errorMessage(cause)))
      .finally(() => setChangingPlan(false));
  };

  const closeWorkspace = () => {
    setClosing(true);
    accountApi
      .close()
      .catch((cause: unknown) => showError(errorMessage(cause)))
      .finally(() => setClosing(false));
  };

  if (error) {
    return (
      <Alert variant="danger" title="Could not load this account">
        {error}
      </Alert>
    );
  }

  const seatsExhausted = seatsUsed >= seatsIncluded;

  return (
    <div className="mrd-page">
      <div className="mrd-grid-2">
        <Card variant="outlined" padding="lg">
          <div className="mrd-card__head">
            <h3 className="mrd-card__title">Plan</h3>
            {organization && (
              <Pill color="primary" size="sm">
                {PLAN_LABELS[organization.plan]}
              </Pill>
            )}
          </div>

          {loading || !organization ? (
            <Skeleton lines={3} />
          ) : (
            <div className="mrd-form">
              <SegmentedControl
                options={PLAN_OPTIONS}
                value={organization.plan}
                onChange={changePlan}
                disabled={changingPlan}
                fullWidth
              />
              <p className="mrd-muted">
                Downgrading below the number of active members is rejected - try Starter with the
                seeded team to see the error path.
              </p>
            </div>
          )}
        </Card>

        <Card variant="outlined" padding="lg">
          <div className="mrd-card__head">
            <h3 className="mrd-card__title">Seats</h3>
            <Pill color={seatsExhausted ? 'warning' : 'secondary'} variant="outlined" size="sm">
              {seatsUsed}/{seatsIncluded}
            </Pill>
          </div>

          {loading || !organization ? (
            <Skeleton lines={3} />
          ) : (
            <div className="mrd-form">
              <Progress
                value={seatsUsed}
                max={seatsIncluded}
                color={seatsExhausted ? 'warning' : 'primary'}
              />
              <p className="mrd-muted">
                Seat usage counts active team members, so it follows the Team page rather than being
                stored separately.
              </p>
              <div className="mrd-form__actions">
                <Button variant="outlined" preIcon={UserPlus} onClick={() => navigate('/app/team')}>
                  Invite people
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card variant="outlined" padding="lg">
        <div className="mrd-card__head">
          <h3 className="mrd-card__title">Danger zone</h3>
        </div>

        <div className="mrd-form">
          <Alert variant="warning" title="Closing the workspace is permanent">
            Every ticket, member and setting is removed. The workspace has to be empty first.
          </Alert>
          <div className="mrd-form__actions">
            <Button
              color="danger"
              preIcon={TriangleAlert}
              loading={closing}
              loadingText="Closing"
              disabled={loading || !organization}
              onClick={closeWorkspace}
            >
              Close workspace
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
