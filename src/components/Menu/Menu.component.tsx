import React, { useCallback } from 'react';
import { ChevronRight, icons } from 'lucide-react';
import type { MenuProps, MenuItemType, MenuItem, MenuWrapperProps } from './Menu.types';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { Tooltip } from '../Tooltip/Tooltip.component';

/**
 * Helper to render an icon (either string name or component)
 */
const renderIcon = (
	icon: string | React.ComponentType<{ className?: string }>,
	className: string
) => {
	if (!icon) return null;

	if (typeof icon === 'string') {
		// String-based icon name (Lucide dynamic icons)
		// Convert to PascalCase (e.g., "arrow-right" -> "ArrowRight")
		const iconName = icon
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');

		const LucideIcon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];

		if (LucideIcon) {
			return React.createElement(LucideIcon, { className });
		}

		// Fallback: treat as CSS class (for Font Awesome, etc.)
		return <i className={icon} aria-hidden="true" />;
	}

	// Component-based icon (Lucide, MUI, etc.)
	return React.createElement(icon, { className });
};

const MenuElement: React.FC<MenuProps> = ({ items, className = '', onItemClick }) => {
	// Handle menu item click
	const handleItemClick = useCallback(
		(item: MenuItem) => {
			if (item.disabled) return;

			// Execute the item's onClick handler first
			if (item.onClick) {
				item.onClick();
			}

			// Then call the onItemClick callback (which will close the dropdown)
			if (onItemClick) {
				onItemClick(item);
			}
		},
		[onItemClick]
	);

	// Render individual menu item
	const renderMenuItem = (item: MenuItemType): React.ReactNode => {
		switch (item.type) {
			case 'item':
				return (
					<li
						key={item.id}
						className={`eidos-menu-item ${item.disabled ? 'eidos-menu-item--disabled' : ''}`}
						onClick={() => handleItemClick(item)}
					>
						{item.icon && renderIcon(item.icon, 'eidos-menu-icon')}
						<span className={`eidos-menu-label`}>{item.label}</span>
						{item.shortcut && <span className={`eidos-menu-shortcut`}>{item.shortcut}</span>}
					</li>
				);

			case 'component':
				return (
					<li key={item.id} className={`eidos-menu-component-item`}>
						{item.component}
					</li>
				);

			case 'separator':
				return <li key={item.id} className={`eidos-menu-separator`} />;

			case 'nested': {
				const triggerElement = (
					<div className={`eidos-menu-nested-trigger`}>
						{item.icon && renderIcon(item.icon, 'eidos-menu-icon')}
						<span className={`eidos-menu-label`}>{item.label}</span>
						<ChevronRight className={`eidos-menu-nested-arrow`} />
					</div>
				);

				return (
					<li key={item.id} className={`eidos-menu-nested-item`}>
						<Dropdown
							trigger={triggerElement}
							content={<MenuElement items={item.items} onItemClick={onItemClick} />}
							placement="right"
							isNested={true}
						/>
					</li>
				);
			}

			default:
				return null;
		}
	};

	return <ul className={`eidos-menu ${className}`}>{items.map(renderMenuItem)}</ul>;
};

export const Menu: React.FC<MenuWrapperProps> = ({
	trigger,
	items,
	minWidth,
	maxWidth,
	minHeight,
	maxHeight,
	autoWidth = true,
	triggerRef,
	closeOnItemClick = true,
	tooltip,
}) => {
	const handleItemClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_item: MenuItem) => {
			// Note: item.onClick is already called in MenuElement's handleItemClick
			// Here we only handle closing the dropdown if needed

			if (closeOnItemClick) {
				// Use a small delay to ensure the onClick handler completes
				setTimeout(() => {
					// Create a synthetic click event outside the dropdown to close it
					const event = new MouseEvent('mousedown', {
						bubbles: true,
						cancelable: true,
						view: window,
					});
					document.dispatchEvent(event);
				}, 10);
			}
		},
		[closeOnItemClick]
	);

	const MenuContent = () => (
		<Dropdown
			trigger={trigger}
			content={<MenuElement items={items} onItemClick={handleItemClick} />}
			minWidth={minWidth}
			maxWidth={maxWidth}
			minHeight={minHeight}
			maxHeight={maxHeight}
			autoWidth={autoWidth}
			triggerRef={triggerRef}
		/>
	);

	return tooltip ? (
		<Tooltip message={tooltip}>
			<MenuContent />
		</Tooltip>
	) : (
		<MenuContent />
	);
};
