import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload } from './FileUpload.component';
import { StoryStack, StoryValue } from '../../story-layout.docs';

const meta = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  argTypes: {
    accept: {
      control: 'text',
      description: "Accepted file types (e.g. 'image/*', '.pdf,.docx').",
      table: { type: { summary: 'string' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow selecting multiple files.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes.',
      table: { type: { summary: 'number' } },
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files (only relevant when multiple=true).',
      table: { type: { summary: 'number' } },
    },
    hint: {
      control: 'text',
      description: 'Custom hint text displayed inside the drop zone.',
      table: { type: { summary: 'string' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all interaction.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
    onFilesAccepted: { table: { disable: true } },
    onFilesRejected: { table: { disable: true } },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - basic drop zone, shows accepted file count via render state
// ============================================================================

// Spreads `args`, so every control in the panel drives the drop zone. This
// used to be `render: () =>`, which ignored args entirely - the Controls panel
// was rendered by the .mdx but could not change anything.
export const Playground: Story = {
  args: {
    multiple: false,
    disabled: false,
  },
  render: function DefaultStory(args) {
    const [accepted, setAccepted] = useState<File[]>([]);
    return (
      <StoryStack gap="sm">
        <FileUpload {...args} onFilesAccepted={setAccepted} />
        {accepted.length > 0 && (
          <StoryValue
            label="Accepted"
            value={`${accepted.length} file${accepted.length > 1 ? 's' : ''}`}
          />
        )}
      </StoryStack>
    );
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// MULTIPLE - multiple files, capped at 5
// ============================================================================

export const Multiple: Story = {
  args: { multiple: true, maxFiles: 5, hint: 'Select up to 5 files' },
};

// ============================================================================
// WITH MAX SIZE - reject files above 5 MB
// ============================================================================

export const WithMaxSize: Story = {
  args: {
    maxSize: 5 * 1024 * 1024,
    hint: 'Maximum file size: 5 MB',
  },
};

// ============================================================================
// IMAGES ONLY
// ============================================================================

export const ImagesOnly: Story = {
  args: {
    accept: 'image/*',
    hint: 'PNG, JPG, GIF, WebP accepted',
  },
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
  args: {
    disabled: true,
    hint: 'File upload is currently unavailable',
  },
};

// ============================================================================
// WITH CALLBACKS - surfaces the accept/reject outcome in the story itself
// ============================================================================

// Renders the outcome rather than logging it. A console.log is invisible on a
// Docs page unless the reader happens to have devtools open, which makes the
// one thing this story exists to demonstrate undiscoverable.
export const WithCallbacks: Story = {
  render: function WithCallbacksStory() {
    const [log, setLog] = useState<string>('Nothing yet - drop a file above.');
    return (
      <StoryStack gap="sm">
        <FileUpload
          multiple
          maxSize={10 * 1024 * 1024}
          hint="Maximum file size: 10 MB"
          onFilesAccepted={(files) => setLog(`Accepted: ${files.map((f) => f.name).join(', ')}`)}
          onFilesRejected={(files, reason) =>
            setLog(`Rejected (${reason}): ${files.map((f) => f.name).join(', ')}`)
          }
        />
        <StoryValue label="Last event" value={log} />
      </StoryStack>
    );
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};
