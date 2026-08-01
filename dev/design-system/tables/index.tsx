import { useState, useMemo, useCallback } from 'react';
import { Table } from '../../../src/components/Table';
import type { TableColumn, TableFilters } from '../../../src/components/Table';
import { Chip } from '../../../src/components/Chip';
import { Section, Col } from '../shared/Section';

// ─── Data ────────────────────────────────────────────────────────────────────

type Role = 'Admin' | 'Editor' | 'Viewer';
type Status = 'active' | 'inactive' | 'pending';
type Department = 'Engineering' | 'Design' | 'Product' | 'Marketing';

interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  department: Department;
  joinDate: string;
  score: number;
}

const ALL_USERS: UserRow[] = [
  { id: '1',  name: 'Alice Smith',    email: 'alice@example.com',    role: 'Admin',  status: 'active',   department: 'Engineering', joinDate: '2021-03-14', score: 95 },
  { id: '2',  name: 'Bob Jones',      email: 'bob@example.com',      role: 'Editor', status: 'active',   department: 'Design',      joinDate: '2022-07-01', score: 82 },
  { id: '3',  name: 'Carol White',    email: 'carol@example.com',    role: 'Viewer', status: 'inactive', department: 'Product',     joinDate: '2020-11-20', score: 54 },
  { id: '4',  name: 'Dave Brown',     email: 'dave@example.com',     role: 'Editor', status: 'active',   department: 'Marketing',   joinDate: '2023-01-08', score: 76 },
  { id: '5',  name: 'Eve Davis',      email: 'eve@example.com',      role: 'Viewer', status: 'inactive', department: 'Engineering', joinDate: '2021-09-30', score: 41 },
  { id: '6',  name: 'Frank Miller',   email: 'frank@example.com',    role: 'Admin',  status: 'active',   department: 'Product',     joinDate: '2019-06-17', score: 88 },
  { id: '7',  name: 'Grace Lee',      email: 'grace@example.com',    role: 'Editor', status: 'pending',  department: 'Design',      joinDate: '2023-05-22', score: 67 },
  { id: '8',  name: 'Henry Wilson',   email: 'henry@example.com',    role: 'Viewer', status: 'active',   department: 'Engineering', joinDate: '2022-02-14', score: 73 },
  { id: '9',  name: 'Isla Moore',     email: 'isla@example.com',     role: 'Editor', status: 'active',   department: 'Marketing',   joinDate: '2020-08-05', score: 90 },
  { id: '10', name: 'Jack Taylor',    email: 'jack@example.com',     role: 'Viewer', status: 'pending',  department: 'Product',     joinDate: '2023-11-01', score: 58 },
  { id: '11', name: 'Karen Anderson', email: 'karen@example.com',    role: 'Admin',  status: 'active',   department: 'Engineering', joinDate: '2018-04-25', score: 99 },
  { id: '12', name: 'Liam Thomas',    email: 'liam@example.com',     role: 'Editor', status: 'inactive', department: 'Design',      joinDate: '2021-12-03', score: 45 },
  { id: '13', name: 'Mia Jackson',    email: 'mia@example.com',      role: 'Viewer', status: 'active',   department: 'Marketing',   joinDate: '2022-10-18', score: 63 },
  { id: '14', name: 'Noah Harris',    email: 'noah@example.com',     role: 'Editor', status: 'active',   department: 'Product',     joinDate: '2023-03-07', score: 79 },
  { id: '15', name: 'Olivia Martin',  email: 'olivia@example.com',   role: 'Viewer', status: 'pending',  department: 'Engineering', joinDate: '2020-05-11', score: 37 },
  { id: '16', name: 'Paul Garcia',    email: 'paul@example.com',     role: 'Admin',  status: 'active',   department: 'Design',      joinDate: '2019-09-29', score: 92 },
  { id: '17', name: 'Quinn Martinez', email: 'quinn@example.com',    role: 'Editor', status: 'inactive', department: 'Marketing',   joinDate: '2022-04-16', score: 50 },
  { id: '18', name: 'Rachel Robinson',email: 'rachel@example.com',   role: 'Viewer', status: 'active',   department: 'Engineering', joinDate: '2021-07-23', score: 84 },
  { id: '19', name: 'Sam Clark',      email: 'sam@example.com',      role: 'Editor', status: 'active',   department: 'Product',     joinDate: '2023-08-12', score: 71 },
  { id: '20', name: 'Tina Lewis',     email: 'tina@example.com',     role: 'Viewer', status: 'pending',  department: 'Design',      joinDate: '2020-01-30', score: 60 },
];

// ─── Shared column definitions ────────────────────────────────────────────────

const statusChip = (v: unknown) => {
  const status = v as Status;
  const colorMap: Record<Status, 'success' | 'warning' | 'secondary'> = {
    active: 'success',
    pending: 'warning',
    inactive: 'secondary',
  };
  return (
    <Chip color={colorMap[status]} size="small" variant="soft">
      {status}
    </Chip>
  );
};

const basicColumns: TableColumn<UserRow>[] = [
  { key: 'name',   label: 'Name' },
  { key: 'email',  label: 'Email' },
  { key: 'role',   label: 'Role' },
  { key: 'status', label: 'Status', render: statusChip },
];

const sortableColumns: TableColumn<UserRow>[] = [
  { key: 'name',   label: 'Name',   sortable: true },
  { key: 'email',  label: 'Email',  sortable: true },
  { key: 'role',   label: 'Role',   sortable: true },
  { key: 'status', label: 'Status', sortable: true, render: statusChip },
];

const filterColumns: TableColumn<UserRow>[] = [
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
    key: 'status',
    label: 'Status',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { id: 'active',   value: 'active',   label: 'Active' },
      { id: 'inactive', value: 'inactive', label: 'Inactive' },
      { id: 'pending',  value: 'pending',  label: 'Pending' },
    ],
    render: statusChip,
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
  {
    key: 'score',
    label: 'Score',
  },
];

const scoreBar = (v: unknown) => {
  const score = v as number;
  return (
    <div
      title={`${score}/100`}
      style={{
        width: '100%',
        maxWidth: '6rem',
        height: '6px',
        borderRadius: '9999px',
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${score}%`,
          borderRadius: '9999px',
          backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
        }}
      />
    </div>
  );
};

const fullColumns: TableColumn<UserRow>[] = [
  { key: 'name',       label: 'Name',       sortable: true, filterable: true, filterType: 'text' },
  { key: 'role',       label: 'Role',       sortable: true, filterable: true, filterType: 'select',
    filterOptions: [
      { id: 'admin',  value: 'Admin',  label: 'Admin' },
      { id: 'editor', value: 'Editor', label: 'Editor' },
      { id: 'viewer', value: 'Viewer', label: 'Viewer' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { id: 'active',   value: 'active',   label: 'Active' },
      { id: 'inactive', value: 'inactive', label: 'Inactive' },
      { id: 'pending',  value: 'pending',  label: 'Pending' },
    ],
    render: statusChip,
  },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'joinDate',   label: 'Join Date',  sortable: true },
  { key: 'score',      label: 'Score',      sortable: true, render: scoreBar },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SortableTable = () => {
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const sortedData = useMemo<UserRow[]>(() => {
    return [...ALL_USERS].sort((a, b) => {
      const aVal = a[sortKey as keyof UserRow] ?? '';
      const bVal = b[sortKey as keyof UserRow] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortKey, sortDir]);

  return (
    <Section label="Sortable">
      <Table<UserRow>
        data={sortedData}
        columns={sortableColumns}
        onSortChange={handleSortChange}
        currentSort={{ key: sortKey, direction: sortDir }}
      />
    </Section>
  );
};

const FilterableTable = () => {
  const [filters, setFilters] = useState<TableFilters>({});

  const filteredData = useMemo<UserRow[]>(() => {
    return ALL_USERS.filter((row) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value || value === '') continue;
        const cell = String(row[key as keyof UserRow] ?? '');
        if (typeof value === 'string') {
          if (!cell.toLowerCase().includes(value.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [filters]);

  return (
    <Section label="With Filters">
      <Table<UserRow>
        data={filteredData}
        columns={filterColumns}
        showFilters
        filters={filters}
        onFiltersChange={setFilters}
      />
    </Section>
  );
};

const FullFeaturedTable = () => {
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<TableFilters>({});

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const processedData = useMemo<UserRow[]>(() => {
    const filtered = ALL_USERS.filter((row) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value || value === '') continue;
        const cell = String(row[key as keyof UserRow] ?? '');
        if (typeof value === 'string') {
          if (!cell.toLowerCase().includes(value.toLowerCase())) return false;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const aVal = a[sortKey as keyof UserRow] ?? '';
      const bVal = b[sortKey as keyof UserRow] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortKey, sortDir, filters]);

  const handleRowClick = useCallback((row: UserRow) => {
    alert(`Clicked: ${row.name}`);
  }, []);

  return (
    <Section label="Full Featured">
      <Table<UserRow>
        data={processedData}
        columns={fullColumns}
        showFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSortChange={handleSortChange}
        currentSort={{ key: sortKey, direction: sortDir }}
        showPagination
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        showFooter
        onRowClick={handleRowClick}
      />
    </Section>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const TableShowcase = () => (
  <Col gap="1.5rem">
    <Section label="Basic">
      <Table<UserRow>
        data={ALL_USERS.slice(0, 5)}
        columns={basicColumns}
      />
    </Section>

    <SortableTable />

    <Section label="With Pagination">
      <Table<UserRow>
        data={ALL_USERS}
        columns={basicColumns}
        showPagination
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        showFooter
      />
    </Section>

    <FilterableTable />

    <FullFeaturedTable />

    <Section label="Loading">
      <Table<UserRow>
        data={[]}
        columns={basicColumns}
        loading
      />
    </Section>

    <Section label="Empty State">
      <Table<UserRow>
        data={[]}
        columns={basicColumns}
        emptyMessage="No users match your search"
      />
    </Section>
  </Col>
);
