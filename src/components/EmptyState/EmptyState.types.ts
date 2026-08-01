import React from 'react';

export interface EmptyStateProps {
	/** Large icon or illustration rendered at the top. Any ReactNode. */
	icon?: React.ReactNode;
	/** Main heading. */
	title: string;
	/** Supporting text below the title. */
	description?: string;
	/** Optional CTA — typically a Button. Any ReactNode. */
	action?: React.ReactNode;
	/** Controls overall size (icon size, text size, padding). Default: 'medium'. */
	size?: 'small' | 'medium' | 'large';
	className?: string;
}
