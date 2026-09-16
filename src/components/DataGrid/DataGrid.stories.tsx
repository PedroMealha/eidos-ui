import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';
import { Trash2, Pencil, ShieldOff, FolderInput, Mail, MessageSquare } from 'lucide-react';
import { DataGrid } from './DataGrid.component';
import type { DataGridColumn, DataGridFilterField, DataGridQuickFilter } from './DataGrid.types';
import type { BulkAction } from '../Table/Table.types';
import type { MenuItemType } from '../Menu';
import { Chip } from '../Chip/Chip.component';

// ─── Data model ───────────────────────────────────────────────────────────────
// `extends Record<string, unknown>` is required so that Person satisfies the
// DataGrid generic constraint `T extends Record<string, unknown>`.

interface Person extends Record<string, unknown> {
  id: number;
  name: string;
  role: string;
  department: string;
  salary: number;
  active: boolean;
  joinDate?: string;
}

// ─── Option lists ─────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'senior', label: 'Senior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'junior', label: 'Junior' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ops', label: 'Operations' },
];

// ─── Seed data (12 rows) ──────────────────────────────────────────────────────

function makePeople(): Person[] {
  return [
    {
      id: 1,
      name: 'Alice Nguyen',
      role: 'lead',
      department: 'engineering',
      salary: 145000,
      active: true,
      joinDate: '2019-03-12',
    },
    {
      id: 2,
      name: 'Bob Smith',
      role: 'senior',
      department: 'engineering',
      salary: 130000,
      active: true,
      joinDate: '2020-07-01',
    },
    {
      id: 3,
      name: 'Carol Jones',
      role: 'mid',
      department: 'design',
      salary: 105000,
      active: false,
      joinDate: '2021-01-18',
    },
    {
      id: 4,
      name: 'David Lee',
      role: 'senior',
      department: 'product',
      salary: 125000,
      active: true,
      joinDate: '2018-11-05',
    },
    {
      id: 5,
      name: 'Eva Rossi',
      role: 'junior',
      department: 'marketing',
      salary: 75000,
      active: true,
      joinDate: '2023-02-27',
    },
    {
      id: 6,
      name: 'Frank Garcia',
      role: 'mid',
      department: 'engineering',
      salary: 115000,
      active: false,
      joinDate: '2022-09-14',
    },
    {
      id: 7,
      name: 'Grace Kim',
      role: 'senior',
      department: 'design',
      salary: 120000,
      active: true,
      joinDate: '2020-04-30',
    },
    {
      id: 8,
      name: 'Hiro Tanaka',
      role: 'lead',
      department: 'product',
      salary: 140000,
      active: true,
      joinDate: '2017-06-09',
    },
    {
      id: 9,
      name: 'Isla Patel',
      role: 'mid',
      department: 'ops',
      salary: 100000,
      active: false,
      joinDate: '2021-10-22',
    },
    {
      id: 10,
      name: 'Jake Morrison',
      role: 'junior',
      department: 'engineering',
      salary: 78000,
      active: true,
      joinDate: '2023-08-03',
    },
    {
      id: 11,
      name: 'Karen Müller',
      role: 'senior',
      department: 'marketing',
      salary: 118000,
      active: true,
      joinDate: '2019-12-15',
    },
    {
      id: 12,
      name: 'Lena Sousa',
      role: 'mid',
      department: 'design',
      salary: 108000,
      active: false,
      joinDate: '2022-05-20',
    },
  ];
}

// ─── Shared column definitions ────────────────────────────────────────────────

const BASE_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60 },
  { key: 'name', header: 'Name', type: 'text', minWidth: 160, required: true },
  { key: 'role', header: 'Role', type: 'select', width: 130, options: ROLE_OPTIONS },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    width: 150,
    options: DEPARTMENT_OPTIONS,
  },
  { key: 'salary', header: 'Salary', type: 'number', width: 110 },
  { key: 'active', header: 'Active', type: 'checkbox', width: 80 },
];

const SORTABLE_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60, sortable: true },
  { key: 'name', header: 'Name', type: 'text', minWidth: 160, sortable: true },
  {
    key: 'role',
    header: 'Role',
    type: 'select',
    width: 130,
    options: ROLE_OPTIONS,
    sortable: true,
  },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    width: 150,
    options: DEPARTMENT_OPTIONS,
    sortable: true,
  },
  { key: 'salary', header: 'Salary', type: 'number', width: 110, sortable: true },
  { key: 'active', header: 'Active', type: 'checkbox', width: 80 },
];

// `align` demo: one column per value, plus a centred `checkbox` column (which
// needs more than `text-align` to move - see DataGrid.scss) and a sortable
// right-aligned one, where the sort icon has to follow the alignment.
const ALIGNED_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60 },
  { key: 'name', header: 'Name', type: 'text', minWidth: 160 },
  {
    key: 'department',
    header: 'Department (center)',
    type: 'select',
    width: 170,
    options: DEPARTMENT_OPTIONS,
    align: 'center',
  },
  {
    key: 'salary',
    header: 'Salary (right)',
    type: 'number',
    width: 140,
    align: 'right',
    sortable: true,
  },
  { key: 'active', header: 'Active (center)', type: 'checkbox', width: 130, align: 'center' },
];

const FILTERABLE_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60 },
  { key: 'name', header: 'Name', type: 'text', minWidth: 160 },
  { key: 'role', header: 'Role', type: 'select', width: 130, options: ROLE_OPTIONS },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    width: 150,
    options: DEPARTMENT_OPTIONS,
  },
  { key: 'salary', header: 'Salary', type: 'number', width: 110 },
  { key: 'active', header: 'Active', type: 'checkbox', width: 80 },
  { key: 'joinDate', header: 'Join Date', type: 'text', width: 130 },
];

// Filter schema is fully decoupled from `columns` - it lives in its own
// dedicated array, so every filterable field is visible in one place instead
// of scattered across each column's definition.
const FILTER_CONFIG: DataGridFilterField[] = [
  { key: 'name', label: 'Name', filterType: 'text' },
  {
    key: 'role',
    label: 'Role',
    filterType: 'select',
    filterOptions: [
      { id: 'lead', value: 'lead', label: 'Lead' },
      { id: 'senior', value: 'senior', label: 'Senior' },
      { id: 'mid', value: 'mid', label: 'Mid-level' },
      { id: 'junior', value: 'junior', label: 'Junior' },
    ],
  },
  {
    key: 'department',
    label: 'Department',
    filterType: 'select',
    filterOptions: [
      { id: 'engineering', value: 'engineering', label: 'Engineering' },
      { id: 'design', value: 'design', label: 'Design' },
      { id: 'product', value: 'product', label: 'Product' },
      { id: 'marketing', value: 'marketing', label: 'Marketing' },
      { id: 'ops', value: 'ops', label: 'Operations' },
    ],
  },
  { key: 'joinDate', label: 'Join Date', filterType: 'date', dateFilterMode: 'range' },
];

// Quick filters sit in the toolbar itself rather than behind the filter
// dropdown. One of each control type: a segmented control for a handful of
// mutually exclusive values, a multi-select for a medium list, and a
// searchable combobox for a long one.
const QUICK_FILTERS: DataGridQuickFilter[] = [
  {
    type: 'segmented',
    key: 'department',
    label: 'Department',
    // No "All" entry here - the grid always prepends it.
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product' },
    ],
  },
  {
    type: 'select',
    key: 'role',
    label: 'Role',
    multiple: true,
    options: ROLE_OPTIONS,
  },
  {
    type: 'combobox',
    key: 'name',
    label: 'Name',
    width: 200,
    options: makePeople().map((person) => ({ value: person.name, label: person.name })),
  },
];

// `department` is deliberately also in FILTER_CONFIG above: a key claimed by a
// quick filter wins and is dropped from the filter dropdown, so the same field
// is never editable from two controls at once.
const FULL_FEATURED_QUICK_FILTERS: DataGridQuickFilter[] = [
  {
    type: 'segmented',
    key: 'department',
    label: 'Department',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product' },
    ],
  },
];

// Pinned-from-middle demo columns.
// 'department' is defined at array position 2 (middle) with pin:'left'  → moved to left edge.
// 'salary' is defined at array position 4 (middle) with pin:'right' → moved to right edge.
// Neither pinned column sits at the natural array edge.
const PINNED_MID_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60 },
  { key: 'name', header: 'Name', type: 'text', minWidth: 200 },
  { key: 'department', header: 'Department', type: 'readonly', width: 160, pin: 'left' }, // array pos 2 → left edge
  { key: 'role', header: 'Role', type: 'select', width: 180, options: ROLE_OPTIONS },
  { key: 'salary', header: 'Salary', type: 'readonly', width: 130, pin: 'right' }, // array pos 4 → right edge
  { key: 'active', header: 'Active', type: 'checkbox', width: 90 },
];

const VALIDATION_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60 },
  {
    key: 'name',
    header: 'Name',
    type: 'text',
    minWidth: 160,
    required: true,
  },
  { key: 'role', header: 'Role', type: 'select', width: 130, options: ROLE_OPTIONS },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    width: 150,
    options: DEPARTMENT_OPTIONS,
  },
  {
    key: 'salary',
    header: 'Salary (USD)',
    type: 'number',
    width: 140,
    required: true,
    validate: (value) => {
      const n = Number(value);
      if (isNaN(n)) return 'Must be a number';
      if (n <= 0) return 'Salary must be greater than 0';
      if (n > 1000000) return 'Salary must be ≤ $1,000,000';
      return true;
    },
  },
  { key: 'active', header: 'Active', type: 'checkbox', width: 80 },
];

const FULL_FEATURED_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'id', header: 'ID', type: 'readonly', width: 60, sortable: true },
  {
    key: 'name',
    header: 'Name',
    type: 'text',
    minWidth: 160,
    required: true,
    sortable: true,
  },
  {
    key: 'role',
    header: 'Role',
    type: 'select',
    width: 130,
    options: ROLE_OPTIONS,
    sortable: true,
  },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    width: 150,
    options: DEPARTMENT_OPTIONS,
    sortable: true,
  },
  { key: 'salary', header: 'Salary', type: 'number', width: 110, sortable: true },
  { key: 'active', header: 'Active', type: 'checkbox', width: 80 },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DataGrid<Person>> = {
  title: 'Data/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An inline-editable data grid with sorting, filtering, pagination, row selection, ' +
          'bulk actions, drag-to-reorder rows, and a density picker. All features work ' +
          'client-side by default; switch to server-side by supplying controlled props ' +
          '(`currentSort`/`onSortChange`, `filters`/`onFiltersChange`, `onPageChange`).',
      },
    },
  },
  argTypes: {
    // ── Controllable props ─────────────────────────────────────────────────────
    editable: {
      control: 'boolean',
      description: 'Master switch - enables inline cell editing for all columns.',
      table: { defaultValue: { summary: 'true' } },
    },
    loading: {
      control: 'boolean',
      description: 'Renders a centred spinner overlay while data is loading.',
      table: { defaultValue: { summary: 'false' } },
    },
    showPagination: {
      control: 'boolean',
      description: 'Show the pagination controls beneath the grid.',
      table: { defaultValue: { summary: 'false' } },
    },
    pageSize: {
      control: { type: 'number', min: 1, max: 50, step: 1 },
      description: 'Rows visible per page when pagination is active.',
      table: { defaultValue: { summary: '10' } },
    },
    showDensity: {
      control: 'boolean',
      description: 'Show the density-picker dropdown in the toolbar.',
      table: { defaultValue: { summary: 'false' } },
    },
    density: {
      control: 'select',
      options: ['compact', 'comfortable', 'spacious'],
      description: 'Row height preset applied to all cells.',
      table: { defaultValue: { summary: 'comfortable' } },
    },
    showRowNumbers: {
      control: 'boolean',
      description: 'Prepend a read-only column showing the 1-based row index.',
      table: { defaultValue: { summary: 'false' } },
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row checkboxes for bulk selection.',
      table: { defaultValue: { summary: 'false' } },
    },
    draggableRows: {
      control: 'boolean',
      description: 'Enable a drag-handle column so rows can be reordered.',
      table: { defaultValue: { summary: 'false' } },
    },
    showFilters: {
      control: 'boolean',
      description: 'Show the filter-panel toggle button in the toolbar.',
      table: { defaultValue: { summary: 'false' } },
    },
    emptyText: {
      control: 'text',
      description: 'Message shown when the `data` array is empty.',
      table: { defaultValue: { summary: 'No data available' } },
    },
    hasCardView: {
      control: 'boolean',
      description:
        'On by default: below `cardViewBreakpoint`, or once the grid can no longer fit ' +
        'every column at a reasonable minimum width, swap the table for one card per row ' +
        "- measured off the grid's own container width, not the viewport.",
      table: { defaultValue: { summary: 'true' } },
    },
    cardViewBreakpoint: {
      control: { type: 'number', min: 200, max: 1200, step: 20 },
      description:
        'Container width (px) at/below which card view kicks in. Card view also switches ' +
        'on automatically below (columns × 100px), regardless of this value.',
      table: { defaultValue: { summary: '640' } },
    },
    cardMinWidth: {
      control: { type: 'number', min: 160, max: 600, step: 20 },
      description:
        'Minimum width (px) a card can shrink to before the next one wraps to a new row.',
      table: { defaultValue: { summary: '280' } },
    },
    // ── Non-controllable props - hide from the controls panel ──────────────────
    columns: { control: false },
    data: { control: false },
    rowKey: { control: false },
    onChange: { control: false },
    onRowAdd: { control: false },
    currentSort: { control: false },
    onSortChange: { control: false },
    filters: { control: false },
    onFiltersChange: { control: false },
    totalRows: { control: false },
    pageSizeOptions: { control: false },
    selectedRows: { control: false },
    defaultSelectedRows: { control: false },
    onSelectionChange: { control: false },
    bulkActions: { control: false },
    onRowReorder: { control: false },
    onPageChange: { control: false },
    className: { table: { disable: true } },
    stickyHeader: { table: { disable: true } },
    maxHeight: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 1. Default (interactive controls) ───────────────────────────────────────

export const Default: Story = {
  name: 'Default (interactive controls)',
  parameters: {
    docs: {
      description: {
        story:
          'A fully editable grid with all common props wired to Storybook controls. ' +
          'Use the Controls panel to toggle `editable`, `loading`, `density`, ' +
          '`showDensity`, `showRowNumbers`, `showPagination`, `selectable`, ' +
          '`draggableRows`, `showFilters`, and `emptyText`.',
      },
    },
  },
  args: {
    editable: true,
    loading: false,
    showPagination: false,
    pageSize: 10,
    showDensity: false,
    density: 'comfortable',
    showRowNumbers: false,
    selectable: false,
    draggableRows: false,
    showFilters: false,
    emptyText: 'No data available',
  },
  // Destructure out props we own so they don't override our fixed values when spread.
  render: function DefaultStory({ columns: _c, data: _d, onChange: _oc, rowKey: _rk, ...args }) {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        {...args}
      />
    );
  },
};

// ─── 2. ReadOnly ──────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All cells are read-only. Click targets and hover states are suppressed. ' +
          'Use `editable={false}` when you want a display-only view of your data.',
      },
    },
  },
  render: function ReadOnlyStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        editable={false}
      />
    );
  },
};

// ─── 3. WithSorting ───────────────────────────────────────────────────────────

export const WithSorting: Story = {
  name: 'WithSorting',
  parameters: {
    docs: {
      description: {
        story:
          'Client-side - click a header to sort. No `onSortChange` callback is ' +
          'provided, so the grid handles sorting internally. Set `sortable: true` ' +
          'on each `DataGridColumn` to opt that column in.',
      },
    },
  },
  render: function WithSortingStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person> columns={SORTABLE_COLUMNS} data={data} rowKey="id" onChange={setData} />
    );
  },
};

// ─── 4. WithFiltering ─────────────────────────────────────────────────────────

export const WithFiltering: Story = {
  name: 'WithFiltering',
  parameters: {
    docs: {
      description: {
        story:
          'Client-side filtering. Open the filter panel via the toolbar button and ' +
          'try filtering by Name (text), Role / Department (select), or Join Date ' +
          '(date range). Filterable fields live in their own dedicated `filterConfig` ' +
          "array - `key`, `label`, `filterType`, `filterOptions`, and - for `filterType: 'date'` - " +
          "`dateFilterMode` (`'single' | 'multiple' | 'range'`) - entirely decoupled from " +
          '`columns`, so a `key` can target any row-data field, not just a rendered column. ' +
          'No `onFiltersChange` callback means the grid manages filter state internally.',
      },
    },
  },
  render: function WithFilteringStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={FILTERABLE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        showFilters={true}
        filterConfig={FILTER_CONFIG}
      />
    );
  },
};

// ─── 5. WithPagination ────────────────────────────────────────────────────────

export const WithPagination: Story = {
  name: 'WithPagination',
  parameters: {
    docs: {
      description: {
        story:
          'Client-side pagination with 12 rows split into pages of 3. ' +
          'The page-size selector lets the user pick between 3, 5, or 10 rows per page.',
      },
    },
  },
  render: function WithPaginationStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        showPagination={true}
        pageSize={3}
        pageSizeOptions={[3, 5, 10]}
      />
    );
  },
};

// ─── 6. WithSelection ─────────────────────────────────────────────────────────

export const WithSelection: Story = {
  name: 'WithSelection',
  parameters: {
    docs: {
      description: {
        story:
          "`bulkActions` accepts any mix of plain buttons (`type: 'button'`, the default) " +
          "and split-buttons (`type: 'split-button'`, a primary action plus a dropdown of " +
          '`options`) - nothing is rendered by default, and every action, icon, and color is ' +
          'entirely up to the consumer. Each action receives the full array of selected row objects.',
      },
    },
  },
  render: function WithSelectionStory() {
    const [data, setData] = useState<Person[]>(makePeople());

    const bulkActions: BulkAction<Person>[] = [
      {
        id: 'delete-selected',
        type: 'button',
        label: 'Delete selected',
        icon: Trash2,
        color: 'danger',
        onClick: (selectedRows) => {
          const selectedIds = new Set(selectedRows.map((r) => r.id));
          setData((prev) => prev.filter((r) => !selectedIds.has(r.id)));
        },
      },
      {
        id: 'move-to',
        type: 'split-button',
        label: 'Move to Engineering',
        icon: FolderInput,
        variant: 'outlined',
        onClick: (selectedRows) => {
          const selectedIds = new Set(selectedRows.map((r) => r.id));
          setData((prev) =>
            prev.map((r) => (selectedIds.has(r.id) ? { ...r, department: 'engineering' } : r)),
          );
        },
        options: [
          {
            id: 'move-to-design',
            label: 'Move to Design',
            onClick: (selectedRows) => {
              const selectedIds = new Set(selectedRows.map((r) => r.id));
              setData((prev) =>
                prev.map((r) => (selectedIds.has(r.id) ? { ...r, department: 'design' } : r)),
              );
            },
          },
          {
            id: 'move-to-product',
            label: 'Move to Product',
            onClick: (selectedRows) => {
              const selectedIds = new Set(selectedRows.map((r) => r.id));
              setData((prev) =>
                prev.map((r) => (selectedIds.has(r.id) ? { ...r, department: 'product' } : r)),
              );
            },
          },
        ],
      },
    ];

    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        selectable={true}
        bulkActions={bulkActions}
      />
    );
  },
};

// ─── 7. WithDraggableRows ─────────────────────────────────────────────────────

export const WithDraggableRows: Story = {
  name: 'WithDraggableRows',
  parameters: {
    docs: {
      description: {
        story:
          'Grab the grip handle on the left of any row and drag it to a new position. ' +
          'The reordered dataset is committed via `onRowReorder`. ' +
          'Note: sorting is intentionally disabled here - sorting and manual ordering ' +
          'are mutually exclusive UX patterns.',
      },
    },
  },
  render: function WithDraggableRowsStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        draggableRows={true}
        onRowReorder={setData}
      />
    );
  },
};

// ─── 8. WithDensity ───────────────────────────────────────────────────────────

export const WithDensity: Story = {
  name: 'WithDensity',
  parameters: {
    docs: {
      description: {
        story:
          'The toolbar exposes a density picker when `showDensity={true}`. ' +
          'Users can switch between Compact, Comfortable, and Spacious row heights. ' +
          'The selected density is stored internally by the grid.',
      },
    },
  },
  render: function WithDensityStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        showDensity={true}
        density="comfortable"
      />
    );
  },
};

// ─── 9. WithRowNumbers ────────────────────────────────────────────────────────

export const WithRowNumbers: Story = {
  name: 'WithRowNumbers',
  parameters: {
    docs: {
      description: {
        story:
          'A prepended read-only column displays the 1-based row index. ' +
          'Pair with `showPagination` - row numbers always reflect the position ' +
          'in the current view, not the full dataset.',
      },
    },
  },
  render: function WithRowNumbersStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={BASE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        showRowNumbers={true}
      />
    );
  },
};

// ─── 10. WithValidation ───────────────────────────────────────────────────────

export const WithValidation: Story = {
  name: 'WithValidation',
  parameters: {
    docs: {
      description: {
        story:
          'Inline validation fires on cell commit. ' +
          'Name is `required` - clear it and tab away to see the error. ' +
          'Salary must be a positive number ≤ $1,000,000 - try entering 0 or a ' +
          'letter to trigger the custom `validate` function.',
      },
    },
  },
  render: function WithValidationStory() {
    const [data, setData] = useState<Person[]>([
      {
        id: 1,
        name: 'Alice Nguyen',
        role: 'lead',
        department: 'engineering',
        salary: 145000,
        active: true,
      },
      { id: 2, name: '', role: 'junior', department: 'marketing', salary: -500, active: false },
      { id: 3, name: 'Carol Jones', role: 'mid', department: 'design', salary: 0, active: true },
    ]);
    return (
      <DataGrid<Person> columns={VALIDATION_COLUMNS} data={data} rowKey="id" onChange={setData} />
    );
  },
};

// ─── 11. EmptyState ───────────────────────────────────────────────────────────

export const EmptyState: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'When `data` is an empty array the grid renders the `emptyText` message ' +
          'centred in the body. Customize it to guide users toward the next action.',
      },
    },
  },
  render: () => (
    <DataGrid<Person>
      columns={BASE_COLUMNS}
      data={[]}
      rowKey="id"
      emptyText="No team members found. Add one to get started."
    />
  ),
};

// ─── 12. Loading ──────────────────────────────────────────────────────────────

export const Loading: Story = {
  name: 'Loading',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `loading={true}` while your data fetch is in flight. ' +
          'The grid renders a centred spinner and suppresses the empty-state message.',
      },
    },
  },
  render: () => <DataGrid<Person> columns={BASE_COLUMNS} data={[]} rowKey="id" loading={true} />,
};

// ─── 13. FullFeatured ─────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  name: 'FullFeatured',
  parameters: {
    docs: {
      description: {
        story:
          'Kitchen-sink story combining: sortable columns, a quick filter, column ' +
          'filters, client-side pagination (5 rows/page), row selection with a ' +
          'bulk-delete action, row numbers, and a density picker. ' +
          'This mirrors a real-world admin table use-case. ' +
          'Both filter surfaces write to the same state, so the Department quick ' +
          'filter and any dropdown filter narrow the data together - and because ' +
          'the quick filter claims `department`, that field is dropped from the ' +
          'dropdown rather than being editable from two places at once. The ' +
          'dropdown\'s own "Clear All" therefore leaves the quick filter alone, ' +
          'while the "no results" empty state clears everything. Select a row to ' +
          'see the quick filter yield the toolbar to the bulk-action bar.',
      },
    },
  },
  render: function FullFeaturedStory() {
    const [data, setData] = useState<Person[]>(makePeople());

    const bulkActions: BulkAction<Person>[] = [
      {
        id: 'delete-selected',
        label: 'Delete selected',
        icon: Trash2,
        color: 'danger',
        onClick: (selectedRows) => {
          const selectedIds = new Set(selectedRows.map((r) => r.id));
          setData((prev) => prev.filter((r) => !selectedIds.has(r.id)));
        },
      },
    ];

    return (
      <DataGrid<Person>
        columns={FULL_FEATURED_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        showRowNumbers={true}
        showDensity={true}
        selectable={true}
        bulkActions={bulkActions}
        showPagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 12]}
        showFilters={true}
        filterConfig={FILTER_CONFIG}
        quickFilters={FULL_FEATURED_QUICK_FILTERS}
      />
    );
  },
};

// ─── 14. PinnedFromMiddle ─────────────────────────────────────────────────────

export const PinnedFromMiddle: Story = {
  name: 'PinnedFromMiddle',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates that `pin` works correctly even when the column is **not** at the ' +
          'edge of the columns array. ' +
          '`department` (array index 2) has `pin: "left"` and `salary` (array index 4) ' +
          'has `pin: "right"` - the DataGrid reorders them to the edges automatically. ' +
          'The wrapper is capped at 500 px to force horizontal scroll so the frozen ' +
          'columns are clearly visible.',
      },
    },
  },
  render: function PinnedFromMiddleStory() {
    return (
      <div style={{ maxWidth: 500 }}>
        <DataGrid<Person>
          columns={PINNED_MID_COLUMNS}
          data={makePeople()}
          rowKey="id"
          onChange={() => {}}
          showRowNumbers
        />
      </div>
    );
  },
};

// ─── 16. Responsive card view ────────────────────────────────────────────────

const CARD_VIEW_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'name', header: 'Name', cardHeader: true },
  { key: 'role', header: 'Role', type: 'select', options: ROLE_OPTIONS, cardSubheader: true },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    options: DEPARTMENT_OPTIONS,
    sortable: true,
  },
  { key: 'salary', header: 'Salary', type: 'number', sortable: true },
  { key: 'active', header: 'Active', type: 'checkbox' },
  {
    key: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      { label: 'Edit', icon: Pencil, onClick: (person) => window.alert(`Edit ${person.name}`) },
      {
        label: 'Delete',
        icon: Trash2,
        danger: true,
        divider: true,
        onClick: (person) => window.alert(`Delete ${person.name}`),
      },
    ],
  },
];

export const ResponsiveCardView: Story = {
  args: {
    cardViewBreakpoint: 360,
  },

  name: 'Responsive card view',

  parameters: {
    docs: {
      description: {
        story:
          'With `hasCardView`, the grid measures its own container width (via ' +
          'ResizeObserver, not the viewport) and swaps the table for a card grid once it ' +
          'drops to/below `cardViewBreakpoint` (1000px here). Cards lay out with CSS ' +
          '`repeat(auto-fill, minmax(cardMinWidth, 1fr))`, so as many fit per row as the ' +
          'container allows instead of one per row regardless of available width - drag ' +
          'the resize handle at the bottom-right of the box below to see both the ' +
          'table/card swap and the per-row card count respond live. `name` is marked ' +
          '`cardHeader` and `role` `cardSubheader`, so they become the card title / ' +
          'subtitle instead of a label:value row like every other column. `actions` is a ' +
          "`type: 'actions'` column, always rendered top-right of the card (see the " +
          '"Row actions menu" story below for more on that column type). Pagination, ' +
          'filtering, sorting, selection, and inline cell editing all keep working exactly ' +
          'as in table mode.',
      },
    },
  },

  render: function ResponsiveCardViewStory() {
    return (
      <div
        style={{
          resize: 'horizontal',
          overflow: 'auto',
          width: 1000,
          maxWidth: '100%',
          border: '1px dashed var(--gray-300)',
          padding: 8,
        }}
      >
        <DataGrid<Person>
          columns={CARD_VIEW_COLUMNS}
          data={makePeople()}
          rowKey="id"
          onChange={() => {}}
          hasCardView
          cardViewBreakpoint={1000}
          cardMinWidth={240}
          selectable
          showRowNumbers
          showPagination
          pageSize={5}
        />
      </div>
    );
  },
};

// ─── 17. Row actions menu ─────────────────────────────────────────────────────

const ACTIONS_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', type: 'select', options: ROLE_OPTIONS },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    options: DEPARTMENT_OPTIONS,
  },
  { key: 'salary', header: 'Salary', type: 'number', sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      { label: 'Edit', icon: Pencil, onClick: (person) => window.alert(`Edit ${person.name}`) },
      {
        label: 'Deactivate',
        icon: ShieldOff,
        disabled: (person) => !person.active,
        onClick: (person) => window.alert(`Deactivate ${person.name}`),
      },
      {
        label: 'Delete',
        icon: Trash2,
        danger: true,
        divider: true,
        onClick: (person) => window.alert(`Delete ${person.name}`),
      },
    ],
  },
];

export const RowActionsMenu: Story = {
  name: 'Row actions menu',
  parameters: {
    docs: {
      description: {
        story:
          'A `type: \'actions\'` column renders a "more" (⋮) trigger instead of any data ' +
          "value - clicking it opens a menu built from that column's `actions` array " +
          '(label, `icon`, `onClick(row, index)`, and optionally `disabled` - a boolean or ' +
          'a `(row) => boolean` predicate, `danger` for destructive styling, and `divider` ' +
          'to place a separator directly above that item). Only one column may set ' +
          "`type: 'actions'`; it's always rendered at the far right in table mode " +
          'regardless of its position in `columns`, and (see the "Responsive card view" ' +
          'story) top-right of the card in card view. The trigger icon itself is ' +
          '`actionsIcon`-overridable, defaulting to the vertical 3-dot icon shown here. ' +
          '"Deactivate" is conditionally disabled per row via its `disabled` predicate - ' +
          'try it on an inactive person.',
      },
    },
  },
  render: function RowActionsMenuStory() {
    return (
      <DataGrid<Person> columns={ACTIONS_COLUMNS} data={makePeople()} rowKey="id" showRowNumbers />
    );
  },
};

// ─── 18. Row actions menu (renderActions escape hatch) ────────────────────────

const ADVANCED_ACTIONS_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', type: 'select', options: ROLE_OPTIONS },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    options: DEPARTMENT_OPTIONS,
  },
  { key: 'salary', header: 'Salary', type: 'number', sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    type: 'actions',
    // `renderActions` is an escape hatch for menu capabilities the simpler
    // `actions` array can't express - it hands you the row/index and expects
    // a full `MenuItemType[]` back, so you get everything `Menu` itself
    // supports: nested submenus, custom `component` items, and `shortcut`
    // labels. `actions` is ignored on this column since `renderActions` is set.
    renderActions: (person, index): MenuItemType[] => [
      {
        id: 'edit',
        type: 'item',
        label: 'Edit',
        icon: Pencil,
        shortcut: '⌘E',
        onClick: () => window.alert(`Edit ${person.name} (row ${index})`),
      },
      {
        id: 'move',
        type: 'nested',
        label: 'Move to department',
        icon: FolderInput,
        items: DEPARTMENT_OPTIONS.map((dept) => ({
          id: `move-${dept.value}`,
          type: 'item',
          label: dept.label,
          disabled: dept.value === person.department,
          onClick: () => window.alert(`Move ${person.name} to ${dept.label}`),
        })),
      },
      {
        id: 'contact',
        type: 'nested',
        label: 'Contact',
        items: [
          {
            id: 'contact-email',
            type: 'item',
            label: 'Send email',
            icon: Mail,
            onClick: () => window.alert(`Email ${person.name}`),
          },
          {
            id: 'contact-message',
            type: 'item',
            label: 'Send message',
            icon: MessageSquare,
            onClick: () => window.alert(`Message ${person.name}`),
          },
        ],
      },
      { id: 'status-separator', type: 'separator' },
      {
        id: 'status',
        type: 'component',
        component: (
          <Chip color={person.active ? 'success' : 'secondary'} variant="outlined" size="md">
            {person.active ? 'Active' : 'Inactive'}
          </Chip>
        ),
      },
      {
        id: 'delete',
        type: 'item',
        label: 'Delete',
        icon: Trash2,
        color: 'danger',
        onClick: () => window.alert(`Delete ${person.name}`),
      },
    ],
  },
];

export const RowActionsMenuAdvanced: Story = {
  name: 'Row actions menu (renderActions escape hatch)',
  parameters: {
    docs: {
      description: {
        story:
          "For menu capabilities the simple `actions` array can't express - " +
          'nested submenus, custom `component` content, or keyboard `shortcut` labels - ' +
          "set `renderActions: (row, index) => MenuItemType[]` on the `type: 'actions'` " +
          'column instead of `actions`. You build the full `MenuItemType[]` yourself (same ' +
          'type the standalone `Menu` component takes), so anything `Menu` supports works ' +
          'here too. This example shows "Move to department" and "Contact" as nested ' +
          'submenus, an `⌘E` shortcut on "Edit", a `type: \'component\'` item rendering a ' +
          "status `Badge`, and a `type: 'separator'` above it. `actions` is ignored on a " +
          'column that sets `renderActions`.',
      },
    },
  },
  render: function RowActionsMenuAdvancedStory() {
    return (
      <DataGrid<Person>
        columns={ADVANCED_ACTIONS_COLUMNS}
        data={makePeople()}
        rowKey="id"
        showRowNumbers
      />
    );
  },
};

// ─── 19. Expandable rows ──────────────────────────────────────────────────────

// Simulates fetching extra detail for a row on first expand - the point being
// that `renderExpandedContent` isn't called at all until a row is actually
// opened (see `useExpandAnimation` in DataGrid.component.tsx), so this
// "request" never fires for rows nobody expanded.
function PersonDetails({ person }: { person: Person }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [person.id]);

  if (loading) {
    return <div style={{ padding: '4px 0', color: 'var(--gray-500)' }}>Loading details…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
      <div>
        <strong>Email:</strong> {person.name.toLowerCase().replace(' ', '.')}@company.com
      </div>
      <div>
        <strong>Joined:</strong> {person.joinDate ?? 'Unknown'}
      </div>
      <div>
        <strong>Status:</strong> {person.active ? 'Active' : 'Inactive'}
      </div>
      <div>
        <strong>Notes:</strong> This is a sample note for {person.name}.
      </div>
    </div>
  );
}

const EXPANDABLE_COLUMNS: DataGridColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true, cardHeader: true },
  { key: 'role', header: 'Role', type: 'select', options: ROLE_OPTIONS, cardSubheader: true },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    options: DEPARTMENT_OPTIONS,
  },
  { key: 'salary', header: 'Salary', type: 'number', sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      { label: 'Edit', icon: Pencil, onClick: (person) => window.alert(`Edit ${person.name}`) },
    ],
  },
];

export const ExpandableRows: Story = {
  name: 'Expandable rows',
  parameters: {
    docs: {
      description: {
        story:
          'Set `expandable` plus `renderExpandedContent: (row, index) => ReactNode` to add a ' +
          'chevron that reveals extra per-row content - a dedicated column in table mode, a ' +
          'toolbar toggle in card mode (try shrinking this preview below the breakpoint here, ' +
          'since `hasCardView` is also on). Content is genuinely lazy: `renderExpandedContent` ' +
          'only runs the first time a given row is opened - see "Bob Martinez" (inactive) ' +
          'below, whose row has no chevron at all via `isRowExpandable`, and any other row for ' +
          'the ~600ms simulated fetch on first expand. `expandMultiple` (default `true`) allows ' +
          'any number of rows open at once; set it to `false` for accordion behaviour - opening ' +
          'one row auto-collapses whichever other row was open. Expansion state can also be ' +
          'controlled via `expandedRows`/`onExpandedRowsChange`, same pattern as `selectedRows`.',
      },
    },
  },
  render: function ExpandableRowsStory() {
    return (
      <DataGrid<Person>
        columns={EXPANDABLE_COLUMNS}
        data={makePeople()}
        rowKey="id"
        showRowNumbers
        expandable
        expandMultiple={false}
        isRowExpandable={(person) => person.active}
        renderExpandedContent={(person) => <PersonDetails person={person} />}
        hasCardView
        cardViewBreakpoint={480}
      />
    );
  },
};

// ─── 20. Quick filters ────────────────────────────────────────────────────────

export const WithQuickFilters: Story = {
  name: 'WithQuickFilters',
  parameters: {
    docs: {
      description: {
        story:
          'Always-visible filter controls on the left of the toolbar, one of each ' +
          'type: a `segmented` Department filter, a `multiple` `select` Role filter, ' +
          'and a searchable `combobox` Name filter. The Department control shows the ' +
          '"All" segment the grid always prepends - a SegmentedControl has no empty ' +
          'state of its own, so without it the filter could never be cleared. The ' +
          'select and combobox use their own `clearable` affordance instead. ' +
          'Quick filters compose with each other, and only sizing is configurable ' +
          'per filter (`width`) - `size`, `fullWidth`, and `className` are fixed by ' +
          'the grid so every control matches the rest of the toolbar.',
      },
    },
  },
  render: function WithQuickFiltersStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={FILTERABLE_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        quickFilters={QUICK_FILTERS}
      />
    );
  },
};

// ─── 21. Column alignment ─────────────────────────────────────────────────────

export const ColumnAlignment: Story = {
  name: 'ColumnAlignment',
  parameters: {
    docs: {
      description: {
        story:
          "Set `align` to `'left'` (the default), `'center'`, or `'right'` per " +
          'column - same values as `TableColumn.align`. It aligns the header and ' +
          'the cell content together, so a numeric column reads correctly ' +
          'right-aligned without its header drifting out of line. On a sortable ' +
          'column the sort icon follows the alignment rather than staying pinned ' +
          'to the far edge (try sorting Salary). Alignment applies in table mode ' +
          'only: card view renders each field as a label above its value, where ' +
          'aligning the value away from its own label reads as a misalignment.',
      },
    },
  },
  render: function ColumnAlignmentStory() {
    const [data, setData] = useState<Person[]>(makePeople());
    return (
      <DataGrid<Person>
        columns={ALIGNED_COLUMNS}
        data={data}
        rowKey="id"
        onChange={setData}
        hasCardView={false}
      />
    );
  },
};
