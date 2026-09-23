import React from 'react';
import { AlertCircle, MoreHorizontal, Paperclip, RotateCw } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { Pill } from '../Pill';
import { Spinner } from '../Spinner';
import type { ConversationMessage, MessageAttachment } from './Conversation.types';
import type { MenuItemType } from '../Menu';
import { classNames, excerpt, formatFileSize, formatMessageTime } from './Conversation.utils';

export interface MessageItemProps {
  message: ConversationMessage;
  /** 'chat' right-aligns own messages into bubbles; 'comment' renders a flat card. */
  layout: 'chat' | 'comment';
  isOwn: boolean;
  /** Continues a run from the same author - hides the avatar and author line. */
  grouped: boolean;
  /** Plays the entrance animation. */
  isNew: boolean;
  actions?: MenuItemType[];
  footer?: React.ReactNode;
  body?: React.ReactNode;
  onRetry?: () => void;
  /** Author of the message being answered, for a flattened deep reply. */
  replyingToName?: string;
  /** Quoted parent, rendered above the body in chat layout. */
  quoted?: ConversationMessage;
  /** Reply affordance; omitted entirely when the viewer may not reply. */
  onReply?: () => void;
  formatTimestamp?: (iso: string) => string;
}

const AttachmentList: React.FC<{ attachments: MessageAttachment[] }> = ({ attachments }) => (
  <ul className="eidos-message-attachments">
    {attachments.map((attachment) => {
      const label = (
        <>
          <Paperclip aria-hidden="true" />
          <span className="eidos-message-attachment-name">{attachment.name}</span>
          {attachment.size !== undefined && (
            <span className="eidos-message-attachment-size">{formatFileSize(attachment.size)}</span>
          )}
        </>
      );

      return (
        <li key={attachment.id} className="eidos-message-attachment">
          {attachment.url ? (
            <a
              href={attachment.url}
              className="eidos-message-attachment-link"
              target="_blank"
              rel="noreferrer"
              download={attachment.name}
            >
              {label}
            </a>
          ) : (
            <span className="eidos-message-attachment-link">{label}</span>
          )}
        </li>
      );
    })}
  </ul>
);

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  layout,
  isOwn,
  grouped,
  isNew,
  actions,
  footer,
  body,
  onRetry,
  replyingToName,
  quoted,
  onReply,
  formatTimestamp,
}) => {
  const { author, status = 'sent' } = message;
  const timestamp = formatTimestamp
    ? formatTimestamp(message.sentAt)
    : formatMessageTime(message.sentAt);
  // An empty action list must not leave a dead trigger behind - see the
  // permissions note in Conversation.types.ts.
  const hasActions = Boolean(actions && actions.length > 0);

  // One placement per layout, rather than one per message.
  //
  // `chat` puts the time at the foot of the bubble, where a grouped message
  // already had it; it used to appear in the header for the first message of a
  // group and inside the bubble for the rest, so a single thread showed the
  // same fact in two places. `comment` keeps it in the header, where the row is
  // full width and has space for it.
  const timeInBubble = layout === 'chat';

  return (
    <li
      className={classNames(
        'eidos-message',
        `eidos-message--${layout}`,
        isOwn && 'eidos-message--own',
        grouped && 'eidos-message--grouped',
        status !== 'sent' && `eidos-message--${status}`,
        isNew && 'eidos-message--enter',
      )}
      data-message-id={message.id}
    >
      <div className="eidos-message-avatar">
        {!grouped && (
          <Avatar
            src={author.avatarSrc}
            name={author.name}
            size="sm"
            color={author.avatarColor ?? 'gray'}
          />
        )}
      </div>

      <div className="eidos-message-main">
        {!grouped && (
          <div className="eidos-message-header">
            <span className="eidos-message-author">{author.name}</span>
            {author.role && (
              <Pill size="sm" variant="outlined" color="secondary">
                {author.role}
              </Pill>
            )}
            {!timeInBubble && (
              <time className="eidos-message-time" dateTime={message.sentAt}>
                {timestamp}
              </time>
            )}
            {message.edited && <span className="eidos-message-edited">edited</span>}
          </div>
        )}

        <div className="eidos-message-bubble">
          {quoted && (
            <blockquote className="eidos-message-quote">
              <span className="eidos-message-quote-author">{quoted.author.name}</span>
              <span className="eidos-message-quote-body">{excerpt(quoted.body)}</span>
            </blockquote>
          )}

          {replyingToName && (
            <span className="eidos-message-reply-target">Replying to {replyingToName}</span>
          )}

          <div className="eidos-message-body">{body ?? message.body}</div>

          {message.attachments && message.attachments.length > 0 && (
            <AttachmentList attachments={message.attachments} />
          )}

          {(timeInBubble || grouped) && (
            <time
              className="eidos-message-time eidos-message-time--inline"
              dateTime={message.sentAt}
            >
              {timestamp}
            </time>
          )}
        </div>

        {status === 'sending' && (
          <span className="eidos-message-status">
            <Spinner size="sm" color="secondary" />
            Sending…
          </span>
        )}

        {status === 'failed' && (
          <span className="eidos-message-status eidos-message-status--failed">
            <AlertCircle aria-hidden="true" />
            Not sent
            {onRetry && (
              <Button variant="text" color="danger" size="sm" preIcon={RotateCw} onClick={onRetry}>
                Retry
              </Button>
            )}
          </span>
        )}

        {footer && <div className="eidos-message-footer">{footer}</div>}

        {onReply && (
          <div className="eidos-message-reply">
            <Button variant="text" color="secondary" size="sm" onClick={onReply}>
              Reply
            </Button>
          </div>
        )}
      </div>

      {hasActions && (
        <div className="eidos-message-actions">
          <Menu
            items={actions ?? []}
            trigger={
              <Button
                variant="text"
                color="secondary"
                size="sm"
                icon={MoreHorizontal}
                aria-label={`Actions for ${author.name}'s message`}
              />
            }
          />
        </div>
      )}
    </li>
  );
};

MessageItem.displayName = 'MessageItem';
