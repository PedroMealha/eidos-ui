import React, { useCallback } from 'react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { MenuPanel } from '../Menu';
import type { MenuItem } from '../Menu';
import { renderIcon } from '../../utils';
import type { SplitButtonProps } from './SplitButton.types';

/**
 * SplitButton - a two-part control with a primary action button on the left
 * and a chevron that opens a dropdown of secondary actions on the right.
 *
 * The primary button fires `onClick` directly; clicking the chevron opens the
 * dropdown. Visually the two parts share a single bordered unit.
 *
 * @example
 * ```tsx
 * <SplitButton
 *   label="Save"
 *   onClick={() => save()}
 *   options={[
 *     { id: 'draft',    label: 'Save as draft',    onClick: saveDraft },
 *     { id: 'template', label: 'Save as template', onClick: saveTemplate },
 *   ]}
 * />
 * ```
 */
export const SplitButton: React.FC<SplitButtonProps> = ({
	label,
	onClick,
	options,
	variant = 'filled',
	color = 'primary',
	size = 'medium',
	disabled = false,
	loading = false,
	preIcon,
	className = '',
}) => {
	// Convert SplitButtonOption → MenuItemType so MenuPanel can render them.
	const menuItems: MenuItem[] = options.map(opt => ({
		type: 'item' as const,
		id: opt.id,
		label: opt.label,
		icon: opt.icon,
		disabled: opt.disabled,
		onClick: opt.onClick,
	}));

	const handleItemClick = useCallback(() => {
		// Close the dropdown by dispatching a mousedown outside it.
		setTimeout(() => {
			document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
		}, 10);
	}, []);

	const baseClass = `eidos-button eidos-button--${variant} eidos-button--${color} eidos-button--${size}`;
	const disabledOrLoading = disabled || loading;

	const chevronTrigger = (
		<button
			type="button"
			className={`${baseClass} eidos-split-button__chevron`}
			disabled={disabledOrLoading}
			aria-label="More options"
		>
			<ChevronDown className="eidos-split-button__chevron-icon" aria-hidden="true" />
		</button>
	);

	return (
		<div
			className={[
				'eidos-split-button',
				`eidos-split-button--${variant}`,
				`eidos-split-button--${color}`,
				`eidos-split-button--${size}`,
				disabledOrLoading && 'eidos-split-button--disabled',
				className,
			].filter(Boolean).join(' ')}
		>
			{/* Primary action */}
			<button
				type="button"
				className={`${baseClass} eidos-split-button__primary`}
				disabled={disabledOrLoading}
				onClick={onClick}
			>
				{loading ? (
					<LoaderCircle className="eidos-split-button__spinner" aria-hidden="true" />
				) : (
					preIcon && renderIcon(preIcon, 'eidos-split-button__pre-icon')
				)}
				<span className="eidos-split-button__label">{label}</span>
			</button>

			{/* Secondary actions dropdown */}
			<Dropdown
				trigger={chevronTrigger}
				content={<MenuPanel items={menuItems} onItemClick={handleItemClick} />}
				placement="bottom"
				align="end"
				disabled={disabledOrLoading}
			/>
		</div>
	);
};
