import { useState } from 'react';
import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDashboard, Settings, Ticket, Users } from 'lucide-react';
import { Navigation } from './Navigation.component';
import type { NavigationItem } from './Navigation.types';
import { Divider } from '../Divider';
import { Pill } from '../Pill';

// Self-contained inline SVGs, one per aspect ratio, used to demonstrate that
// a vertical, horizontal, or square logo all render correctly with no
// distortion or cropping. Deliberately not network images - see the same
// rationale in Avatar.stories.tsx (deterministic markup for visual
// regression testing).
const SQUARE_LOGO = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
    <rect width="64" height="64" rx="12" fill="#6366f1" />
    <text x="32" y="42" font-family="sans-serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">E</text>
  </svg>
`)}`;

// Abstract, text-free (like the other two) - a wordmark logo baking its own
// brand name into the image would otherwise visually repeat next to the
// `brand.name` text Navigation renders alongside every logo.
const HORIZONTAL_LOGO = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="64">
    <rect width="64" height="64" rx="12" fill="#6366f1" />
    <rect x="88" width="64" height="64" rx="12" fill="#a5b4fc" />
    <rect x="176" width="64" height="64" rx="12" fill="#c7d2fe" />
  </svg>
`)}`;

const VERTICAL_LOGO = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="160">
    <rect width="64" height="64" rx="12" fill="#6366f1" />
    <rect y="96" width="64" height="64" rx="12" fill="#a5b4fc" />
  </svg>
`)}`;

const ITEMS: Omit<NavigationItem, 'active' | 'onClick'>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Wraps a story render function with local `activeId` state, so clicking an
 * item actually moves the active highlight - `Navigation` itself has no
 * routing/state of its own, this is purely for the story.
 */
function useDemoItems(initialActiveId: string = ITEMS[0].id): NavigationItem[] {
  const [activeId, setActiveId] = useState(initialActiveId);
  return ITEMS.map((item) => ({
    ...item,
    active: item.id === activeId,
    onClick: () => setActiveId(item.id),
  }));
}

const meta = {
  title: 'Layout/Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Sidebar navigation rail - a brand mark (logo or initials avatar), a list of items, and an optional footer slot. Extracted from the Meridian example app (`dev/layouts/admin-layout.tsx`).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: '400px',
          boxShadow: '0 0 6px 3px rgb(0,0,0,0.04)',
          backgroundColor: 'var(--gray-100)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    brand: {
      control: 'object',
      description:
        'Either `{ name }` (an initials Avatar + text) or `{ logo }` (rendered alone) - never both.',
      table: { type: { summary: 'NavigationBrandProps' } },
    },
    items: {
      control: 'object',
      description: 'Navigation items. `active` and `onClick` are fully controlled by the consumer.',
      table: { type: { summary: 'NavigationItem[]' } },
    },
    footer: {
      control: false,
      description: 'Rendered at the bottom of the rail. Hidden while collapsed.',
      table: { type: { summary: 'ReactNode' } },
    },
    collapsed: {
      control: false,
      description:
        'Controlled collapsed (icon-only) state. Omit (with `defaultCollapsed`) for Navigation to manage its own state.',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: 'Initial collapsed state when uncontrolled (`collapsed` omitted).',
      table: { defaultValue: { summary: 'false' } },
    },
    onCollapsedChange: { control: false },
    collapseBelow: {
      control: 'number',
      description:
        'On by default: automatically collapses (and re-expands) below this viewport width, ' +
        'in pixels. Pass `0` to opt out entirely.',
      table: { defaultValue: { summary: '768' } },
    },
    collapsible: {
      control: 'boolean',
      description: 'Renders the built-in collapse/expand toggle button.',
      table: { defaultValue: { summary: 'true' } },
    },
    className: { table: { disable: true } },
  },
  // `brand` and `items` are required. Declaring them here satisfies the type
  // for the render-only stories below *and* seeds the Default controls - the
  // file previously dropped the `Story` annotation entirely to dodge this,
  // which left every story untyped and Default's Controls panel inert.
  args: {
    brand: { name: 'Eidos', onClick: action('Brand clicked') },
    items: ITEMS.map((item, i) => ({ ...item, active: i === 0 })),
    defaultCollapsed: false,
    collapsible: true,
  },
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Without a `logo`, the brand mark falls back to an initials `Avatar` built
 * from `name`. Click the toggle button at the bottom of the rail to collapse
 * it to an icon-only width - no `useState` required, `Navigation` manages
 * this itself.
 */
export const Default: Story = {
  // Spreads `args` so the panel drives the rail; `items` still comes from the
  // local-state hook so clicking an item moves the active highlight.
  render: function DefaultStory(args) {
    return (
      <Navigation
        {...args}
        items={useDemoItems()}
        footer={
          <>
            <Divider />
            <Pill color="primary" variant="outlined" size="sm">
              Admin
            </Pill>
          </>
        }
      />
    );
  },
};

/**
 * A square logo renders at a fixed height with no distortion. Note there's
 * no separate `name` text - a logo is rendered alone, since it typically
 * already bakes the brand name into the image (passing both is a type
 * error, same as `Footer`'s `copyright`/`component`).
 */
export const WithSquareLogo: Story = {
  render: () => (
    <Navigation brand={{ logo: { src: SQUARE_LOGO, alt: 'Eidos' } }} items={useDemoItems()} />
  ),
};

/**
 * A wide, horizontal logo (a typical wordmark) renders at the same fixed
 * height as the square logo, scaling its width to match its own aspect
 * ratio - up to a maximum width, so it can never overflow the rail.
 */
export const WithHorizontalLogo: Story = {
  render: () => (
    <Navigation brand={{ logo: { src: HORIZONTAL_LOGO, alt: 'Eidos' } }} items={useDemoItems()} />
  ),
};

/**
 * A tall, vertical logo is capped by the same fixed height as the other
 * orientations - it never grows taller than the brand row, regardless of
 * its narrow aspect ratio.
 */
export const WithVerticalLogo: Story = {
  render: () => (
    <Navigation brand={{ logo: { src: VERTICAL_LOGO, alt: 'Eidos' } }} items={useDemoItems()} />
  ),
};

/**
 * More items than fit in a short rail scroll internally, rather than
 * overflowing it - the brand mark, footer, and toggle all stay fixed in
 * place above/below the scrolling item list.
 */
export const WithManyItems: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('item-0');
    const items: NavigationItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i + 1}`,
      icon: ITEMS[i % ITEMS.length].icon,
      active: activeId === `item-${i}`,
      onClick: () => setActiveId(`item-${i}`),
    }));
    return (
      <Navigation
        brand={{ name: 'Eidos' }}
        items={items}
        footer={
          <Pill color="primary" variant="outlined" size="sm">
            Admin
          </Pill>
        }
      />
    );
  },
};

/**
 * `disabled: true` renders an item at reduced opacity and blocks clicks.
 */
export const WithDisabledItem: Story = {
  render: () => {
    const items = useDemoItems();
    items[2] = { ...items[2], disabled: true, onClick: undefined };
    return <Navigation brand={{ name: 'Eidos' }} items={items} />;
  },
};

/**
 * `defaultCollapsed` sets the initial state while still leaving Navigation
 * uncontrolled - the toggle button still works normally.
 */
export const DefaultCollapsed: Story = {
  render: () => (
    <Navigation
      brand={{ logo: { src: SQUARE_LOGO, alt: 'Eidos' } }}
      items={useDemoItems()}
      defaultCollapsed
    />
  ),
};

/**
 * `collapseBelow` auto-collapses (and re-expands) whenever the *browser
 * window* - not this canvas frame - crosses the given width, in pixels.
 * Resize your actual browser window to see it react; the toggle button
 * still works normally in between crossings.
 */
export const CollapseBelowBreakpoint: Story = {
  render: () => (
    <Navigation
      brand={{ logo: { src: SQUARE_LOGO, alt: 'Eidos' } }}
      items={useDemoItems()}
      collapseBelow={1024}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Navigation brand={{ name: 'Acme' }} items={items} collapseBelow={1024} />`,
      },
    },
  },
};

/**
 * `collapseBelow={0}` opts out of the responsive behaviour entirely - no
 * viewport is narrower than `0px`, so the rail keeps whatever state it was
 * given and only the toggle button changes it.
 *
 * Paired with `defaultCollapsed` here: with the breakpoint opted out, a rail
 * asked to start collapsed stays collapsed until the toggle says otherwise.
 */
export const CollapseDisabled: Story = {
  render: () => (
    <Navigation
      brand={{ logo: { src: SQUARE_LOGO, alt: 'Eidos' } }}
      items={useDemoItems()}
      collapseBelow={0}
      defaultCollapsed
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Navigation brand={{ name: 'Acme' }} items={items} collapseBelow={0} defaultCollapsed />`,
      },
    },
  },
};

/**
 * Pass `collapsed` (+ `onCollapsedChange`) for full external control - e.g.
 * to persist the preference, or to auto-collapse below a viewport
 * breakpoint. `collapsible={false}` also hides the built-in toggle button
 * entirely when the only way to change it should be external.
 */
export const Controlled: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          height: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{ alignSelf: 'flex-start' }}
        >
          Toggle from outside
        </button>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Navigation
            brand={{ logo: { src: SQUARE_LOGO, alt: 'Eidos' } }}
            items={useDemoItems()}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [collapsed, setCollapsed] = useState(false);

<Navigation
  brand={{ name: 'Acme' }}
  items={items}
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
/>`.trim(),
      },
    },
  },
};
