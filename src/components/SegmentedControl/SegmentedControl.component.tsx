import React, { useState } from 'react';
import { Tooltip } from '../Tooltip';
import { renderIcon } from '../../utils';
import type { SegmentedControlProps } from './SegmentedControl.types';

/**
 * SegmentedControl — a compact, single-select toggle group rendered as a pill.
 *
 * Semantics: `role="radiogroup"` on the container, `role="radio"` on each
 * segment. Supports controlled and uncontrolled usage.
 *
 * @example
 * ```tsx
 * // Controlled
 * const [view, setView] = useState('list');
 * <SegmentedControl
 *   options={[
 *     { value: 'list',  icon: List,       tooltip: 'List view' },
 *     { value: 'grid',  icon: LayoutGrid, tooltip: 'Grid view' },
 *     { value: 'table', icon: Table2,     tooltip: 'Table view' },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 *
 * // With labels
 * <SegmentedControl
 *   options={[
 *     { value: 'day',   label: 'Day' },
 *     { value: 'week',  label: 'Week' },
 *     { value: 'month', label: 'Month' },
 *   ]}
 *   defaultValue="week"
 *   onChange={console.log}
 * />
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
	options,
	value,
	defaultValue,
	onChange,
	size = 'medium',
	color = 'primary',
	disabled = false,
	fullWidth = false,
	className = '',
}) => {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState<string>(
		defaultValue ?? options[0]?.value ?? ''
	);

	const activeValue = isControlled ? value : internalValue;

	const handleSelect = (optValue: string) => {
		if (disabled) return;
		if (optValue === activeValue) return; // already selected
		if (!isControlled) setInternalValue(optValue);
		onChange?.(optValue);
	};

	const containerClasses = [
		'eidos-segmented',
		`eidos-segmented--${size}`,
		`eidos-segmented--${color}`,
		disabled && 'eidos-segmented--disabled',
		fullWidth && 'eidos-segmented--full-width',
		className,
	].filter(Boolean).join(' ');

	return (
		<div className={containerClasses} role="radiogroup">
			{options.map(opt => {
				const isActive = activeValue === opt.value;
				const isDisabled = disabled || !!opt.disabled;

				const segment = (
					<button
						key={opt.value}
						type="button"
						role="radio"
						aria-checked={isActive}
						disabled={isDisabled}
						className={[
							'eidos-segmented-item',
							isActive && 'eidos-segmented-item--active',
						].filter(Boolean).join(' ')}
						onClick={() => !isDisabled && handleSelect(opt.value)}
					>
						{opt.icon && renderIcon(opt.icon, 'eidos-segmented-icon')}
						{opt.label && <span className="eidos-segmented-label">{opt.label}</span>}
					</button>
				);

				return opt.tooltip ? (
					<Tooltip key={opt.value} message={opt.tooltip}>
						{segment}
					</Tooltip>
				) : (
					React.cloneElement(segment, { key: opt.value })
				);
			})}
		</div>
	);
};
