import type React from 'react';

export type DataGridCellType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'readonly';

export interface DataGridSelectOption {
	value: string;
	label: string;
}

export interface DataGridColumn<T = Record<string, unknown>> {
	/** Matches the key in the data row object */
	key: string;
	header: string;
	/** @default 'text' */
	type?: DataGridCellType;
	width?: number | string;
	minWidth?: number | string;
	/** @default true */
	editable?: boolean;
	/** Show error if cell is left empty */
	required?: boolean;
	/** For type='select' */
	options?: DataGridSelectOption[];
	/** Return an error string or `true` if valid */
	validate?: (value: unknown) => string | true;
	renderCell?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
	renderEditor?: (value: unknown, onChange: (v: unknown) => void, row: T) => React.ReactNode;
}

export interface DataGridProps<T extends Record<string, unknown> = Record<string, unknown>> {
	columns: DataGridColumn<T>[];
	data: T[];
	/** Field name used as React key. @default 'id' */
	rowKey?: string;
	/** Called after each cell commit with the full updated dataset */
	onChange?: (data: T[]) => void;
	/** Returns a blank row object; if omitted, no Add-row button is shown */
	onRowAdd?: () => T;
	onRowDelete?: (row: T, index: number) => void;
	/** Master editable switch. @default true */
	editable?: boolean;
	loading?: boolean;
	emptyText?: string;
	className?: string;
	stickyHeader?: boolean;
	maxHeight?: string | number;
	/** @default false */
	showRowNumbers?: boolean;
}

export type EditingCell = { rowIndex: number; colKey: string } | null;
