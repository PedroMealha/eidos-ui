import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableFiltersDropdown } from './TableFiltersDropdown.component';
import type { TableColumn, TableFilters } from './Table.types';

// ── Story-local row type ──────────────────────────────────────────────────────
// Concrete type used across all stories so TypeScript can resolve column keys.

interface StoryRow extends Record<string, unknown> {
  name: string;
  status: string;
  role: string;
  department: string;
  joinDate: string;
  active: boolean;
}

// ── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TableFiltersDropdown<StoryRow>> = {
  title: 'Data Display/TableFiltersDropdown',
  component: TableFiltersDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A standalone filter-picker dropdown used by the Table component. ' +
          'Each filter row selects a filterable column and a matching value. ' +
          'Changes are staged locally and only committed when the user clicks **Apply Filters**.',
      },
    },
  },
  argTypes: {
    columns:        { control: false },
    filters:        { control: false },
    onFiltersChange: { control: false },
    defaultFilters:  { control: false },
    className:       { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared column definitions ─────────────────────────────────────────────────

const textAndSelectColumns: TableColumn<StoryRow>[] = [
  {
    key: 'name',
    label: 'Name',
    filterable: true,
    filterType: 'text',
  },
  {
    key: 'role',
    label: 'Role',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { id: 'admin',  value: 'Admin',  label: 'Admin' },
      { id: 'editor', value: 'Editor', label: 'Editor' },
      { id: 'viewer', value: 'Viewer', label: 'Viewer' },
    ],
  },
  {
    key: 'department',
    label: 'Department',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { id: 'engineering', value: 'Engineering', label: 'Engineering' },
      { id: 'design',      value: 'Design',      label: 'Design' },
      { id: 'product',     value: 'Product',     label: 'Product' },
      { id: 'marketing',   value: 'Marketing',   label: 'Marketing' },
    ],
  },
];

const richColumns: TableColumn<StoryRow>[] = [
  {
    key: 'name',
    label: 'Name',
    filterable: true,
    filterType: 'text',
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    filterable: true,
    filterType: 'date',
    dateFilterMode: 'range',
  },
  {
    key: 'active',
    label: 'Active',
    filterable: true,
    filterType: 'boolean',
  },
  {
    key: 'status',
    label: 'Status',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { id: 'active',   value: 'active',   label: 'Active' },
      { id: 'inactive', value: 'inactive', label: 'Inactive' },
      { id: 'pending',  value: 'pending',  label: 'Pending' },
    ],
  },
];

// ── Story helper: shows applied filters below the dropdown ────────────────────

const AppliedBadge = ({ filters }: { filters: TableFilters }) => {
  const entries = Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
      <strong>Applied filters:</strong>{' '}
      {entries.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join(' · ')}
    </div>
  );
};

// ── Story 1: Default ──────────────────────────────────────────────────────────
// Minimal example with text + select column types.

export const Default: Story = {
  render: () => {
     
    const [filters, setFilters] = useState<TableFilters>({});

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Click the funnel icon to open the filter panel
        </p>
        <TableFiltersDropdown<StoryRow>
          columns={textAndSelectColumns}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <AppliedBadge filters={filters} />
      </div>
    );
  },
};

// ── Story 2: Multiple Filters ─────────────────────────────────────────────────
// Demonstrates date-range, boolean, and select filter types together.

export const MultipleFilters: Story = {
  render: () => {
     
    const [filters, setFilters] = useState<TableFilters>({});

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Columns include text, date-range, boolean, and select filter types
        </p>
        <TableFiltersDropdown<StoryRow>
          columns={richColumns}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <AppliedBadge filters={filters} />
      </div>
    );
  },
};

// ── Story 3: Pre-filled Filters ───────────────────────────────────────────────
// Dropdown opens with `defaultFilters` already staged (not yet committed).
// The user can adjust them and click Apply, or discard the changes.

export const PreFilledFilters: Story = {
  render: () => {
     
    const [filters, setFilters] = useState<TableFilters>({});

    const defaultFilters: TableFilters = {
      name:   'Alice',
      role:   'Admin',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Dropdown opens with pre-staged filters (name = "Alice", role = "Admin")
        </p>
        <TableFiltersDropdown<StoryRow>
          columns={textAndSelectColumns}
          filters={filters}
          onFiltersChange={setFilters}
          defaultFilters={defaultFilters}
        />
        <AppliedBadge filters={filters} />
      </div>
    );
  },
};
