import { ApiError, request } from './client';
import { seedOrganization } from './seed';
import { activeMemberCount } from './team';
import type { Organization, Plan } from './types';

let organization: Organization = seedOrganization();

/** Seats included with each plan. The seat *usage* comes from the team list. */
export const PLAN_SEATS: Record<Plan, number> = {
  starter: 3,
  business: 10,
  enterprise: 50,
};

export const PLAN_LABELS: Record<Plan, string> = {
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
};

export const accountApi = {
  get: (): Promise<Organization> => request('Loading the account', () => ({ ...organization })),

  /** Seats in use right now - derived, never stored on the organisation. */
  seatsUsed: (): Promise<number> => request('Loading seat usage', () => activeMemberCount()),

  /**
   * Fails when the target plan has fewer seats than the team already uses -
   * a domain rule, so the error path is reachable by choosing Starter with
   * four active members rather than by any random failure.
   */
  changePlan: (plan: Plan): Promise<Organization> =>
    request('Changing the plan', () => {
      const used = activeMemberCount();
      const seats = PLAN_SEATS[plan];

      if (seats < used) {
        throw new ApiError(
          `${PLAN_LABELS[plan]} includes ${seats} seats, but ${used} members are active. Deactivate someone on the Team page first.`,
          422,
        );
      }

      organization = { ...organization, plan };
      return { ...organization };
    }),

  /**
   * Always rejects while anyone other than the owner is still active - the
   * deterministic way to reach the danger-zone error state.
   */
  close: (): Promise<never> =>
    request('Closing the workspace', () => {
      const used = activeMemberCount();
      if (used > 1) {
        throw new ApiError(
          `${used} members are still active. Remove everyone except the owner before closing the workspace.`,
          422,
        );
      }
      throw new ApiError('Closing a workspace is disabled in the demo environment.', 403);
    }),
};
