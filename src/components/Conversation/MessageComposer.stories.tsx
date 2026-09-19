import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageComposer } from './MessageComposer.component';
import { ANA, BRUNO } from './Conversation.fixtures';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: 'Data/MessageComposer',
  component: MessageComposer,
  parameters: { layout: 'padded' },
  args: {
    // Required prop, so it has to be on the meta for every story to typecheck.
    // Each story below supplies its own.
    onSubmit: () => {},
    placeholder: 'Write a message...',
    submitLabel: 'Send',
    sendOnEnter: false,
    allowAttachments: false,
    disabled: false,
    requireBody: true,
    autoFocus: false,
  },
  argTypes: {
    value: {
      control: false,
      description: 'Controlled draft body. Leave undefined for uncontrolled use.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    onChange: {
      control: false,
      description: 'Fired on every keystroke. Required only for controlled use.',
      table: { type: { summary: '(value: string) => void' } },
    },
    onSubmit: {
      control: false,
      description:
        'Return a promise for an automatic pending state: the draft clears on resolve and is preserved on reject, so a failed send never loses what was typed.',
      table: { type: { summary: '(draft: MessageDraft) => void | Promise<void>' } },
    },
    onCancel: {
      control: false,
      description: 'Renders a Cancel control when supplied.',
      table: { type: { summary: '() => void' } },
    },
    author: {
      control: false,
      description: 'Composing user. Renders an avatar beside the field.',
      table: { type: { summary: 'MessageAuthor' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder, also used as the field’s accessible name.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Write a message...'" } },
    },
    submitLabel: {
      control: 'text',
      description: 'Label on the submit button.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Send'" } },
    },
    sendOnEnter: {
      control: 'boolean',
      description: 'Enter submits; Shift+Enter inserts a newline. IME composition is unaffected.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    parentId: {
      control: 'text',
      description: 'Attached to the emitted draft, marking it a reply.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    replyingTo: {
      control: 'text',
      description: 'Name of the author being replied to. Shown as a dismissible hint.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    allowAttachments: {
      control: 'boolean',
      description:
        'Shows the attach control. Files are emitted on the draft; upload is the consumer’s job.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    attachmentAccept: {
      control: 'text',
      description: "Restricts the file picker, e.g. 'image/*'.",
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    requireBody: {
      control: 'boolean',
      description: 'Rejects a whitespace-only body. Turn off for attachment-only messages.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Focuses the field on mount. Intended for a reply composer.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    maxLength: {
      control: 'number',
      description: 'Maximum body length.',
      table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
    },
  },
} satisfies Meta<typeof MessageComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [sent, setSent] = useState<string[]>([]);

    return (
      <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <MessageComposer
          {...args}
          author={ANA}
          onSubmit={async (draft) => {
            await wait(600);
            setSent((current) => [...current, draft.body]);
          }}
        />
        {sent.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--gray-500)' }}>
            {sent.map((body, index) => (
              <li key={index}>{body}</li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};

/** Enter submits. The hint is shown inline so the shortcut is discoverable. */
export const SendOnEnter: Story = {
  args: { sendOnEnter: true },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <MessageComposer {...args} author={ANA} onSubmit={() => {}} />
    </div>
  ),
};

export const WithAttachments: Story = {
  args: { allowAttachments: true, requireBody: false },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <MessageComposer {...args} author={ANA} onSubmit={() => {}} />
    </div>
  ),
};

export const ReplyingTo: Story = {
  args: {
    replyingTo: BRUNO.name,
    parentId: 'c-2',
    submitLabel: 'Reply',
    placeholder: 'Write a reply...',
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <MessageComposer {...args} author={ANA} onSubmit={() => {}} onCancel={() => {}} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <MessageComposer {...args} author={ANA} onSubmit={() => {}} />
    </div>
  ),
};

/**
 * A rejected submit keeps the draft. Type something and send - the request
 * fails, the pending state clears, and the text is still there to retry.
 */
export const FailingSubmit: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <MessageComposer
        {...args}
        author={ANA}
        onSubmit={async () => {
          await wait(700);
          throw new Error('Network unavailable');
        }}
      />
    </div>
  ),
};
