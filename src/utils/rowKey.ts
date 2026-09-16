/**
 * A field name of a row-data type, as a string-literal union.
 *
 * Shared by every data component that addresses row fields by name
 * (`Table`, `DataGrid`) so the same concept is typed one way everywhere -
 * `TableColumn.key`, `DataGridColumn.key`, `rowKey`, sort keys, and the
 * filter/quick-filter schemas.
 *
 * Degrades to `string` for the untyped default (`Record<string, unknown>`),
 * which is what keeps callers who never specify `T` compiling unchanged.
 *
 * `Extract<keyof T, string>` rather than `keyof T`: keys are compared against
 * and rendered as strings throughout (`data-col-key`, React keys, filter
 * state objects), so numeric and symbol keys are excluded deliberately.
 *
 * ## Why this only works when `T` has no index signature
 *
 * An index signature widens `keyof T` to `string`, at which point this
 * resolves to `string` and every key-narrowing and per-key value type built
 * on it silently degrades to the old, unchecked behaviour. That is exactly
 * what `T extends Record<string, unknown>` used to force on consumers:
 * TypeScript only grants *implicit* index signatures to object type aliases,
 * so anyone modelling rows with an `interface` had to write
 * `interface Row extends Record<string, unknown>` to satisfy it - and thereby
 * opted out of all of this without knowing.
 *
 * Both components now constrain `T extends object` instead, so a plain
 * interface is accepted and keeps its literal keys. Don't tighten that
 * constraint back to `Record<string, unknown>`: it would not fail loudly, it
 * would just quietly stop checking.
 */
export type RowKey<T> = Extract<keyof T, string>;
