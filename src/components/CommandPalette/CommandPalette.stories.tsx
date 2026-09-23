import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Bug, FilePlus, Moon, Settings } from 'lucide-react';
import { CommandPalette } from './CommandPalette.component';
import type { CommandItem } from './CommandPalette.types';
import { CMDP_ITEMS } from './CommandPalette.fixtures';
import { Avatar } from '../Avatar';
import { expectFocusTrap } from '../../story-a11y.docs';
import { expect, screen, waitFor } from 'storybook/test';

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Overlays/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A keyboard-driven command palette rendered via `createPortal`. ' +
          'Supports fuzzy search, grouped results, keyboard shortcuts, and smooth enter/exit animations.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          height: '300px',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: {
      control: false,
      description:
        'Controlled open state. Omit (with `onClose`) for the palette to manage its own state.',
    },
    defaultOpen: {
      control: false,
      description: 'Initial open state when uncontrolled (`open` omitted).',
    },
    onClose: { control: false },
    onOpen: {
      control: false,
      description: 'Called when `shortcutKey` fires while `open` is controlled.',
    },
    shortcutKey: {
      control: 'text',
      description: 'Cmd/Ctrl+<key> shortcut that opens the palette. Pass `null` to disable it.',
    },
    items: {
      control: 'object',
      description: 'Array of command items to display in the palette.',
      table: {
        type: {
          summary: 'CommandItem[]',
        },
      },
    },
    footer: { control: false },
    trigger: {
      control: false,
      description:
        'Renders a clickable entry point inline. `true` for the built-in default trigger, a `ReactNode` for your own, or omit for a fully headless palette.',
    },
    triggerLabel: { control: 'text' },
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
    maxHeight: { control: 'text' },
    className: { table: { disable: true } },
  },
  // `items` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding the Playground controls. The
  // file previously dropped the `Story` annotation from every story to dodge
  // this, which left them all untyped.
  args: { items: CMDP_ITEMS },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ────────────────────────────────────────────────────────────────────

/**
 * The default story renders a full palette with a mixed set of items.
 * Click the built-in trigger to open it.
 *
 * Docs pages render every story's Canvas simultaneously, each mounting its
 * own live CommandPalette - if every one of these secondary stories also
 * kept the default `shortcutKey: 'k'`, a single ⌘K press would open all of
 * them at once (see `Uncontrolled`, the one place this is meant to be
 * demonstrated), so it's disabled here. Still fully overridable via Controls.
 */
export const Playground: Story = {
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette {...args} trigger items={CMDP_ITEMS} />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={items} />`,
      },
    },
  },
};

/**
 * Omitting `trigger` (as well as `open`/`onClose`) lets the palette manage
 * its own state entirely - no `useState`/`useEffect`, and no visible entry
 * point at all. Press ⌘K / Ctrl+K to open it directly; `shortcutKey` can be
 * changed to any other letter, or set to `null` to disable the listener.
 */
export const Uncontrolled: Story = {
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const key = args.shortcutKey === undefined ? 'k' : args.shortcutKey;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          background: 'var(--gray-50)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        {key ? (
          <span>
            Press <kbd style={{ fontFamily: 'monospace' }}>⌘{key.toUpperCase()}</kbd> to open
          </span>
        ) : (
          <span>
            No trigger here - `shortcutKey` is disabled and there's no button in this story
          </span>
        )}
        <CommandPalette {...args} items={CMDP_ITEMS} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'No `trigger`/`open`/`onClose` here at all - just press ⌘K / Ctrl+K. Try `shortcutKey="r"` to change it to ⌘R, or `shortcutKey={null}` to disable the built-in listener.',
      },
      source: {
        code: `<CommandPalette items={items} />`,
      },
    },
  },
};

/**
 * `trigger` also accepts any `ReactNode` instead of `true` - it's wrapped in
 * a click handler that opens the palette, the same convention `Menu` and
 * `Dropdown` use for their own `trigger` prop.
 */
export const WithCustomTrigger: Story = {
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger={<Avatar name="John Doe" size="sm" color="primary" />}
      items={CMDP_ITEMS}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger={<Avatar name="John Doe" size="sm" />} items={items} />`,
      },
    },
  },
};

/**
 * All items carry a `group` property, producing clearly labelled sections.
 * Groups appear in the order their first item appears in the `items` array.
 */
export const WithGroups: Story = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette {...args} trigger items={CMDP_ITEMS} />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Items that share a \`group\` string are clustered under a labelled heading.
<CommandPalette trigger items={items} />`.trim(),
      },
    },
  },
};

/**
 * Demonstrates shortcut badges rendered as `<kbd>` elements.
 * Use ArrowUp / ArrowDown to move between items and inspect the shortcuts.
 */
export const WithShortcuts: Story = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const shortcutItems: CommandItem[] = CMDP_ITEMS.filter((item) => item.shortcut);
    return <CommandPalette {...args} trigger items={shortcutItems} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
// Each item's \`shortcut: string[]\` renders as <kbd> badges.
<CommandPalette trigger items={items} />`.trim(),
      },
    },
  },
};

/**
 * Empty items list - shows the `emptyText` placeholder immediately.
 * You can also trigger the empty state in any other story by typing a
 * query that matches nothing.
 */
export const EmptyState: Story = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger
      items={[]}
      emptyText={args.emptyText ?? 'No commands available right now'}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={[]} emptyText="No commands available right now" />`,
      },
    },
  },
};

/**
 * The `footer` prop accepts any ReactNode and is placed on the right side of
 * the footer bar, next to the keyboard-hint strip.
 */
export const WithFooter: Story = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger
      items={CMDP_ITEMS}
      footer={
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-family-mono, monospace)',
          }}
        >
          {CMDP_ITEMS.length} commands
        </span>
      }
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<CommandPalette trigger items={items} footer={<span>{items.length} commands</span>} />`,
      },
    },
  },
};

/**
 * Items with `disabled: true` are rendered at reduced opacity and skip
 * keyboard navigation - you cannot land on them with ArrowUp / ArrowDown.
 */
export const WithDisabledItems: Story = {
  // See the comment on Default's `args`.
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => {
    const mixed: CommandItem[] = [
      { id: 'a', label: 'Active Command', icon: Settings, group: 'General' },
      { id: 'b', label: 'Disabled Command', icon: Bug, group: 'General', disabled: true },
      {
        id: 'c',
        label: 'Another Active',
        icon: FilePlus,
        group: 'General',
        shortcut: ['⌘', 'N'],
      },
      {
        id: 'd',
        label: 'Also Disabled',
        description: 'This action is currently unavailable',
        icon: Moon,
        group: 'General',
        disabled: true,
      },
    ];
    return <CommandPalette {...args} trigger items={mixed} />;
  },
  parameters: {
    docs: {
      source: {
        code: `
// Set \`disabled: true\` on any item to skip it during keyboard navigation.
<CommandPalette trigger items={items} />`.trim(),
      },
    },
  },
};

// ============================================================================
// FOCUS MANAGEMENT - test-only
// ============================================================================

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`. See
 * the equivalent story on `Modal` for why this is not attached to `Playground`.
 *
 * `CommandPalette` was the closest of the three to correct - it already
 * focused its search input on open - but it still had no trap and no
 * restore, so Tab left the dialog and closing it stranded focus.
 */
export const FocusManagement: Story = {
  tags: ['!dev', '!autodocs'],
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    // `trigger` is the built-in button rather than a custom node on purpose.
    // A custom `trigger` is currently wrapped in
    // `<div role="button" tabIndex={0}>`, which makes the trigger match twice
    // by accessible name and is a `nested-interactive` violation in its own
    // right - the same shape as the `Dropdown` wrapper fixed in 3.3.0, but
    // worse, because `tabIndex={0}` puts the wrapper in the tab order too.
    // Fixing that needs an `asChild`-style API change, so it belongs to the
    // ARIA phase rather than here.
    <CommandPalette {...args} trigger triggerLabel="Open palette" items={CMDP_ITEMS} />
  ),
  play: async ({ canvas, userEvent, step }) => {
    await expectFocusTrap({
      userEvent,
      step,
      trigger: canvas.getByRole('button', { name: 'Open palette' }),
      // The palette has few tab stops (the search input, and the list is
      // arrow-key navigated rather than tabbed), so a long cycle only
      // re-tests the same wrap.
      cycles: 4,
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * `defaultOpen` puts the palette on screen from its first render, which is the
 * path where the portal is deferred by one render for SSR safety. The focus
 * hook has to wait for that, or it runs against a ref whose portal does not
 * exist yet and never runs again - leaving the search field unfocused in a
 * dialog that has just taken over the screen.
 */
export const FocusEntersWhenOpenOnFirstRender: Story = {
  tags: ['!dev', '!autodocs'],
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette {...args} defaultOpen items={CMDP_ITEMS} />
  ),
  play: async ({ step }) => {
    await step('focus lands on the search field', async () => {
      const dialog = await screen.findByRole('dialog');
      await waitFor(() =>
        expect(
          dialog.contains(document.activeElement),
          'focus never entered a palette that was open on its first render',
        ).toBe(true),
      );
      expect(document.activeElement?.tagName).toBe('INPUT');
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * A custom `trigger` that is not itself interactive - the documented example is
 * an `Avatar` - used to be wrapped in `<div role="button" tabIndex={0}>` with no
 * key handler. So it took focus, announced itself as a button, and did nothing
 * when activated: WCAG 2.1.1, in the one configuration the docs demonstrate.
 *
 * The wrapper now measures what it was handed, the way `Tooltip` does: a
 * non-interactive child makes the wrapper a real control, and an interactive
 * one leaves the wrapper as plain layout so there is no second tab stop and no
 * button inside a button.
 */
export const CustomTriggerIsOperableByKeyboard: Story = {
  tags: ['!dev', '!autodocs'],
  args: { shortcutKey: null },
  render: (args: Partial<ComponentProps<typeof CommandPalette>>) => (
    <CommandPalette
      {...args}
      trigger={<Avatar name="Ada Lovelace" size="sm" />}
      items={CMDP_ITEMS}
    />
  ),
  play: async ({ canvas, userEvent, step }) => {
    // `findByRole`, not `getByRole`: whether this wrapper needs to be a control
    // is measured from the rendered child, so the role arrives on the render
    // after mount. A synchronous query races that and fails with "there are no
    // accessible roles" - it passed locally and failed in CI, which is the
    // usual shape of this mistake.
    const trigger = await canvas.findByRole('button');

    await step('the wrapper is reachable and says what it does', async () => {
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
    });

    await step('Enter opens the palette', async () => {
      await userEvent.keyboard('{Enter}');
      const dialog = await screen.findByRole('dialog');
      // Focus lands a few frames after mount - the panel is hidden until its
      // entrance transition applies, and focus cannot go to a hidden element.
      // Pressing Escape before then would test nothing: the key would still be
      // going to the trigger.
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    });

    await step('Escape closes it, and Space opens it again', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      trigger.focus();
      await userEvent.keyboard(' ');
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });
  },
};
