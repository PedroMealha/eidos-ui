import type { Meta, StoryObj } from '@storybook/react-vite';
import { Save, Download, FileText, Clock, ChevronDown } from 'lucide-react';
import { SplitButton } from './SplitButton.component';
import { StoryRow } from '../../story-layout.docs';

const SAVE_OPTIONS = [
  { id: 'draft', label: 'Save as draft', icon: FileText, onClick: () => {} },
  { id: 'template', label: 'Save as template', icon: Save, onClick: () => {} },
  { id: 'schedule', label: 'Schedule publish', icon: Clock, onClick: () => {} },
];

const EXPORT_OPTIONS = [
  { id: 'csv', label: 'Export as CSV', icon: Download, onClick: () => {} },
  { id: 'xlsx', label: 'Export as XLSX', icon: Download, onClick: () => {} },
  { id: 'pdf', label: 'Export as PDF', icon: Download, onClick: () => {} },
];

const SIMPLE_OPTIONS = [
  { id: 'a', label: 'Option A', onClick: () => {} },
  { id: 'b', label: 'Option B', onClick: () => {} },
];

const meta = {
  title: 'Elements/SplitButton',
  component: SplitButton,
  parameters: { layout: 'centered' },
  // `label`, `onClick` and `options` are required props, so they live here to
  // satisfy the type for the render-only stories below as well as seeding the
  // Default controls.
  args: {
    label: 'Save',
    onClick: () => {},
    options: SAVE_OPTIONS,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the primary (left) action.',
      table: { type: { summary: 'string' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['filled', 'outlined'],
      description:
        'There is deliberately no `text` variant - a transparent split control has no visible boundary between its two halves.',
      table: {
        type: { summary: '"filled" | "outlined"' },
        defaultValue: { summary: 'filled' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Control height',
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables both halves and the dropdown.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner in the primary half.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    preIcon: {
      control: 'text',
      description:
        'Icon before the primary label. Pass a Lucide component (Save) or string name ("save").',
      table: { type: { summary: 'React.ComponentType | string' }, category: 'Icons' },
    },
    options: {
      control: 'object',
      description: 'Secondary actions shown in the dropdown.',
      table: { type: { summary: 'SplitButtonOption[]' } },
    },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Shared options ───────────────────────────────────────────────────────────

// ─── Playground ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    preIcon: Save,
    variant: 'filled',
    color: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <StoryRow>
      <SplitButton label="Save" onClick={() => {}} options={SAVE_OPTIONS} preIcon={Save} />
      <SplitButton
        label="Export"
        variant="outlined"
        onClick={() => {}}
        options={EXPORT_OPTIONS}
        preIcon={Download}
      />
    </StoryRow>
  ),
};

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors: Story = {
  render: () => (
    <StoryRow>
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const).map((color) => (
        <SplitButton
          key={color}
          label={color.charAt(0).toUpperCase() + color.slice(1)}
          color={color}
          onClick={() => {}}
          options={SIMPLE_OPTIONS}
        />
      ))}
    </StoryRow>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <StoryRow>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SplitButton
          key={size}
          label="Publish"
          size={size}
          onClick={() => {}}
          options={SIMPLE_OPTIONS}
        />
      ))}
    </StoryRow>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const Loading: Story = {
  render: () => <SplitButton label="Saving..." loading onClick={() => {}} options={SAVE_OPTIONS} />,
};

export const Disabled: Story = {
  render: () => (
    <SplitButton label="Save" disabled onClick={() => {}} options={SAVE_OPTIONS} preIcon={Save} />
  ),
};

export const WithDisabledOption: Story = {
  render: () => (
    <SplitButton
      label="Export"
      onClick={() => {}}
      preIcon={ChevronDown}
      options={[
        { id: 'csv', label: 'Export as CSV', onClick: () => {} },
        { id: 'xlsx', label: 'Export as XLSX', onClick: () => {}, disabled: true },
        { id: 'pdf', label: 'Export as PDF', onClick: () => {} },
      ]}
    />
  ),
};
