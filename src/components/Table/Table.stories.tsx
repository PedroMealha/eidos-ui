import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table.component';
import { useState, useMemo } from 'react';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { Menu } from '../Menu';
import { Edit, Trash2, Eye, UserCircle, MoreVertical } from 'lucide-react';
import type { TableColumn } from './Table.types';

// Sample data type. A plain interface: an index signature would widen
// `keyof User` to `string` and disable column-key checking.
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastLogin: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-03-20',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'User',
    status: 'active',
    joinDate: '2024-02-20',
    lastLogin: '2024-03-19',
  },
  {
    id: 3,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Editor',
    status: 'inactive',
    joinDate: '2024-01-10',
    lastLogin: '2024-03-10',
  },
  {
    id: 4,
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Admin',
    status: 'active',
    joinDate: '2024-03-01',
    lastLogin: '2024-03-21',
  },
  {
    id: 5,
    name: 'Eve Martinez',
    email: 'eve@example.com',
    role: 'User',
    status: 'pending',
    joinDate: '2024-03-15',
    lastLogin: '2024-03-18',
  },
  {
    id: 6,
    name: 'Frank Wilson',
    email: 'frank@example.com',
    role: 'User',
    status: 'active',
    joinDate: '2024-02-05',
    lastLogin: '2024-03-20',
  },
  {
    id: 7,
    name: 'Grace Lee',
    email: 'grace@example.com',
    role: 'Editor',
    status: 'active',
    joinDate: '2024-01-20',
    lastLogin: '2024-03-21',
  },
  {
    id: 8,
    name: 'Henry Davis',
    email: 'henry@example.com',
    role: 'User',
    status: 'inactive',
    joinDate: '2024-03-10',
    lastLogin: '2024-03-15',
  },
];

const meta: Meta<typeof Table<User>> = {
  title: 'Data/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive table component with sorting, pagination, filtering, and customizable columns. Supports server-side data handling.',
      },
    },
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading state with spinner',
      table: { defaultValue: { summary: 'false' } },
    },
    emptyMessage: {
      control: 'text',
      description: 'Message shown when data array is empty',
      table: { defaultValue: { summary: "'No data available'" } },
    },
    showFooter: {
      control: 'boolean',
      description: 'Show the footer row (item count etc.)',
      table: { defaultValue: { summary: 'false' } },
    },
    showPagination: {
      control: 'boolean',
      description: 'Enable client-side pagination controls',
      table: { defaultValue: { summary: 'false' } },
    },
    pageSize: {
      control: { type: 'select' },
      options: [10, 25, 50, 100],
      description: 'Number of rows per page',
      table: { defaultValue: { summary: '25' } },
    },
    showFilters: {
      control: 'boolean',
      description: 'Show the column-filter toolbar',
      table: { defaultValue: { summary: 'false' } },
    },
    // Non-controllable props
    data: { control: false },
    columns: { control: false },
    onRowClick: { control: false },
    currentSort: { control: false },
    onSortChange: { control: false },
    filters: { control: false },
    onFiltersChange: { control: false },
    defaultFilters: { control: false },
    totalItems: { control: false },
    pageSizeOptions: { control: false },
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Shared columns definition used by the Default (args-driven) story.
const defaultColumns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
];

export const Default: Story = {
  name: 'Default (interactive controls)',
  args: {
    loading: false,
    emptyMessage: 'No data available',
    showFooter: false,
    showPagination: false,
    pageSize: 25,
    showFilters: false,
  },
  // Destructure out data/columns from args (they're not user-controlled) so
  // spreading the remainder alongside our fixed values doesn't duplicate props.
  render: ({ data: _d, columns: _c, ...rest }) => (
    <div style={{ width: '100%' }}>
      <Table data={sampleUsers} columns={defaultColumns} {...rest} />
    </div>
  ),
};

// Basic table
export const Basic: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table data={sampleUsers} columns={columns} />
      </div>
    );
  },
};

// With custom rendering
export const WithCustomRendering: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table data={sampleUsers} columns={columns} />
      </div>
    );
  },
};

// With sorting
export const WithSorting: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<keyof User & string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'joinDate', label: 'Join Date', sortable: true },
    ];

    // Simulate what a server would return after receiving the sort params.
    const sortedData = useMemo(() => {
      return [...sampleUsers].sort((a, b) => {
        const aVal = String(a[sortKey as keyof User] ?? '');
        const bVal = String(b[sortKey as keyof User] ?? '');
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }, [sortKey, sortDirection]);

    return (
      <div style={{ width: '100%' }}>
        <Table
          data={sortedData}
          columns={columns}
          currentSort={{ key: sortKey, direction: sortDirection }}
          onSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
        />
      </div>
    );
  },
};

// With pagination
export const WithPagination: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      {
        key: 'status',
        label: 'Status',
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table
          data={sampleUsers}
          columns={columns}
          showFooter={true}
          showPagination={true}
          pageSize={3}
          pageSizeOptions={[3, 5, 10]}
        />
      </div>
    );
  },
};

// With filters
export const WithFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState({});

    const columns: TableColumn<User>[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
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
          { id: 'user', value: 'User', label: 'User' },
          { id: 'editor', value: 'Editor', label: 'Editor' },
        ],
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
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
      {
        key: 'joinDate',
        label: 'Join Date',
        filterable: true,
        filterType: 'date',
        dateFilterMode: 'range',
      },
    ];

    // Apply filters to data (client-side filtering for demo purposes)
    const filteredData = sampleUsers.filter((user) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const userValue = user[key as keyof User];

        // Text filter
        if (typeof value === 'string') {
          return String(userValue).toLowerCase().includes(value.toLowerCase());
        }

        // Date range filter
        if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
          const dateValue = new Date(userValue as string);
          const rangeValue = value as { start: string | null; end: string | null };
          if (rangeValue.start && new Date(rangeValue.start) > dateValue) return false;
          if (rangeValue.end && new Date(rangeValue.end) < dateValue) return false;
          return true;
        }

        return true;
      });
    });

    return (
      <div style={{ width: '100%' }}>
        <Table
          data={filteredData}
          columns={columns}
          filters={filters}
          onFiltersChange={setFilters}
          showFilters={true}
          showFooter={true}
        />
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          <strong>Active Filters:</strong>{' '}
          {Object.keys(filters).length > 0 ? JSON.stringify(filters, null, 2) : 'None'}
        </div>
      </div>
    );
  },
};

// With actions menu
export const WithActionsMenu: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      {
        key: 'id',
        label: '',
        type: 'icon',
        render: () => <UserCircle size={20} />,
      },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
      {
        key: 'actions',
        label: '',
        type: 'icon',
        align: 'center',
        render: (_value, item) => (
          <Menu
            trigger={<Button icon={MoreVertical} variant="text" size="sm" />}
            items={[
              {
                id: 'view',
                type: 'item',
                label: 'View',
                icon: Eye,
                onClick: () => alert(`View user ${item.name}`),
              },
              {
                id: 'edit',
                type: 'item',
                label: 'Edit',
                icon: Edit,
                onClick: () => alert(`Edit user ${item.name}`),
              },
              { id: 'sep-1', type: 'separator' },
              {
                id: 'delete',
                type: 'item',
                label: 'Delete',
                icon: Trash2,
                onClick: () => alert(`Delete user ${item.name}`),
              },
            ]}
          />
        ),
      },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table data={sampleUsers} columns={columns} />
      </div>
    );
  },
};

// With clickable rows
export const WithClickableRows: Story = {
  render: () => {
    const [lastClicked, setLastClicked] = useState<User | null>(null);

    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      {
        key: 'status',
        label: 'Status',
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table data={sampleUsers} columns={columns} onRowClick={(user) => setLastClicked(user)} />
        {lastClicked && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <strong>Last clicked:</strong> {lastClicked.name} ({lastClicked.email})
          </div>
        )}
      </div>
    );
  },
};

// Loading state
export const LoadingState: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table data={[]} columns={columns} loading={true} />
      </div>
    );
  },
};

// Empty state
export const EmptyState: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
    ];

    return (
      <div style={{ width: '100%' }}>
        <Table
          data={[]}
          columns={columns}
          emptyMessage="No users found. Try adjusting your filters or create a new user."
        />
      </div>
    );
  },
};

// Complete example
export const Examples: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<keyof User & string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filters, setFilters] = useState({});

    const columns: TableColumn<User>[] = [
      {
        key: 'id',
        label: '',
        type: 'icon',
        render: () => <UserCircle size={20} />,
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        filterable: true,
        filterType: 'text',
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { id: 'admin', value: 'Admin', label: 'Admin' },
          { id: 'user', value: 'User', label: 'User' },
          { id: 'editor', value: 'Editor', label: 'Editor' },
        ],
      },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { id: 'active', value: 'active', label: 'Active' },
          { id: 'inactive', value: 'inactive', label: 'Inactive' },
          { id: 'pending', value: 'pending', label: 'Pending' },
        ],
        render: (value) => {
          const status = value as User['status'];
          return (
            <Chip
              color={status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'warning'}
              size="sm"
            >
              {status}
            </Chip>
          );
        },
      },
      {
        key: 'joinDate',
        label: 'Join Date',
        sortable: true,
        filterable: true,
        filterType: 'date',
        dateFilterMode: 'range',
      },
      {
        key: 'actions',
        label: '',
        type: 'icon',
        align: 'center',
        render: (_value, item) => (
          <Menu
            trigger={<Button icon={MoreVertical} variant="text" size="sm" />}
            items={[
              {
                id: 'view',
                type: 'item',
                label: 'View',
                icon: Eye,
                onClick: () => alert(`View user ${item.name}`),
              },
              {
                id: 'edit',
                type: 'item',
                label: 'Edit',
                icon: Edit,
                onClick: () => alert(`Edit user ${item.name}`),
              },
              { id: 'sep-1', type: 'separator' },
              {
                id: 'delete',
                type: 'item',
                label: 'Delete',
                icon: Trash2,
                onClick: () => alert(`Delete user ${item.name}`),
              },
            ]}
          />
        ),
      },
    ];

    // Apply filters (client-side for demo)
    let processedData = sampleUsers.filter((user) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const userValue = user[key as keyof User];

        // Text filter
        if (typeof value === 'string') {
          return String(userValue).toLowerCase().includes(value.toLowerCase());
        }

        // Date range filter
        if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
          const dateValue = new Date(userValue as string);
          const rangeValue = value as { start: string | null; end: string | null };
          if (rangeValue.start && new Date(rangeValue.start) > dateValue) return false;
          if (rangeValue.end && new Date(rangeValue.end) < dateValue) return false;
          return true;
        }

        return true;
      });
    });

    // Apply sorting (client-side for demo)
    processedData = [...processedData].sort((a, b) => {
      const aValue = String(a[sortKey as keyof User]);
      const bValue = String(b[sortKey as keyof User]);
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return (
      <div style={{ width: '100%' }}>
        <Table
          data={processedData}
          columns={columns}
          currentSort={{ key: sortKey, direction: sortDirection }}
          onSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          filters={filters}
          onFiltersChange={setFilters}
          showFilters={true}
          showFooter={true}
          showPagination={true}
          pageSize={3}
          pageSizeOptions={[3, 5, 10]}
          totalItems={sampleUsers.length}
          onRowClick={(user) => console.log('Clicked:', user)}
        />
      </div>
    );
  },
};
