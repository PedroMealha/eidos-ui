import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ChevronRight, LayoutDashboard, Settings, Ticket, Users } from 'lucide-react';
import { PageLayout } from './PageLayout.component';
import { CMDP_ITEMS } from '../CommandPalette/CommandPalette.fixtures';
import { Avatar } from '../Avatar';
import { Divider } from '../Divider';
import { Pill } from '../Pill';

const meta = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ height: '1000px', boxShadow: '0 0 6px 3px rgb(0,0,0,0.04)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    navigation: {
      brand: { name: 'Eidos' },
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
      footer: (
        <>
          <Divider />
          <Pill color="primary" variant="outlined" size="sm">
            Admin
          </Pill>
        </>
      ),
    },
    toolbar: {
      breadcrumbs: {
        separator: <ChevronRight size={14} />,
        items: [
          { label: 'Home' },
          { label: 'Products' },
          { label: 'Electronics' },
          { label: 'Smartphones' },
        ],
      },
      cmdPaletteItems: CMDP_ITEMS,
      user: { name: 'John Doe', color: 'primary' },
      actions: [
        {
          tooltip: 'Notifications',
          icon: 'Bell',
          color: 'secondary',
          onClick: action('Notifications clicked'),
        },
        {
          tooltip: 'Settings',
          icon: 'Settings',
          color: 'secondary',
          onClick: action('Settings clicked'),
        },
        {
          tooltip: 'User',
          icon: 'User',
          onClick: action('Settings clicked'),
        },
      ],
      userMenu: [
        {
          type: 'component',
          id: 'identity',
          component: (
            <div
              style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-sm) 0' }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                John Doe
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                john.doe@example.com
              </span>
            </div>
          ),
        },
        { type: 'separator', id: 'sep-1' },
        {
          type: 'item',
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          onClick: action('Settings clicked'),
        },
        {
          type: 'item',
          id: 'logout',
          label: 'Logout',
          icon: 'log-out',
          color: 'danger',
          onClick: action('Logout clicked'),
        },
      ],
    },
    header: {
      title: 'Page Title',
      subtitle: 'Page Subtitle',
      actions: [
        {
          children: 'Refresh',
          preIcon: 'refresh-cw',
          variant: 'outlined',
          onClick: action('Settings clicked'),
        },
      ],
    },
    children: 'Page content',
  },
  argTypes: {
    header: {
      control: 'object',
      description: 'Header section of the page layout.',
      table: {
        type: { summary: 'HeaderProps' },
        defaultValue: { summary: '{}' },
      },
    },
    toolbar: {
      control: 'object',
      description: 'Toolbar of the page layout.',
      table: {
        type: { summary: 'ToolbarProps' },
        defaultValue: { summary: '{}' },
      },
    },
    navigation: {
      control: 'object',
      description: 'Sidebar navigation rail of the page layout. Omit to leave the region empty.',
      table: {
        type: { summary: 'NavigationProps' },
        defaultValue: { summary: 'undefined' },
      },
    },
    footer: {
      control: 'object',
      description:
        'Footer of the page layout. Omit to fall back to the default Eidos UI copyright notice.',
      table: {
        type: { summary: 'FooterProps' },
        defaultValue: { summary: "{ copyright: '© <year> Eidos UI' }" },
      },
    },
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * `main` is the layout's only scroll region: the header, body and footer all
 * scroll together inside it while the toolbar and navigation rail stay put.
 * Scroll the canvas below - the header and the copyright notice both travel
 * with the content, and neither overlaps it.
 */
export const Scrolling: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {Array.from({ length: 12 }, (_, index) => (
          <section key={index}>
            <h4>Section {index + 1}</h4>
            <p>
              Each of these blocks sizes to its own content, and the body region grows with them
              rather than clipping them - the overflow ends up on the scroll container, not inside
              the body.
            </p>
          </section>
        ))}
      </div>
    ),
  },
};

/**
 * At a narrow width, `Toolbar` wraps its breadcrumb trail onto its own line
 * (rather than clipping it or squeezing the search/actions/user menu off to
 * the side) with plain CSS and no breakpoint of its own, while `Header`
 * stacks its actions below the title stack once **its own** column - not the
 * window - drops to 640px. Note that the rail's width counts against that,
 * so the header reflows here at a window width well above 640px.
 *
 * `navigation.collapseBelow` is also set here - resize your actual browser
 * window (not this canvas frame) past `1024px` to see the rail itself
 * auto-collapse to icon-only, exactly as it does standalone (see the
 * `Navigation` docs).
 */
export const NarrowViewport: Story = {
  args: {
    navigation: {
      ...meta.args.navigation,
      collapseBelow: 1024,
    },
  },
  // Combined with the meta-level decorator's own height/shadow wrapper -
  // this one just constrains the width to demonstrate the narrow-viewport
  // behaviour without duplicating that styling.
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * An account or profile screen, with the identity treatment `IdentityHeader`
 * provides.
 *
 * Note what is passed: **`header` is a data prop, not a slot**, so the
 * `IdentityHeader` component itself cannot go here - `PageLayout` always
 * renders a `Header`. The shape is fully expressible as data all the same,
 * because `media`, `meta` and `variant` live on `Header` rather than only
 * inside the preset. The only thing the preset adds on top is its `avatar`
 * shorthand, which is two lines to write out by hand:
 *
 * ```tsx
 * header={{
 *   variant: 'hero',
 *   media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
 *   meta: [{ label: 'Role', value: 'Admin', icon: 'shield' }],
 * }}
 * ```
 *
 * Use `IdentityHeader` directly when a page renders its own header instead of
 * feeding a shared layout.
 */
export const IdentityPageHeader: Story = {
  args: {
    navigation: {
      ...meta.args.navigation,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'team', label: 'Team', icon: Users, active: true },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
    toolbar: {
      ...meta.args.toolbar,
      breadcrumbs: {
        separator: <ChevronRight size={14} />,
        items: [{ label: 'Home' }, { label: 'Team' }, { label: 'Ana Ferreira' }],
      },
    },
    header: {
      variant: 'hero',
      title: (
        <>
          Ana Ferreira
          <Pill color="success" variant="outlined" size="sm">
            Active
          </Pill>
        </>
      ),
      subtitle: 'Customer Support · Lisbon',
      media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
      meta: [
        { label: 'Role', value: 'Admin', icon: 'shield' },
        { label: 'Email', value: 'ana.ferreira@meridian.app', icon: 'mail' },
        { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
      ],
      actions: [
        { children: 'Message', preIcon: 'message-square', variant: 'outlined' },
        { children: 'Edit profile', preIcon: 'pencil' },
      ],
    },
    children: <p>Profile content goes here.</p>,
  },
};

/**
 * `navigation` is optional, and omitting it collapses the rail's grid column
 * to nothing rather than leaving an empty gutter - the column is sized to
 * `Navigation`'s own rendered width, so with no content there is no width.
 *
 * The toolbar then spans the full layout, which is the shape a public or
 * single-area app wants.
 */
export const WithoutNavigation: Story = {
  args: {
    navigation: undefined,
  },
};

/**
 * `footer` is a discriminated union: pass `copyright` for the default
 * centered notice, or `component` to replace it entirely.
 *
 * The custom content only brings its own **vertical** spacing: the left and
 * right inset is the layout's shared page gutter, which the footer region
 * already has, so adding horizontal padding here would inset the text twice
 * and pull it out of line with the page content above.
 */
export const CustomFooter: Story = {
  args: {
    footer: {
      component: (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBlock: 'var(--spacing-md)',
            borderTop: '1px solid var(--gray-200)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-500)',
          }}
        >
          <span>© 2026 Acme Inc.</span>
          <span style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <a href="#status">Status</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </span>
        </div>
      ),
    },
  },
};
