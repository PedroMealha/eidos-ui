/**
 * Type-level tests.
 *
 * Not a runtime test file and not imported by anything - it exists purely to
 * be checked by `tsc --noEmit` (i.e. `npm run typecheck`, and therefore
 * `npm run verify`). `files: ["dist"]` keeps it out of the published tarball,
 * and tsup only builds the per-component `index.ts` entry points, so it never
 * reaches the build output either.
 *
 * `@ts-expect-error` is the assertion mechanism on purpose: it fails the build
 * both when an expected error *disappears* (reported as an unused directive)
 * and when an unexpected one appears. That two-way property is exactly what's
 * needed here, because the pair that's easy to regress is "narrowing works"
 * and "the untyped default stays permissive" - and a regression in either
 * direction is silent otherwise.
 */
import type {
  DataGridColumn,
  DataGridFilterField,
  DataGridProps,
  DataGridQuickFilter,
  TableColumn,
} from './index';

/** A plain interface - no index signature, so `keyof Row` stays literal. */
interface Row {
  id: string;
  amount: number;
  paid: boolean;
  note?: string;
}

// ─── Keys are checked against the row type ───────────────────────────────────

// @ts-expect-error 'nope' is not a field of Row
const badFilterKey: DataGridFilterField<Row> = { key: 'nope', label: 'x' };

// @ts-expect-error 'nope' is not a field of Row
const badColumnKey: DataGridColumn<Row> = { key: 'nope', header: 'x' };

const badQuickFilterKey: DataGridQuickFilter<Row> = {
  type: 'select',
  // @ts-expect-error 'nope' is not a field of Row
  key: 'nope',
  label: 'x',
  options: [],
};

// @ts-expect-error 'nope' is not a field of Row
const badRowKey: DataGridProps<Row> = { columns: [], data: [], rowKey: 'nope' };

const badSortKey: DataGridProps<Row> = {
  columns: [],
  data: [],
  // @ts-expect-error 'nope' is not a field of Row
  currentSort: { key: 'nope', direction: 'asc' },
};

// @ts-expect-error 'nope' is not a field of Row (Table's key was a no-op union before)
const badTableColumnKey: TableColumn<Row> = { key: 'nope', label: 'x' };

// ─── Values are correlated with the key, not `unknown` ───────────────────────

const numberValue: DataGridColumn<Row> = {
  key: 'amount',
  header: 'Amount',
  // `.toFixed` only exists if this inferred as `number`
  renderCell: (value) => value.toFixed(2),
  validate: (value) => (value > 0 ? true : 'must be positive'),
};

const optionalValue: DataGridColumn<Row> = {
  key: 'note',
  header: 'Note',
  // Optional field, so `string | undefined` - the `?.` must be required
  renderCell: (value) => value?.trim() ?? '',
};

const tableValue: TableColumn<Row> = {
  key: 'paid',
  label: 'Paid',
  render: (value) => (value ? 'yes' : 'no'),
};

const wrongValueType: DataGridColumn<Row> = {
  key: 'amount',
  header: 'Amount',
  // @ts-expect-error `amount` is a number, so string methods must be rejected
  renderCell: (value) => value.toUpperCase(),
};

// ─── Escape hatches for columns that address no field ────────────────────────

const customColumn: DataGridColumn<Row> = {
  key: 'computed',
  header: 'Computed',
  type: 'custom',
  renderCell: (_value, row) => `${row.id}/${row.amount}`,
};

const actionsColumn: DataGridColumn<Row> = {
  // No `key` at all - it used to be required and meaningless here
  header: '',
  type: 'actions',
  actions: [{ label: 'Delete', onClick: (row) => void row.id }],
};

const tableCustomColumn: TableColumn<Row> = {
  key: 'computed',
  label: 'Computed',
  type: 'custom',
  render: (_value, item) => item.id,
};

// @ts-expect-error a custom column has no field to fall back to, so renderCell is required
const customWithoutRender: DataGridColumn<Row> = { key: 'x', header: 'x', type: 'custom' };

// ─── The untyped default stays exactly as permissive as pre-2.0 ──────────────

const untypedFilter: DataGridFilterField = { key: 'anything at all', label: 'x' };
const untypedColumn: DataGridColumn = {
  key: 'anything at all',
  header: 'x',
  renderCell: (value) => String(value),
};
const untypedTableColumn: TableColumn = { key: 'anything at all', label: 'x' };
const untypedRowKey: DataGridProps = { columns: [], data: [], rowKey: 'anything at all' };

// A hand-annotated wider parameter must still be assignable - this is what
// keeps pre-2.0 `(value: unknown, row) => ...` callers compiling.
const widenedParam: DataGridColumn<Row> = {
  key: 'amount',
  header: 'Amount',
  renderCell: (value: unknown, row) => `${String(value)}${row.id}`,
};

export type { Row };
export {
  badFilterKey,
  badColumnKey,
  badQuickFilterKey,
  badRowKey,
  badSortKey,
  badTableColumnKey,
  numberValue,
  optionalValue,
  tableValue,
  wrongValueType,
  customColumn,
  actionsColumn,
  tableCustomColumn,
  customWithoutRender,
  untypedFilter,
  untypedColumn,
  untypedTableColumn,
  untypedRowKey,
  widenedParam,
};
