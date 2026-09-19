import React, { useCallback, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { Skeleton } from '../Skeleton';
import { Spinner } from '../Spinner';
import { MessageComposer } from './MessageComposer.component';
import { MessageItem } from './MessageItem.component';
import type { CommentThreadProps, ConversationMessage, MessageDraft } from './Conversation.types';
import { useNewMessageIds } from './Conversation.hooks';
import {
  buildThread,
  classNames,
  continuesRun,
  replyTargetName,
  sortBySentAt,
} from './Conversation.utils';

const CommentSkeleton: React.FC = () => (
  <div className="eidos-comment-thread-skeleton" aria-hidden="true">
    {[0, 1, 2].map((row) => (
      <div key={row} className="eidos-comment-thread-skeleton-row">
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" lines={2} />
      </div>
    ))}
  </div>
);

/**
 * A comment section: document flow, no internal scroll container, one level of
 * nesting.
 *
 * Shares its data model and message rendering with `Chat`, so history captured
 * in one can be displayed in the other. Unlike `Chat` it has no scroll region
 * of its own - it grows with the page and pages *downward* via `onLoadMore`.
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  messages,
  currentUserId,
  onSend,
  onReply,
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
  formatTimestamp,
  animateNewMessages = true,
  allowAttachments = false,
  attachmentAccept,
  order = 'oldest-first',
  composerPosition = 'bottom',
  placeholder = 'Add a comment...',
  sendOnEnter = false,
  title,
  ariaLabel = 'Comments',
  className = '',
}) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const newIds = useNewMessageIds(messages, animateNewMessages);

  const byId = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  const roots = useMemo(() => {
    const thread = buildThread(messages);
    const sorted = sortBySentAt(thread.map((node) => node.message));
    const ordered = order === 'newest-first' ? [...sorted].reverse() : sorted;
    const nodeById = new Map(thread.map((node) => [node.message.id, node]));
    // Replies always read oldest-first, even when roots are reversed - a
    // conversation under a single comment is chronological by nature.
    return ordered.map((message) => nodeById.get(message.id)!);
  }, [messages, order]);

  const canReply = !readOnly && Boolean(onReply);
  const showComposer = !readOnly && Boolean(onSend);
  const isEmpty = !loading && messages.length === 0;
  const total = messages.length;

  const handleReply = useCallback(
    async (draft: MessageDraft) => {
      await onReply?.(draft);
      setReplyingToId(null);
    },
    [onReply],
  );

  const renderComment = (
    message: ConversationMessage,
    options: { rootId: string; previous?: ConversationMessage; isReply: boolean },
  ) => {
    const actions = readOnly ? undefined : messageActions?.(message);

    return (
      <MessageItem
        key={message.id}
        message={message}
        layout="comment"
        isOwn={Boolean(currentUserId) && message.author.id === currentUserId}
        grouped={groupConsecutive && continuesRun(options.previous, message, groupWindowMinutes)}
        isNew={newIds.has(message.id)}
        actions={actions}
        footer={renderMessageFooter?.(message)}
        body={renderBody?.(message)}
        onRetry={!readOnly && onRetry ? () => onRetry(message) : undefined}
        replyingToName={
          options.isReply ? replyTargetName(message, byId, options.rootId) : undefined
        }
        onReply={canReply ? () => setReplyingToId(message.id) : undefined}
        formatTimestamp={formatTimestamp}
      />
    );
  };

  const composer = showComposer && (
    <MessageComposer
      onSubmit={onSend as NonNullable<typeof onSend>}
      placeholder={placeholder}
      submitLabel="Comment"
      sendOnEnter={sendOnEnter}
      allowAttachments={allowAttachments}
      attachmentAccept={attachmentAccept}
      className="eidos-comment-thread-composer"
    />
  );

  return (
    <section className={classNames('eidos-comment-thread', className)} aria-label={ariaLabel}>
      {(title || total > 0) && (
        <header className="eidos-comment-thread-header">
          {title && <h3 className="eidos-comment-thread-title">{title}</h3>}
          {total > 0 && (
            <span className="eidos-comment-thread-count">
              {total} {total === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </header>
      )}

      {composerPosition === 'top' && composer}

      {loading && <CommentSkeleton />}

      {isEmpty &&
        (emptyContent ?? (
          <EmptyState
            icon={<MessageSquare />}
            title="No comments yet"
            description={showComposer ? 'Start the discussion by leaving a comment.' : undefined}
            size="sm"
          />
        ))}

      {!loading && roots.length > 0 && (
        <ol className="eidos-conversation-list eidos-comment-thread-list" aria-busy={loadingMore}>
          {roots.map((node) => (
            <li key={node.message.id} className="eidos-comment-thread-node">
              <ol className="eidos-conversation-list">
                {renderComment(node.message, { rootId: node.message.id, isReply: false })}
              </ol>

              {node.replies.length > 0 && (
                <ol className="eidos-conversation-list eidos-comment-thread-replies">
                  {node.replies.map((reply, index) =>
                    renderComment(reply, {
                      rootId: node.message.id,
                      previous: node.replies[index - 1],
                      isReply: true,
                    }),
                  )}
                </ol>
              )}

              {replyingToId &&
                (replyingToId === node.message.id ||
                  node.replies.some((reply) => reply.id === replyingToId)) && (
                  <div className="eidos-comment-thread-reply-composer">
                    <MessageComposer
                      onSubmit={handleReply}
                      onCancel={() => setReplyingToId(null)}
                      parentId={replyingToId}
                      replyingTo={byId.get(replyingToId)?.author.name}
                      placeholder="Write a reply..."
                      submitLabel="Reply"
                      sendOnEnter={sendOnEnter}
                      allowAttachments={allowAttachments}
                      attachmentAccept={attachmentAccept}
                      autoFocus
                    />
                  </div>
                )}
            </li>
          ))}
        </ol>
      )}

      {hasMore && (
        <div className="eidos-comment-thread-load-more">
          {loadingMore ? (
            <span className="eidos-comment-thread-loading-more">
              <Spinner size="sm" color="secondary" />
              Loading more comments…
            </span>
          ) : (
            <Button variant="outlined" color="secondary" size="sm" onClick={onLoadMore}>
              Load more comments
            </Button>
          )}
        </div>
      )}

      {composerPosition === 'bottom' && composer}

      {readOnly && readOnlyMessage && (
        <p className="eidos-conversation-readonly">{readOnlyMessage}</p>
      )}
    </section>
  );
};

CommentThread.displayName = 'CommentThread';
