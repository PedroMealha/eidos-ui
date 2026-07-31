import React from 'react';
import type { DividerProps } from './Divider.types';

export const Divider: React.FC<DividerProps> = ({ direction = 'horizontal', className = '', ...rest }) => {
	return (
		<div
			role="separator"
			{...rest}
			className={['eidos-divider', `eidos-divider--${direction}`, className].filter(Boolean).join(' ')}
		/>
	);
};
