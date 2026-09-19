import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { Drawer } from '../Drawer';
import { Chat } from './Chat.component';
import { ANA, BRUNO, CHAT_MESSAGES, CHIARA } from './Conversation.fixtures';
import type { ConversationMessage, MessageDraft } from './Conversation.types';

// Chat fills its parent by design (no `height` prop), so every story needs a
// sized box around it. Fixed px, not rem: a Docs page renders in Storybook's
// manager frame, which doesn't inherit global.scss's 14px root font size.
const Frame: React.FC<{ children: React.ReactNode; height?: number }> = ({
  children,
  height = 460,
}) => (
  <div
    style={{
      height,
      maxWidth: 720,
      border: '1px solid var(--gray-200)',
      borderRadius: 8,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: 'Data/Chat',
  component: Chat,
  parameters: { layout: 'padded' },
  args: {
    messages: CHAT_MESSAGES,
    currentUserId: ANA.id,
    readOnly: false,
    loading: false,
    hasMore: false,
    loadingMore: false,
    groupConsecutive: true,
    groupWindowMinutes: 5,
    showDateSeparators: true,
    animateNewMessages: true,
    allowAttachments: false,
    sendOnEnter: true,
    placeholder: 'Write a message...',
    ariaLabel: 'Conversation',
  },
  argTypes: {
    // ---- Data -------------------------------------------------------------
    // Left uncontrolled: an auto-generated object editor for an array of
    // messages is unusable, and editing it by hand breaks the stories.
    messages: {
      control: false,
      description: 'Messages to render, oldest first. Fully JSON-serialisable.',
      table: { type: { summary: 'ConversationMessage[]' } },
    },
    currentUserId: {
      control: 'text',
      description: 'Id of the viewing user. Their messages are right-aligned and filled.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    typing: {
      control: false,
      description: 'Authors currently composing. Rendered as a typing indicator.',
      table: { type: { summary: 'MessageAuthor[]' } },
    },
    unreadFromId: {
      control: 'text',
      description: 'Draws an "Unread messages" divider above this id. Ignored if not present.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },

    // ---- Permissions ------------------------------------------------------
    readOnly: {
      control: 'boolean',
      description:
        'Removes the composer, reply and retry affordances. A UI affordance only - not authorization.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    readOnlyMessage: {
      control: 'text',
      description: 'Shown in place of the composer while `readOnly`.',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
    },
    messageActions: {
      control: false,
      description:
        'Per-message overflow menu, and the per-message permission hook: return an empty array to render no trigger for that message.',
      table: { type: { summary: '(message) => MenuItemType[] | undefined' } },
    },

    // ---- State ------------------------------------------------------------
    loading: {
      control: 'boolean',
      description: 'Shows a skeleton in place of the list.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    hasMore: {
      control: 'boolean',
      description: 'Whether older messages remain. Shows the load-earlier affordance.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    loadingMore: {
      control: 'boolean',
      description: 'Pending state for the load-earlier affordance.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    emptyContent: {
      control: false,
      description: 'Replaces the built-in empty state.',
      table: { type: { summary: 'React.ReactNode' } },
    },

    // ---- Presentation -----------------------------------------------------
    groupConsecutive: {
      control: 'boolean',
      description: 'Collapses the avatar and author line on consecutive messages from one author.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    groupWindowMinutes: {
      control: { type: 'number', min: 0, max: 120 },
      description: 'Maximum gap between messages that still counts as one run.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '5' } },
    },
    showDateSeparators: {
      control: 'boolean',
      description: 'Draws a Today / Yesterday / date divider between days.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    animateNewMessages: {
      control: 'boolean',
      description:
        'Fades newly arrived messages in. Never animates the initial history, and always off under prefers-reduced-motion.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    allowAttachments: {
      control: 'boolean',
      description: 'Shows the attach control on the composer.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    attachmentAccept: {
      control: 'text',
      description: "Restricts the file picker, e.g. 'image/*'.",
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    sendOnEnter: {
      control: 'boolean',
      description: 'Enter submits; Shift+Enter inserts a newline.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    placeholder: {
      control: 'text',
      description: 'Composer placeholder.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Write a message...'" } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the log region.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Conversation'" } },
    },

    // ---- Callbacks --------------------------------------------------------
    onSend: {
      control: false,
      description:
        'Submit handler. Return a promise to get a pending state; the draft is preserved if it rejects. Omit to render no composer.',
      table: { type: { summary: '(draft: MessageDraft) => void | Promise<void>' } },
    },
    onRetry: {
      control: false,
      description: "Invoked from the retry control on a message with status 'failed'.",
      table: { type: { summary: '(message: ConversationMessage) => void' } },
    },
    onLoadMore: {
      control: false,
      description: 'Requests the previous page. Also fires when scrolling near the top.',
      table: { type: { summary: '() => void' } },
    },
    renderBody: {
      control: false,
      description: 'Replaces the message body - use for markdown or rich text.',
      table: { type: { summary: '(message) => React.ReactNode' } },
    },
    renderMessageFooter: {
      control: false,
      description: 'Extra content under a body, e.g. reactions or read receipts.',
      table: { type: { summary: '(message) => React.ReactNode' } },
    },
    formatTimestamp: {
      control: false,
      description: 'Overrides the default Intl-based timestamp rendering.',
      table: { type: { summary: '(iso: string) => string' } },
    },
  },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  render: (args) => {
    const [messages, setMessages] = useState<ConversationMessage[]>(args.messages);

    const handleSend = useCallback(async (draft: MessageDraft) => {
      const id = `local-${Date.now()}`;
      setMessages((current) => [
        ...current,
        {
          id,
          author: ANA,
          body: draft.body,
          sentAt: new Date().toISOString(),
          status: 'sending',
          attachments: draft.attachments.map((file, index) => ({
            id: `${id}-${index}`,
            name: file.name,
            size: file.size,
          })),
        },
      ]);

      await wait(700);
      setMessages((current) =>
        current.map((message) => (message.id === id ? { ...message, status: 'sent' } : message)),
      );
    }, []);

    return (
      <Frame>
        <Chat {...args} messages={messages} onSend={handleSend} />
      </Frame>
    );
  },
};

// ============================================================================
// States
// ============================================================================

export const Empty: Story = {
  args: { messages: [] },
  render: (args) => (
    <Frame height={360}>
      <Chat {...args} onSend={() => {}} />
    </Frame>
  ),
};

export const Loading: Story = {
  args: { loading: true, messages: [] },
  render: (args) => (
    <Frame height={360}>
      <Chat {...args} onSend={() => {}} />
    </Frame>
  ),
};

/**
 * Paging upward. The scroll position is anchored across the prepend, so the
 * message the reader was on stays exactly where it was.
 */
export const LoadingOlderHistory: Story = {
  render: (args) => {
    const [messages, setMessages] = useState(CHAT_MESSAGES);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);

    const handleLoadMore = useCallback(async () => {
      setLoadingMore(true);
      await wait(800);
      const older: ConversationMessage[] = Array.from({ length: 5 }, (_, index) => ({
        id: `older-${page}-${index}`,
        author: index % 2 === 0 ? BRUNO : ANA,
        body: `Earlier message ${page * 5 + index + 1} from the previous page of history.`,
        sentAt: new Date(Date.now() - (6 + page * 5 + index) * 86_400_000).toISOString(),
      }));
      setMessages((current) => [...older.reverse(), ...current]);
      setPage((current) => current + 1);
      setLoadingMore(false);
    }, [page]);

    return (
      <Frame>
        <Chat
          {...args}
          messages={messages}
          hasMore={page < 3}
          loadingMore={loadingMore}
          onLoadMore={() => void handleLoadMore()}
          onSend={() => {}}
        />
      </Frame>
    );
  },
};

/** An optimistic send that failed. The body is kept and retry is offered. */
export const FailedMessageRetry: Story = {
  render: (args) => {
    const [messages, setMessages] = useState<ConversationMessage[]>([
      ...CHAT_MESSAGES,
      {
        id: 'm-failed',
        author: ANA,
        body: "Here's the updated timeline for the migration.",
        sentAt: new Date().toISOString(),
        status: 'failed',
      },
    ]);

    const handleRetry = useCallback(async (message: ConversationMessage) => {
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, status: 'sending' } : item)),
      );
      await wait(900);
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, status: 'sent' } : item)),
      );
    }, []);

    return (
      <Frame>
        <Chat
          {...args}
          messages={messages}
          onRetry={(message) => void handleRetry(message)}
          onSend={() => {}}
        />
      </Frame>
    );
  },
};

export const TypingIndicator: Story = {
  args: { typing: [BRUNO] },
  render: (args) => (
    <Frame>
      <Chat {...args} onSend={() => {}} />
    </Frame>
  ),
};

export const UnreadDivider: Story = {
  args: { unreadFromId: 'm-5' },
  render: (args) => (
    <Frame>
      <Chat {...args} onSend={() => {}} />
    </Frame>
  ),
};

export const WithAttachments: Story = {
  args: { allowAttachments: true },
  render: (args) => (
    <Frame>
      <Chat {...args} onSend={() => {}} />
    </Frame>
  ),
};

// ============================================================================
// Permissions
// ============================================================================

/**
 * A viewer with no write permission. The composer is **removed**, not
 * disabled - a control nobody can ever use is worse than no control.
 */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    readOnlyMessage: 'You have read-only access to this conversation.',
  },
  render: (args) => (
    <Frame>
      <Chat {...args} onSend={() => {}} messageActions={() => []} />
    </Frame>
  ),
};

/**
 * Per-message permissions. `messageActions` is called for each message, so a
 * viewer can edit their own and only report someone else's.
 */
export const MixedPermissions: Story = {
  render: (args) => (
    <Frame>
      <Chat
        {...args}
        currentUserId={ANA.id}
        onSend={() => {}}
        messageActions={(message) =>
          message.author.id === ANA.id
            ? [
                { id: 'edit', type: 'item', label: 'Edit', icon: Pencil },
                { id: 'delete', type: 'item', label: 'Delete', icon: Trash2, color: 'danger' },
              ]
            : []
        }
      />
    </Frame>
  ),
};

// ============================================================================
// In context
// ============================================================================

/**
 * Inside a Drawer - the case the responsive rules are built for. The layout
 * reacts to the Drawer's width via container queries, so it collapses
 * correctly even though the viewport is wide.
 */
export const InsideDrawer: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open conversation</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} size="sm" title="Ticket MRD-482">
          <div style={{ height: '100%', minHeight: 420 }}>
            <Chat {...args} typing={[CHIARA]} onSend={() => {}} />
          </div>
        </Drawer>
      </>
    );
  },
};
