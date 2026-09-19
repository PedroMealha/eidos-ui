import React, { useCallback, useMemo } from 'react';
import { ArrowDown, MessagesSquare } from 'lucide-react';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { Skeleton } from '../Skeleton';
import { Spinner } from '../Spinner';
import { MessageComposer } from './MessageComposer.component';
import { MessageItem } from './MessageItem.component';
import type { ChatProps, ConversationMessage } from './Conversation.types';
import {
  useLoadMoreOnScrollTop,
  useNewMessageIds,
  useScrollAnchor,
  useStickToBottom,
} from './Conversation.hooks';
import { classNames, continuesRun, formatDateSeparator, isSameDay } from './Conversation.utils';

const ChatSkeleton: React.FC = () => (
  <div className="eidos-chat-skeleton" aria-hidden="true">
    {[0, 1, 2, 3].map((row) => (
      <div
        key={row}
        className={classNames(
          'eidos-chat-skeleton-row',
          row % 2 === 1 && 'eidos-chat-skeleton-row--own',
        )}
      >
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="rounded" height={48} />
      </div>
    ))}
  </div>
);

/**
 * A bottom-anchored message thread with a composer.
 *
 * Controlled and transport-agnostic: it renders the `messages` it is given and
 * reports intent through `onSend` / `onLoadMore`. It never fetches, so the
 * same array can be persisted and replayed verbatim.
 */
export const Chat: React.FC<ChatProps> = ({
  messages,
  currentUserId,
  onSend,
  onRetry,
  readOnly = false,
  readOnlyMessage,
  renderBody,
  messageActions,
  renderMessageFooter,
  loading = false,
  emptyContent,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  groupConsecutive = true,
  groupWindowMinutes = 5,
  showDateSeparators = true,
  formatTimestamp,
  animateNewMessages = true,
  allowAttachments = false,
  attachmentAccept,
  typing,
  unreadFromId,
  placeholder = 'Write a message...',
  sendOnEnter = true,
  ariaLabel = 'Conversation',
  className = '',
}) => {
  const { scrollRef, atBottom, scrollToBottom, handleScroll } = useStickToBottom(messages);
  const newIds = useNewMessageIds(messages, animateNewMessages);
  useScrollAnchor(scrollRef, messages);

  const loadMoreOnScroll = useLoadMoreOnScrollTop(scrollRef, { hasMore, loadingMore, onLoadMore });

  const onScroll = useCallback(() => {
    handleScroll();
    loadMoreOnScroll();
  }, [handleScroll, loadMoreOnScroll]);

  const byId = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  // An id that isn't in the current page must not draw a divider above
  // nothing - it would float at the top of whatever happens to be loaded.
  const unreadIndex = useMemo(() => {
    if (!unreadFromId) return -1;
    return messages.findIndex((message) => message.id === unreadFromId);
  }, [messages, unreadFromId]);

  const showComposer = !readOnly && Boolean(onSend);
  const isEmpty = !loading && messages.length === 0;

  const renderMessage = (message: ConversationMessage, index: number) => {
    const previous = messages[index - 1];
    const actions = readOnly ? undefined : messageActions?.(message);
    const quoted = message.parentId ? byId.get(message.parentId) : undefined;

    const nodes: React.ReactNode[] = [];

    if (showDateSeparators && (!previous || !isSameDay(previous.sentAt, message.sentAt))) {
      nodes.push(
        <li key={`date-${message.id}`} className="eidos-conversation-separator">
          <span>{formatDateSeparator(message.sentAt)}</span>
        </li>,
      );
    }

    if (index === unreadIndex) {
      nodes.push(
        <li
          key={`unread-${message.id}`}
          className="eidos-conversation-separator eidos-conversation-separator--unread"
        >
          <span>Unread messages</span>
        </li>,
      );
    }

    // A separator breaks a run: the message under it needs its own header.
    const grouped =
      groupConsecutive &&
      index !== unreadIndex &&
      nodes.length === 0 &&
      continuesRun(previous, message, groupWindowMinutes);

    nodes.push(
      <MessageItem
        key={message.id}
        message={message}
        layout="chat"
        isOwn={Boolean(currentUserId) && message.author.id === currentUserId}
        grouped={grouped}
        isNew={newIds.has(message.id)}
        actions={actions}
        footer={renderMessageFooter?.(message)}
        body={renderBody?.(message)}
        onRetry={!readOnly && onRetry ? () => onRetry(message) : undefined}
        quoted={quoted}
        formatTimestamp={formatTimestamp}
      />,
    );

    return nodes;
  };

  return (
    <div className={classNames('eidos-chat', className)}>
      <div
        ref={scrollRef}
        className="eidos-chat-scroll"
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={loading}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {hasMore && (
          <div className="eidos-chat-load-more">
            {loadingMore ? (
              <span className="eidos-chat-loading-more">
                <Spinner size="sm" color="secondary" />
                Loading earlier messages…
              </span>
            ) : (
              <Button variant="text" color="secondary" size="sm" onClick={onLoadMore}>
                Load earlier messages
              </Button>
            )}
          </div>
        )}

        {loading && <ChatSkeleton />}

        {isEmpty &&
          (emptyContent ?? (
            <EmptyState
              icon={<MessagesSquare />}
              title="No messages yet"
              description={
                showComposer ? 'Send the first message to start the conversation.' : undefined
              }
              size="sm"
            />
          ))}

        {!loading && messages.length > 0 && (
          <ol className="eidos-conversation-list">{messages.map(renderMessage)}</ol>
        )}

        {typing && typing.length > 0 && (
          <div className="eidos-chat-typing" aria-live="polite">
            <span className="eidos-chat-typing-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {typing.length === 1
              ? `${typing[0].name} is typing…`
              : `${typing.length} people are typing…`}
          </div>
        )}
      </div>

      {!atBottom && messages.length > 0 && (
        <div className="eidos-chat-jump">
          <Button
            size="sm"
            variant="filled"
            color="secondary"
            preIcon={ArrowDown}
            onClick={() => scrollToBottom('smooth')}
          >
            Latest
          </Button>
        </div>
      )}

      {showComposer && (
        <div className="eidos-chat-composer">
          <MessageComposer
            onSubmit={onSend as NonNullable<typeof onSend>}
            placeholder={placeholder}
            sendOnEnter={sendOnEnter}
            allowAttachments={allowAttachments}
            attachmentAccept={attachmentAccept}
          />
        </div>
      )}

      {readOnly && readOnlyMessage && (
        <p className="eidos-conversation-readonly">{readOnlyMessage}</p>
      )}
    </div>
  );
};

Chat.displayName = 'Chat';
