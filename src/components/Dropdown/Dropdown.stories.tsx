import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ChevronDown, Settings, User, LogOut, HelpCircle } from 'lucide-react';
import { Dropdown } from './Dropdown.component';
import { Button } from '../Button';
import { StoryRow } from '../../story-layout.docs';
import { expect, waitFor } from 'storybook/test';

const meta = {
  title: 'Overlays/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible dropdown that positions its content relative to a trigger element. Works standalone by default. To enable **mutual exclusion** between multiple dropdowns (only one open at a time), wrap them with `DropdownProvider` and use the `dropdownGroup` prop.',
      },
    },
  },
  args: {
    trigger: undefined,
    content: undefined,
  },
  argTypes: {
    trigger: {
      control: false,
      description: 'The element that triggers the dropdown (e.g., button, text, icon)',
      table: { type: { summary: 'React.ReactNode' } },
    },
    content: {
      control: false,
      description: 'The content to display in the dropdown',
      table: { type: { summary: 'React.ReactNode' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Preferred placement of the dropdown (auto-adjusts if no space)',
      table: {
        type: { summary: '"top" | "bottom" | "left" | "right"' },
        defaultValue: { summary: 'bottom' },
      },
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing the dropdown',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    open: {
      control: false,
      description:
        'Controlled open state. Pass with `onOpenChange` to own the open/closed decision; omit both to let Dropdown manage itself.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'undefined' } },
    },
    onOpenChange: { table: { disable: true } },
    defaultOpen: {
      control: 'boolean',
      description: 'Open on first mount, when uncontrolled.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    role: {
      control: 'text',
      description:
        'ARIA role for the portaled content. Defaults to none - pass one only when the panel itself carries the semantics.',
      table: { type: { summary: 'React.AriaRole' }, defaultValue: { summary: 'undefined' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the dropdown trigger',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: 'Close dropdown when clicking outside',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close dropdown when pressing Escape key',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    autoWidth: {
      control: 'boolean',
      description: 'Match dropdown width to trigger width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of dropdown (number in px or string with units)',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of dropdown (number in px, string with units, or "auto")',
      table: {
        type: { summary: 'number | string | "auto"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of dropdown',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of dropdown',
      table: {
        type: { summary: 'number | string | "auto"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    triggerClassName: {
      control: 'text',
      description: 'Additional CSS class for trigger element',
      table: { type: { summary: 'string' }, defaultValue: { summary: '""' } },
    },
    contentClassName: {
      control: 'text',
      description: 'Additional CSS class for dropdown content',
      table: { type: { summary: 'string' }, defaultValue: { summary: '""' } },
    },
    isNested: {
      control: 'boolean',
      description: 'Whether this is a nested dropdown (affects z-index)',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    dropdownGroup: {
      control: 'text',
      description: 'Group identifier - only one dropdown in a group can be open at a time',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    className: { table: { disable: true } },
    triggerRef: { table: { disable: true } },
    dropdownLevel: { table: { disable: true } },
    parentDropdownId: { table: { disable: true } },
    onNestedDropdownOpen: { table: { disable: true } },
    onNestedDropdownClose: { table: { disable: true } },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="outlined">Open Dropdown</Button>,
    content: (
      <div style={{ padding: '1rem', minWidth: '200px' }}>
        <p>Dropdown content goes here!</p>
      </div>
    ),
  },
};

// Real buttons, not clickable `div`s. `Dropdown` supplies positioning and
// nothing else, so a panel of actions is only operable by keyboard if its
// contents are - this story is the one people copy.
const menuItemStyle: React.CSSProperties = {
  padding: 'var(--spacing-sm) var(--spacing-md)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  width: '100%',
  background: 'transparent',
  border: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
};

// Named "action panel", not "menu": it has no menu semantics, and `Dropdown`
// no longer claims any. A real menu is `Menu`.
export const AsAnActionPanel: Story = {
  args: {
    trigger: (
      <Button variant="outlined" posIcon={ChevronDown}>
        User menu
      </Button>
    ),
    content: (
      <div style={{ minWidth: 200 }}>
        <button type="button" style={menuItemStyle} onClick={action('Profile clicked')}>
          <User size={16} />
          <span>Profile</span>
        </button>
        <button type="button" style={menuItemStyle} onClick={action('Settings clicked')}>
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <div style={{ height: 1, background: 'var(--gray-200)', margin: 'var(--spacing-sm) 0' }} />
        {/* `--danger-color`, not `--danger` - the latter does not exist, so it
            silently fell back to the inherited colour. */}
        <button
          type="button"
          style={{ ...menuItemStyle, color: 'var(--danger-color)' }}
          onClick={action('Logout clicked')}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    ),
  },
};

export const Placements: Story = {
  render: () => (
    <StoryRow>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Dropdown
          key={placement}
          placement={placement}
          trigger={<Button variant="filled">{placement}</Button>}
          content={<div style={{ padding: 'var(--spacing-md)' }}>Placed {placement}</div>}
        />
      ))}
    </StoryRow>
  ),
};

export const Sizing: Story = {
  render: () => (
    <StoryRow>
      <Dropdown
        trigger={<Button variant="outlined">Min width 300px</Button>}
        content={
          <div style={{ padding: 'var(--spacing-md)' }}>
            This dropdown has a minimum width of 300px
          </div>
        }
        minWidth={300}
      />
      <Dropdown
        trigger={<Button variant="outlined">Max height 150px</Button>}
        content={
          <div style={{ padding: 'var(--spacing-md)' }}>
            <p style={{ marginTop: 0 }}>This dropdown has scrollable content</p>
            {Array.from({ length: 6 }, (_, i) => (
              <p key={i}>Line {i + 1}</p>
            ))}
          </div>
        }
        maxHeight={150}
      />
    </StoryRow>
  ),
};

export const WithDelay: Story = {
  args: {
    delay: 500,
    trigger: <Button variant="outlined">Click me (500ms delay)</Button>,
    content: <div style={{ padding: 'var(--spacing-md)' }}>This appeared after a delay.</div>,
  },
};

export const Grouped: Story = {
  render: () => (
    <StoryRow>
      {(['primary', 'secondary', 'success'] as const).map((color, i) => (
        <Dropdown
          key={color}
          dropdownGroup="actions"
          trigger={
            <Button variant="filled" color={color}>
              Action {i + 1}
            </Button>
          }
          content={
            <div style={{ padding: 'var(--spacing-md)', minWidth: 150 }}>
              Dropdown {i + 1} content
            </div>
          }
        />
      ))}
    </StoryRow>
  ),
};

/**
 * The trigger keeps its own semantics - `Dropdown` wraps it in a plain
 * positioning `div` with no `role`. So a custom trigger must itself be a real
 * interactive element (a `<button>` here), or it will be unreachable by
 * keyboard and invisible to assistive technology.
 */
export const CustomTrigger: Story = {
  args: {
    trigger: (
      <button
        type="button"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          border: '1px solid var(--gray-300)',
          borderRadius: 'var(--border-radius-sm)',
          background: 'transparent',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          font: 'inherit',
        }}
      >
        <HelpCircle size={16} />
        <span>Need help?</span>
      </button>
    ),
    content: (
      <div style={{ padding: 'var(--spacing-md)', maxWidth: 250 }}>
        <h4 style={{ margin: '0 0 var(--spacing-sm)' }}>Help centre</h4>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Click here to access documentation, tutorials, and support resources.
        </p>
      </div>
    ),
  },
};

// ============================================================================
// CHARACTERISATION - the open/close state machine as it behaves today
// ============================================================================
//
// These pin behaviour that is about to be refactored: `Dropdown` owns its open
// state privately, and every consumer works around that (`Select`, `Combobox`,
// `TagInput`, `DatePicker` and `TableFiltersDropdown` force a close by
// remounting via `key`; `Menu` dispatches a synthetic `document` mousedown;
// `Combobox` synthesises a click on a 0-height span to open). Giving the
// component a controlled `open`/`onOpenChange` API means rewriting the state
// machine underneath all of them.
//
// So the point of these is not coverage - it is that the diff can be shown to
// preserve behaviour. They were written and confirmed green *before* any of
// that refactor started. The project rules call for exactly this ("write the
// test before the refactor"), naming `Combobox` as the component everything
// else builds on.

/** The portaled panel. Roleless by design, so queried by its data attribute. */
const panels = () => Array.from(document.querySelectorAll<HTMLElement>('[data-dropdown-content]'));

export const OpensAndClosesByEveryRoute: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' },
  args: {
    trigger: <Button variant="outlined">Toggle</Button>,
    content: <div style={{ padding: 'var(--spacing-md)' }}>Panel</div>,
  },
  render: (args) => (
    <div>
      <Dropdown {...args} />
      <button type="button" data-testid="outside">
        Elsewhere
      </button>
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    const trigger = canvas.getByRole('button', { name: 'Toggle' });

    await step('the trigger opens it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(panels()).toHaveLength(1));
    });

    await step('the trigger toggles it closed again', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(panels()).toHaveLength(0));
    });

    await step('Escape closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(panels()).toHaveLength(0));
    });

    await step('a click outside closes it', async () => {
      await userEvent.click(trigger);
      await waitFor(() => expect(panels()).toHaveLength(1));
      await userEvent.click(canvas.getByTestId('outside'));
      await waitFor(() => expect(panels()).toHaveLength(0));
    });
  },
};

/**
 * The invariant most at risk in the refactor, and the one that fails silently.
 *
 * `isVisible` and `isPositioned` live in one state object today and every
 * mutation sets both. Splitting them - which a controlled `open` prop requires,
 * since `open` comes from outside while `isPositioned` stays internal - risks a
 * panel that is mounted, correctly positioned and permanently
 * `visibility: hidden`. Nothing in lint, tsc or a DOM query notices that.
 */
export const IsHiddenUntilPositioned: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    trigger: <Button variant="outlined">Open</Button>,
    content: <div style={{ padding: 'var(--spacing-md)' }}>Panel</div>,
  },
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));

    await step('the panel ends up visible, and says so in its class list', async () => {
      await waitFor(() => expect(panels()).toHaveLength(1));
      const panel = panels()[0];

      await waitFor(() =>
        expect(
          panel.classList.contains('eidos-dropdown-content--positioned'),
          'the positioned modifier never landed, so the panel stays `visibility: hidden`',
        ).toBe(true),
      );
      await waitFor(() => expect(getComputedStyle(panel).visibility).toBe('visible'));
    });
  },
};

export const OpensOnMountWithDefaultOpen: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    defaultOpen: true,
    trigger: <Button variant="outlined">Already open</Button>,
    content: <div style={{ padding: 'var(--spacing-md)' }}>Panel</div>,
  },
  play: async ({ step }) => {
    await step('no interaction needed - and it still becomes visible', async () => {
      await waitFor(() => expect(panels()).toHaveLength(1));
      await waitFor(() =>
        expect(panels()[0].classList.contains('eidos-dropdown-content--positioned')).toBe(true),
      );
    });
  },
};

export const DefersOpeningByDelay: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    // Long enough that the "not yet mounted" assertion below cannot lose a race
    // with it on a slow machine. The story is hidden, so the extra wait costs
    // nothing but test time.
    delay: 600,
    trigger: <Button variant="outlined">Delayed</Button>,
    content: <div style={{ padding: 'var(--spacing-md)' }}>Panel</div>,
  },
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delayed' }));

    await step('nothing is mounted immediately', async () => {
      expect(panels()).toHaveLength(0);
    });

    await step('and the panel arrives after the delay', async () => {
      await waitFor(() => expect(panels()).toHaveLength(1), { timeout: 2000 });
    });
  },
};

/**
 * Mutual exclusion is implemented by dispatching a `closeSibling` `CustomEvent`
 * straight at the other panel's DOM node, bypassing React state entirely. A
 * controlled `open` prop has to route this through the same setter as every
 * other transition, or a consumer's state will say "open" while the panel is
 * gone.
 */
export const GroupExcludesSiblings: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' },
  render: () => (
    <StoryRow>
      {[1, 2].map((n) => (
        <Dropdown
          key={n}
          dropdownGroup="characterisation"
          trigger={<Button variant="outlined">Open {n}</Button>}
          content={<div style={{ padding: 'var(--spacing-md)' }}>Panel {n}</div>}
        />
      ))}
    </StoryRow>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open 1' }));
    await waitFor(() => expect(panels()).toHaveLength(1));

    await step('opening the second closes the first', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open 2' }));
      await waitFor(() => expect(panels()).toHaveLength(1));
      expect(panels()[0].textContent).toBe('Panel 2');
    });
  },
};

/**
 * Hidden from the sidebar and docs, but run by `npm run test:stories`.
 *
 * The content is portaled and `position: fixed`, so it only stays anchored
 * because a scroll listener re-measures the trigger. `scroll` does not bubble,
 * so listeners on `window`/`document.body` see nothing when the scroller is an
 * arbitrary ancestor - which is every dropdown inside `PageLayout`, whose
 * `&__content` is the layout's scrollport. The listener has to be on `document`
 * in the capture phase.
 */
export const RepositionsOnAncestorScroll: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' },
  args: {
    trigger: <Button variant="outlined">Open</Button>,
    content: <div style={{ padding: 'var(--spacing-md)', minWidth: 200 }}>Anchored content</div>,
  },
  render: (args) => (
    <div data-testid="scroller" style={{ height: 300, overflow: 'auto' }}>
      <div style={{ height: 120 }} />
      <Dropdown {...args} />
      <div style={{ height: 800 }} />
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    const scroller = canvas.getByTestId('scroller');
    const trigger = canvas.getByRole('button', { name: 'Open' });

    await userEvent.click(trigger);
    // Queried by the component's own data attribute: the content is portaled
    // (so outside `canvas`) and deliberately carries no role - `Dropdown` is a
    // positioning primitive and does not know what its content is.
    const content = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-dropdown-content]');
      expect(element, 'the dropdown content never rendered').not.toBeNull();
      return element!;
    });

    // `gap` in calculateOptimalPosition.
    const GAP = 8;
    const offset = () =>
      content.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom;

    await step('anchored on open', async () => {
      await waitFor(() => expect(offset()).toBeCloseTo(GAP, 0));
    });

    await step('still anchored after the ancestor scroller moves', async () => {
      scroller.scrollTop = 60;

      await waitFor(() =>
        expect(
          offset(),
          'the dropdown did not follow its trigger when an ancestor (not the page) scrolled',
        ).toBeCloseTo(GAP, 0),
      );
    });
  },
};
