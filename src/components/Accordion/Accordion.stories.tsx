import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRight, Settings, User, Star, Bell, Lock } from 'lucide-react';
import { Accordion, AccordionItem } from './Accordion.component';

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  // children is required by AccordionProps but every story supplies it
  // through its own render function — set to undefined here to avoid
  // Storybook trying to auto-generate a control for it.
  args: {
    children: undefined,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated'],
      description: 'Visual style variant of the accordion container.',
      table: {
        type: { summary: '"default" | "bordered" | "separated"' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size affecting trigger padding and font size.',
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color applied to the open trigger label and chevron.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger"' },
        defaultValue: { summary: 'primary' },
      },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple items to be open simultaneously.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    // Controlled-only / internal props — hidden from the args panel
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof Accordion>;

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

const itemContent = (topic: string) => (
  <p style={{ margin: 0 }}>
    <strong style={{ color: 'var(--dark-color)' }}>{topic}</strong> — This panel contains
    detailed information about the selected topic. Toggle the trigger above to collapse it.
  </p>
);

// ============================================================================
// DEFAULT — interactive playground; all controls apply here
// ============================================================================

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'medium',
    color: 'primary',
    multiple: false,
    defaultValue: 'item1',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item1" label="What is eidos-ui?">
        {itemContent('eidos-ui')}
      </AccordionItem>
      <AccordionItem value="item2" label="How do I install it?">
        {itemContent('Installation')}
      </AccordionItem>
      <AccordionItem value="item3" label="Is it accessible?">
        {itemContent('Accessibility')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// MULTIPLE — allow several items open at once
// ============================================================================

export const Multiple = {
  render: () => (
    <Accordion multiple variant="bordered" defaultValue={['item1', 'item3']}>
      <AccordionItem value="item1" label="General settings">
        {itemContent('General settings')}
      </AccordionItem>
      <AccordionItem value="item2" label="Privacy & security">
        {itemContent('Privacy & security')}
      </AccordionItem>
      <AccordionItem value="item3" label="Notifications">
        {itemContent('Notifications')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// BORDERED
// ============================================================================

export const Bordered = {
  render: () => (
    <Accordion variant="bordered" defaultValue="faq1">
      <AccordionItem value="faq1" label="Can I use this in production?">
        {itemContent('Production readiness')}
      </AccordionItem>
      <AccordionItem value="faq2" label="Does it support TypeScript?">
        {itemContent('TypeScript support')}
      </AccordionItem>
      <AccordionItem value="faq3" label="How do I customise the theme?">
        {itemContent('Theming')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// SEPARATED
// ============================================================================

export const Separated = {
  render: () => (
    <Accordion variant="separated" defaultValue="step1">
      <AccordionItem value="step1" label="Step 1 — Create an account">
        {itemContent('Account creation')}
      </AccordionItem>
      <AccordionItem value="step2" label="Step 2 — Set up your profile">
        {itemContent('Profile setup')}
      </AccordionItem>
      <AccordionItem value="step3" label="Step 3 — Invite your team">
        {itemContent('Team invitations')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// SIZES — small / medium / large stacked
// ============================================================================

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={labelStyle}>Small</p>
        <Accordion size="small" defaultValue="s1">
          <AccordionItem value="s1" label="Small trigger height">
            {itemContent('Small size')}
          </AccordionItem>
          <AccordionItem value="s2" label="Compact spacing">
            {itemContent('Compact')}
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p style={labelStyle}>Medium (default)</p>
        <Accordion size="medium" defaultValue="m1">
          <AccordionItem value="m1" label="Medium trigger height">
            {itemContent('Medium size')}
          </AccordionItem>
          <AccordionItem value="m2" label="Default spacing">
            {itemContent('Default')}
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p style={labelStyle}>Large</p>
        <Accordion size="large" defaultValue="l1">
          <AccordionItem value="l1" label="Large trigger height">
            {itemContent('Large size')}
          </AccordionItem>
          <AccordionItem value="l2" label="Generous spacing">
            {itemContent('Generous')}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// ============================================================================
// COLORS — all four color themes
// ============================================================================

export const Colors = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={labelStyle}>Primary</p>
        <Accordion color="primary" defaultValue="c1">
          <AccordionItem value="c1" label="Primary color active">
            {itemContent('Primary')}
          </AccordionItem>
          <AccordionItem value="c2" label="Toggle to see the color">
            {itemContent('Primary')}
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p style={labelStyle}>Secondary</p>
        <Accordion color="secondary" defaultValue="c1">
          <AccordionItem value="c1" label="Secondary color active">
            {itemContent('Secondary')}
          </AccordionItem>
          <AccordionItem value="c2" label="Toggle to see the color">
            {itemContent('Secondary')}
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p style={labelStyle}>Success</p>
        <Accordion color="success" defaultValue="c1">
          <AccordionItem value="c1" label="Success color active">
            {itemContent('Success')}
          </AccordionItem>
          <AccordionItem value="c2" label="Toggle to see the color">
            {itemContent('Success')}
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p style={labelStyle}>Danger</p>
        <Accordion color="danger" defaultValue="c1">
          <AccordionItem value="c1" label="Danger color active">
            {itemContent('Danger')}
          </AccordionItem>
          <AccordionItem value="c2" label="Toggle to see the color">
            {itemContent('Danger')}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// ============================================================================
// WITH ICONS — items with a leading icon node
// ============================================================================

export const WithIcons = {
  render: () => (
    <Accordion variant="bordered" defaultValue="profile">
      <AccordionItem
        value="profile"
        label="Profile"
        icon={<User size={16} />}
      >
        {itemContent('Profile')}
      </AccordionItem>
      <AccordionItem
        value="settings"
        label="Settings"
        icon={<Settings size={16} />}
      >
        {itemContent('Settings')}
      </AccordionItem>
      <AccordionItem
        value="notifications"
        label="Notifications"
        icon={<Bell size={16} />}
      >
        {itemContent('Notifications')}
      </AccordionItem>
      <AccordionItem
        value="security"
        label="Security"
        icon={<Lock size={16} />}
      >
        {itemContent('Security')}
      </AccordionItem>
      <AccordionItem
        value="plans"
        label="Plans & billing"
        icon={<Star size={16} />}
      >
        {itemContent('Plans & billing')}
      </AccordionItem>
      <AccordionItem
        value="advanced"
        label="Advanced"
        icon={<ChevronRight size={16} />}
      >
        {itemContent('Advanced')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// DISABLED — one item disabled, one open, one normal
// ============================================================================

export const Disabled = {
  render: () => (
    <Accordion defaultValue="item1">
      <AccordionItem value="item1" label="Active item — open">
        {itemContent('Active item')}
      </AccordionItem>
      <AccordionItem value="item2" label="Disabled item — cannot be toggled" disabled>
        {itemContent('Disabled item')}
      </AccordionItem>
      <AccordionItem value="item3" label="Normal item — click to expand">
        {itemContent('Normal item')}
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// CONTROLLED — external useState drives the open state
// ============================================================================

export const Controlled = {
  render: () => {
    const [openItem, setOpenItem] = useState<string>('q1');

    const handleChange = (value: string | string[]) => {
      // In single mode, onChange receives a string (or '' when closed).
      setOpenItem(value as string);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Accordion value={openItem} onChange={handleChange} variant="bordered">
          <AccordionItem value="q1" label="Question one">
            {itemContent('Question one')}
          </AccordionItem>
          <AccordionItem value="q2" label="Question two">
            {itemContent('Question two')}
          </AccordionItem>
          <AccordionItem value="q3" label="Question three">
            {itemContent('Question three')}
          </AccordionItem>
        </Accordion>

        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>
          Open item:{' '}
          <strong style={{ color: 'var(--dark-color)' }}>
            {openItem || '(none)'}
          </strong>
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['q1', 'q2', 'q3'].map((v) => (
            <button
              key={v}
              onClick={() => setOpenItem(openItem === v ? '' : v)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 6,
                border: '1px solid var(--gray-300)',
                background: openItem === v ? 'var(--primary-color)' : 'transparent',
                color: openItem === v ? '#fff' : 'var(--dark-color)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              Toggle {v}
            </button>
          ))}
        </div>
      </div>
    );
  },
};
