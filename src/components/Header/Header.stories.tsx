import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header.component';
import { Pill } from '../Pill';
import { Avatar } from '../Avatar';

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
        preIcon: 'refresh-cw',
        variant: 'outlined',
        onClick: () => alert('Settings clicked'),
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

export const Default: Story = {};

/**
 * `actions` accepts a restricted subset of `Button` props - `icon` for an
 * icon-only action, or `children`/`preIcon`/`posIcon` for a labeled one -
 * and any number of them can be mixed together.
 */
export const WithMultipleActions: Story = {
  args: {
    actions: [
      { icon: 'Bell', color: 'secondary', variant: 'text', tooltip: 'Notifications' },
      { icon: 'Settings', color: 'secondary', variant: 'text', tooltip: 'Settings' },
      {
        children: 'Export',
        preIcon: 'download',
        variant: 'outlined',
        onClick: () => alert('Export clicked'),
      },
      {
        children: 'New item',
        preIcon: 'plus',
        onClick: () => alert('New item clicked'),
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
 * logo, an icon block, or an avatar larger than `Avatar`'s own `lg` size.
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
      { label: 'Role', value: 'Admin', icon: 'shield' },
      { label: 'Email', value: 'ana.ferreira@meridian.app', icon: 'mail' },
      { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
    ],
  },
};

/**
 * `variant="hero"` puts the header on its own padded, bordered surface with a
 * larger title - the treatment account and profile landing areas want. The
 * band matches `Card`'s surface (`--white` with a `--gray-200` border), so it
 * reads as a raised panel on `PageLayout`'s gray content area. It is
 * deliberately not a themed tint: a `--x-50` background behind text is under
 * AA even for the shipped palette, and far worse for a pale themed base.
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
      { label: 'Role', value: 'Admin', icon: 'shield' },
      { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
    ],
    actions: [
      { children: 'Edit profile', preIcon: 'pencil', variant: 'outlined' },
      { children: 'Save', preIcon: 'check' },
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
    { label: 'Role', value: 'Admin', icon: 'shield' },
    { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
  ]}
  actions={[
    { icon: 'bell', variant: 'text', color: 'secondary', tooltip: 'Notifications' },
    { children: 'Export', preIcon: 'download', variant: 'outlined' },
    { children: 'Save', preIcon: 'check' },
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
      { label: 'Role', value: 'Admin', icon: 'shield' },
      { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
    ],
    actions: [
      { icon: 'bell', variant: 'text', color: 'secondary', tooltip: 'Notifications' },
      { children: 'Export', preIcon: 'download', variant: 'outlined' },
      { children: 'Save', preIcon: 'check' },
    ],
  },
};
