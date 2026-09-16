/**
 * Domain model for the Meridian example app.
 *
 * `type` aliases here are just a style choice now. They used to be load-bearing:
 * `DataGrid<T>` constrained `T extends Record<string, unknown>`, and TypeScript
 * only grants implicit index signatures to object type aliases, so an
 * `interface` had to write `extends Record<string, unknown>` to satisfy it -
 * which then widened `keyof T` to `string` and silently disabled every
 * column-key and per-key value check. Both components constrain
 * `T extends object` as of v2, so either declaration style works and keeps its
 * literal keys.
 */

export type Role = 'admin' | 'member';

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketMessage = {
  id: string;
  author: string;
  body: string;
  sentAt: string;
};

export type Ticket = {
  id: string;
  reference: string;
  subject: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  /**
   * Demo affordance: mutations against a locked ticket always fail, so the
   * error/snackbar path is reachable without relying on random failures.
   */
  locked: boolean;
  messages: TicketMessage[];
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  joinedAt: string;
};

export type Session = {
  email: string;
  name: string;
  role: Role;
};

export type DashboardStats = {
  openTickets: number;
  resolvedThisWeek: number;
  avgFirstResponseMins: number;
  satisfaction: number;
  slaTarget: number;
  slaAttained: number;
};

export type ActivityEntry = {
  id: string;
  title: string;
  description: string;
  at: string;
  kind: 'resolved' | 'assigned' | 'escalated' | 'created';
};

export type TicketQuery = {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting: 'Waiting on customer',
  resolved: 'Resolved',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_COLORS: Record<TicketStatus, 'info' | 'primary' | 'warning' | 'success'> = {
  open: 'info',
  in_progress: 'primary',
  waiting: 'warning',
  resolved: 'success',
};

export const PRIORITY_COLORS: Record<TicketPriority, 'secondary' | 'info' | 'warning' | 'danger'> =
  {
    low: 'secondary',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  };
