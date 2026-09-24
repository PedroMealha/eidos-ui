import type { Meta, StoryObj } from '@storybook/react-vite';
import { IdentityHeader } from './IdentityHeader.component';
import { Pill } from '../Pill';
import {
  Bell,
  Calendar,
  CreditCard,
  Mail,
  MessageSquare,
  Pencil,
  Shield,
  UserPlus,
} from 'lucide-react';

const meta = {
  title: 'Layout/Components/IdentityHeader',
  component: IdentityHeader,
  parameters: { layout: 'padded' },
  args: {
    title: 'Ana Ferreira',
    subtitle: 'ana.ferreira@meridian.app',
    avatar: { name: 'Ana Ferreira', color: 'primary', size: 'xl' },
    meta: [
      { label: 'Role', value: 'Admin', icon: Shield },
      { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
    ],
    actions: [{ children: 'Edit profile', preIcon: Pencil, variant: 'outlined' }],
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
      description:
        'Avatar shorthand for the leading media, rendered at `lg` unless `size` says otherwise.',
      table: {
        type: {
          summary: "Pick<AvatarProps, 'name' | 'src' | 'alt' | 'color' | 'shape' | 'size'>",
        },
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

export const Playground: Story = {};

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
      { label: 'Plan', value: 'Business annual', icon: CreditCard },
      { label: 'Renews', value: '1 Jan 2027', icon: Calendar },
      { label: 'Owner', value: 'ana.ferreira@meridian.app', icon: Mail },
    ],
    actions: [
      { icon: Bell, variant: 'text', color: 'secondary', tooltip: 'Notification settings' },
      { children: 'Manage billing', preIcon: CreditCard, variant: 'outlined' },
      { children: 'Invite people', preIcon: UserPlus },
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
      { label: 'Role', value: 'Admin', icon: Shield },
      { label: 'Email', value: 'ana.ferreira@meridian.app', icon: Mail },
      { label: 'Joined', value: '14 Feb 2024', icon: Calendar },
    ],
    actions: [
      { children: 'Message', preIcon: MessageSquare, variant: 'outlined' },
      { children: 'Edit profile', preIcon: Pencil },
    ],
  },
};

/**
 * `avatar` is only a shorthand. Pass `media` for anything that isn't an
 * avatar - a logo or an icon block. If both are given, `media` wins and a
 * development warning is logged.
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
