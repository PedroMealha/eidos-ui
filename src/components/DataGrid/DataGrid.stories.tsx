import { useState, useRef } from 'react';
import type { Meta } from '@storybook/react-vite';
import { DataGrid } from './DataGrid.component';
import type { DataGridColumn, DataGridProps } from './DataGrid.types';

// ─── Sample data ──────────────────────────────────────────────────────────────
// `extends Record<string, unknown>` is required so that Person satisfies the
// DataGrid generic constraint `T extends Record<string, unknown>`.

interface Person extends Record<string, unknown> {
	id: number;
	name: string;
	email: string;
	role: string;
	active: boolean;
	score: number;
}

const ROLE_OPTIONS = [
	{ value: 'admin', label: 'Admin' },
	{ value: 'editor', label: 'Editor' },
	{ value: 'viewer', label: 'Viewer' },
];

const COLUMNS: DataGridColumn<Person>[] = [
	{
		key: 'id',
		header: 'ID',
		type: 'readonly',
		width: 60,
	},
	{
		key: 'name',
		header: 'Name',
		type: 'text',
		required: true,
		minWidth: 160,
	},
	{
		key: 'email',
		header: 'Email',
		type: 'text',
		minWidth: 200,
	},
	{
		key: 'role',
		header: 'Role',
		type: 'select',
		options: ROLE_OPTIONS,
		width: 140,
	},
	{
		key: 'active',
		header: 'Active',
		type: 'checkbox',
		width: 80,
	},
	{
		key: 'score',
		header: 'Score',
		type: 'number',
		width: 100,
		validate: value => {
			const n = Number(value);
			return n >= 0 ? true : 'Score must be ≥ 0';
		},
	},
];

function makeSampleData(): Person[] {
	return [
		{ id: 1, name: 'Alice Nguyen', email: 'alice@example.com', role: 'admin', active: true, score: 95 },
		{ id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'editor', active: true, score: 78 },
		{ id: 3, name: 'Carol Jones', email: 'carol@example.com', role: 'viewer', active: false, score: 42 },
		{ id: 4, name: 'David Lee', email: 'david@example.com', role: 'editor', active: true, score: 88 },
	];
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Data/DataGrid',
	component: DataGrid,
	parameters: { layout: 'padded' },
	tags: ['autodocs'],
} satisfies Meta<typeof DataGrid>;

export default meta;

// ─── Stateful wrapper ─────────────────────────────────────────────────────────
// All stories use render() to supply their own data, so we skip StoryObj typing
// (which would require args to cover all required DataGrid props).  Instead we
// inline-annotate each export as a plain render-story object, which is perfectly
// valid Storybook behaviour.

interface StatefulGridProps {
	initialData: Person[];
	extraProps?: Omit<DataGridProps<Person>, 'columns' | 'data' | 'rowKey' | 'onChange'>;
}

function StatefulGrid({ initialData, extraProps }: StatefulGridProps) {
	const [data, setData] = useState<Person[]>(initialData);
	return (
		<DataGrid<Person>
			columns={COLUMNS}
			data={data}
			rowKey="id"
			onChange={setData}
			{...extraProps}
		/>
	);
}

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Fully editable grid — click any cell to edit it inline.
 * Committed changes are reflected immediately in the table.
 */
export const Default = {
	render: () => <StatefulGrid initialData={makeSampleData()} />,
};

/**
 * All cells are read-only; the editing cursor and hover states are suppressed.
 */
export const ReadOnly = {
	render: () => (
		<StatefulGrid
			initialData={makeSampleData()}
			extraProps={{ editable: false }}
		/>
	),
};

/**
 * A leading column displays the 1-based row index.
 */
export const WithRowNumbers = {
	render: () => (
		<StatefulGrid
			initialData={makeSampleData()}
			extraProps={{ showRowNumbers: true }}
		/>
	),
};

/**
 * Demonstrates the Add-row and Delete-row affordances.
 * New rows are appended with an auto-incrementing ID.
 */
export const WithAddDelete = {
	render: function WithAddDeleteStory() {
		const [data, setData] = useState<Person[]>(makeSampleData());
		const nextId = useRef(data.length + 1);

		const handleAdd = (): Person => ({
			id: nextId.current++,
			name: '',
			email: '',
			role: 'viewer',
			active: false,
			score: 0,
		});

		const handleDelete = (row: Person) => {
			console.log('Deleted row:', row);
			// DataGrid updates its own copy and fires onChange — no extra work needed here.
		};

		return (
			<DataGrid<Person>
				columns={COLUMNS}
				data={data}
				rowKey="id"
				onChange={setData}
				onRowAdd={handleAdd}
				onRowDelete={handleDelete}
			/>
		);
	},
};

/**
 * The grid shows a centred spinner while data is being fetched.
 */
export const Loading = {
	render: () => (
		<DataGrid<Person>
			columns={COLUMNS}
			data={[]}
			loading={true}
		/>
	),
};

/**
 * Empty dataset — shows the configurable empty-state message.
 */
export const EmptyState = {
	render: () => (
		<DataGrid<Person>
			columns={COLUMNS}
			data={[]}
			emptyText="No team members found. Add one to get started."
		/>
	),
};

/**
 * Sticky header with a bounded max-height so the table body scrolls vertically.
 */
export const StickyHeader = {
	render: () => {
		const manyRows: Person[] = Array.from({ length: 20 }, (_, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			email: `person${i + 1}@example.com`,
			role: (['admin', 'editor', 'viewer'] as const)[i % 3],
			active: i % 2 === 0,
			score: (i * 7 + 13) % 100,
		}));

		return (
			<StatefulGrid
				initialData={manyRows}
				extraProps={{ stickyHeader: true, maxHeight: 320, showRowNumbers: true }}
			/>
		);
	},
};

/**
 * Shows inline validation in action.
 * Try leaving Name blank or entering a negative Score.
 */
export const ValidationShowcase = {
	render: () => (
		<StatefulGrid
			initialData={[
				{ id: 1, name: '', email: '', role: 'viewer', active: false, score: -5 },
			]}
		/>
	),
};
