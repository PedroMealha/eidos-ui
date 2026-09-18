import type {
  ActivityEntry,
  Organization,
  TeamMember,
  Ticket,
  TicketPriority,
  TicketStatus,
} from './types';

/**
 * Seeded PRNG (mulberry32) so the dataset is identical on every reload.
 * Random-per-reload demo data makes screenshots and bug reports useless.
 */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const SUBJECTS = [
  'Webhook deliveries stopped after key rotation',
  'Cannot export invoices as CSV',
  'SSO login loops back to sign-in page',
  'Duplicate charges on annual renewal',
  'API returns 429 below documented rate limit',
  'Team invitations never arrive',
  'Dashboard totals disagree with report',
  'Timezone off by one hour in digest email',
  'Bulk import silently skips rows',
  'Two-factor reset request',
  'Sandbox data leaked into production report',
  'Custom domain certificate will not provision',
  'Attachments over 10 MB fail to upload',
  'Deleted workspace still billed',
  'Search returns stale results for renamed projects',
  'Slack notifications duplicated after reinstall',
  'Audit log missing role change entries',
  'Mobile app crashes on ticket detail',
];

const CUSTOMERS = [
  'Northwind Trading',
  'Acme Logistics',
  'Helios Energy',
  'Barton Health',
  'Lumen Retail',
  'Vertex Robotics',
  'Kestrel Media',
  'Solstice Bank',
];

const AGENTS = ['Ana Ferreira', 'Bruno Costa', 'Chiara Ricci', 'Diego Marín', 'Unassigned'];

const TAG_POOL = [
  'billing',
  'api',
  'auth',
  'urgent-followup',
  'integrations',
  'mobile',
  'reporting',
  'onboarding',
];

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting', 'resolved'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

const daysAgo = (days: number, hours = 0): string => {
  const date = new Date(Date.UTC(2026, 7, 28, 9, 0, 0));
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(date.getUTCHours() - hours);
  return date.toISOString();
};

export const seedTickets = (): Ticket[] => {
  const random = createRandom(20260828);

  return SUBJECTS.map((subject, index) => {
    const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];
    const created = daysAgo(Math.floor(random() * 21), Math.floor(random() * 12));
    const status = pick(STATUSES);
    const tagCount = 1 + Math.floor(random() * 2);
    const tags = Array.from(new Set(Array.from({ length: tagCount }, () => pick(TAG_POOL))));

    return {
      id: `tkt_${String(index + 1).padStart(3, '0')}`,
      reference: `MER-${1200 + index * 7}`,
      subject,
      customer: pick(CUSTOMERS),
      status,
      priority: pick(PRIORITIES),
      assignee: pick(AGENTS),
      tags,
      createdAt: created,
      updatedAt: daysAgo(Math.floor(random() * 3), Math.floor(random() * 20)),
      // Two fixed tickets are locked so the failure path is always reachable.
      locked: index === 2 || index === 9,
      messages: [
        {
          id: `msg_${index}_1`,
          author: pick(CUSTOMERS),
          body: `${subject}. This started after the last deployment and is blocking our team.`,
          sentAt: created,
        },
        {
          id: `msg_${index}_2`,
          author: 'Ana Ferreira',
          body: 'Thanks for the report - I can reproduce it and have escalated to engineering.',
          sentAt: daysAgo(Math.floor(random() * 2), 3),
        },
      ],
    } satisfies Ticket;
  });
};

export const seedTeam = (): TeamMember[] => [
  {
    id: 'usr_1',
    name: 'Ana Ferreira',
    email: 'ana@meridian.test',
    role: 'admin',
    active: true,
    joinedAt: daysAgo(420),
  },
  {
    id: 'usr_2',
    name: 'Bruno Costa',
    email: 'bruno@meridian.test',
    role: 'member',
    active: true,
    joinedAt: daysAgo(310),
  },
  {
    id: 'usr_3',
    name: 'Chiara Ricci',
    email: 'chiara@meridian.test',
    role: 'member',
    active: true,
    joinedAt: daysAgo(180),
  },
  {
    id: 'usr_4',
    name: 'Diego Marín',
    email: 'diego@meridian.test',
    role: 'admin',
    active: false,
    joinedAt: daysAgo(95),
  },
  {
    id: 'usr_5',
    name: 'Eve Nakamura',
    email: 'eve@meridian.test',
    role: 'member',
    active: true,
    joinedAt: daysAgo(30),
  },
];

/**
 * `createdAt` matches Ana's `joinedAt` above - she is the owner, so the
 * workspace cannot predate her. `renewsAt` is a fixed date rather than an
 * offset because the whole seeded world is pinned to `daysAgo`'s 2026-08-28
 * base, and a renewal date has to sit in that fiction's future.
 */
export const seedOrganization = (): Organization => ({
  id: 'org_1',
  name: 'Meridian Support',
  slug: 'meridian-support',
  plan: 'business',
  renewsAt: '2027-01-01T00:00:00.000Z',
  ownerEmail: 'ana@meridian.test',
  createdAt: daysAgo(420),
});

export const seedActivity = (): ActivityEntry[] => [
  // References must match the seeded tickets above: reference = MER-(1200 + index * 7).
  {
    id: 'act_1',
    kind: 'resolved',
    title: 'MER-1207 resolved',
    description: 'Chiara Ricci closed "Cannot export invoices as CSV".',
    at: '2 hours ago',
  },
  {
    id: 'act_2',
    kind: 'escalated',
    title: 'MER-1228 escalated to engineering',
    description: 'Rate limiting regression confirmed on the API gateway.',
    at: '5 hours ago',
  },
  {
    id: 'act_3',
    kind: 'assigned',
    title: 'MER-1249 assigned to Bruno Costa',
    description: 'Reassigned from the unassigned queue during triage.',
    at: 'Yesterday',
  },
  {
    id: 'act_4',
    kind: 'created',
    title: '6 tickets created',
    description: 'Highest volume from Northwind Trading and Lumen Retail.',
    at: 'Yesterday',
  },
];
