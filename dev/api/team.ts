import { ApiError, request } from './client';
import { seedTeam } from './seed';
import type { Role, TeamMember } from './types';

let members: TeamMember[] = seedTeam();

let nextId = members.length + 1;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Active members currently occupying a seat.
 *
 * Read by `accountApi` so the workspace's seat usage is derived from the one
 * team list rather than duplicated into the organisation record, where it
 * would drift the first time someone is invited or deactivated.
 */
export const activeMemberCount = (): number => members.filter((member) => member.active).length;

export const teamApi = {
  list: (): Promise<TeamMember[]> =>
    request('Loading the team', () => members.map((member) => ({ ...member }))),

  get: (id: string): Promise<TeamMember> =>
    request('Loading the member', () => {
      const member = members.find((m) => m.id === id);
      if (!member) throw new ApiError('That member no longer exists.', 404);
      return { ...member };
    }),

  invite: (input: { name: string; email: string; role: Role }): Promise<TeamMember> =>
    request('Sending the invitation', () => {
      if (!input.name.trim()) throw new ApiError('A name is required.', 400);
      if (!EMAIL_PATTERN.test(input.email)) throw new ApiError('Enter a valid email address.', 400);
      if (members.some((m) => m.email.toLowerCase() === input.email.toLowerCase())) {
        throw new ApiError(`${input.email} is already on the team.`, 409);
      }

      const member: TeamMember = {
        id: `usr_${nextId++}`,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        active: true,
        joinedAt: new Date().toISOString(),
      };
      members = [...members, member];
      return { ...member };
    }),

  /** Persists the whole dataset - matches how DataGrid reports edits. */
  saveAll: (next: TeamMember[]): Promise<TeamMember[]> =>
    request('Saving team changes', () => {
      const admins = next.filter((member) => member.role === 'admin' && member.active);
      if (admins.length === 0) {
        throw new ApiError('At least one active admin must remain.', 422);
      }
      members = next.map((member) => ({ ...member }));
      return members.map((member) => ({ ...member }));
    }),

  remove: (id: string): Promise<{ name: string }> =>
    request('Removing the member', () => {
      const member = members.find((m) => m.id === id);
      if (!member) throw new ApiError('That member no longer exists.', 404);
      const remainingAdmins = members.filter((m) => m.id !== id && m.role === 'admin' && m.active);
      if (remainingAdmins.length === 0) {
        throw new ApiError('At least one active admin must remain.', 422);
      }
      members = members.filter((m) => m.id !== id);
      return { name: member.name };
    }),
};
