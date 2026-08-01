import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '../Input/Input.component';
import { Select } from '../Select/Select.component';
import { Checkbox } from '../Checkbox/Checkbox.component';
import { Spinner } from '../Spinner/Spinner.component';
import type { DataGridProps, DataGridColumn, EditingCell } from './DataGrid.types';
import './DataGrid.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Inner implementation (generic function so we can assign .displayName cleanly)
// ─────────────────────────────────────────────────────────────────────────────
function DataGridInner<T extends Record<string, unknown>>({
	columns,
	data,
	rowKey = 'id',
	onChange,
	onRowAdd,
	onRowDelete,
	editable = true,
	loading = false,
	emptyText = 'No data available',
	className,
	stickyHeader = false,
	maxHeight,
	showRowNumbers = false,
}: DataGridProps<T>): React.ReactElement {
	// ── state + paired refs ──────────────────────────────────────────────────
	// We keep a ref alongside each piece of mutable state so that event
	// handlers registered in effects can always read the *latest* value without
	// stale-closure bugs, while the state variables drive re-renders normally.

	const [localData, _setLocalData] = useState<T[]>(data);
	const localDataRef = useRef<T[]>(data);

	const [editingCell, _setEditingCell] = useState<EditingCell>(null);
	const editingCellRef = useRef<EditingCell>(null);

	const [editValue, _setEditValue] = useState<unknown>(null);
	const editValueRef = useRef<unknown>(null);

	const [editError, setEditError] = useState<string | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);

	// ── synced setters ───────────────────────────────────────────────────────
	const setLocalData = useCallback((v: T[]) => {
		localDataRef.current = v;
		_setLocalData(v);
	}, []);

	const setEditingCell = useCallback((v: EditingCell) => {
		editingCellRef.current = v;
		_setEditingCell(v);
	}, []);

	const setEditValue = useCallback((v: unknown) => {
		editValueRef.current = v;
		_setEditValue(v);
	}, []);

	// ── sync when the data prop changes externally ────────────────────────────
	useEffect(() => {
		setLocalData(data);
	}, [data, setLocalData]);

	// ── helpers ──────────────────────────────────────────────────────────────
	const isCellEditable = useCallback(
		(col: DataGridColumn<T>): boolean => {
			if (!editable) return false;
			if (col.type === 'readonly') return false;
			if (col.editable === false) return false;
			return true;
		},
		[editable],
	);

	const validateCell = useCallback((col: DataGridColumn<T>, value: unknown): string | null => {
		if (col.required && (value === '' || value === null || value === undefined)) {
			return 'This field is required';
		}
		if (col.validate) {
			const result = col.validate(value);
			if (result !== true) return result as string;
		}
		return null;
	}, []);

	// ── commit / discard ─────────────────────────────────────────────────────
	/**
	 * Validates the current edit value and, if valid, persists it.
	 * Returns `true` when the edit was committed (or there was nothing to commit),
	 * `false` when validation failed (keeps edit mode open).
	 */
	const commitEdit = useCallback((): boolean => {
		const cell = editingCellRef.current;
		const value = editValueRef.current;
		const currentData = localDataRef.current;

		if (!cell) return true;

		const col = columns.find(c => c.key === cell.colKey);
		if (!col) {
			setEditingCell(null);
			return true;
		}

		const error = validateCell(col, value);
		if (error) {
			setEditError(error);
			return false;
		}

		const newData = currentData.map<T>((row, idx) =>
			idx === cell.rowIndex ? ({ ...row, [cell.colKey]: value } as T) : row,
		);
		setLocalData(newData);
		onChange?.(newData);
		setEditingCell(null);
		setEditError(null);
		return true;
	}, [columns, onChange, setEditingCell, setLocalData, validateCell]);

	const discardEdit = useCallback(() => {
		setEditingCell(null);
		setEditError(null);
	}, [setEditingCell]);

	// Keep refs to the latest commit/discard so the global handler never captures
	// a stale version, without having the effect re-run on every re-render.
	const commitEditRef = useRef(commitEdit);
	const discardEditRef = useRef(discardEdit);
	useEffect(() => {
		commitEditRef.current = commitEdit;
	}, [commitEdit]);
	useEffect(() => {
		discardEditRef.current = discardEdit;
	}, [discardEdit]);

	// ── global mousedown: commit when clicking outside the grid ──────────────
	// Using mousedown (fires before blur/click) lets us commit the active cell
	// before a click on another cell starts a new edit.  We explicitly allow
	// clicks inside portaled dropdowns (eidos-dropdown-content) so the Select
	// editor doesn't accidentally commit when the user opens its dropdown.
	useEffect(() => {
		if (!editingCell) return;

		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as Element;

			// Still inside the grid container — let per-cell handlers take over
			if (containerRef.current?.contains(target)) return;

			// Inside a portaled dropdown — don't commit yet
			if (target.closest?.('.eidos-dropdown-content')) return;

			commitEditRef.current();
		};

		document.addEventListener('mousedown', handleMouseDown);
		return () => document.removeEventListener('mousedown', handleMouseDown);
	}, [editingCell]);

	// ── start editing ────────────────────────────────────────────────────────
	const startEdit = useCallback(
		(rowIndex: number, colKey: string, currentValue: unknown) => {
			const col = columns.find(c => c.key === colKey);
			if (!col || !isCellEditable(col)) return;
			setEditingCell({ rowIndex, colKey });
			setEditValue(currentValue);
			setEditError(null);
		},
		[columns, isCellEditable, setEditingCell, setEditValue],
	);

	// ── cell click handler ───────────────────────────────────────────────────
	const handleCellClick = useCallback(
		(rowIndex: number, col: DataGridColumn<T>) => {
			const value = localDataRef.current[rowIndex]?.[col.key];

			// Checkbox cells: toggle immediately — no "edit mode" UI needed
			if (col.type === 'checkbox') {
				if (!editable || col.editable === false) return;
				const newData = localDataRef.current.map<T>((row, idx) =>
					idx === rowIndex ? ({ ...row, [col.key]: !value } as T) : row,
				);
				setLocalData(newData);
				onChange?.(newData);
				return;
			}

			if (!isCellEditable(col)) return;

			// Already editing this exact cell — do nothing
			const cell = editingCellRef.current;
			if (cell?.rowIndex === rowIndex && cell?.colKey === col.key) return;

			// Commit any in-flight edit first (returns false if validation fails)
			if (cell) {
				const committed = commitEdit();
				if (!committed) return;
			}

			startEdit(rowIndex, col.key, value);
		},
		[editable, isCellEditable, commitEdit, startEdit, setLocalData, onChange],
	);

	// ── keyboard navigation inside an editing cell ───────────────────────────
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, rowIndex: number, colKey: string) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				discardEdit();
				return;
			}

			if (e.key === 'Enter') {
				e.preventDefault();
				commitEdit();
				return;
			}

			if (e.key === 'Tab') {
				e.preventDefault();

				// Validate before moving
				const col = columns.find(c => c.key === colKey);
				if (col) {
					const error = validateCell(col, editValueRef.current);
					if (error) {
						setEditError(error);
						return;
					}
				}

				// Flat list of editable cells in DOM order
				const editableCells: Array<{ rowIndex: number; colKey: string }> = [];
				for (let ri = 0; ri < localDataRef.current.length; ri++) {
					for (const c of columns) {
						if (isCellEditable(c)) {
							editableCells.push({ rowIndex: ri, colKey: c.key });
						}
					}
				}

				const idx = editableCells.findIndex(
					c => c.rowIndex === rowIndex && c.colKey === colKey,
				);
				const next = e.shiftKey ? editableCells[idx - 1] : editableCells[idx + 1];

				// Commit the current cell first
				const newData = localDataRef.current.map<T>((row, i) =>
					i === rowIndex ? ({ ...row, [colKey]: editValueRef.current } as T) : row,
				);
				setLocalData(newData);
				onChange?.(newData);

				if (next) {
					setEditingCell(next);
					setEditValue(newData[next.rowIndex][next.colKey]);
					setEditError(null);
				} else {
					setEditingCell(null);
					setEditError(null);
				}
			}
		},
		[columns, isCellEditable, commitEdit, discardEdit, validateCell, onChange, setEditingCell, setEditValue, setLocalData],
	);

	// ── row actions ──────────────────────────────────────────────────────────
	const handleRowDelete = useCallback(
		(row: T, index: number) => {
			onRowDelete?.(row, index);
			const newData = localDataRef.current.filter((_, i) => i !== index);
			setLocalData(newData);
			onChange?.(newData);
		},
		[onRowDelete, onChange, setLocalData],
	);

	const handleRowAdd = useCallback(() => {
		if (!onRowAdd) return;
		const newRow = onRowAdd();
		const newData = [...localDataRef.current, newRow];
		setLocalData(newData);
		onChange?.(newData);
	}, [onRowAdd, onChange, setLocalData]);

	// ── cell content renderers ───────────────────────────────────────────────
	const renderViewCell = (
		col: DataGridColumn<T>,
		value: unknown,
		row: T,
		rowIndex: number,
	): React.ReactNode => {
		if (col.renderCell) return col.renderCell(value, row, rowIndex);

		switch (col.type) {
			case 'checkbox':
				// The <td> onClick handles toggling; onChange is a no-op here so that
				// the controlled Checkbox doesn't re-toggle via its own handler.
				return (
					<Checkbox
						checked={Boolean(value)}
						onChange={() => {
							/* handled by td onClick */
						}}
						size="small"
					/>
				);

			case 'select': {
				const option = col.options?.find(o => o.value === String(value ?? ''));
				return <span>{option ? option.label : String(value ?? '')}</span>;
			}

			case 'readonly':
			case 'text':
			case 'number':
			case 'date':
			default:
				return <span>{String(value ?? '')}</span>;
		}
	};

	const renderEditCell = (
		col: DataGridColumn<T>,
		value: unknown,
		row: T,
		rowIndex: number,
	): React.ReactNode => {
		if (col.renderEditor) {
			return col.renderEditor(value, v => setEditValue(v), row);
		}

		switch (col.type) {
			case 'number':
				return (
					<Input
						type="number"
						size="small"
						value={String(value ?? '')}
						onChange={e => setEditValue(e.target.value)}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						fullWidth
						clearable={false}
					/>
				);

			case 'date':
				return (
					<Input
						type="date"
						size="small"
						value={String(value ?? '')}
						onChange={e => setEditValue(e.target.value)}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						fullWidth
						clearable={false}
					/>
				);

			case 'select': {
				// Auto-commit as soon as the user picks an option; the Dropdown's portal
				// means we can't rely on a simple onBlur for this cell type.
				const selectOptions = (col.options ?? []).map(o => ({
					id: o.value,
					value: o.value,
					label: o.label,
				}));

				return (
					<Select
						options={selectOptions}
						value={String(value ?? '')}
						onChange={v => {
							const selected = Array.isArray(v) ? (v[0] ?? '') : v;
							const newData = localDataRef.current.map<T>((r, i) =>
								i === rowIndex ? ({ ...r, [col.key]: selected } as T) : r,
							);
							setLocalData(newData);
							onChange?.(newData);
							setEditingCell(null);
							setEditError(null);
						}}
						fullWidth
						inputProps={{ size: 'small' }}
					/>
				);
			}

			// text / date (fallthrough) / default
			default:
				return (
					<Input
						type="text"
						size="small"
						value={String(value ?? '')}
						onChange={e => setEditValue(e.target.value)}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						fullWidth
						clearable={false}
					/>
				);
		}
	};

	// ── derived ──────────────────────────────────────────────────────────────
	const hasDeleteCol = Boolean(onRowDelete);
	const totalCols = columns.length + (showRowNumbers ? 1 : 0) + (hasDeleteCol ? 1 : 0);

	const containerStyle: React.CSSProperties = {};
	if (stickyHeader && maxHeight) {
		containerStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
	}

	// ── loading state ────────────────────────────────────────────────────────
	if (loading) {
		return (
			<div className={['eidos-data-grid-container', className].filter(Boolean).join(' ')}>
				<div className="eidos-data-grid-loading">
					<Spinner size="medium" />
					<p>Loading…</p>
				</div>
			</div>
		);
	}

	// ── render ───────────────────────────────────────────────────────────────
	return (
		<div
			ref={containerRef}
			className={[
				'eidos-data-grid-container',
				stickyHeader && 'eidos-data-grid-container--sticky-header',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			style={containerStyle}
		>
			<table className="eidos-data-grid">
				<thead>
					<tr>
						{showRowNumbers && (
							<th className="eidos-data-grid-header-cell eidos-data-grid-row-number-col">
								#
							</th>
						)}
						{columns.map(col => (
							<th
								key={col.key}
								className="eidos-data-grid-header-cell"
								style={{
									width:
										col.width != null
											? typeof col.width === 'number'
												? `${col.width}px`
												: col.width
											: undefined,
									minWidth:
										col.minWidth != null
											? typeof col.minWidth === 'number'
												? `${col.minWidth}px`
												: col.minWidth
											: undefined,
								}}
							>
								{col.header}
							</th>
						))}
						{hasDeleteCol && (
							<th className="eidos-data-grid-header-cell eidos-data-grid-actions-col" />
						)}
					</tr>
				</thead>

				<tbody>
					{localData.length > 0 ? (
						localData.map((row, rowIndex) => {
							const rowKeyValue = String(row[rowKey] ?? rowIndex);
							return (
								<tr key={rowKeyValue} className="eidos-data-grid-row">
									{showRowNumbers && (
										<td className="eidos-data-grid-cell eidos-data-grid-row-number">
											{rowIndex + 1}
										</td>
									)}

									{columns.map(col => {
										const value = row[col.key];
										const isEditing =
											editingCell?.rowIndex === rowIndex &&
											editingCell?.colKey === col.key;
										const canEdit = isCellEditable(col);
										const hasError = isEditing && Boolean(editError);

										const cellCls = [
											'eidos-data-grid-cell',
											isEditing && 'eidos-data-grid-cell--editing',
											hasError && 'eidos-data-grid-cell--error',
											canEdit && !isEditing && 'eidos-data-grid-cell--editable',
											col.type === 'readonly' && 'eidos-data-grid-cell--readonly',
										]
											.filter(Boolean)
											.join(' ');

										return (
											<td
												key={col.key}
												className={cellCls}
												onClick={() => handleCellClick(rowIndex, col)}
												onKeyDown={
													isEditing
														? e => handleKeyDown(e, rowIndex, col.key)
														: undefined
												}
												// Make editing cells focusable so keydown events register
												tabIndex={isEditing ? -1 : undefined}
											>
												{isEditing
													? renderEditCell(col, editValue, row, rowIndex)
													: renderViewCell(col, value, row, rowIndex)}

												{hasError && (
													<div className="eidos-data-grid-cell-error">
														{editError}
													</div>
												)}
											</td>
										);
									})}

									{hasDeleteCol && (
										<td className="eidos-data-grid-cell eidos-data-grid-actions-col">
											<button
												type="button"
												className="eidos-data-grid-delete-btn"
												onClick={() => handleRowDelete(row, rowIndex)}
												aria-label="Delete row"
											>
												<Trash2 size={16} />
											</button>
										</td>
									)}
								</tr>
							);
						})
					) : (
						<tr className="eidos-data-grid-empty-row">
							<td
								colSpan={totalCols}
								className="eidos-data-grid-cell eidos-data-grid-empty-cell"
							>
								<div className="eidos-data-grid-empty-message">{emptyText}</div>
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{onRowAdd && (
				<button
					type="button"
					className="eidos-data-grid-add-row"
					onClick={handleRowAdd}
				>
					<Plus size={16} />
					<span>Add row</span>
				</button>
			)}
		</div>
	);
}

// Assign displayName cleanly without losing the generic signature
export const DataGrid = Object.assign(DataGridInner, { displayName: 'DataGrid' });
