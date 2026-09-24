import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './ThemeProvider.component';
import { defaultTheme } from './ThemeProvider.tokens';
import { useTheme } from './ThemeProvider.context';
import { Button } from '../Button';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { Pill } from '../Pill';
import { SegmentedControl } from '../SegmentedControl';
import type { ColorScheme } from './ThemeProvider.types';
import { expect, waitFor } from 'storybook/test';
import { deriveDarkBase } from './ThemeProvider.color';

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
    colorScheme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description:
        'Controlled colour scheme, written to `<html data-color-scheme>`. Leave it and `defaultColorScheme` unset to leave the attribute to your app.',
      table: { type: { summary: "'light' | 'dark' | 'system'" } },
    },
    defaultColorScheme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description: 'Initial scheme for uncontrolled usage. Ignored when `colorScheme` is set.',
      table: { type: { summary: "'light' | 'dark' | 'system'" } },
    },
    onColorSchemeChange: {
      description: 'Fires when the scheme is changed through `setColorScheme`.',
      table: { type: { summary: '(scheme: ColorScheme) => void' } },
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

/** A light/dark/system switch, wired to `useTheme().setColorScheme`. */
const SchemeSwitch: React.FC = () => {
  const { colorScheme, resolvedColorScheme, setColorScheme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <SegmentedControl
        ariaLabel="Colour scheme"
        size="sm"
        value={colorScheme}
        onChange={(value) => setColorScheme(value as ColorScheme)}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ]}
      />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        in effect: <code>{resolvedColorScheme}</code>
      </span>
    </div>
  );
};

/**
 * `colorScheme` (or `defaultColorScheme`) switches between light, dark and
 * the operating system's setting. Custom colours follow: each is tone-shifted
 * for the dark page automatically, so a themed app gets an accessible dark
 * mode with no second palette.
 */
export const ColorSchemes: Story = {
  render: () => (
    <ThemeProvider defaultColorScheme="dark" defaultTheme={{ colors: { primary: '#b5179e' } }}>
      <SchemeSwitch />
      <Swatches />
    </ThemeProvider>
  ),
  play: async ({ canvas, userEvent, step }) => {
    const root = document.documentElement;
    const token = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();

    await step(
      'dark: the custom primary is tone-shifted, not pinned to its light value',
      async () => {
        await waitFor(() => expect(root.getAttribute('data-color-scheme')).toBe('dark'));
        await expect(token('--primary-color')).toBe(deriveDarkBase('#b5179e'));
        await expect(token('--surface')).toBe('#0f172a');
      },
    );

    await step('light: back to the colour as picked', async () => {
      await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
      await waitFor(() => expect(root.getAttribute('data-color-scheme')).toBe('light'));
      await expect(token('--primary-color')).toBe('#b5179e');
    });
  },
};

/**
 * `dark.colors` sets an exact dark colour per family, for a brand with its own
 * dark palette. Families without one keep the derived tone.
 */
export const DarkOverrides: Story = {
  render: () => (
    <ThemeProvider
      defaultColorScheme="dark"
      defaultTheme={{
        colors: { primary: '#0ea5e9' },
        dark: { colors: { primary: '#7dd3fc' } },
      }}
    >
      <SchemeSwitch />
      <Swatches />
    </ThemeProvider>
  ),
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
