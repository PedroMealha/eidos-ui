import { useState } from 'react';
import { DataGrid } from '../../../src/components/DataGrid';
import type { DataGridColumn } from '../../../src/components/DataGrid';
import { Section, Col } from '../shared/Section';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  department: string;
  level: string;
  salary: number;
  remote: boolean;
}

interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toOptions = (values: string[]) =>
  values.map((v) => ({ value: v, label: v }));

// ─── Column definitions ───────────────────────────────────────────────────────

const employeeColumns: DataGridColumn<Employee>[] = [
  { key: 'id',         header: 'ID',         type: 'readonly', width: 60 },
  { key: 'name',       header: 'Name',       type: 'text',     minWidth: 160, required: true },
  { key: 'email',      header: 'Email',      type: 'text',     minWidth: 200 },
  {
    key: 'department',
    header: 'Department',
    type: 'select',
    minWidth: 140,
    options: toOptions(['Engineering', 'Design', 'Product', 'Marketing', 'Sales']),
  },
  {
    key: 'level',
    header: 'Level',
    type: 'select',
    minWidth: 120,
    options: toOptions(['Junior', 'Mid', 'Senior', 'Lead', 'Principal']),
  },
  {
    key: 'salary',
    header: 'Salary ($)',
    type: 'number',
    minWidth: 120,
    validate: (value) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? true : 'Salary must be greater than 0';
    },
  },
  { key: 'remote', header: 'Remote', type: 'checkbox', width: 80 },
];

const productColumns: DataGridColumn<Product>[] = [
  { key: 'id',     header: 'ID',    type: 'readonly', width: 60 },
  { key: 'name',   header: 'Name',  type: 'text',     minWidth: 160, required: true },
  {
    key: 'price',
    header: 'Price ($)',
    type: 'number',
    minWidth: 110,
    validate: (value) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? true : 'Price must be 0 or greater';
    },
  },
  { key: 'stock',  header: 'Stock',  type: 'number',   minWidth: 90 },
  { key: 'active', header: 'Active', type: 'checkbox', width: 70 },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alice Martin',  email: 'alice@company.io',   department: 'Engineering', level: 'Senior',    salary: 120000, remote: true  },
  { id: 2, name: 'Bob Chen',      email: 'bob@company.io',     department: 'Design',      level: 'Mid',       salary: 90000,  remote: false },
  { id: 3, name: 'Carol White',   email: 'carol@company.io',   department: 'Product',     level: 'Lead',      salary: 135000, remote: true  },
  { id: 4, name: 'David Kim',     email: 'david@company.io',   department: 'Engineering', level: 'Junior',    salary: 70000,  remote: false },
  { id: 5, name: 'Eva Torres',    email: 'eva@company.io',     department: 'Marketing',   level: 'Mid',       salary: 85000,  remote: true  },
  { id: 6, name: 'Frank Lee',     email: 'frank@company.io',   department: 'Sales',       level: 'Senior',    salary: 105000, remote: false },
  { id: 7, name: 'Grace Patel',   email: 'grace@company.io',   department: 'Engineering', level: 'Principal', salary: 165000, remote: true  },
  { id: 8, name: 'Henry Brown',   email: 'henry@company.io',   department: 'Design',      level: 'Senior',    salary: 110000, remote: true  },
];

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: 149.99, stock: 82,  active: true  },
  { id: 2, name: 'Mechanical Keyboard', price: 229.00, stock: 45,  active: true  },
  { id: 3, name: 'USB-C Hub',           price: 59.99,  stock: 130, active: true  },
  { id: 4, name: 'Monitor Stand',       price: 89.00,  stock: 0,   active: false },
  { id: 5, name: 'Webcam HD',           price: 99.50,  stock: 27,  active: true  },
];

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const DataGridShowcase = () => {
  const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
  const [products]                = useState<Product[]>(SEED_PRODUCTS);

  let nextId = employees.reduce((max, e) => Math.max(max, e.id), 0) + 1;

  const handleAddEmployee = (): Employee => {
    const newRow: Employee = {
      id:         nextId++,
      name:       '',
      email:      '',
      department: 'Engineering',
      level:      'Junior',
      salary:     50000,
      remote:     false,
    };
    return newRow;
  };

  const handleDeleteEmployee = (row: Employee, index: number) => {
    console.log(`Deleted employee at row ${index}:`, row);
  };

  return (
    <Col gap="1.5rem">
      {/* 1 — Employee directory (full-featured) */}
      <Section label="Employee Directory – click any cell to edit inline">
        <DataGrid<Employee>
          columns={employeeColumns}
          data={employees}
          rowKey="id"
          onChange={setEmployees}
          onRowAdd={handleAddEmployee}
          onRowDelete={handleDeleteEmployee}
          showRowNumbers
        />
      </Section>

      {/* 2 — Product catalog (simple, no add/delete) */}
      <Section label="Product Catalog – basic editable grid">
        <DataGrid<Product>
          columns={productColumns}
          data={products}
          rowKey="id"
          onChange={() => {}}
        />
      </Section>

      {/* 3 — Read-only view */}
      <Section label="Read-only Table – editable={false}">
        <DataGrid<Employee>
          columns={employeeColumns}
          data={SEED_EMPLOYEES}
          rowKey="id"
          editable={false}
          onChange={() => {}}
        />
      </Section>

      {/* 4 — Loading state */}
      <Section label="Loading State">
        <DataGrid<Employee>
          columns={employeeColumns}
          data={[]}
          rowKey="id"
          loading
          onChange={() => {}}
        />
      </Section>
    </Col>
  );
};
