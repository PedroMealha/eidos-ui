import type { IconType } from '../../utils';

export interface SegmentedOption {
	/** Unique value for this segment. */
	value: string;
	/** Text label (optional if `icon` is provided). */
	label?: string;
	/** Icon to show before the label. */
	icon?: IconType;
	/** Disable this individual segment. */
	disabled?: boolean;
	/** Tooltip shown on hover. */
	tooltip?: string;
}

export interface SegmentedControlProps {
	/** Segment definitions. */
	options: SegmentedOption[];
	/** Controlled selected value. */
	value?: string;
	/** Initial value when uncontrolled. Defaults to the first option's value. */
	defaultValue?: string;
	/** Called with the newly selected value whenever the selection changes. */
	onChange?: (value: string) => void;
	size?: 'small' | 'medium' | 'large';
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	/** Disable all segments. */
	disabled?: boolean;
	/** Stretch to fill the parent's width. */
	fullWidth?: boolean;
	className?: string;
}
