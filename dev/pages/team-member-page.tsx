import React, { useCallback, useMemo } from 'react';
import { Alert, Avatar, Card, Divider, Pill, Skeleton } from 'eidos-ui';
import { teamApi } from '../api/team';
import type { TeamMember } from '../api/types';
import { usePageChrome } from '../layouts/page-chrome';
import { useAsync } from '../lib/use-async';
import { useRouter } from '../routes/router';
import { ArrowLeft } from 'lucide-react';

/**
 * Child route of `/app/team`, reached at `/app/team/:memberId`.
 *
 * The dynamic half of the page-chrome contract: this page's title and
 * breadcrumb are the member's name, which isn't known until the request
 * resolves. Until then the route table's own "Team member" default shows -
 * the header never blanks, and the navigation rail keeps "Team" lit the
 * whole time because the route declares `/app/team` as its parent.
 */
export const TeamMemberPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const memberId = params.memberId;

  const loadMember = useCallback(() => teamApi.get(memberId), [memberId]);
  const { data: member, loading, error } = useAsync<TeamMember>(loadMember);

  usePageChrome(
    useMemo(
      () => ({
        // Left undefined while loading so the route's static default stands
        // in, rather than blanking the header mid-request.
        title: member ? (
          <>
            {member.name}
            <Pill color={member.active ? 'success' : 'secondary'} variant="outlined" size="sm">
              {member.active ? 'Active' : 'Deactivated'}
            </Pill>
          </>
        ) : undefined,
        subtitle: member?.email,
        breadcrumb: member?.name,
        actions: [
          {
            children: 'Back to team',
            preIcon: ArrowLeft,
            variant: 'outlined',
            onClick: () => navigate('/app/team'),
          },
        ],
      }),
      [member, navigate],
    ),
  );

  if (error) {
    return (
      <Alert variant="danger" title="Could not load this member">
        {error}
      </Alert>
    );
  }

  return (
    <Card variant="outlined" padding="lg">
      {loading || !member ? (
        <Skeleton lines={4} />
      ) : (
        <div className="mrd-member">
          <Avatar name={member.name} size="lg" color="primary" />

          <div className="mrd-member__facts">
            <div className="mrd-member__fact">
              <span className="mrd-field__label">Role</span>
              <Pill color={member.role === 'admin' ? 'primary' : 'secondary'} size="sm">
                {member.role === 'admin' ? 'Admin' : 'Member'}
              </Pill>
            </div>

            <Divider />

            <div className="mrd-member__fact">
              <span className="mrd-field__label">Email</span>
              <span>{member.email}</span>
            </div>

            <Divider />

            <div className="mrd-member__fact">
              <span className="mrd-field__label">Joined</span>
              <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
