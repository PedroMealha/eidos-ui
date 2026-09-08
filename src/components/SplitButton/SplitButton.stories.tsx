import type { Meta, StoryObj } from '@storybook/react-vite';
import { Save, Download, FileText, Clock, ChevronDown } from 'lucide-react';
import { SplitButton } from './SplitButton.component';

const meta = {
  title: 'Elements/SplitButton',
  component: SplitButton,
  parameters: { layout: 'centered' },
  args: {
    // Required - overridden by every story's render function.
    label: 'Save',
    onClick: () => {},
    options: [],
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Shared options ───────────────────────────────────────────────────────────

const SAVE_OPTIONS = [
  {
    id: 'draft',
    label: 'Save as draft',
    icon: FileText,
    onClick: () => console.log('Save as draft'),
  },
  {
    id: 'template',
    label: 'Save as template',
    icon: Save,
    onClick: () => console.log('Save as template'),
  },
  {
    id: 'schedule',
    label: 'Schedule publish',
    icon: Clock,
    onClick: () => console.log('Schedule'),
  },
];

const EXPORT_OPTIONS = [
  { id: 'csv', label: 'Export as CSV', icon: Download, onClick: () => console.log('CSV') },
  { id: 'xlsx', label: 'Export as XLSX', icon: Download, onClick: () => console.log('XLSX') },
  { id: 'pdf', label: 'Export as PDF', icon: Download, onClick: () => console.log('PDF') },
];

// ─── 1. Default (filled, primary) ────────────────────────────────────────────

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Click the left part to trigger the primary action immediately. ' +
          'Click the chevron on the right to reveal secondary options. ' +
          'The two halves share one continuous visual boundary.',
      },
    },
  },
  render: () => (
    <SplitButton
      label="Save"
      onClick={() => console.log('Primary: Save')}
      options={SAVE_OPTIONS}
      preIcon={Save}
    />
  ),
};

// ─── 2. Outlined ─────────────────────────────────────────────────────────────

export const Outlined: Story = {
  name: 'Outlined',
  render: () => (
    <SplitButton
      label="Export"
      variant="outlined"
      onClick={() => console.log('Export')}
      options={EXPORT_OPTIONS}
      preIcon={Download}
    />
  ),
};

// ─── 3. Colors ────────────────────────────────────────────────────────────────

export const Colors: Story = {
  name: 'Colors',
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const).map((color) => (
        <SplitButton
          key={color}
          label={color.charAt(0).toUpperCase() + color.slice(1)}
          color={color}
          onClick={() => console.log(color)}
          options={[
            { id: 'a', label: 'Option A', onClick: () => {} },
            { id: 'b', label: 'Option B', onClick: () => {} },
          ]}
        />
      ))}
    </div>
  ),
};

// ─── 4. Sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SplitButton
          key={size}
          label="Publish"
          size={size}
          onClick={() => {}}
          options={[
            { id: 'draft', label: 'Save as draft', onClick: () => {} },
            { id: 'schedule', label: 'Schedule publish', onClick: () => {} },
          ]}
        />
      ))}
    </div>
  ),
};

// ─── 5. Loading ───────────────────────────────────────────────────────────────

export const Loading: Story = {
  name: 'Loading',
  render: () => <SplitButton label="Saving..." loading onClick={() => {}} options={SAVE_OPTIONS} />,
};

// ─── 6. Disabled ─────────────────────────────────────────────────────────────

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <SplitButton label="Save" disabled onClick={() => {}} options={SAVE_OPTIONS} preIcon={Save} />
  ),
};

// ─── 7. With disabled option ──────────────────────────────────────────────────

export const WithDisabledOption: Story = {
  name: 'WithDisabledOption',
  render: () => (
    <SplitButton
      label="Export"
      onClick={() => console.log('Export')}
      preIcon={ChevronDown}
      options={[
        { id: 'csv', label: 'Export as CSV', onClick: () => {} },
        { id: 'xlsx', label: 'Export as XLSX', onClick: () => {}, disabled: true },
        { id: 'pdf', label: 'Export as PDF', onClick: () => {} },
      ]}
    />
  ),
};
