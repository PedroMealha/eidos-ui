import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ConversationMessage } from './Conversation.types';

/**
 * Ids that arrived *after* the first render.
 *
 * Seeded from the first commit so an initial page of history is never
 * animated - otherwise opening a thread fades forty messages in at once,
 * which reads as a glitch rather than as feedback. Only genuinely new ids get
 * the entrance class, and each one only once.
 */
export const useNewMessageIds = (
  messages: ConversationMessage[],
  enabled: boolean,
): Set<string> => {
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    // First commit: everything already on screen counts as pre-existing.
    if (seen.current === null) {
      seen.current = new Set(messages.map((message) => message.id));
      return;
    }

    if (!enabled) {
      for (const message of messages) seen.current.add(message.id);
      return;
    }

    const added = messages.filter((message) => !seen.current?.has(message.id));
    if (!added.length) return;

    for (const message of added) seen.current.add(message.id);
    setFresh(new Set(added.map((message) => message.id)));
  }, [messages, enabled]);

  return fresh;
};

interface StickToBottom {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** The viewport is at (or near) the newest message. */
  atBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  handleScroll: () => void;
}

/** Distance from the bottom still counted as "reading the newest message". */
const BOTTOM_THRESHOLD_PX = 48;

/**
 * Keeps a bottom-anchored list pinned to the newest message - but only while
 * the reader is already there.
 *
 * Scrolling someone back down while they are reading scrollback is the single
 * most common defect in chat UIs, so arrival of a new message only forces a
 * scroll when `atBottom` was already true. Otherwise the caller surfaces a
 * jump-to-latest affordance and leaves the viewport alone.
 */
export const useStickToBottom = (messages: ConversationMessage[]): StickToBottom => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  // Read during a layout effect, so it must not be state - it has to be
  // correct for the commit that is happening right now, not the next render.
  const atBottomRef = useRef(true);
  const lastCount = useRef(messages.length);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    const next = distance <= BOTTOM_THRESHOLD_PX;
    atBottomRef.current = next;
    setAtBottom((current) => (current === next ? current : next));
  }, []);

  // Jump (not animate) to the bottom on first paint so a thread opens on its
  // newest message instead of visibly scrolling there.
  useLayoutEffect(() => {
    scrollToBottom('auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useLayoutEffect(() => {
    if (messages.length > lastCount.current && atBottomRef.current) {
      scrollToBottom('smooth');
    }
    lastCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  return { scrollRef, atBottom, scrollToBottom, handleScroll };
};

/**
 * Preserves the reader's position when older messages are prepended.
 *
 * Without this, inserting a page above the viewport pushes the content the
 * user was reading down by the height of everything added, which reads as the
 * list jumping to a random place. Capturing `scrollHeight` before the DOM
 * mutation and restoring the delta in a *layout* effect corrects it before the
 * browser paints, so there is no visible shift.
 */
export const useScrollAnchor = (
  scrollRef: React.RefObject<HTMLDivElement | null>,
  messages: ConversationMessage[],
): void => {
  const previous = useRef({ height: 0, firstId: '', count: 0 });

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const firstId = messages[0]?.id ?? '';
    const before = previous.current;
    // A prepend is the only case where the first id changes while the list
    // grows - an append leaves it untouched, and a replacement shrinks it.
    const prepended =
      before.firstId !== '' && before.firstId !== firstId && messages.length > before.count;

    if (prepended) {
      node.scrollTop += node.scrollHeight - before.height;
    }

    previous.current = { height: node.scrollHeight, firstId, count: messages.length };
  }, [messages, scrollRef]);
};

/**
 * Fires `onLoadMore` once the reader approaches the top of the history.
 *
 * Latched on the way in and released only after they scroll back out of the
 * trigger zone, so a single pause near the top can't queue a dozen fetches.
 */
export const useLoadMoreOnScrollTop = (
  scrollRef: React.RefObject<HTMLDivElement | null>,
  {
    hasMore,
    loadingMore,
    onLoadMore,
  }: {
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
  },
  thresholdPx = 80,
): (() => void) => {
  const armed = useRef(true);

  return useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    if (node.scrollTop > thresholdPx) {
      armed.current = true;
      return;
    }

    if (!armed.current || !hasMore || loadingMore || !onLoadMore) return;
    armed.current = false;
    onLoadMore();
  }, [scrollRef, hasMore, loadingMore, onLoadMore, thresholdPx]);
};

/**
 * Grows a textarea to fit its content, up to `maxHeight`.
 *
 * Height is written to `style.height` directly rather than through a React
 * inline style: it is measured from the live DOM after every keystroke, so it
 * cannot be expressed as a class, and routing it through state would add a
 * render per character. Assigning the property imperatively also keeps it out
 * of the server-rendered `style` attribute that CSP's `style-src-attr` gates.
 */
export const useAutoGrow = (
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 200,
): void => {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.style.height = 'auto';
    const next = Math.min(node.scrollHeight, maxHeight);
    node.style.height = `${next}px`;
    node.style.overflowY = node.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
};
