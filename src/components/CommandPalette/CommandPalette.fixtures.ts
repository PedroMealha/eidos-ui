import { BookOpen, Bug, FilePlus, LayoutDashboard, Moon, Search, Settings } from 'lucide-react';
import type { CommandItem } from './CommandPalette.types';

// Shared sample data, used across CommandPalette's own stories as well as
// Toolbar's and PageLayout's. Deliberately NOT exported from
// `CommandPalette.stories.tsx` - Storybook's indexer (see `stories` glob in
// `.storybook/main.ts`) treats every named export of a `*.stories.tsx` file
// as a candidate story, regardless of its actual shape, and a bare
// `CommandItem[]` array crashes as soon as it tries to render one (Chromatic
// caught this as `CommandPalette: CMDP ITEMS` erroring with "Cannot read
// properties of undefined (reading 'filter')" - the array's own indices
// being misread as story config). Keeping fixture data in a plain, non-glob
// -matching file avoids it being indexed as a story at all.
export const CMDP_ITEMS: CommandItem[] = [
  {
    id: '1',
    label: 'Go to Dashboard',
    icon: LayoutDashboard,
    group: 'Navigation',
    shortcut: ['⌘', 'D'],
  },
  {
    id: '2',
    label: 'New Document',
    icon: FilePlus,
    group: 'Actions',
    shortcut: ['⌘', 'N'],
    action: () => alert('New doc'),
  },
  {
    id: '3',
    label: 'Search Files',
    icon: Search,
    group: 'Actions',
    keywords: ['find', 'lookup'],
  },
  {
    id: '4',
    label: 'Toggle Theme',
    icon: Moon,
    group: 'Settings',
  },
  {
    id: '5',
    label: 'Open Settings',
    icon: Settings,
    group: 'Settings',
    shortcut: ['⌘', ','],
  },
  {
    id: '6',
    label: 'View Documentation',
    description: 'Open the docs in a new tab',
    icon: BookOpen,
    group: 'Help',
  },
  {
    id: '7',
    label: 'Report a Bug',
    icon: Bug,
    group: 'Help',
    disabled: true,
  },
];
