import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	label?: React.ReactNode;
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export interface RadioOption {
	value: string;
	label: React.ReactNode;
	disabled?: boolean;
}

export interface RadioGroupProps {
	name: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	options: RadioOption[];
	direction?: 'horizontal' | 'vertical';
	color?: 'primary' | 'secondary' | 'success' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	error?: string;
	className?: string;
}
