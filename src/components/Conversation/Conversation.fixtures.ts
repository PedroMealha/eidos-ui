import type { ConversationMessage, MessageAuthor } from './Conversation.types';

// Shared sample data for Chat's, CommentThread's and MessageComposer's
// stories. Deliberately kept out of any `*.stories.tsx` file: Storybook's
// indexer treats every named export of one as a candidate story and crashes
// when it tries to render a bare array - see the same note on
// `CommandPalette.fixtures.ts`.

export const ANA: MessageAuthor = {
  id: 'u-ana',
  name: 'Ana Ferreira',
  avatarColor: 'primary',
  role: 'Support',
};

export const BRUNO: MessageAuthor = {
  id: 'u-bruno',
  name: 'Bruno Costa',
  avatarColor: 'success',
};

export const CHIARA: MessageAuthor = {
  id: 'u-chiara',
  name: 'Chiara Ricci',
  avatarColor: 'warning',
  role: 'Admin',
};

/** Fixed offsets from "now" so the stories always show plausible timestamps. */
const at = (minutesAgo: number): string => new Date(Date.now() - minutesAgo * 60_000).toISOString();

/**
 * A real, downloadable `url` for the attachment below.
 *
 * `MessageItem` renders an attachment as an `<a download>` only when it has a
 * `url`, and as an inert label otherwise - so a fixture without one documented
 * "attachments render as download chips" with a chip that does nothing when
 * clicked. A `data:` URL keeps the fixture a plain JSON-serialisable string,
 * which is the property `ConversationMessage` exists to preserve.
 */
const PATCH_FILE =
  'data:text/plain;charset=utf-8,' +
  encodeURIComponent(
    [
      '--- a/export.ts',
      '+++ b/export.ts',
      '@@',
      '-const columns = BASE;',
      '+const columns = ALL;',
    ].join('\n'),
  );

export const CHAT_MESSAGES: ConversationMessage[] = [
  {
    id: 'm-1',
    author: BRUNO,
    body: 'Morning! The export job finished overnight but the CSV is missing the last column.',
    sentAt: at(60 * 26),
  },
  {
    id: 'm-2',
    author: ANA,
    body: 'Thanks for flagging it - looking now.',
    sentAt: at(60 * 25),
  },
  {
    id: 'm-3',
    author: ANA,
    body: "Reproduced. The header row is written before the schema migration runs, so it's using the old column list.",
    sentAt: at(60 * 25 - 2),
  },
  {
    id: 'm-4',
    author: BRUNO,
    body: 'Ah, that would explain why it only started after Tuesday.',
    sentAt: at(190),
  },
  {
    id: 'm-5',
    author: ANA,
    body: 'Exactly. Patch is up for review, should ship this afternoon.',
    sentAt: at(45),
    attachments: [{ id: 'a-1', name: 'export-fix.patch', size: 4_812, url: PATCH_FILE }],
  },
  {
    id: 'm-6',
    author: BRUNO,
    body: 'Perfect, thank you!',
    sentAt: at(12),
  },
];

export const COMMENT_MESSAGES: ConversationMessage[] = [
  {
    id: 'c-1',
    author: CHIARA,
    body: 'Proposing we drop the legacy v1 endpoint in the next major. Usage is down to 0.3% of requests and it is the last thing blocking the auth refactor.',
    sentAt: at(60 * 30),
  },
  {
    id: 'c-2',
    author: BRUNO,
    body: 'Agreed in principle. Do we know who the remaining 0.3% are?',
    sentAt: at(60 * 28),
    parentId: 'c-1',
  },
  {
    id: 'c-3',
    author: CHIARA,
    body: 'Two internal dashboards and one customer integration. All three have a migration path.',
    sentAt: at(60 * 27),
    parentId: 'c-2',
  },
  {
    id: 'c-4',
    author: ANA,
    body: "Let's give the customer a full release cycle of notice rather than deprecating and removing in one go.",
    sentAt: at(60 * 5),
    edited: true,
  },
];
