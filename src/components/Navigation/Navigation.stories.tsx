import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
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

const HORIZONTAL_LOGO = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="64">
    <rect width="64" height="64" rx="12" fill="#6366f1" />
    <text x="80" y="42" font-family="sans-serif" font-size="28" font-weight="700" fill="#1e293b">Eidos</text>
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
      <div style={{ height: '480px', boxShadow: '0 0 6px 3px rgb(0,0,0,0.04)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    brand: {
      control: 'object',
      description: 'Brand mark (logo or initials avatar) and name.',
      table: { type: { summary: 'NavigationBrandProps' } },
    },
    items: {
      control: 'object',
      description: 'Navigation items. `active` and `onClick` are fully controlled by the consumer.',
      table: { type: { summary: 'NavigationItem[]' } },
    },
    footer: {
      control: false,
      description: 'Rendered at the bottom of the rail.',
      table: { type: { summary: 'ReactNode' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Navigation>;

export default meta;

// Stories use a plain object (no `Story` type annotation). This mirrors the
// CommandPalette pattern in the codebase and avoids the Storybook TS error
// that would otherwise require required props (brand, items) inside `args`
// even when a render function is used.

/**
 * Without a `logo`, the brand mark falls back to an initials `Avatar` built
 * from `name`.
 */
export const Default = {
  render: () => (
    <Navigation
      brand={{ name: 'Eidos', onClick: () => alert('Brand clicked') }}
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
  ),
};

/**
 * A square logo renders at a fixed height with no distortion.
 */
export const WithSquareLogo = {
  render: () => (
    <Navigation brand={{ name: 'Eidos', logo: { src: SQUARE_LOGO } }} items={useDemoItems()} />
  ),
};

/**
 * A wide, horizontal logo (a typical wordmark) renders at the same fixed
 * height as the square logo, scaling its width to match its own aspect
 * ratio - up to a maximum width, so it can never overflow the rail.
 */
export const WithHorizontalLogo = {
  render: () => (
    <Navigation brand={{ name: 'Eidos', logo: { src: HORIZONTAL_LOGO } }} items={useDemoItems()} />
  ),
};

/**
 * A tall, vertical logo is capped by the same fixed height as the other
 * orientations - it never grows taller than the brand row, regardless of
 * its narrow aspect ratio.
 */
export const WithVerticalLogo = {
  render: () => (
    <Navigation brand={{ name: 'Eidos', logo: { src: VERTICAL_LOGO } }} items={useDemoItems()} />
  ),
};

/**
 * `disabled: true` renders an item at reduced opacity and blocks clicks.
 */
export const WithDisabledItem = {
  render: () => {
    const items = useDemoItems();
    items[2] = { ...items[2], disabled: true, onClick: undefined };
    return <Navigation brand={{ name: 'Eidos' }} items={items} />;
  },
};
