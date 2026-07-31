import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	label?: React.ReactNode;
	error?: string;
	indeterminate?: boolean;
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	size?: 'small' | 'medium' | 'large';
	className?: string;
}
