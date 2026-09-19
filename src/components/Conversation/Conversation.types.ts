import React from 'react';
import type { AvatarColor } from '../Avatar';
import type { MenuItemType } from '../Menu';

/**
 * Delivery state of a single message.
 *
 * `sending` and `failed` exist so a consumer can render an optimistic message
 * immediately and reconcile it once the transport resolves - the component
 * never performs the request itself.
 */
export type MessageStatus = 'sent' | 'sending' | 'failed';

export interface MessageAuthor {
  /** Compared against `currentUserId` to decide own-vs-other presentation. */
  id: string;
  name: string;
  /** Avatar image. Falls back to initials derived from `name`. */
  avatarSrc?: string;
  /** Colour of the initials fallback. Default: 'gray'. */
  avatarColor?: AvatarColor;
  /** Short qualifier shown beside the name as a Pill, e.g. 'Admin', 'Bot'. */
  role?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  /** When present the attachment renders as a link. */
  url?: string;
  /** Size in bytes. Rendered in human-readable form when supplied. */
  size?: number;
  mimeType?: string;
}

/**
 * A single entry in a conversation.
 *
 * Deliberately contains **no** `ReactNode` and **no** functions, so the array
 * is JSON-serialisable end to end: whatever a backend returns can be passed
 * straight in, and whatever is rendered can be persisted verbatim. Everything
 * presentational (`renderBody`) or behavioural (`messageActions`) lives on the
 * component props instead.
 */
export interface ConversationMessage {
  id: string;
  author: MessageAuthor;
  /**
   * Plain text. Newlines are preserved.
   *
   * For markdown or rich content, keep the source string here and render it
   * with the `renderBody` prop - that keeps the stored history serialisable
   * rather than trapping React elements in the data model.
   */
  body: string;
  /** ISO 8601 timestamp. */
  sentAt: string;
  /** Default: 'sent'. */
  status?: MessageStatus;
  /** Renders an "edited" marker beside the timestamp. Display only. */
  edited?: boolean;
  /**
   * Id of the message this one replies to.
   *
   * `CommentThread` nests replies **one level** - a reply to a reply is
   * flattened onto the same level as its parent, with the author it answered
   * shown inline. `Chat` renders it as a quoted excerpt above the body.
   */
  parentId?: string;
  attachments?: MessageAttachment[];
}

/** What the composer emits on submit. */
export interface MessageDraft {
  body: string;
  attachments: File[];
  /** Set when the draft was written in a reply composer. */
  parentId?: string;
}

/** Props shared by `Chat` and `CommentThread`. */
export interface ConversationBaseProps {
  messages: ConversationMessage[];
  /** Id of the viewing user. Drives own-vs-other presentation. */
  currentUserId?: string;
  /**
   * Called when the composer is submitted. Return a promise to have the
   * composer show a pending state; it clears the draft on resolve and
   * **keeps the typed text on reject** so nothing is lost on a failed send.
   * Omit it (or set `readOnly`) to render no composer at all.
   */
  onSend?: (draft: MessageDraft) => void | Promise<void>;
  /** Invoked from the retry affordance on a message whose `status` is 'failed'. */
  onRetry?: (message: ConversationMessage) => void;
  /**
   * Hides every authoring affordance: the composer, reply buttons and retry.
   * Takes precedence over `onSend`/`onReply` being supplied.
   *
   * This is a **UI affordance, not authorization** - it only removes controls
   * from the page. Enforce permissions on the server.
   *
   * @default false
   */
  readOnly?: boolean;
  /** Rendered in place of the composer when `readOnly`, e.g. an explanation. */
  readOnlyMessage?: React.ReactNode;
  /** Replaces the whole message body. Use for markdown or rich text. */
  renderBody?: (message: ConversationMessage) => React.ReactNode;
  /**
   * Per-message overflow menu. This is the per-message permission hook:
   * return an empty array (or nothing) for a message the viewer may not act
   * on and no overflow trigger is rendered for it.
   */
  messageActions?: (message: ConversationMessage) => MenuItemType[] | undefined;
  /** Extra content under a message body - reactions, read receipts, ... */
  renderMessageFooter?: (message: ConversationMessage) => React.ReactNode;
  /** Shows a skeleton placeholder instead of the list. */
  loading?: boolean;
  /** Rendered when there are no messages and `loading` is false. */
  emptyContent?: React.ReactNode;
  /** Whether older messages remain to be fetched. */
  hasMore?: boolean;
  /** Shows a pending indicator on the load-more affordance. */
  loadingMore?: boolean;
  /** Requests the previous page of history. */
  onLoadMore?: () => void;
  /**
   * Collapses the avatar and author line on consecutive messages from the
   * same author sent within `groupWindowMinutes`.
   * @default true
   */
  groupConsecutive?: boolean;
  /** @default 5 */
  groupWindowMinutes?: number;
  /** @default true */
  showDateSeparators?: boolean;
  /** Overrides the default `Intl`-based timestamp rendering. */
  formatTimestamp?: (isoDate: string) => string;
  /**
   * Fades newly arrived messages in. Messages present on the first render are
   * never animated, so loading history doesn't animate the whole list.
   * Always disabled under `prefers-reduced-motion: reduce`.
   * @default true
   */
  animateNewMessages?: boolean;
  /** Allows files to be attached to a new message. @default false */
  allowAttachments?: boolean;
  /** Restricts the file picker, e.g. 'image/*'. Requires `allowAttachments`. */
  attachmentAccept?: string;
  className?: string;
}

export interface ChatProps extends ConversationBaseProps {
  /** Authors currently composing. Rendered as a typing indicator below the list. */
  typing?: MessageAuthor[];
  /**
   * Id of the first unread message. An "Unread" divider is drawn above it.
   * Ignored when the id is not in `messages`.
   */
  unreadFromId?: string;
  /** Placeholder for the composer. @default 'Write a message...' */
  placeholder?: string;
  /**
   * Enter submits, Shift+Enter inserts a newline. Set false to require the
   * send button.
   * @default true
   */
  sendOnEnter?: boolean;
  /** Accessible name for the log region. @default 'Conversation' */
  ariaLabel?: string;
}

export interface CommentThreadProps extends ConversationBaseProps {
  /**
   * Enables the per-comment reply affordance and its inline composer. Omit to
   * render a flat thread with no reply controls.
   */
  onReply?: (draft: MessageDraft) => void | Promise<void>;
  /** @default 'oldest-first' */
  order?: 'oldest-first' | 'newest-first';
  /** @default 'bottom' */
  composerPosition?: 'top' | 'bottom';
  /** Placeholder for the top-level composer. @default 'Add a comment...' */
  placeholder?: string;
  /**
   * Enter submits. Off by default because a comment is usually multi-line and
   * submitted deliberately.
   * @default false
   */
  sendOnEnter?: boolean;
  /** Heading rendered above the thread, e.g. 'Comments'. */
  title?: React.ReactNode;
  /** Accessible name for the comment list. @default 'Comments' */
  ariaLabel?: string;
}

export interface MessageComposerProps {
  /** Controlled draft body. Leave undefined for uncontrolled use. */
  value?: string;
  onChange?: (value: string) => void;
  /**
   * Submit handler. Return a promise for an automatic pending state; the
   * draft clears on resolve and is preserved on reject.
   */
  onSubmit: (draft: MessageDraft) => void | Promise<void>;
  /** Cancels an in-progress draft. Renders a Cancel button when supplied. */
  onCancel?: () => void;
  /** @default 'Write a message...' */
  placeholder?: string;
  /** @default 'Send' */
  submitLabel?: string;
  /** Enter submits; Shift+Enter inserts a newline. @default false */
  sendOnEnter?: boolean;
  /** Attached to the emitted draft, marking it a reply. */
  parentId?: string;
  /** Name of the author being replied to. Shown as a dismissible hint. */
  replyingTo?: string;
  /** Allows files to be attached. @default false */
  allowAttachments?: boolean;
  /** Restricts the file picker, e.g. 'image/*'. */
  attachmentAccept?: string;
  /** Avatar of the composing user, rendered beside the field. */
  author?: MessageAuthor;
  disabled?: boolean;
  /** Rejects an empty (whitespace-only) body. @default true */
  requireBody?: boolean;
  /** Focuses the field on mount. Use for a reply composer. @default false */
  autoFocus?: boolean;
  maxLength?: number;
  className?: string;
}
