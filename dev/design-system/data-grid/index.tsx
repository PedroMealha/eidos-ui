import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DataGrid } from '../../../src/components/DataGrid';
import type { DataGridColumn, BulkAction } from '../../../src/components/DataGrid';
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

// ─── Column definitions ───────────────────────────────────────────────────────

const toSelectOptions = (values: string[]) =>
	values.map(v => ({ value: v, label: v }));

const toFilterOptions = (values: string[]) =>
	values.map(v => ({ id: v, value: v, label: v }));

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'];
const LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'];

const employeeColumns: DataGridColumn<Employee>[] = [
	{
		key: 'id',
		header: 'ID',
		type: 'readonly',
		width: 60,
		pin: 'left',
	},
	{
		key: 'name',
		header: 'Name',
		type: 'text',
		minWidth: 160,
		required: true,
		sortable: true,
		filterable: true,
		filterType: 'text',
	},
	{
		key: 'email',
		header: 'Email',
		type: 'text',
		minWidth: 200,
		filterable: true,
		filterType: 'text',
	},
	{
		key: 'department',
		header: 'Department',
		type: 'select',
		minWidth: 140,
		options: toSelectOptions(DEPARTMENTS),
		sortable: true,
		filterable: true,
		filterType: 'select',
		filterOptions: toFilterOptions(DEPARTMENTS),
	},
	{
		key: 'level',
		header: 'Level',
		type: 'select',
		minWidth: 120,
		options: toSelectOptions(LEVELS),
		sortable: true,
		filterable: true,
		filterType: 'select',
		filterOptions: toFilterOptions(LEVELS),
	},
	{
		key: 'salary',
		header: 'Salary ($)',
		type: 'number',
		minWidth: 120,
		sortable: true,
		validate: value => {
			const n = Number(value);
			return Number.isFinite(n) && n > 0 ? true : 'Salary must be greater than 0';
		},
	},
	{
		key: 'remote',
		header: 'Remote',
		type: 'checkbox',
		width: 80,
		filterable: true,
		filterType: 'boolean',
	},
];

// ─── Pinned-from-middle column definitions ────────────────────────────────────
// 'department' is array position 2 (not the first!) with pin:'left'  → left edge.
// 'salary'     is array position 4 (not the last!)  with pin:'right' → right edge.
// 'id'         is intentionally the last column with no pin → scrolls in the middle.
const PINNED_DEMO_COLUMNS: DataGridColumn<Employee>[] = [
	{ key: 'name',       header: 'Name',       type: 'text',     minWidth: 200 },
	{ key: 'email',      header: 'Email',      type: 'text',     minWidth: 220 },
	{ key: 'department', header: 'Department', type: 'readonly', width: 160, pin: 'left'  },
	{ key: 'level',      header: 'Level',      type: 'readonly', width: 120 },
	{ key: 'salary',     header: 'Salary ($)', type: 'readonly', width: 130, pin: 'right' },
	{ key: 'remote',     header: 'Remote',     type: 'checkbox', width: 90 },
	{ key: 'id',         header: 'ID',         type: 'readonly', width: 60 },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: Employee[] = [
	{ id: 1, name: 'Alice Martin',  email: 'alice@company.io',  department: 'Engineering', level: 'Senior',    salary: 120000, remote: true  },
	{ id: 2, name: 'Bob Chen',      email: 'bob@company.io',    department: 'Design',      level: 'Mid',       salary: 90000,  remote: false },
	{ id: 3, name: 'Carol White',   email: 'carol@company.io',  department: 'Product',     level: 'Lead',      salary: 135000, remote: true  },
	{ id: 4, name: 'David Kim',     email: 'david@company.io',  department: 'Engineering', level: 'Junior',    salary: 70000,  remote: false },
	{ id: 5, name: 'Eva Torres',    email: 'eva@company.io',    department: 'Marketing',   level: 'Mid',       salary: 85000,  remote: true  },
	{ id: 6, name: 'Frank Lee',     email: 'frank@company.io',  department: 'Sales',       level: 'Senior',    salary: 105000, remote: false },
	{ id: 7, name: 'Grace Patel',   email: 'grace@company.io',  department: 'Engineering', level: 'Principal', salary: 165000, remote: true  },
	{ id: 8, name: 'Henry Brown',   email: 'henry@company.io',  department: 'Design',      level: 'Senior',    salary: 110000, remote: true  },
];

// ─── Pinned-from-middle demo ──────────────────────────────────────────────────

function PinnedColumnsGrid() {
	return (
		// Cap width to 560 px so horizontal scrolling is clearly visible.
		<div style={{ maxWidth: 560 }}>
			<DataGrid<Employee>
				columns={PINNED_DEMO_COLUMNS}
				data={SEED_EMPLOYEES}
				rowKey="id"
				onChange={() => {}}
				showRowNumbers
			/>
		</div>
	);
}

// ─── Section 1: Full Featured DataGrid ───────────────────────────────────────

function FullFeaturedGrid() {
	const [employees, setEmployees] = useState<Employee[]>(SEED_EMPLOYEES);
	let nextId = employees.reduce((max, e) => Math.max(max, e.id), 0) + 1;

	const bulkActions: BulkAction<Employee>[] = [
		{
			id: 'delete',
			label: 'Delete selected',
			icon: Trash2,
			color: 'danger',
			variant: 'outlined',
			onClick: selectedRows => {
				const selectedIds = new Set(selectedRows.map(r => r.id));
				setEmployees(prev => prev.filter(e => !selectedIds.has(e.id)));
			},
		},
	];

	return (
		<DataGrid<Employee>
			columns={employeeColumns}
			data={employees}
			rowKey="id"
			onChange={setEmployees}
			onRowAdd={() => {
				const newRow: Employee = {
					id: nextId++,
					name: '',
					email: '',
					department: 'Engineering',
					level: 'Junior',
					salary: 50000,
					remote: false,
				};
				return newRow;
			}}
			onRowDelete={(row, index) => {
				console.log(`Deleted employee at index ${index}:`, row);
			}}
			showRowNumbers
			showFilters
			showPagination
			pageSize={5}
			pageSizeOptions={[5, 10, 25]}
			selectable
			bulkActions={bulkActions}
			showDensity
			emptyText="No employees match your current filters."
		/>
	);
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const DataGridShowcase = () => (
	<Col gap="1.5rem">
		{/* ── 1: Full Featured ──────────────────────────────────────────────── */}
		<Section label="Full Featured DataGrid — sort columns, filter rows, paginate, select + delete">
			<FullFeaturedGrid />
		</Section>

		{/* ── 2: Pinned from Middle ───────────────────────────────────────── */}
		<Section label="Pinned columns — neither at the array edge">
			<p
				style={{
					margin: '0 0 0.75rem',
					fontSize: 'var(--font-size-xs)',
					color: 'var(--gray-500)',
					lineHeight: 1.6,
				}}
			>
				<code>department</code> is defined at array index&nbsp;2 with{' '}
				<code>pin:&nbsp;"left"</code> and <code>salary</code> is at index&nbsp;4
				with <code>pin:&nbsp;"right"</code>. Neither is at the natural array edge.
				The DataGrid automatically moves them to the correct side and keeps all
				non-pinned columns scrollable in between.
			</p>
			<PinnedColumnsGrid />
		</Section>

		{/* ── 3: Empty / Loading States ────────────────────────────────────── */}
		<Section label="Empty / Loading States">
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
				<div>
					<p
						style={{
							margin: '0 0 0.5rem',
							fontSize: 'var(--font-size-xs)',
							color: 'var(--gray-500)',
							fontWeight: 'var(--font-weight-medium)',
						}}
					>
						data=[] → EmptyState
					</p>
					<DataGrid<Employee>
						columns={employeeColumns}
						data={[]}
						rowKey="id"
						onChange={() => {}}
						emptyText="No employees found."
					/>
				</div>
				<div>
					<p
						style={{
							margin: '0 0 0.5rem',
							fontSize: 'var(--font-size-xs)',
							color: 'var(--gray-500)',
							fontWeight: 'var(--font-weight-medium)',
						}}
					>
						loading=true → Spinner
					</p>
					<DataGrid<Employee>
						columns={employeeColumns}
						data={[]}
						rowKey="id"
						loading
						onChange={() => {}}
					/>
				</div>
			</div>
		</Section>
	</Col>
);
