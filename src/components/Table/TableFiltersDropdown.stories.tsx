import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableFiltersDropdown } from './TableFiltersDropdown.component';
import type { TableColumn, TableFilters } from './Table.types';
import { expect, waitFor } from 'storybook/test';

// ── Story-local row type ──────────────────────────────────────────────────────
// Concrete type used across all stories so TypeScript can resolve column keys.

interface StoryRow {
  name: string;
  status: string;
  role: string;
  department: string;
  joinDate: string;
  active: boolean;
}

// ── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TableFiltersDropdown<StoryRow>> = {
  title: 'Data/TableFiltersDropdown',
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
    // `columns` is the one prop a control can meaningfully drive: edit the
    // schema and the filter rows re-derive from it. Everything else is
    // controlled state or a callback, so exposing a control for them would
    // be a widget that silently does nothing.
    columns: {
      control: 'object',
      description:
        'Column schema. Only entries with `filterable: true` appear; `filterType` picks the editor.',
      table: { type: { summary: 'TableColumn<T>[]' } },
    },
    defaultFilters: {
      control: 'object',
      description: 'Filters applied before the user touches anything.',
      table: { type: { summary: 'TableFilters' } },
    },
    filters: { control: false, description: 'Controlled applied filters.' },
    onFiltersChange: { control: false, description: 'Called on Apply with the committed filters.' },
    className: { table: { disable: true } },
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
      { id: 'admin', value: 'Admin', label: 'Admin' },
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
      { id: 'design', value: 'Design', label: 'Design' },
      { id: 'product', value: 'Product', label: 'Product' },
      { id: 'marketing', value: 'Marketing', label: 'Marketing' },
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
      { id: 'active', value: 'active', label: 'Active' },
      { id: 'inactive', value: 'inactive', label: 'Inactive' },
      { id: 'pending', value: 'pending', label: 'Pending' },
    ],
  },
];

// ── Story helper: shows applied filters below the dropdown ────────────────────

const AppliedBadge = ({ filters }: { filters: TableFilters }) => {
  const entries = Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      <strong>Applied filters:</strong>{' '}
      {entries.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join(' · ')}
    </div>
  );
};

// ── Story 1: Default ──────────────────────────────────────────────────────────
// Minimal example with text + select column types.

export const Playground: Story = {
  args: {
    columns: textAndSelectColumns,
    defaultFilters: {},
  },
  // Spreads `args` so editing the `columns` schema in the panel re-derives the
  // filter rows. `filters`/`onFiltersChange` stay owned by the story, since a
  // controlled component needs someone to hold the state.
  render: function DefaultStory(args) {
    // Seeded with an active filter so the panel renders its "Clear All"
    // action: the apply/discard pair only appears once something is pending,
    // and the close-on-commit path is the same either way.
    const [filters, setFilters] = useState<TableFilters>({ name: 'abc' });

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click the funnel icon to open the filter panel
        </p>
        <TableFiltersDropdown<StoryRow> {...args} filters={filters} onFiltersChange={setFilters} />
        <AppliedBadge filters={filters} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
const [filters, setFilters] = useState<TableFilters>({});

<TableFiltersDropdown
  columns={columns}
  filters={filters}
  onFiltersChange={setFilters}
/>`.trim(),
      },
    },
  },
};

// ── Story 2: Multiple Filters ─────────────────────────────────────────────────
// Demonstrates date-range, boolean, and select filter types together.

export const MultipleFilters: Story = {
  render: () => {
    // Seeded with an active filter so the panel renders its "Clear All"
    // action: the apply/discard pair only appears once something is pending,
    // and the close-on-commit path is the same either way.
    const [filters, setFilters] = useState<TableFilters>({ name: 'abc' });

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
  parameters: {
    docs: {
      source: {
        code: `
const [filters, setFilters] = useState<TableFilters>({});

// Columns can mix text, select, date-range, and boolean filter types.
<TableFiltersDropdown
  columns={columns}
  filters={filters}
  onFiltersChange={setFilters}
/>`.trim(),
      },
    },
  },
};

// ── Story 3: Pre-filled Filters ───────────────────────────────────────────────
// Dropdown opens with `defaultFilters` already staged (not yet committed).
// The user can adjust them and click Apply, or discard the changes.

export const PreFilledFilters: Story = {
  render: () => {
    // Seeded with an active filter so the panel renders its "Clear All"
    // action: the apply/discard pair only appears once something is pending,
    // and the close-on-commit path is the same either way.
    const [filters, setFilters] = useState<TableFilters>({ name: 'abc' });

    const defaultFilters: TableFilters = {
      name: 'Alice',
      role: 'Admin',
    };

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
  parameters: {
    docs: {
      source: {
        code: `
const [filters, setFilters] = useState<TableFilters>({ name: 'Alice', role: 'Admin' });

<TableFiltersDropdown
  columns={columns}
  filters={filters}
  onFiltersChange={setFilters}
  defaultFilters={{ name: 'Alice', role: 'Admin' }}
/>`.trim(),
      },
    },
  },
};

// ============================================================================
// CHARACTERISATION - pinned before the panel stops closing itself by remounting
// ============================================================================

export const ClosesOnApply: StoryObj<typeof TableFiltersDropdown> = {
  tags: ['!dev', '!autodocs'],
  render: function CharacterisationStory() {
    // Seeded with an active filter so the panel renders its "Clear All"
    // action: the apply/discard pair only appears once something is pending,
    // and the close-on-commit path is the same either way.
    const [filters, setFilters] = useState<TableFilters>({ name: 'abc' });
    return (
      <TableFiltersDropdown
        columns={[{ key: 'name', label: 'Name', filterable: true }]}
        filters={filters}
        onFiltersChange={setFilters}
      />
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    const panels = () => document.querySelectorAll('[data-dropdown-content]');

    await step('the toolbar button opens the panel', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Filters/ }));
      await waitFor(() => expect(panels()).toHaveLength(1));
    });

    await step('committing from inside the panel closes it', async () => {
      // Queried out of the panel by hand: the content is portaled, and the
      // footer buttons are only rendered for some states, so a document-wide
      // role query is the wrong tool here.
      const clear = Array.from(panels()[0].querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.includes('Clear All'),
      );
      expect(clear, 'the panel rendered no "Clear All" action').toBeDefined();
      await userEvent.click(clear!);
      await waitFor(() => expect(panels()).toHaveLength(0));
    });

    await step('and it reopens afterwards', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /Filters/ }));
      await waitFor(() => expect(panels()).toHaveLength(1));
    });
  },
};
