import type { Meta, StoryObj } from '@storybook/react-vite';
import { IdentityHeader } from './IdentityHeader.component';
import { Pill } from '../Pill';

const meta = {
  title: 'Layout/Components/IdentityHeader',
  component: IdentityHeader,
  parameters: { layout: 'padded' },
  args: {
    title: 'Ana Ferreira',
    subtitle: 'ana.ferreira@meridian.app',
    avatar: { name: 'Ana Ferreira', color: 'primary' },
    meta: [
      { label: 'Role', value: 'Admin', icon: 'shield' },
      { label: 'Joined', value: '14 Feb 2024', icon: 'calendar' },
    ],
    actions: [{ children: 'Edit profile', preIcon: 'pencil', variant: 'outlined' }],
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The person or entity this page is about. Accepts inline nodes.',
      table: { type: { summary: 'React.ReactNode' } },
    },
    subtitle: {
      control: 'text',
      description: 'Secondary identifier - an email, handle or org slug.',
      table: { type: { summary: 'React.ReactNode' }, defaultValue: { summary: 'undefined' } },
    },
    avatar: {
      control: 'object',
      description: 'Avatar shorthand for the leading media, rendered at `lg`.',
      table: {
        type: { summary: "Pick<AvatarProps, 'name' | 'src' | 'alt' | 'color' | 'shape'>" },
        defaultValue: { summary: 'undefined' },
      },
    },
    meta: {
      control: 'object',
      description: 'Supporting facts rendered below the subtitle.',
      table: { type: { summary: 'HeaderMetaItem[]' }, defaultValue: { summary: 'undefined' } },
    },
    actions: {
      control: 'object',
      description: 'Trailing action buttons.',
      table: { type: { summary: 'HeaderActionProps[]' }, defaultValue: { summary: 'undefined' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'hero'],
      description: "Surface treatment. Defaults to 'hero' here, unlike on `Header`.",
      table: {
        type: { summary: "'default' | 'hero'" },
        defaultValue: { summary: "'hero'" },
      },
    },
  },
} satisfies Meta<typeof IdentityHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * An account page leads with the organisation rather than a person, but the
 * shape is identical - which is why there is one component for both rather
 * than an `AccountHeader` and a `ProfileHeader` that would render the same
 * markup.
 *
 * A `square` avatar reads better for an org than the default circle.
 */
export const AccountHeader: Story = {
  args: {
    title: (
      <>
        Meridian Support
        <Pill color="success" variant="outlined" size="sm">
          Business
        </Pill>
      </>
    ),
    subtitle: 'meridian-support · 42 seats',
    avatar: { name: 'Meridian Support', color: 'info', shape: 'square' },
    meta: [
      { label: 'Plan', value: 'Business annual', icon: 'credit-card' },
      { label: 'Renews', value: '1 Jan 2027', icon: 'calendar' },
      { label: 'Owner', value: 'ana.ferreira@meridian.app', icon: 'mail' },
    ],
    actions: [
      { icon: 'bell', variant: 'text', color: 'secondary', tooltip: 'Notification settings' },
      { children: 'Manage billing', preIcon: 'credit-card', variant: 'outlined' },
      { children: 'Invite people', preIcon: 'user-plus' },
    ],
  },
};

/**
 * A profile page leads with the person. `title` still takes inline nodes, so
 * an account-state indicator sits beside the name rather than being pushed
 * into the subtitle.
 */
export const ProfileHeader: Story = {
  args: {
    title: (
      <>
        Ana Ferreira
        <Pill color="success" variant="outlined" size="sm">
          Active
        </Pill>
      </>
    ),
    subtitle: 'Customer Support · Lisbon',
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
};

/**
 * `avatar` is only a shorthand. Pass `media` for anything else - a logo, an
 * icon block, or an avatar larger than `Avatar`'s own `lg` size (48px), which
 * is what a hero band usually wants and what `Avatar` cannot currently
 * express. If both are given, `media` wins and a development warning is
 * logged.
 */
export const CustomMedia: Story = {
  args: {
    avatar: undefined,
    // Inline styles are story scaffolding: this stands in for whatever the
    // consumer drops in the slot, and none of it reaches `dist/`. Kept free
    // of any network request so the story renders identically offline.
    media: (
      <div
        aria-hidden="true"
        style={{
          width: 112,
          height: 112,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--primary-color)',
          color: 'var(--primary-contrast)',
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        AF
      </div>
    ),
  },
};

/**
 * `variant="default"` drops back to the standard title size while keeping the
 * avatar and metadata layout - for an identity header that shouldn't dominate
 * the page it sits on.
 */
export const AtDefaultProminence: Story = {
  args: {
    variant: 'default',
  },
};
