import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	label?: React.ReactNode;
	labelPosition?: 'left' | 'right';
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	size?: 'small' | 'medium' | 'large';
	className?: string;
}
