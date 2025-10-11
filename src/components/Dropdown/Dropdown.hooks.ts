import { useContext } from 'react';
import { DropdownContext } from './Dropdown.context.types';

export const useDropdownContext = () => {
	return useContext(DropdownContext);
};
