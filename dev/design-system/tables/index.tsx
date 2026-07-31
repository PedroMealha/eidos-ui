import React from 'react';
import { Table } from '../../../src/components/Table';
import { Chip } from '../../../src/components/Chip';
import { Section } from '../shared/Section';

interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
  {
    key: 'status',
    label: 'Status',
    render: (v: unknown) => (
      <Chip
        color={(v as string) === 'active' ? 'success' : 'secondary'}
        size="small"
        variant="soft"
      >
        {v as string}
      </Chip>
    ),
  },
];

const data: UserRow[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'inactive' },
  { id: '4', name: 'Dave Brown', email: 'dave@example.com', role: 'Editor', status: 'active' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Viewer', status: 'inactive' },
];

export const TableShowcase = () => {
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
  };

  const sortedData = React.useMemo<UserRow[]>(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof UserRow] ?? '';
      const bVal = b[sortKey as keyof UserRow] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortKey, sortDir]);

  return (
    <Section label="Users">
      <Table<UserRow>
        data={sortedData}
        columns={columns}
        showPagination
        pageSize={3}
        onSortChange={handleSortChange}
        currentSort={{ key: sortKey, direction: sortDir }}
      />
    </Section>
  );
};
