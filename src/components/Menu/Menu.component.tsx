import React, { useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MenuProps, MenuItemType, MenuItem, MenuWrapperProps } from './Menu.types';
import { Dropdown } from '../Dropdown/Dropdown.component';
import { Tooltip } from '../Tooltip/Tooltip.component';
import { Kbd } from '../Kbd/Kbd.component';
import { renderIcon } from '../../utils';

/**
 * MenuPanel — the bare menu list, without any trigger or dropdown wrapper.
 * Exported for use in SplitButton, ContextMenu, and other consumers that need
 * to render the menu content inside their own Dropdown / portal.
 */
export const MenuPanel: React.FC<MenuProps> = ({ items, className = '', onItemClick }) => {
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
						{item.shortcut && <Kbd size="small" className="eidos-menu-shortcut">{item.shortcut}</Kbd>}
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
							content={<MenuPanel items={item.items} onItemClick={onItemClick} />}
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
			// Note: item.onClick is already called in MenuPanel's handleItemClick
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
			content={<MenuPanel items={items} onItemClick={handleItemClick} />}
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
