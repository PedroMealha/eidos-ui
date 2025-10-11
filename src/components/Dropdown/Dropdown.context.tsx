import React from 'react';
import { DropdownContext } from './Dropdown.context.types';

export const DropdownProvider: React.FC<{ children: React.ReactNode; level?: number }> = ({ children, level = 0 }) => {
	return <DropdownContext.Provider value={{ level }}>{children}</DropdownContext.Provider>;
};
