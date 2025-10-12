import type { ReactNode } from 'react';

interface TableColumn<T> {
	key: keyof T | string;
	label: string;
	render?: (value: unknown, item: T) => ReactNode;
	sortable?: boolean;
	filterable?: boolean;
	filterType?: 'text' | 'select' | 'date' | 'boolean';
	filterOptions?: { id: string; value: string; label: string }[];
	// Date filter specific options
	dateFilterMode?: 'single' | 'multiple' | 'range';
	width?: string;
	align?: 'left' | 'center' | 'right';
	type?: 'data' | 'icon' | 'action';
}

type FilterValue = string | string[] | boolean | { start: string | null; end: string | null } | undefined;

interface TableFilters {
	[key: string]: FilterValue;
}

interface TableProps<T> {
	data: T[];
	columns: TableColumn<T>[];
	loading?: boolean;
	emptyMessage?: string;
	onRowClick?: (item: T) => void;
	className?: string;
	showFooter?: boolean;
	totalItems?: number;
	// Pagination props
	showPagination?: boolean;
	pageSize?: number;
	pageSizeOptions?: number[];
	// Server-side sorting
	onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
	currentSort?: {
		key: string;
		direction: 'asc' | 'desc';
	};
	// Server-side filtering
	filters?: TableFilters;
	onFiltersChange?: (filters: TableFilters) => void;
	defaultFilters?: TableFilters;
	showFilters?: boolean;
}

export type { TableColumn, TableFilters, TableProps, FilterValue };