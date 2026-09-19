import React, { useCallback, useId, useRef, useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Chip } from '../Chip';
import type { MessageComposerProps } from './Conversation.types';
import { useAutoGrow } from './Conversation.hooks';
import { classNames, formatFileSize } from './Conversation.utils';

/**
 * The authoring half of a conversation - a growing text field, optional
 * attachments, and a submit control.
 *
 * Exported on its own so a consumer building a bespoke list can still reuse
 * the input, and used internally by both `Chat` and `CommentThread`.
 */
export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Write a message...',
  submitLabel = 'Send',
  sendOnEnter = false,
  parentId,
  replyingTo,
  allowAttachments = false,
  attachmentAccept,
  author,
  disabled = false,
  requireBody = true,
  autoFocus = false,
  maxLength,
  className = '',
}) => {
  const [internalBody, setInternalBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pending, setPending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const isControlled = value !== undefined;
  const body = isControlled ? value : internalBody;

  useAutoGrow(textareaRef, body);

  const setBody = useCallback(
    (next: string) => {
      if (!isControlled) setInternalBody(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const canSubmit = !disabled && !pending && (!requireBody || body.trim().length > 0);

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    const draft = { body: body.trim(), attachments, parentId };
    const result = onSubmit(draft);

    // A synchronous handler clears immediately; an async one keeps the draft
    // until it resolves, so a rejected send never loses what was typed.
    if (!(result instanceof Promise)) {
      setBody('');
      setAttachments([]);
      return;
    }

    setPending(true);
    try {
      await result;
      setBody('');
      setAttachments([]);
    } catch {
      // Intentionally swallowed: the draft stays put and the consumer owns
      // error reporting (a Snackbar, an Alert, ...). Rethrowing here would
      // surface as an unhandled rejection from a keystroke.
    } finally {
      setPending(false);
    }
  }, [canSubmit, body, attachments, parentId, onSubmit, setBody]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!sendOnEnter) return;
    // Shift+Enter always inserts a newline; the modifier check also leaves
    // IME composition (which fires Enter to commit) alone.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submit();
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setAttachments((current) => [...current, ...Array.from(list)]);
    // Reset so selecting the same file twice in a row still fires `change`.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) =>
    setAttachments((current) => current.filter((_, i) => i !== index));

  return (
    <form
      className={classNames('eidos-message-composer', className)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {replyingTo && (
        <div className="eidos-composer-reply-hint">
          <span>
            Replying to <strong>{replyingTo}</strong>
          </span>
          {onCancel && (
            <Button
              variant="text"
              color="secondary"
              size="sm"
              icon={X}
              onClick={onCancel}
              tooltip="Cancel reply"
              aria-label="Cancel reply"
            />
          )}
        </div>
      )}

      <div className="eidos-composer-row">
        {author && (
          <div className="eidos-composer-avatar">
            <Avatar
              src={author.avatarSrc}
              name={author.name}
              size="sm"
              color={author.avatarColor ?? 'gray'}
            />
          </div>
        )}

        <div className="eidos-composer-field">
          <textarea
            ref={textareaRef}
            className="eidos-composer-input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || pending}
            rows={1}
            maxLength={maxLength}
            // Opt-in and off by default. Only the reply composer sets it, where
            // the field appears in direct response to the user pressing Reply -
            // moving focus there is the expected outcome, not a hijack.
            autoFocus={autoFocus}
            aria-label={placeholder}
          />

          {attachments.length > 0 && (
            <ul className="eidos-composer-attachments">
              {attachments.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`}>
                  <Chip
                    size="sm"
                    variant="outlined"
                    color="secondary"
                    preIcon={Paperclip}
                    onRemove={() => removeAttachment(index)}
                  >
                    {file.name}
                    {file.size > 0 && ` (${formatFileSize(file.size)})`}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="eidos-composer-actions">
        <div className="eidos-composer-actions-start">
          {allowAttachments && (
            <>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                multiple
                accept={attachmentAccept}
                className="eidos-composer-file-input"
                onChange={(event) => addFiles(event.target.files)}
                disabled={disabled || pending}
              />
              <Button
                variant="text"
                color="secondary"
                size="sm"
                icon={Paperclip}
                tooltip="Attach files"
                aria-label="Attach files"
                disabled={disabled || pending}
                onClick={() => fileInputRef.current?.click()}
              />
            </>
          )}
          {sendOnEnter && (
            <span className="eidos-composer-hint">
              <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
            </span>
          )}
        </div>

        <div className="eidos-composer-actions-end">
          {onCancel && !replyingTo && (
            <Button
              variant="text"
              color="secondary"
              size="sm"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            color="primary"
            preIcon={Send}
            loading={pending}
            disabled={!canSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

MessageComposer.displayName = 'MessageComposer';
