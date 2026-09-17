import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeEditor } from './ThemeEditor.component';
import { ThemeProvider } from '../ThemeProvider';
import type { ThemeConfig } from '../ThemeProvider';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { Pill } from '../Pill';
import { Switch } from '../Switch';

/**
 * Something for the editor to visibly affect. The provider writes tokens to
 * `document.documentElement`, so everything on the page - including this
 * preview and Storybook's own rendered story content - follows along.
 */
const Preview: React.FC = () => (
  <Card variant="outlined" padding="lg">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button color="primary">Primary</Button>
        <Button color="success">Success</Button>
        <Button color="danger">Danger</Button>
        <Button color="warning">Warning</Button>
        <Button color="info">Info</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="outlined" color="primary">
          Outlined
        </Button>
        <Button variant="text" color="primary">
          Text
        </Button>
        <Chip color="primary">Chip</Chip>
        <Pill color="success">Pill</Pill>
        <Switch defaultChecked color="primary" label="Switch" />
      </div>
      <Alert variant="info" title="Tinted surfaces follow too">
        Alert backgrounds are <code>rgba(var(--x-rgb), …)</code>, so they track the base colour.
      </Alert>
      <p>
        Body copy with a <a href="#theme">hyperlink</a> in it, so the link colour is visible while
        editing.
      </p>
    </div>
  </Card>
);

const meta = {
  title: 'Theming/ThemeEditor',
  component: ThemeEditor,
  parameters: { layout: 'padded' },
  argTypes: {
    colors: {
      control: 'object',
      description: 'Which colour rows to show, in order. Defaults to all seven themeable families.',
      table: {
        type: { summary: 'ThemeColorKey[]' },
        defaultValue: { summary: "['primary', 'secondary', 'success', 'danger', ...]" },
      },
    },
    hideTypography: {
      control: 'boolean',
      description: 'Hide the typography section.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    hideReset: {
      control: 'boolean',
      description: 'Hide the "Reset all" action.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    hideCssExport: {
      control: 'boolean',
      description: 'Hide the "Copy as CSS" action.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: {
      control: 'text',
      description: 'Additional class name on the root element.',
      table: { type: { summary: 'string' } },
    },
  },
} satisfies Meta<typeof ThemeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ThemeEditor {...args} />
        <Preview />
      </div>
    </ThemeProvider>
  ),
};

export const ColoursOnly: Story = {
  render: () => (
    <ThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ThemeEditor colors={['primary', 'danger']} hideTypography hideCssExport />
        <Preview />
      </div>
    </ThemeProvider>
  ),
};

export const WithStartingTheme: Story = {
  render: () => (
    <ThemeProvider defaultTheme={{ colors: { primary: '#b5179e', success: '#1b7f4f' } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ThemeEditor />
        <Preview />
      </div>
    </ThemeProvider>
  ),
};

/**
 * A pale base cannot be legible with white text and cannot be told apart from
 * the page behind it. The editor reports both instead of quietly altering the
 * chosen colour.
 */
export const ContrastDiagnostics: Story = {
  render: () => (
    <ThemeProvider defaultTheme={{ colors: { primary: '#fde047', success: '#a5b4fc' } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ThemeEditor colors={['primary', 'success']} hideTypography />
        <Preview />
      </div>
    </ThemeProvider>
  ),
};

/**
 * A font stack only names a font. The row flags a stack whose first family
 * won't actually render, and `Upload` registers a file for the session so it
 * does - see the docs for why an upload cannot be persisted in a `ThemeConfig`.
 */
export const FontOptions: Story = {
  render: () => (
    <ThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ThemeEditor
          colors={[]}
          hideCssExport
          fontOptions={[
            { label: 'Georgia (installed almost everywhere)', value: 'Georgia, serif' },
            { label: 'Definitely Not Installed', value: "'Definitely Not Installed', sans-serif" },
            { label: 'System UI', value: 'system-ui, sans-serif' },
          ]}
        />
        <Preview />
      </div>
    </ThemeProvider>
  ),
};

/**
 * Controlled mode: the surrounding app owns the theme, which is what you want
 * when it is loaded from (and saved back to) a user record on a server.
 */
export const Controlled: Story = {
  render: () => {
    const ControlledExample: React.FC = () => {
      const [theme, setTheme] = useState<ThemeConfig>({ colors: { primary: '#0f766e' } });
      return (
        <ThemeProvider theme={theme} onThemeChange={setTheme}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ThemeEditor colors={['primary']} hideTypography hideCssExport />
            <Card variant="outlined" padding="md">
              <pre>{JSON.stringify(theme, null, 2)}</pre>
            </Card>
            <Preview />
          </div>
        </ThemeProvider>
      );
    };
    return <ControlledExample />;
  },
};
