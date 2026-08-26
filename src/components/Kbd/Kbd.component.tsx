import React from 'react';
import type { KbdProps } from './Kbd.types';

/**
 * Kbd - renders a keyboard key or shortcut with a physical key appearance.
 *
 * Use it anywhere a keyboard shortcut needs to be communicated: tooltips,
 * menu item shortcuts, inline documentation, command palettes.
 *
 * For multi-key combinations, place `<Kbd>` elements side-by-side and
 * separate them with a `+` character or a thin space as suits the context.
 *
 * @example
 * ```tsx
 * // Single key
 * <Kbd>⌘</Kbd>
 *
 * // Compound shortcut - wrap in a fragment or span
 * <span><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
 *
 * // Inline in prose
 * Press <Kbd>Enter</Kbd> to confirm.
 * ```
 */
export const Kbd: React.FC<KbdProps> = ({
	children,
	size = 'md',
	className = '',
}) => {
	const classes = [
		'eidos-kbd',
		`eidos-kbd--${size}`,
		className,
	].filter(Boolean).join(' ');

	return <kbd className={classes}>{children}</kbd>;
};
