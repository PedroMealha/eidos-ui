import React, { useCallback } from 'react';
import { Alert, Button, Card, Pill, Progress, Skeleton, Timeline } from 'eidos-ui';
import { ArrowUpRight, CircleCheck, CirclePlus, TriangleAlert, UserCheck } from 'lucide-react';
import { ticketsApi } from '../api/tickets';
import type { ActivityEntry, DashboardStats } from '../api/types';
import { useAsync } from '../lib/use-async';
import { useRouter } from '../routes/router';

const ACTIVITY_ICONS: Record<ActivityEntry['kind'], React.ReactNode> = {
  resolved: <CircleCheck size={14} />,
  escalated: <TriangleAlert size={14} />,
  assigned: <UserCheck size={14} />,
  created: <CirclePlus size={14} />,
};

const ACTIVITY_COLORS: Record<ActivityEntry['kind'], 'success' | 'danger' | 'primary' | 'default'> =
  {
    resolved: 'success',
    escalated: 'danger',
    assigned: 'primary',
    created: 'default',
  };

const StatCard: React.FC<{
  label: string;
  value: string;
  trend?: string;
  loading: boolean;
  /** Suppresses the value and trend when the request failed - showing "0" plus
   *  an upward trend for data we never received would be a lie. */
  unavailable?: boolean;
}> = ({ label, value, trend, loading, unavailable = false }) => (
  <Card variant="outlined" padding="md" className="mrd-stat">
    <span className="mrd-stat__label">{label}</span>
    {loading ? (
      <Skeleton width={72} height={30} variant="rounded" />
    ) : (
      <span className="mrd-stat__value">{unavailable ? '-' : value}</span>
    )}
    {trend && !loading && !unavailable && (
      <span className="mrd-stat__trend">
        <ArrowUpRight size={13} />
        {trend}
      </span>
    )}
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { navigate } = useRouter();

  const loadStats = useCallback(() => ticketsApi.stats(), []);
  const loadActivity = useCallback(() => ticketsApi.activity(), []);

  const stats = useAsync<DashboardStats>(loadStats);
  const activity = useAsync<ActivityEntry[]>(loadActivity);

  const statsUnavailable = !stats.loading && stats.data === null;

  const slaPercent =
    stats.data && stats.data.slaTarget > 0
      ? Math.round((stats.data.slaAttained / stats.data.slaTarget) * 100)
      : 0;

  return (
    <div className="mrd-page">
      <div className="mrd-page__head">
        <div>
          <h1 className="mrd-page__title">Dashboard</h1>
          <p className="mrd-page__subtitle">Support performance for the current week.</p>
        </div>
        <Button
          variant="outlined"
          preIcon="refresh-cw"
          onClick={stats.reload}
          loading={stats.loading}
        >
          Refresh
        </Button>
      </div>

      {stats.error && (
        <Alert
          variant="danger"
          title="Could not load the dashboard"
          action={{ label: 'Retry', onClick: stats.reload }}
        >
          {stats.error}
        </Alert>
      )}

      <div className="mrd-stats">
        <StatCard
          label="Open tickets"
          value={String(stats.data?.openTickets ?? 0)}
          loading={stats.loading}
          unavailable={statsUnavailable}
        />
        <StatCard
          label="Resolved this week"
          value={String(stats.data?.resolvedThisWeek ?? 0)}
          trend="12% vs last week"
          loading={stats.loading}
          unavailable={statsUnavailable}
        />
        <StatCard
          label="Avg first response"
          value={`${stats.data?.avgFirstResponseMins ?? 0} min`}
          loading={stats.loading}
          unavailable={statsUnavailable}
        />
        <StatCard
          label="Satisfaction"
          value={`${stats.data?.satisfaction ?? 0}%`}
          trend="3 pts"
          loading={stats.loading}
          unavailable={statsUnavailable}
        />
      </div>

      <div className="mrd-grid-2">
        <Card variant="outlined" padding="lg">
          <div className="mrd-card__head">
            <h2 className="mrd-card__title">SLA attainment</h2>
            {!stats.loading && !statsUnavailable && (
              <Pill color={slaPercent >= 80 ? 'success' : 'warning'} variant="outlined" size="sm">
                {slaPercent >= 80 ? 'On track' : 'At risk'}
              </Pill>
            )}
          </div>

          {stats.loading ? (
            <Skeleton lines={3} />
          ) : statsUnavailable ? (
            <p className="mrd-muted">Unavailable while the service is unreachable.</p>
          ) : (
            <>
              <Progress
                value={slaPercent}
                color={slaPercent >= 80 ? 'success' : 'warning'}
                showLabel
                size="lg"
              />
              <p className="mrd-muted">
                {stats.data?.slaAttained ?? 0} of {stats.data?.slaTarget ?? 0} tickets answered
                within the target window.
              </p>
              <Button variant="text" posIcon="arrow-right" onClick={() => navigate('/app/tickets')}>
                Review the queue
              </Button>
            </>
          )}
        </Card>

        <Card variant="outlined" padding="lg">
          <div className="mrd-card__head">
            <h2 className="mrd-card__title">Recent activity</h2>
          </div>

          {activity.loading ? (
            <Skeleton lines={5} />
          ) : activity.error ? (
            <p className="mrd-muted">Unavailable while the service is unreachable.</p>
          ) : (
            <Timeline
              items={(activity.data ?? []).map((entry) => ({
                id: entry.id,
                title: entry.title,
                description: entry.description,
                timestamp: entry.at,
                icon: ACTIVITY_ICONS[entry.kind],
                color: ACTIVITY_COLORS[entry.kind],
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
