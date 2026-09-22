import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Command, CornerDownLeft, Search } from 'lucide-react';
import type { CommandItem, CommandPaletteProps } from './CommandPalette.types';
import { useDialogFocus, useIsClient, FOCUSABLE_SELECTOR } from '../../utils';
import { Kbd } from '../Kbd';
import './CommandPalette.scss';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Must match the CSS transition duration in CommandPalette.scss */
const TRANSITION_MS = 200;

// ── Pure helpers ───────────────────────────────────────────────────────────────

function filterItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(({ label, description, keywords }) => {
    return (
      label.toLowerCase().includes(q) ||
      (description?.toLowerCase().includes(q) ?? false) ||
      (keywords?.some((k) => k.toLowerCase().includes(q)) ?? false)
    );
  });
}

interface Group {
  label: string | null;
  items: CommandItem[];
}

/**
 * Groups items while preserving the order in which groups first appear.
 * Items with no `group` property are placed in a leading implicit section
 * (label: null) so that labelled groups always follow them.
 */
function buildGroups(items: CommandItem[]): Group[] {
  const groups: Group[] = [];
  const groupMap = new Map<string, Group>();

  for (const item of items) {
    const key = item.group ?? '';
    let group = groupMap.get(key);
    if (!group) {
      group = { label: item.group ?? null, items: [] };
      groups.push(group);
      groupMap.set(key, group);
    }
    group.items.push(item);
  }

  return groups;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open: openProp,
  defaultOpen = false,
  onClose,
  onOpen,
  shortcutKey = 'k',
  items,
  onSelect,
  placeholder = 'Search commands…',
  emptyText = 'No commands found',
  maxHeight = 360,
  className = '',
  footer,
  trigger,
  triggerLabel = 'Search',
}) => {
  const dialogId = useId();
  const listId = `${dialogId}-list`;

  // ── Controlled / uncontrolled open state ───────────────────────────────────
  // Omitting `open` lets the palette own its state entirely, which combined
  // with the shortcut listener below means it needs zero external
  // useState/useEffect to work. Passing `open` (+ `onClose`, optionally
  // `onOpen`) keeps full external control for consumers who need it (syncing
  // with a URL, another piece of app state, etc).
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? (openProp as boolean) : internalOpen;

  const close = useCallback(() => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
  }, [isControlled, onClose]);

  // Shared "open" path - uncontrolled flips the internal state directly;
  // controlled defers to `onOpen` since the palette can't change `open`
  // itself. Used by both the keyboard shortcut below and the inline
  // `trigger`'s click handler.
  const openPalette = useCallback(() => {
    if (isControlled) {
      onOpen?.();
    } else {
      setInternalOpen(true);
    }
  }, [isControlled, onOpen]);

  // Global keyboard shortcut - Cmd/Ctrl+<shortcutKey> opens the palette.
  useEffect(() => {
    if (!shortcutKey) return;

    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
      e.preventDefault();
      openPalette();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcutKey, openPalette]);

  // ── Animation state machine (mirrors the Drawer pattern) ─────────────────
  // isMounted → portal exists in the DOM (controls render/null)
  // isVisible → CSS --visible modifier is applied (drives transitions)
  //
  // Opening:  isMounted=true → double rAF → isVisible=true  → CSS transitions fire
  // Closing:  isVisible=false → CSS transitions reverse → after TRANSITION_MS → isMounted=false
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  // `isMounted` starts as `open`, so a palette opened by `open`/`defaultOpen`
  // would portal on its first render, which throws under SSR. The trigger
  // below still renders on the server - only the portal is deferred.
  const isClient = useIsClient();

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timerId: ReturnType<typeof setTimeout>;

    if (open) {
      setIsMounted(true);
      // Double rAF: ensures the browser has painted the initial off-screen
      // state before the CSS transition begins (React 18 automatic batching
      // means a single rAF is not always sufficient).
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      timerId = setTimeout(() => setIsMounted(false), TRANSITION_MS);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timerId);
    };
  }, [open]);

  // ── Search state ───────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Derived lists - memoised to stabilise scroll-effect deps
  const filtered = useMemo(() => filterItems(items, query), [items, query]);
  const navigable = useMemo(() => filtered.filter((item) => !item.disabled), [filtered]);
  const groups = useMemo(() => buildGroups(filtered), [filtered]);

  // Reset search query and selection when the palette is opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setFocusedIndex(0);
    }
  }, [open]);

  // Focus the search input on open, trap Tab inside the dialog, and return
  // focus to the trigger on close.
  //
  // This replaces a bare `inputRef.current?.focus()` effect. That moved focus
  // in correctly but nothing kept it there: the first Tab left the dialog for
  // the page behind it, and closing the palette stranded focus wherever it
  // happened to be. `initialFocus` preserves the original behaviour of
  // landing on the search field rather than the first focusable node.
  // `isClient` for the same reason as `Modal`: a palette opened by `open` or
  // `defaultOpen` has no portal on its first render, and this would run against
  // a null ref and never re-run.
  useDialogFocus(isClient && open && isVisible, dialogRef, { initialFocus: inputRef });

  // Reset focused index to 0 whenever the filtered list changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  // Scroll the focused item into view during keyboard navigation
  useEffect(() => {
    const focusedItem = navigable[focusedIndex];
    if (!focusedItem) return;
    itemRefs.current.get(focusedItem.id)?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, navigable]);

  // Body scroll lock (tied to open, not to isMounted, so it releases promptly
  // when the consumer decides to close - even before the exit animation ends)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ── Interaction handlers ───────────────────────────────────────────────────

  const selectItem = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      item.action?.();
      onSelect?.(item);
      close();
    },
    [close, onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (navigable.length === 0) return;
          setFocusedIndex((i) => (i + 1) % navigable.length);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (navigable.length === 0) return;
          setFocusedIndex((i) => (i - 1 + navigable.length) % navigable.length);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const item = navigable[focusedIndex];
          if (item) selectItem(item);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          close();
          break;
        }
      }
    },
    [focusedIndex, navigable, close, selectItem],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only fire when the click lands directly on the backdrop element,
      // not on any child (the dialog itself or its contents).
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  // Whether the custom trigger wrapper has to be the control itself, i.e.
  // whether what the caller passed contains nothing focusable. Measured after
  // render, like `Tooltip`'s equivalent.
  const customTriggerRef = useRef<HTMLDivElement>(null);
  const [customTriggerIsControl, setCustomTriggerIsControl] = useState(false);

  useEffect(() => {
    const element = customTriggerRef.current;
    setCustomTriggerIsControl(!!element && element.querySelector(FOCUSABLE_SELECTOR) === null);
  }, [trigger]);

  // ── Render ─────────────────────────────────────────────────────────────────

  // The inline trigger (if any) must render regardless of `isMounted` - it's
  // what opens the palette in the first place, so it can't be gated behind
  // the portal's own mount state.
  const triggerNode =
    trigger === true ? (
      <button
        type="button"
        className="eidos-cmd-trigger-default"
        onClick={openPalette}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{triggerLabel}</span>
        {shortcutKey && (
          <Kbd size="sm" className="eidos-cmd-trigger-kbd">
            <Command size={10} />
            {shortcutKey.toUpperCase()}
          </Kbd>
        )}
      </button>
    ) : trigger ? (
      // The wrapper only becomes a control when what it wraps is not one.
      //
      // It used to be `role="button" tabIndex={0}` unconditionally, with no key
      // handler, which was wrong in both directions at once: around an
      // interactive child it produced a button inside a button and a second tab
      // stop, and around a non-interactive one - `Avatar`, which is the
      // documented example - it produced a focusable element that announced
      // itself as a button and did nothing when activated.
      //
      // Measured from the DOM rather than guessed from the node type, because
      // `trigger` is an arbitrary `ReactNode` and the control may be nested
      // inside it. Same approach as `Tooltip`.
      <div
        ref={customTriggerRef}
        className="eidos-cmd-trigger"
        onClick={openPalette}
        {...(customTriggerIsControl
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-haspopup': 'dialog' as const,
              'aria-expanded': open,
              onKeyDown: (event: React.KeyboardEvent) => {
                // A `div` is not a button: Enter and Space produce no click of
                // their own.
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPalette();
                }
              },
            }
          : {})}
      >
        {trigger}
      </div>
    ) : null;

  const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  // The root element must not change shape between the closed and open
  // states.
  //
  // This used to `return triggerNode` while closed and a fragment once
  // mounted. React compares the root by element type, so flipping from
  // `<button>` to `<Fragment>` unmounted the trigger and mounted a brand new
  // one - the very element the user had just clicked was destroyed. Focus
  // was lost with it, which made returning focus on close impossible: the
  // node to return to no longer existed.
  //
  // Always returning the fragment keeps `triggerNode` in a stable position,
  // so React preserves the DOM node across open and close.
  return (
    <>
      {triggerNode}
      {isClient &&
        isMounted &&
        createPortal(
          <div
            className={['eidos-cmd-backdrop', isVisible && 'eidos-cmd-backdrop--visible']
              .filter(Boolean)
              .join(' ')}
            onClick={handleBackdropClick}
            aria-hidden={!open}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              id={dialogId}
              className={['eidos-cmd-dialog', isVisible && 'eidos-cmd-dialog--visible', className]
                .filter(Boolean)
                .join(' ')}
              onKeyDown={handleKeyDown}
            >
              {/* ── Search ──────────────────────────────────────────────────────── */}
              <div className="eidos-cmd-search">
                <Search className="eidos-cmd-search-icon" size={18} aria-hidden="true" />

                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-label={placeholder}
                  className="eidos-cmd-input"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                />

                {/* Reminds users of the configured shortcut, if any */}
                {shortcutKey && (
                  <div className="eidos-cmd-search-badge" aria-hidden="true">
                    <Command size={11} />
                    <span>{shortcutKey.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* ── Results list ─────────────────────────────────────────────────── */}
              <div
                id={listId}
                role="listbox"
                aria-label="Commands"
                className="eidos-cmd-list"
                style={{ maxHeight: maxHeightValue }}
              >
                {filtered.length === 0 ? (
                  <p className="eidos-cmd-empty" role="status">
                    {emptyText}
                  </p>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.label ?? '__ungrouped__'}
                      role="group"
                      aria-label={group.label ?? undefined}
                    >
                      {group.label && (
                        <div className="eidos-cmd-group-label" aria-hidden="true">
                          {group.label}
                        </div>
                      )}

                      {group.items.map((item) => {
                        const isFocused = navigable[focusedIndex]?.id === item.id;
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.id}
                            ref={(el) => {
                              if (el) {
                                itemRefs.current.set(item.id, el);
                              } else {
                                itemRefs.current.delete(item.id);
                              }
                            }}
                            role="option"
                            aria-selected={isFocused}
                            aria-disabled={item.disabled}
                            className={[
                              'eidos-cmd-item',
                              isFocused && 'eidos-cmd-item--focused',
                              item.disabled && 'eidos-cmd-item--disabled',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => selectItem(item)}
                            onMouseEnter={() => {
                              if (!item.disabled) {
                                const idx = navigable.findIndex((n) => n.id === item.id);
                                if (idx !== -1) setFocusedIndex(idx);
                              }
                            }}
                          >
                            {Icon && (
                              <span className="eidos-cmd-item-icon" aria-hidden="true">
                                <Icon size={16} />
                              </span>
                            )}

                            <div className="eidos-cmd-item-body">
                              <div className="eidos-cmd-item-label">{item.label}</div>
                              {item.description && (
                                <div className="eidos-cmd-item-description">{item.description}</div>
                              )}
                            </div>

                            {item.shortcut && item.shortcut.length > 0 && (
                              <div
                                className="eidos-cmd-item-shortcut"
                                aria-label={`Shortcut: ${item.shortcut.join(' ')}`}
                              >
                                {item.shortcut.map((key, i) => (
                                  <kbd key={i} className="eidos-cmd-kbd">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* ── Footer ───────────────────────────────────────────────────────── */}
              <div className="eidos-cmd-footer">
                <div className="eidos-cmd-hints" aria-hidden="true">
                  <span>
                    <ArrowUp size={11} />
                    <ArrowDown size={11} /> Navigate
                  </span>
                  <span>
                    <CornerDownLeft size={11} /> Select
                  </span>
                  <span>Esc Close</span>
                </div>

                {footer && <div className="eidos-cmd-footer-slot">{footer}</div>}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

CommandPalette.displayName = 'CommandPalette';
