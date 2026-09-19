import type { ConversationMessage } from './Conversation.types';

/**
 * Timestamp formatting goes through `Intl` rather than a date library on
 * purpose: `dayjs` is currently bundled only into the `DatePicker` chunk, and
 * pulling it in here would add it to every consumer importing a conversation.
 * `Intl` is built in and already locale-aware.
 */

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateFormatSameYear = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
});

/** Parses an ISO string, returning null rather than an `Invalid Date`. */
export const parseDate = (iso: string): Date | null => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMessageTime = (iso: string): string => {
  const date = parseDate(iso);
  return date ? timeFormat.format(date) : iso;
};

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const isSameDay = (a: string, b: string): boolean => {
  const first = parseDate(a);
  const second = parseDate(b);
  if (!first || !second) return false;
  return startOfDay(first) === startOfDay(second);
};

/** `Today` / `Yesterday` / a full date, for the divider between days. */
export const formatDateSeparator = (iso: string): string => {
  const date = parseDate(iso);
  if (!date) return iso;

  const now = new Date();
  const dayDelta = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDelta === 0) return 'Today';
  if (dayDelta === 1) return 'Yesterday';
  return date.getFullYear() === now.getFullYear()
    ? dateFormatSameYear.format(date)
    : dateFormat.format(date);
};

const FILE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;

  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < FILE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  // One decimal below 10 (9.4 MB), none above it (24 MB) - the extra digit
  // stops carrying information once the integer part is two digits.
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${FILE_UNITS[unit]}`;
};

/**
 * Whether `message` continues a run started by `previous` - same author, same
 * day, and within the grouping window. A grouped message hides its avatar and
 * author line.
 */
export const continuesRun = (
  previous: ConversationMessage | undefined,
  message: ConversationMessage,
  windowMinutes: number,
): boolean => {
  if (!previous) return false;
  if (previous.author.id !== message.author.id) return false;
  if (!isSameDay(previous.sentAt, message.sentAt)) return false;

  const before = parseDate(previous.sentAt);
  const after = parseDate(message.sentAt);
  if (!before || !after) return false;

  return Math.abs(after.getTime() - before.getTime()) <= windowMinutes * 60_000;
};

export const sortBySentAt = (messages: ConversationMessage[]): ConversationMessage[] =>
  [...messages].sort((a, b) => {
    const first = parseDate(a.sentAt)?.getTime() ?? 0;
    const second = parseDate(b.sentAt)?.getTime() ?? 0;
    return first - second;
  });

export interface ThreadNode {
  message: ConversationMessage;
  replies: ConversationMessage[];
}

/**
 * Collapses a flat list into one level of nesting.
 *
 * Deeper chains are flattened onto the nearest **top-level** ancestor rather
 * than being dropped or nested further: indentation past one level is
 * unreadable on a phone, and silently discarding a reply-to-a-reply would lose
 * data the consumer stored. `replyingToName` on the rendered reply is what
 * preserves who was actually answered.
 *
 * A `parentId` pointing at a message that isn't present (paged out, deleted)
 * is treated as top-level, so nothing ever disappears from the list.
 */
export const buildThread = (messages: ConversationMessage[]): ThreadNode[] => {
  const byId = new Map(messages.map((message) => [message.id, message]));

  /** Walks up to the outermost ancestor, guarding against a parentId cycle. */
  const rootIdOf = (message: ConversationMessage): string => {
    const seen = new Set<string>([message.id]);
    let current = message;

    while (current.parentId) {
      const parent = byId.get(current.parentId);
      if (!parent || seen.has(parent.id)) break;
      seen.add(parent.id);
      current = parent;
    }

    return current.id;
  };

  const nodes = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  for (const message of messages) {
    if (message.parentId && byId.has(message.parentId)) continue;
    const node: ThreadNode = { message, replies: [] };
    nodes.set(message.id, node);
    roots.push(node);
  }

  for (const message of messages) {
    if (!message.parentId || !byId.has(message.parentId)) continue;
    nodes.get(rootIdOf(message))?.replies.push(message);
  }

  for (const node of nodes.values()) {
    node.replies = sortBySentAt(node.replies);
  }

  return roots;
};

/** Name of the author a reply was addressed to, when it isn't its own parent. */
export const replyTargetName = (
  message: ConversationMessage,
  byId: Map<string, ConversationMessage>,
  rootId: string,
): string | undefined => {
  if (!message.parentId || message.parentId === rootId) return undefined;
  return byId.get(message.parentId)?.author.name;
};

/** Trims a quoted excerpt so a long parent message can't dominate the reply. */
export const excerpt = (body: string, maxLength = 120): string => {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength - 1)}…` : flat;
};

export const classNames = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(' ');
