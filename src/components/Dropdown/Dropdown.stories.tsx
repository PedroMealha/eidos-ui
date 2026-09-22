import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ChevronDown, Settings, User, LogOut, HelpCircle } from 'lucide-react';
import { Dropdown } from './Dropdown.component';
import { Button } from '../Button';
import { StoryRow } from '../../story-layout.docs';
import { expect, screen, waitFor } from 'storybook/test';

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

const menuItemStyle: React.CSSProperties = {
  padding: 'var(--spacing-sm) var(--spacing-md)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
};

export const AsAMenu: Story = {
  args: {
    trigger: (
      <Button variant="outlined" posIcon={ChevronDown}>
        User menu
      </Button>
    ),
    content: (
      <div style={{ minWidth: 200 }}>
        <div style={menuItemStyle} onClick={action('Profile clicked')}>
          <User size={16} />
          <span>Profile</span>
        </div>
        <div style={menuItemStyle} onClick={action('Settings clicked')}>
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <div style={{ height: 1, background: 'var(--gray-200)', margin: 'var(--spacing-sm) 0' }} />
        {/* `--danger-color`, not `--danger` - the latter does not exist, so it
            silently fell back to the inherited colour. */}
        <div
          style={{ ...menuItemStyle, color: 'var(--danger-color)' }}
          onClick={action('Logout clicked')}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </div>
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
    // `Dropdown` hardcodes `role="menu"` on its content, and this is the only
    // audited story that leaves one open - so the content has to be a valid
    // menu (`role="menuitem"` children) or axe reports
    // `aria-required-children` against the library.
    content: (
      <div style={{ minWidth: 200 }}>
        <button
          type="button"
          role="menuitem"
          style={{ ...menuItemStyle, width: '100%', background: 'transparent', border: 0 }}
        >
          Anchored content
        </button>
      </div>
    ),
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
    const content = await screen.findByRole('menu');

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
