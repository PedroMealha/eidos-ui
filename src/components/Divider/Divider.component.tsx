import React from 'react';
import type { DividerProps } from './Divider.types';

export const Divider: React.FC<DividerProps> = ({ direction = 'horizontal' }) => {
	return <div className={`eidos-divider eidos-divider--${direction}`} />;
};
