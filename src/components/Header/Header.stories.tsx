import type { CSSProperties } from 'react';
import { action } from 'storybook/actions';
import { expect } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header.component';
import { Pill } from '../Pill';
import { Avatar } from '../Avatar';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Download,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Shield,
} from 'lucide-react';

const meta = {
  title: 'Layout/Components/Header',
  component: Header,
  parameters: { layout: 'padded' },
  args: {
    title: 'Eidos UI',
    subtitle: 'A modern UI component library',
    actions: [
      {
        children: 'Refresh',
        preIcon: RefreshCw,
        variant: 'outlined',
        onClick: action('Settings clicked'),
      },
    ],
  },
  argTypes: {
    title: {
      // Kept as a text control even though the prop is a ReactNode - the
      // string case is the one worth having editable in the Controls panel.
      control: 'text',
      description: 'Title to display in the header. Accepts inline nodes, not just a string.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    subtitle: {
      control: 'object',
      description: 'Subtitle to display in the header.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    actions: {
      control: 'object',
      description: 'Actions to display in the header.',
      table: {
        type: { summary: 'HeaderActionProps[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    media: {
      control: false,
      description:
        'Leading media - an Avatar, logo or icon block - rendered before the title stack.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
    meta: {
      control: 'object',
      description: 'Supporting facts rendered below the subtitle.',
      table: {
        type: { summary: 'HeaderMetaItem[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    titleAs: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description:
        'Heading level of the title. Changes the document outline only - the title looks the same at every level.',
      table: {
        type: { summary: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'" },
        defaultValue: { summary: "'h1'" },
      },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'hero'],
      description: 'Surface treatment.',
      table: {
        type: { summary: "'default' | 'hero'" },
        defaultValue: { summary: "'default'" },
      },
    },
    collapseActionsBelow: {
      control: 'number',
      description:
        "Header width, in px, at or below which surplus actions fold into an overflow popover. Measured against the header's own width, not the viewport. 0 opts out.",
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '640' },
      },
    },
    actionsVisibleWhenCollapsed: {
      control: 'number',
      description: 'How many actions stay outside the overflow popover once collapsed.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const labelStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  color: 'var(--gray-500)',
};

export const Playground: Story = {};

/**
 * An action with `href` renders as a link - for actions that go somewhere,
 * like opening billing, rather than ones that do something in place. Link and
 * button actions mix freely, and both fold into the overflow popover alike.
 */
export const LinkActions: Story = {
  args: {
    title: 'Billing',
    subtitle: 'Business annual · renews 1 January 2027',
    actions: [
      { children: 'Invoices', href: '#invoices', variant: 'outlined' },
      { children: 'Manage plan', href: '#plan', posIcon: ArrowRight },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Manage plan' })).toHaveAttribute(
      'href',
      '#plan',
    );
  },
};

/**
 * `titleAs` sets the title's heading level without changing how it looks, so
 * a `Header` can introduce a section further down a page under the page's
 * own `h1`.
 */
export const TitleLevel: Story = {
  args: {
    title: 'Recent activity',
    subtitle: 'The last 30 days across your workspace',
    titleAs: 'h2',
    actions: undefined,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Recent activity' }),
    ).toBeInTheDocument();
  },
};

/**
 * `actions` accepts a restricted subset of `Button` props - `icon` for an
 * icon-only action, or `children`/`preIcon`/`posIcon` for a labeled one -
 * and any number of them can be mixed together.
 */
export const WithMultipleActions: Story = {
  args: {
    actions: [
      { icon: Bell, color: 'secondary', variant: 'text', tooltip: 'Notifications' },
      { icon: Settings, color: 'secondary', variant: 'text', tooltip: 'Settings' },
      {
        children: 'Export',
        preIcon: Download,
        variant: 'outlined',
        onClick: action('Export clicked'),
      },
      {
        children: 'New item',
        preIcon: Plus,
        onClick: action('New item clicked'),
      },
    ],
  },
};

/**
 * `subtitle` and `actions` are both optional - a bare `title` is a valid
 * header on its own.
 */
export const TitleOnly: Story = {
  args: {
    subtitle: undefined,
    actions: undefined,
  },
};

/**
 * `title` takes any inline node, not only a string, so a status indicator can
 * sit beside the text rather than being pushed into the subtitle. It is
 * centered on the title's own line, and wraps below it when there isn't room
 * for both.
 */
export const WithInlineTitleContent: Story = {
  args: {
    title: (
      <>
        Invoice #4823
        <Pill color="warning" variant="outlined" size="sm">
          Overdue
        </Pill>
      </>
    ),
    subtitle: 'Issued 12 March 2026 · Net 30',
  },
};

/**
 * `media` renders any node on the leading edge, centered against the title
 * stack. It takes a node rather than an `Avatar` config so it can also hold a
 * logo or an icon block.
 *
 * The extra wrapper element this needs is only rendered when `media` is
 * actually passed, so a header without it emits exactly the markup it always
 * has.
 */
export const WithMedia: Story = {
  args: {
    title: 'Ana Ferreira',
    subtitle: 'ana.ferreira@meridian.app',
    media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
  },
};

/**
 * `meta` is a row of supporting facts below the subtitle. Each item is a
 * `label`/`value` pair with an optional `icon`, and the row wraps one whole
 * item at a time rather than splitting a fact across two lines - though a
 * single long value, like an email, can still break on its own.
 */
export const WithMetadata: Story = {
  args: {
    title: 'Ana Ferreira',
    subtitle: 'Customer Support',
    media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
    meta: [
      { label: 'Role', value: 'Admin', icon: Shield },
      { label: 'Email', value: 'ana.ferreira@meridian.app', icon: Mail },
      { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
    ],
  },
};

/**
 * `variant="hero"` raises the header's prominence with a larger title - the
 * treatment account and profile landing areas want.
 *
 * It paints no surface of its own (no background, border or padding): the
 * header is normally rendered inside a region that is already padded, so a
 * second inset here misaligns it against the rest of the page, and a
 * bordered box inside a padded region reads as a double border. A surface,
 * if wanted, belongs to the page - wrap the header in a `Card`.
 *
 * `IdentityHeader` is this combination preconfigured.
 */
export const Hero: Story = {
  args: {
    variant: 'hero',
    title: 'Ana Ferreira',
    subtitle: 'ana.ferreira@meridian.app',
    media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
    meta: [
      { label: 'Role', value: 'Admin', icon: Shield },
      { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
    ],
    actions: [
      { children: 'Edit profile', preIcon: Pencil, variant: 'outlined' },
      { children: 'Save', preIcon: Check },
    ],
  },
};

/**
 * Everything responsive in `Header` is keyed off the header's **own** width,
 * not the viewport - so it reflows correctly in a narrow column on a wide
 * screen. Both headers below are in the same window; only their container
 * widths differ.
 *
 * At 640px or narrower the title stack and the actions go one above the
 * other, the retained actions stretch to fill the line, and every action past
 * `actionsVisibleWhenCollapsed` (default `1`) folds into an overflow popover.
 * The last actions are the ones kept inline, since a primary call to action
 * is conventionally rightmost. Pass `collapseActionsBelow={0}` to opt out.
 */
export const ResponsiveCollapse: Story = {
  parameters: {
    docs: {
      source: {
        type: 'code',
        code: `<Header
  variant="hero"
  title="Ana Ferreira"
  subtitle="ana.ferreira@meridian.app"
  media={<Avatar name="Ana Ferreira" size="lg" color="primary" />}
  meta={[
    { label: 'Role', value: 'Admin', icon: Shield },
    { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
  ]}
  actions={[
    { icon: Bell, variant: 'text', color: 'secondary', tooltip: 'Notifications' },
    { children: 'Export', preIcon: Download, variant: 'outlined' },
    { children: 'Save', preIcon: Check },
  ]}
/>`,
      },
    },
  },
  // Inline styles are only story scaffolding here - they exist to constrain
  // the two containers to different widths, and none of this reaches `dist/`,
  // so the library's own no-inline-styles/CSP rule doesn't apply.
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ maxWidth: 900 }}>
        <p style={labelStyle}>900px container - everything inline</p>
        <Header {...args} />
      </div>
      <div style={{ maxWidth: 420 }}>
        <p style={labelStyle}>420px container - stacked, surplus actions in a popover</p>
        <Header {...args} />
      </div>
    </div>
  ),
  args: {
    variant: 'hero',
    title: 'Ana Ferreira',
    subtitle: 'ana.ferreira@meridian.app',
    media: <Avatar name="Ana Ferreira" size="lg" color="primary" />,
    meta: [
      { label: 'Role', value: 'Admin', icon: Shield },
      { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
    ],
    actions: [
      { icon: Bell, variant: 'text', color: 'secondary', tooltip: 'Notifications' },
      { children: 'Export', preIcon: Download, variant: 'outlined' },
      { children: 'Save', preIcon: Check },
    ],
  },
};
