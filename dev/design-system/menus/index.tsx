import { User, Settings, LogOut, FileText, Copy, Trash2, Share2 } from 'lucide-react';
import { Menu } from '../../../src/components/Menu';
import { Button } from '../../../src/components/Button';
import { Section, Col } from '../shared/Section';

export const MenuShowcase = () => (
  <Col>
    <Section label="Basic Menu">
      <Menu
        trigger={<Button variant="filled">Account</Button>}
        items={[
          { type: 'item', id: '1', label: 'Profile', icon: User, onClick: () => alert('Profile') },
          { type: 'item', id: '2', label: 'Settings', icon: Settings, onClick: () => alert('Settings') },
          { type: 'separator', id: 'sep1' },
          { type: 'item', id: '3', label: 'Logout', icon: LogOut, onClick: () => alert('Logout') },
        ]}
      />
    </Section>

    <Section label="Keyboard Shortcuts">
      <Menu
        trigger={<Button variant="filled" color="secondary">File Menu</Button>}
        items={[
          {
            type: 'item',
            id: '1',
            label: 'New File',
            icon: FileText,
            shortcut: '⌘N',
            onClick: () => alert('New File'),
          },
          {
            type: 'item',
            id: '2',
            label: 'Copy',
            icon: Copy,
            shortcut: '⌘C',
            onClick: () => alert('Copy'),
          },
          {
            type: 'item',
            id: '3',
            label: 'Delete',
            icon: Trash2,
            shortcut: '⌫',
            onClick: () => alert('Delete'),
          },
        ]}
      />
    </Section>

    <Section label="Nested Menu">
      <Menu
        trigger={<Button variant="outlined" color="primary">More Options</Button>}
        items={[
          { type: 'item', id: '1', label: 'Copy', icon: Copy, onClick: () => alert('Copy') },
          { type: 'item', id: '2', label: 'Share', icon: Share2, onClick: () => alert('Share') },
          { type: 'separator', id: 'sep1' },
          {
            type: 'nested',
            id: 'nested1',
            label: 'More Actions',
            icon: Settings,
            items: [
              { type: 'item', id: 'n1', label: 'Archive', onClick: () => alert('Archive') },
              { type: 'item', id: 'n2', label: 'Export', onClick: () => alert('Export') },
              { type: 'item', id: 'n3', label: 'Print', onClick: () => alert('Print') },
            ],
          },
          { type: 'separator', id: 'sep2' },
          { type: 'item', id: '3', label: 'Delete', icon: Trash2, onClick: () => alert('Delete') },
        ]}
      />
    </Section>
  </Col>
);
