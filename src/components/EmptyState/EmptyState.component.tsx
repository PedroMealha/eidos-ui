import React from 'react';
import type { EmptyStateProps } from './EmptyState.types';

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	description,
	action,
	size = 'md',
	className = '',
}) => (
	<div
		className={['eidos-empty-state', `eidos-empty-state--${size}`, className]
			.filter(Boolean)
			.join(' ')}
	>
		{icon && <div className="eidos-empty-state-icon">{icon}</div>}

		<div className="eidos-empty-state-content">
			<h3 className="eidos-empty-state-title">{title}</h3>
			{description && (
				<p className="eidos-empty-state-description">{description}</p>
			)}
		</div>

		{action && <div className="eidos-empty-state-action">{action}</div>}
	</div>
);

EmptyState.displayName = 'EmptyState';
