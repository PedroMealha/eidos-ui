import { useState, useMemo, useCallback } from 'react';
import { Table } from '../../../src/components/Table';
import type { TableColumn, TableFilters, BulkAction } from '../../../src/components/Table';
import { Chip } from '../../../src/components/Chip';
import { Trash2, Mail, Download } from 'lucide-react';
import { Section, Col } from '../shared/Section';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role       = 'Admin' | 'Editor' | 'Viewer';
type Status     = 'active' | 'inactive' | 'pending';
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

// ─── Dataset (15 rows, 8 columns) ─────────────────────────────────────────────

const ALL_USERS: UserRow[] = [
  { id: '1',  name: 'Alice Smith',     email: 'alice@example.com',   role: 'Admin',  status: 'active',   department: 'Engineering', joinDate: '2021-03-14', score: 95 },
  { id: '2',  name: 'Bob Jones',       email: 'bob@example.com',     role: 'Editor', status: 'active',   department: 'Design',      joinDate: '2022-07-01', score: 82 },
  { id: '3',  name: 'Carol White',     email: 'carol@example.com',   role: 'Viewer', status: 'inactive', department: 'Product',     joinDate: '2020-11-20', score: 54 },
  { id: '4',  name: 'Dave Brown',      email: 'dave@example.com',    role: 'Editor', status: 'active',   department: 'Marketing',   joinDate: '2023-01-08', score: 76 },
  { id: '5',  name: 'Eve Davis',       email: 'eve@example.com',     role: 'Viewer', status: 'inactive', department: 'Engineering', joinDate: '2021-09-30', score: 41 },
  { id: '6',  name: 'Frank Miller',    email: 'frank@example.com',   role: 'Admin',  status: 'active',   department: 'Product',     joinDate: '2019-06-17', score: 88 },
  { id: '7',  name: 'Grace Lee',       email: 'grace@example.com',   role: 'Editor', status: 'pending',  department: 'Design',      joinDate: '2023-05-22', score: 67 },
  { id: '8',  name: 'Henry Wilson',    email: 'henry@example.com',   role: 'Viewer', status: 'active',   department: 'Engineering', joinDate: '2022-02-14', score: 73 },
  { id: '9',  name: 'Isla Moore',      email: 'isla@example.com',    role: 'Editor', status: 'active',   department: 'Marketing',   joinDate: '2020-08-05', score: 90 },
  { id: '10', name: 'Jack Taylor',     email: 'jack@example.com',    role: 'Viewer', status: 'pending',  department: 'Product',     joinDate: '2023-11-01', score: 58 },
  { id: '11', name: 'Karen Anderson',  email: 'karen@example.com',   role: 'Admin',  status: 'active',   department: 'Engineering', joinDate: '2018-04-25', score: 99 },
  { id: '12', name: 'Liam Thomas',     email: 'liam@example.com',    role: 'Editor', status: 'inactive', department: 'Design',      joinDate: '2021-12-03', score: 45 },
  { id: '13', name: 'Mia Jackson',     email: 'mia@example.com',     role: 'Viewer', status: 'active',   department: 'Marketing',   joinDate: '2022-10-18', score: 63 },
  { id: '14', name: 'Noah Harris',     email: 'noah@example.com',    role: 'Editor', status: 'active',   department: 'Product',     joinDate: '2023-03-07', score: 79 },
  { id: '15', name: 'Olivia Martin',   email: 'olivia@example.com',  role: 'Viewer', status: 'pending',  department: 'Engineering', joinDate: '2020-05-11', score: 37 },
];

// ─── Renderers ────────────────────────────────────────────────────────────────

const statusChip = (v: unknown) => {
  const status = v as Status;
  const colorMap: Record<Status, 'success' | 'warning' | 'secondary'> = {
    active:   'success',
    pending:  'warning',
    inactive: 'secondary',
  };
  return (
    <Chip color={colorMap[status]} size="small" variant="soft">
      {status}
    </Chip>
  );
};

const scoreBar = (v: unknown) => {
  const score = v as number;
  return (
    <div
      title={`${score}/100`}
      style={{ width: '100%', maxWidth: '5rem', height: '6px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}
    >
      <div style={{
        height: '100%',
        width: `${score}%`,
        borderRadius: '9999px',
        backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
      }} />
    </div>
  );
};

// ─── Column definitions ───────────────────────────────────────────────────────

const fullColumns: TableColumn<UserRow>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
    filterType: 'text',
    pin: 'left',
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    width: '220px',
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
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
  {
    key: 'department',
    label: 'Department',
    sortable: true,
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
    key: 'joinDate',
    label: 'Join Date',
    sortable: true,
    width: '120px',
  },
  {
    key: 'score',
    label: 'Score',
    sortable: true,
    align: 'center',
    render: scoreBar,
    width: '80px',
  },
];

// ─── Bulk actions ─────────────────────────────────────────────────────────────

const buildBulkActions = (
  setData: React.Dispatch<React.SetStateAction<UserRow[]>>,
  setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>,
  setLastAction: React.Dispatch<React.SetStateAction<string | null>>,
): BulkAction<UserRow>[] => [
  {
    id: 'email',
    label: 'Send Email',
    icon: Mail,
    color: 'primary',
    variant: 'outlined',
    onClick: (rows) =>
      setLastAction(`Email sent to ${rows.length} user(s): ${rows.map(r => r.name).join(', ')}`),
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    color: 'secondary',
    variant: 'outlined',
    onClick: (rows) => setLastAction(`Exported ${rows.length} row(s)`),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: 'danger',
    variant: 'outlined',
    onClick: (rows) => {
      const ids = new Set(rows.map(r => r.id));
      setData(prev => prev.filter(r => !ids.has(r.id)));
      setSelectedKeys([]);
      setLastAction(`Deleted ${rows.length} user(s)`);
    },
  },
];

// ─── Section 1: Full Featured Table ──────────────────────────────────────────

const FullFeaturedTable = () => {
  const [data, setData] = useState<UserRow[]>(ALL_USERS);
  const [sortKey, setSortKey]     = useState<string>('name');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters]     = useState<TableFilters>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [orderedCols, setOrderedCols]   = useState<TableColumn<UserRow>[]>(fullColumns);
  const [lastAction, setLastAction]     = useState<string | null>(null);

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const processedData = useMemo<UserRow[]>(() => {
    const filtered = data.filter(row => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === '' || value === undefined || value === null) continue;
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
      const cmp  = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, filters]);

  const bulkActions = useMemo(
    () => buildBulkActions(setData, setSelectedKeys, setLastAction),
    [],
  );

  return (
    <Section label="Full Featured Table">
      <Col gap="0.75rem">
        <Table<UserRow>
          data={processedData}
          columns={orderedCols}
          rowKey="id"
          // Sorting
          onSortChange={handleSortChange}
          currentSort={{ key: sortKey, direction: sortDir }}
          // Filtering
          showFilters
          filters={filters}
          onFiltersChange={setFilters}
          // Pagination
          showPagination
          pageSize={5}
          pageSizeOptions={[5, 10, 15]}
          showFooter
          // Row selection + bulk actions
          selectable
          selectedRows={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(keys)}
          bulkActions={bulkActions}
          // Column management
          showColumnVisibility
          showExport
          showDensity
          draggableColumns
          onColumnReorder={setOrderedCols}
        />

        {lastAction && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Last action: <strong>{lastAction}</strong>
          </p>
        )}

        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
          ↔ Scroll horizontally to see the pinned <strong>Name</strong> column stay fixed.
          Drag column headers to reorder. Use the toolbar to toggle visibility, export CSV, or filter rows.
        </p>
      </Col>
    </Section>
  );
};

// ─── Section 2: Empty State ───────────────────────────────────────────────────

const EmptyStateSection = () => (
  <Section label="Empty State">
    <Table<UserRow>
      data={[]}
      columns={fullColumns}
      emptyMessage="No users found — try adjusting your filters"
    />
  </Section>
);

// ─── Main export ──────────────────────────────────────────────────────────────

export const TableShowcase = () => (
  <Col gap="1.5rem">
    <FullFeaturedTable />
    <EmptyStateSection />
  </Col>
);
