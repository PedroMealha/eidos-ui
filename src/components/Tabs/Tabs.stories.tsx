import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Settings, Bell } from 'lucide-react';
import { Tabs, Tab, TabPanel } from './Tabs.component';
import { Divider } from '../Divider';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  // `children` is required by TabsProps; setting it here (at meta level) means
  // individual Story objects don't need to repeat it in their args - every story
  // supplies real children through its own `render` function instead.
  args: {
    children: undefined,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'enclosed', 'pills'],
      description: 'Visual style variant of the tab list.',
      table: {
        type: { summary: '"line" | "enclosed" | "pills"' },
        defaultValue: { summary: 'line' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme applied to the active tab indicator.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tab buttons.',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch tab buttons to fill the full width of the list.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    scrollButtons: {
      control: 'select',
      options: ['auto', 'none'],
      description:
        'How an overflowing strip is scrolled. `auto` shows previous/next buttons while it overflows and hides the scrollbar; `none` leaves the native scrollbar. Native scrolling works either way.',
      table: {
        type: { summary: '"auto" | "none"' },
        defaultValue: { summary: 'auto' },
      },
    },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled initial active tab value.',
      table: {
        type: { summary: 'string' },
      },
    },
    // Controlled-only props - excluded from the args panel
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// HELPERS
// ============================================================================

const labelStyle: React.CSSProperties = {
  marginBottom: '0.625rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94a3b8',
};

const panelContent = (tab: string) => (
  <div
    style={{
      padding: '0.25rem 0',
      color: 'var(--gray-600)',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    }}
  >
    <strong style={{ color: 'var(--dark-color)' }}>{tab}</strong> - content for this tab panel.
    Change the active tab above to navigate between panels.
  </div>
);

// ============================================================================
// DEFAULT - interactive playground; all controls apply here
// ============================================================================

export const Default: Story = {
  args: {
    variant: 'line',
    color: 'primary',
    size: 'md',
    fullWidth: false,
    defaultValue: 'overview',
  },
  render: (args) => (
    <Tabs {...args}>
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
      <Tab value="reports">Reports</Tab>
      <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
      <TabPanel value="analytics">{panelContent('Analytics')}</TabPanel>
      <TabPanel value="reports">{panelContent('Reports')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// ENCLOSED
// Showcase stories below are plain objects (no `: Story` annotation) so they
// are not required to supply args - identical to the `Examples` pattern used
// throughout the rest of the design system (e.g. Button.stories.tsx).
// ============================================================================

export const Enclosed = {
  render: () => (
    <Tabs variant="enclosed" defaultValue="account">
      <Tab value="account">Account</Tab>
      <Tab value="security">Security</Tab>
      <Tab value="billing">Billing</Tab>
      <TabPanel value="account">{panelContent('Account')}</TabPanel>
      <TabPanel value="security">{panelContent('Security')}</TabPanel>
      <TabPanel value="billing">{panelContent('Billing')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// PILLS
// ============================================================================

export const Pills = {
  render: () => (
    <Tabs variant="pills" defaultValue="all">
      <Tab value="all">All</Tab>
      <Tab value="active">Active</Tab>
      <Tab value="archived">Archived</Tab>
      <TabPanel value="all">{panelContent('All')}</TabPanel>
      <TabPanel value="active">{panelContent('Active')}</TabPanel>
      <TabPanel value="archived">{panelContent('Archived')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// WITH ICONS
// ============================================================================

export const WithIcons = {
  render: () => (
    <Tabs defaultValue="home">
      <Tab value="home" icon={Home}>
        Home
      </Tab>
      <Tab value="settings" icon={Settings}>
        Settings
      </Tab>
      <Tab value="notifications" icon={Bell}>
        Notifications
      </Tab>
      <TabPanel value="home">{panelContent('Home')}</TabPanel>
      <TabPanel value="settings">{panelContent('Settings')}</TabPanel>
      <TabPanel value="notifications">{panelContent('Notifications')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// COLORS - all four color themes
// ============================================================================

export const Colors = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2rem' };
    return (
      <div style={col}>
        <div>
          <p style={labelStyle}>Primary</p>
          <Tabs color="primary" defaultValue="tab1">
            <Tab value="tab1">Tab One</Tab>
            <Tab value="tab2">Tab Two</Tab>
            <Tab value="tab3">Tab Three</Tab>
            <TabPanel value="tab1">{panelContent('Tab One')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Tab Two')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Tab Three')}</TabPanel>
          </Tabs>
        </div>
        <div>
          <p style={labelStyle}>Secondary</p>
          <Tabs color="secondary" defaultValue="tab1">
            <Tab value="tab1">Tab One</Tab>
            <Tab value="tab2">Tab Two</Tab>
            <Tab value="tab3">Tab Three</Tab>
            <TabPanel value="tab1">{panelContent('Tab One')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Tab Two')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Tab Three')}</TabPanel>
          </Tabs>
        </div>
        <div>
          <p style={labelStyle}>Success</p>
          <Tabs color="success" defaultValue="tab1">
            <Tab value="tab1">Tab One</Tab>
            <Tab value="tab2">Tab Two</Tab>
            <Tab value="tab3">Tab Three</Tab>
            <TabPanel value="tab1">{panelContent('Tab One')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Tab Two')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Tab Three')}</TabPanel>
          </Tabs>
        </div>
        <div>
          <p style={labelStyle}>Danger</p>
          <Tabs color="danger" defaultValue="tab1">
            <Tab value="tab1">Tab One</Tab>
            <Tab value="tab2">Tab Two</Tab>
            <Tab value="tab3">Tab Three</Tab>
            <TabPanel value="tab1">{panelContent('Tab One')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Tab Two')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Tab Three')}</TabPanel>
          </Tabs>
        </div>
      </div>
    );
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
  render: () => {
    const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2rem' };
    return (
      <div style={col}>
        <div>
          <p style={labelStyle}>Small</p>
          <Tabs size="sm" defaultValue="tab1">
            <Tab value="tab1">Overview</Tab>
            <Tab value="tab2">Analytics</Tab>
            <Tab value="tab3">Reports</Tab>
            <TabPanel value="tab1">{panelContent('Overview')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Analytics')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Reports')}</TabPanel>
          </Tabs>
        </div>
        <div>
          <p style={labelStyle}>Medium (default)</p>
          <Tabs size="md" defaultValue="tab1">
            <Tab value="tab1">Overview</Tab>
            <Tab value="tab2">Analytics</Tab>
            <Tab value="tab3">Reports</Tab>
            <TabPanel value="tab1">{panelContent('Overview')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Analytics')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Reports')}</TabPanel>
          </Tabs>
        </div>
        <div>
          <p style={labelStyle}>Large</p>
          <Tabs size="lg" defaultValue="tab1">
            <Tab value="tab1">Overview</Tab>
            <Tab value="tab2">Analytics</Tab>
            <Tab value="tab3">Reports</Tab>
            <TabPanel value="tab1">{panelContent('Overview')}</TabPanel>
            <TabPanel value="tab2">{panelContent('Analytics')}</TabPanel>
            <TabPanel value="tab3">{panelContent('Reports')}</TabPanel>
          </Tabs>
        </div>
      </div>
    );
  },
};

// ============================================================================
// FULL WIDTH
// ============================================================================

export const FullWidth = {
  render: () => (
    <Tabs fullWidth defaultValue="overview">
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
      <Tab value="reports">Reports</Tab>
      <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
      <TabPanel value="analytics">{panelContent('Analytics')}</TabPanel>
      <TabPanel value="reports">{panelContent('Reports')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// WITH DISABLED TAB
// ============================================================================

export const WithDisabledTab = {
  render: () => (
    <Tabs defaultValue="overview">
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics" disabled>
        Analytics
      </Tab>
      <Tab value="reports">Reports</Tab>
      <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
      <TabPanel value="analytics">{panelContent('Analytics')}</TabPanel>
      <TabPanel value="reports">{panelContent('Reports')}</TabPanel>
    </Tabs>
  ),
};

// ============================================================================
// SCROLL BUTTONS - an overflowing strip in a deliberately narrow container
// ============================================================================

const MANY_TABS = [
  'Overview',
  'Analytics',
  'Reports',
  'Automations',
  'Integrations',
  'Members',
  'Billing',
  'Audit log',
  'Webhooks',
  'Danger zone',
];

export const ScrollButtons = {
  render: () => {
    const narrow: React.CSSProperties = { maxWidth: '420px' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={narrow}>
          <p style={labelStyle}>scrollButtons=&quot;auto&quot; (default)</p>
          <Tabs defaultValue="overview" variant="line">
            {MANY_TABS.map((tab) => (
              <Tab key={tab} value={tab.toLowerCase().replace(' ', '-')}>
                {tab}
              </Tab>
            ))}
            <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
          </Tabs>
        </div>
        <div style={narrow}>
          <p style={labelStyle}>scrollButtons=&quot;auto&quot; (default)</p>
          <Tabs defaultValue="overview" variant="enclosed">
            {MANY_TABS.map((tab) => (
              <Tab key={tab} value={tab.toLowerCase().replace(' ', '-')}>
                {tab}
              </Tab>
            ))}
            <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
          </Tabs>
        </div>
        <div style={narrow}>
          <p style={labelStyle}>scrollButtons=&quot;auto&quot; (default)</p>
          <Tabs defaultValue="overview" variant="pills">
            {MANY_TABS.map((tab) => (
              <Tab key={tab} value={tab.toLowerCase().replace(' ', '-')}>
                {tab}
              </Tab>
            ))}
            <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
          </Tabs>
        </div>
        <Divider />
        <div style={narrow}>
          <p style={labelStyle}>scrollButtons=&quot;none&quot;</p>
          <Tabs defaultValue="overview" scrollButtons="none">
            {MANY_TABS.map((tab) => (
              <Tab key={tab} value={tab.toLowerCase().replace(' ', '-')}>
                {tab}
              </Tab>
            ))}
            <TabPanel value="overview">{panelContent('Overview')}</TabPanel>
          </Tabs>
        </div>
      </div>
    );
  },
};

// ============================================================================
// CONTROLLED - external state drives the active tab
// ============================================================================

export const Controlled = {
  render: () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="profile">Profile</Tab>
          <Tab value="settings">Settings</Tab>
          <Tab value="notifications">Notifications</Tab>
          <TabPanel value="profile">{panelContent('Profile')}</TabPanel>
          <TabPanel value="settings">{panelContent('Settings')}</TabPanel>
          <TabPanel value="notifications">{panelContent('Notifications')}</TabPanel>
        </Tabs>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>
          Active tab: <strong style={{ color: 'var(--dark-color)' }}>{activeTab}</strong>
        </p>
      </div>
    );
  },
};
