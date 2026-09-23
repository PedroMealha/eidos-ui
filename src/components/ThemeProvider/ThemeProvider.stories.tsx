import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './ThemeProvider.component';
import { defaultTheme } from './ThemeProvider.tokens';
import { useTheme } from './ThemeProvider.context';
import { Button } from '../Button';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { Pill } from '../Pill';

const Swatches: React.FC = () => {
  const { resolvedTheme, isDefault } = useTheme();
  return (
    <Card variant="outlined" padding="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button color="primary">Primary</Button>
          <Button color="success">Success</Button>
          <Button color="warning">Warning</Button>
          <Chip color="primary">Chip</Chip>
          <Pill color="info">Pill</Pill>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => (
            <div
              key={step}
              title={`--primary-${step}`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                background: `var(--primary-${step})`,
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: 12 }}>
          primary <code>{resolvedTheme.colors.primary.base}</code> · font scale{' '}
          <code>{resolvedTheme.typography.fontScale}</code> · writing tokens:{' '}
          <code>{isDefault ? 'no (preset)' : 'yes'}</code>
        </p>
      </div>
    </Card>
  );
};

/**
 * `inline: false` for the same reason as `ThemeEditor`'s stories: a provider
 * writes its tokens to `document.documentElement`, so several rendered inline
 * on one Docs page would overwrite each other's colours. An iframe per story is
 * the only way to give each its own root.
 */
const meta = {
  title: 'Theming/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'padded',
    docs: { story: { inline: false, height: '420px' } },
  },
  argTypes: {
    theme: {
      control: 'object',
      description: 'Controlled theme. Pair with `onThemeChange` and own persistence in your app.',
      table: { type: { summary: 'ThemeConfig' } },
    },
    defaultTheme: {
      control: 'object',
      description: 'Initial theme for uncontrolled usage. Ignored when `theme` is set.',
      table: { type: { summary: 'ThemeConfig' } },
    },
    onThemeChange: {
      description: 'Fires on every theme change, in both controlled and uncontrolled mode.',
      table: { type: { summary: '(theme: ThemeConfig) => void' } },
    },
  },
  // `children` is required, so it lives here to satisfy the type for the
  // render-only stories below as well as seeding the Playground controls.
  args: {
    children: <Swatches />,
  },
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * With no theme supplied, nothing is written and the preset renders as-is.
 *
 * Args-driven, so editing `defaultTheme` in the Controls panel re-themes the
 * swatches live - which is the point of the component.
 */
export const Playground: Story = {
  render: (args) => <ThemeProvider {...args} />,
};

/** One base colour is enough - the ramp, shades and foregrounds are derived. */
export const CustomPrimary: Story = {
  render: () => (
    <ThemeProvider defaultTheme={{ colors: { primary: '#b5179e' } }}>
      <Swatches />
    </ThemeProvider>
  ),
};

/** Typography is scaled by a multiplier over the preset `--font-size-*` values. */
export const Typography: Story = {
  render: () => (
    <ThemeProvider
      defaultTheme={{
        typography: { fontFamily: "Georgia, 'Times New Roman', serif", fontScale: 1.15 },
      }}
    >
      <Swatches />
    </ThemeProvider>
  ),
};

/**
 * `contrast` pins the foreground for a fill, bypassing the computed choice.
 * Here white is forced onto a pale yellow, which is exactly the illegible
 * result the computation exists to avoid - shown to make the override visible.
 */
export const PinnedContrast: Story = {
  // The illegible pairing is the subject of this story, so axe is skipped for
  // it rather than allow-listing the nodes somewhere else. See
  // `scripts/check-a11y-baseline.js`, which reads the same tag.
  tags: ['a11y-contrast-demo'],
  render: () => (
    <ThemeProvider defaultTheme={{ colors: { primary: { base: '#fde047', contrast: '#ffffff' } } }}>
      <Swatches />
    </ThemeProvider>
  ),
};

/** The preset object is exported, so a theme can be built by deriving from it. */
export const ReadingThePreset: Story = {
  render: () => (
    <Card variant="outlined" padding="lg">
      <pre style={{ fontSize: 11 }}>{JSON.stringify(defaultTheme, null, 2)}</pre>
    </Card>
  ),
};
