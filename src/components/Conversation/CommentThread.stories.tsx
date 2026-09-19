import { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flag, Pencil, Trash2 } from 'lucide-react';
import { CommentThread } from './CommentThread.component';
import { ANA, BRUNO, CHIARA, COMMENT_MESSAGES } from './Conversation.fixtures';
import type { ConversationMessage, MessageDraft } from './Conversation.types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: 'Data/CommentThread',
  component: CommentThread,
  parameters: { layout: 'padded' },
  args: {
    messages: COMMENT_MESSAGES,
    currentUserId: ANA.id,
    title: 'Discussion',
    readOnly: false,
    loading: false,
    hasMore: false,
    loadingMore: false,
    groupConsecutive: true,
    groupWindowMinutes: 5,
    animateNewMessages: true,
    allowAttachments: false,
    sendOnEnter: false,
    order: 'oldest-first',
    composerPosition: 'bottom',
    placeholder: 'Add a comment...',
    ariaLabel: 'Comments',
  },
  argTypes: {
    // ---- Data -------------------------------------------------------------
    messages: {
      control: false,
      description:
        'Comments to render. `parentId` nests a reply one level; deeper chains flatten onto the top-level ancestor.',
      table: { type: { summary: 'ConversationMessage[]' } },
    },
    currentUserId: {
      control: 'text',
      description: 'Id of the viewing user. Marks their own comments with a rule.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    title: {
      control: 'text',
      description: 'Heading above the thread.',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
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
        'Per-comment overflow menu, and the per-comment permission hook: return an empty array to render no trigger for that comment.',
      table: { type: { summary: '(message) => MenuItemType[] | undefined' } },
    },

    // ---- Layout -----------------------------------------------------------
    order: {
      control: 'radio',
      options: ['oldest-first', 'newest-first'],
      description: 'Ordering of top-level comments. Replies always read oldest-first.',
      table: {
        type: { summary: '"oldest-first" | "newest-first"' },
        defaultValue: { summary: 'oldest-first' },
      },
    },
    composerPosition: {
      control: 'radio',
      options: ['top', 'bottom'],
      description: 'Where the top-level composer sits relative to the thread.',
      table: { type: { summary: '"top" | "bottom"' }, defaultValue: { summary: 'bottom' } },
    },

    // ---- State ------------------------------------------------------------
    loading: {
      control: 'boolean',
      description: 'Shows a skeleton in place of the thread.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    hasMore: {
      control: 'boolean',
      description: 'Whether more comments remain. Shows the load-more affordance.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    loadingMore: {
      control: 'boolean',
      description: 'Pending state for the load-more affordance.',
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
      description: 'Collapses the avatar and author line on consecutive comments from one author.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    groupWindowMinutes: {
      control: { type: 'number', min: 0, max: 120 },
      description: 'Maximum gap between comments that still counts as one run.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '5' } },
    },
    animateNewMessages: {
      control: 'boolean',
      description:
        'Fades newly arrived comments in. Never animates the initial page, and always off under prefers-reduced-motion.',
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
      description:
        'Enter submits. Off by default - a comment is usually deliberate and multi-line.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Composer placeholder.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Add a comment...'" } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the comment list.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Comments'" } },
    },

    // ---- Callbacks --------------------------------------------------------
    onSend: {
      control: false,
      description: 'Submit handler for a top-level comment. Omit to render no composer.',
      table: { type: { summary: '(draft: MessageDraft) => void | Promise<void>' } },
    },
    onReply: {
      control: false,
      description:
        'Enables the per-comment reply control and its inline composer. Omit for a flat thread.',
      table: { type: { summary: '(draft: MessageDraft) => void | Promise<void>' } },
    },
    onRetry: {
      control: false,
      description: "Invoked from the retry control on a comment with status 'failed'.",
      table: { type: { summary: '(message: ConversationMessage) => void' } },
    },
    onLoadMore: {
      control: false,
      description: 'Requests the next page of comments.',
      table: { type: { summary: '() => void' } },
    },
    renderBody: {
      control: false,
      description: 'Replaces the comment body - use for markdown or rich text.',
      table: { type: { summary: '(message) => React.ReactNode' } },
    },
    renderMessageFooter: {
      control: false,
      description: 'Extra content under a body, e.g. reactions.',
      table: { type: { summary: '(message) => React.ReactNode' } },
    },
    formatTimestamp: {
      control: false,
      description: 'Overrides the default Intl-based timestamp rendering.',
      table: { type: { summary: '(iso: string) => string' } },
    },
  },
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  render: (args) => {
    const [messages, setMessages] = useState<ConversationMessage[]>(args.messages);

    const append = useCallback(async (draft: MessageDraft) => {
      await wait(500);
      setMessages((current) => [
        ...current,
        {
          id: `local-${Date.now()}`,
          author: ANA,
          body: draft.body,
          sentAt: new Date().toISOString(),
          parentId: draft.parentId,
        },
      ]);
    }, []);

    return <CommentThread {...args} messages={messages} onSend={append} onReply={append} />;
  },
};

// ============================================================================
// States
// ============================================================================

export const Empty: Story = {
  args: { messages: [] },
  render: (args) => <CommentThread {...args} onSend={() => {}} />,
};

export const Loading: Story = {
  args: { loading: true, messages: [] },
  render: (args) => <CommentThread {...args} onSend={() => {}} />,
};

/**
 * Replies nest exactly one level. A reply to a reply is flattened onto the
 * same level with a "Replying to ..." line, rather than indenting further -
 * deeper indentation is unreadable on a narrow screen.
 */
export const WithReplies: Story = {
  render: (args) => <CommentThread {...args} onSend={() => {}} onReply={() => {}} />,
};

export const NewestFirst: Story = {
  args: { order: 'newest-first' },
  render: (args) => <CommentThread {...args} onSend={() => {}} onReply={() => {}} />,
};

export const ComposerAtTop: Story = {
  args: { composerPosition: 'top' },
  render: (args) => <CommentThread {...args} onSend={() => {}} onReply={() => {}} />,
};

export const WithLoadMore: Story = {
  args: { hasMore: true },
  render: (args) => <CommentThread {...args} onSend={() => {}} onReply={() => {}} />,
};

// ============================================================================
// Permissions
// ============================================================================

/**
 * No write permission at all: no composer, no reply controls, no overflow
 * menus. The notice explains the absence rather than leaving it silent.
 */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    readOnlyMessage: 'Commenting is closed on this thread.',
  },
  render: (args) => (
    <CommentThread {...args} onSend={() => {}} onReply={() => {}} messageActions={() => []} />
  ),
};

/**
 * The realistic case: permissions differ **per comment** within one thread.
 * Ana may edit and delete her own, report anyone else's, and Chiara's
 * comments as an admin are not hers to touch.
 */
export const MixedPermissions: Story = {
  render: (args) => (
    <CommentThread
      {...args}
      currentUserId={ANA.id}
      onSend={() => {}}
      onReply={() => {}}
      messageActions={(message) =>
        message.author.id === ANA.id
          ? [
              { id: 'edit', type: 'item', label: 'Edit', icon: Pencil },
              { id: 'delete', type: 'item', label: 'Delete', icon: Trash2, color: 'danger' },
            ]
          : [{ id: 'report', type: 'item', label: 'Report', icon: Flag }]
      }
    />
  ),
};

/** A thread nobody may reply to, but which still accepts new top-level comments. */
export const RepliesDisabled: Story = {
  args: { messages: COMMENT_MESSAGES.filter((message) => !message.parentId) },
  render: (args) => <CommentThread {...args} onSend={() => {}} />,
};

// ============================================================================
// Customisation
// ============================================================================

/** `renderMessageFooter` is the extension point for reactions and receipts. */
export const WithMessageFooter: Story = {
  render: (args) => (
    <CommentThread
      {...args}
      onSend={() => {}}
      onReply={() => {}}
      renderMessageFooter={(message) => (
        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {message.author.id === CHIARA.id ? '👍 3 · 🎉 1' : '👍 1'}
        </span>
      )}
    />
  ),
};

/** Own comments are distinguished by a rule, so a full page stays readable. */
export const OwnComments: Story = {
  args: { currentUserId: BRUNO.id },
  render: (args) => <CommentThread {...args} onSend={() => {}} onReply={() => {}} />,
};
