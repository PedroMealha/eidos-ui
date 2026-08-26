import { useState, useEffect } from 'react';
import {
  Home,
  Settings,
  User,
  FileText,
  FolderPlus,
  Trash2,
  PanelLeft,
  Sun,
  Maximize2,
  BookOpen,
  Keyboard,
  Bug,
} from 'lucide-react';
import { CommandPalette } from '../../../src/components/CommandPalette';
import type { CommandItem } from '../../../src/components/CommandPalette';
import { Button } from '../../../src/components/Button';
import { Section, Col, Row } from '../shared/Section';

// ─── Styles ───────────────────────────────────────────────────────────────────

const descStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: '#64748b',
  marginBottom: '1.25rem',
};

const lastCmdStyle: React.CSSProperties = {
  marginTop: '1rem',
  fontSize: '0.8125rem',
  color: '#94a3b8',
};

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const CommandPaletteShowcase = () => {
  const [open, setOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const makeAction = (label: string) => () => {
    console.log(`Executed: ${label}`);
    setLastCommand(label);
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Home',
      description: 'Navigate to the home dashboard',
      icon: Home,
      group: 'Navigation',
      shortcut: ['⌘', '1'],
      action: makeAction('Go to Home'),
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Open application settings',
      icon: Settings,
      group: 'Navigation',
      shortcut: ['⌘', ','],
      action: makeAction('Go to Settings'),
    },
    {
      id: 'nav-profile',
      label: 'Go to Profile',
      description: 'View your user profile',
      icon: User,
      group: 'Navigation',
      shortcut: ['⌘', 'P'],
      action: makeAction('Go to Profile'),
    },

    // Actions
    {
      id: 'action-new-doc',
      label: 'New Document',
      description: 'Create a blank document',
      icon: FileText,
      group: 'Actions',
      shortcut: ['⌘', 'N'],
      action: makeAction('New Document'),
    },
    {
      id: 'action-new-folder',
      label: 'New Folder',
      description: 'Create a new folder in the current directory',
      icon: FolderPlus,
      group: 'Actions',
      shortcut: ['⌘', '⇧', 'N'],
      action: makeAction('New Folder'),
    },
    {
      id: 'action-delete',
      label: 'Delete',
      description: 'Delete the selected item',
      icon: Trash2,
      group: 'Actions',
      shortcut: ['⌘', '⌫'],
      action: makeAction('Delete'),
    },

    // View
    {
      id: 'view-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the navigation sidebar',
      icon: PanelLeft,
      group: 'View',
      shortcut: ['⌘', 'B'],
      action: makeAction('Toggle Sidebar'),
    },
    {
      id: 'view-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: Sun,
      group: 'View',
      shortcut: ['⌘', '⇧', 'T'],
      action: makeAction('Toggle Theme'),
    },
    {
      id: 'view-fullscreen',
      label: 'Full Screen',
      description: 'Enter full screen mode',
      icon: Maximize2,
      group: 'View',
      shortcut: ['F11'],
      action: makeAction('Full Screen'),
    },

    // Help
    {
      id: 'help-docs',
      label: 'Documentation',
      description: 'Open the official documentation',
      icon: BookOpen,
      group: 'Help',
      shortcut: ['F1'],
      action: makeAction('Documentation'),
    },
    {
      id: 'help-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      icon: Keyboard,
      group: 'Help',
      shortcut: ['⌘', '?'],
      action: makeAction('Keyboard Shortcuts'),
    },
    {
      id: 'help-bug',
      label: 'Report a Bug',
      description: 'Submit a bug report to the team',
      icon: Bug,
      group: 'Help',
      action: makeAction('Report a Bug'),
    },
  ];

  return (
    <Col>
      <Section label="Command Palette">
        <p style={descStyle}>
          A searchable, keyboard-navigable command palette with grouped commands.
          Press <kbd>⌘K</kbd> or click the button below to open it.
        </p>

        <Row>
          <Button variant="filled" onClick={() => setOpen(true)}>
            Open Command Palette &nbsp; ⌘K
          </Button>
        </Row>

        <p style={lastCmdStyle}>
          {lastCommand ? `Last command: ${lastCommand}` : 'No command executed yet'}
        </p>
      </Section>

      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={commands}
        onSelect={(item) => setLastCommand(item.label)}
        placeholder="Search commands…"
      />
    </Col>
  );
};
