import { ApiError, request } from './client';
import { seedActivity, seedTickets } from './seed';
import type { ActivityEntry, DashboardStats, Ticket, TicketQuery, TicketStatus } from './types';

/** In-memory store. Resets on a full page reload, which is fine for a demo. */
let tickets: Ticket[] = seedTickets();

const clone = (ticket: Ticket): Ticket => ({
  ...ticket,
  tags: [...ticket.tags],
  messages: ticket.messages.map((message) => ({ ...message })),
});

const findIndexOrThrow = (id: string): number => {
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index === -1) throw new ApiError(`Ticket ${id} no longer exists.`, 404);
  return index;
};

/** Domain rule that makes the error path deterministic rather than random. */
const assertUnlocked = (ticket: Ticket): void => {
  if (ticket.locked) {
    throw new ApiError(
      `${ticket.reference} is locked by a compliance hold and cannot be modified.`,
      409,
    );
  }
};

const matchesQuery = (ticket: Ticket, query: TicketQuery): boolean => {
  const term = query.search?.trim().toLowerCase();
  if (term) {
    const haystack = [ticket.reference, ticket.subject, ticket.customer, ticket.assignee, ...ticket.tags]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  if (query.status?.length && !query.status.includes(ticket.status)) return false;
  if (query.priority?.length && !query.priority.includes(ticket.priority)) return false;
  return true;
};

export const ticketsApi = {
  list: (query: TicketQuery = {}): Promise<Ticket[]> =>
    request('Loading tickets', () => tickets.filter((t) => matchesQuery(t, query)).map(clone)),

  get: (id: string): Promise<Ticket> =>
    request('Loading ticket', () => clone(tickets[findIndexOrThrow(id)])),

  update: (id: string, patch: Partial<Omit<Ticket, 'id'>>): Promise<Ticket> =>
    request('Saving the ticket', () => {
      const index = findIndexOrThrow(id);
      assertUnlocked(tickets[index]);
      const updated: Ticket = {
        ...tickets[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      tickets = tickets.map((ticket, i) => (i === index ? updated : ticket));
      return clone(updated);
    }),

  bulkSetStatus: (ids: string[], status: TicketStatus): Promise<{ updated: number; skipped: string[] }> =>
    request('Updating tickets', () => {
      const skipped: string[] = [];
      let updated = 0;

      tickets = tickets.map((ticket) => {
        if (!ids.includes(ticket.id)) return ticket;
        if (ticket.locked) {
          skipped.push(ticket.reference);
          return ticket;
        }
        updated += 1;
        return { ...ticket, status, updatedAt: new Date().toISOString() };
      });

      return { updated, skipped };
    }),

  remove: (id: string): Promise<{ reference: string }> =>
    request('Deleting the ticket', () => {
      const index = findIndexOrThrow(id);
      const ticket = tickets[index];
      assertUnlocked(ticket);
      tickets = tickets.filter((_, i) => i !== index);
      return { reference: ticket.reference };
    }),

  stats: (): Promise<DashboardStats> =>
    request('Loading dashboard', () => {
      const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
      const resolved = tickets.filter((t) => t.status === 'resolved').length;
      return {
        openTickets: open,
        resolvedThisWeek: resolved,
        avgFirstResponseMins: 42,
        satisfaction: 94,
        slaTarget: tickets.length,
        slaAttained: Math.max(tickets.length - 3, 0),
      };
    }),

  activity: (): Promise<ActivityEntry[]> => request('Loading activity', () => seedActivity()),
};
