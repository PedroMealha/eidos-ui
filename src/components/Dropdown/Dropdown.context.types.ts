import { createContext } from 'react';

export interface DropdownContextValue {
  level: number;
}

export const DropdownContext = createContext<DropdownContextValue>({ level: 0 });
