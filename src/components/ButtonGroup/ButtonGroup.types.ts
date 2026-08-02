export interface ButtonGroupProps {
	/** Buttons (or other elements) to group. */
	children: React.ReactNode;
	/**
	 * Fallback size applied to children that don't specify their own size.
	 * Each child can still override this individually.
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Fallback variant applied to children that don't specify their own variant.
	 */
	variant?: 'filled' | 'outlined' | 'text';
	/**
	 * Fallback color applied to children that don't specify their own color.
	 */
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	/** Stack buttons vertically instead of horizontally. */
	orientation?: 'horizontal' | 'vertical';
	className?: string;
}
