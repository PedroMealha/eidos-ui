import { Copy, Scissors, Clipboard, Trash2, Share2, ExternalLink, Edit, Star } from 'lucide-react';
import { ContextMenu } from '../../../src/components/ContextMenu';
import type { MenuItemType } from '../../../src/components/Menu';
import { Section, Col } from '../shared/Section';

const canvasStyle: React.CSSProperties = {
  border: '2px dashed var(--gray-200)',
  borderRadius: 'var(--border-radius-md)',
  padding: '2rem',
  textAlign: 'center',
  color: 'var(--gray-400)',
  fontSize: '0.875rem',
  userSelect: 'none',
  cursor: 'context-menu',
};

const rowItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--gray-200)',
  fontSize: '0.875rem',
  cursor: 'context-menu',
  userSelect: 'none',
};

const CANVAS_ITEMS: MenuItemType[] = [
  { type: 'item', id: 'copy',      label: 'Copy',      icon: Copy,      shortcut: '⌘C', onClick: () => {} },
  { type: 'item', id: 'cut',       label: 'Cut',       icon: Scissors,  shortcut: '⌘X', onClick: () => {} },
  { type: 'item', id: 'paste',     label: 'Paste',     icon: Clipboard, shortcut: '⌘V', onClick: () => {} },
  { type: 'separator', id: 'sep1' },
  { type: 'item', id: 'share',     label: 'Share',     icon: Share2,    onClick: () => {} },
  { type: 'item', id: 'open',      label: 'Open link', icon: ExternalLink, onClick: () => {} },
  { type: 'separator', id: 'sep2' },
  { type: 'item', id: 'delete',    label: 'Delete',    icon: Trash2,    color: 'danger', onClick: () => {} },
];

const files = [
  { id: '1', name: 'Design brief.pdf', type: 'PDF' },
  { id: '2', name: 'Prototype v2.fig', type: 'Figma' },
  { id: '3', name: 'Assets.zip',       type: 'Archive' },
];

export const ContextMenuShowcase = () => (
  <Col>
    <Section label="Canvas — right-click inside the area">
      <ContextMenu items={CANVAS_ITEMS}>
        <div style={canvasStyle}>Right-click anywhere in this area</div>
      </ContextMenu>
    </Section>

    <Section label="Per-row context menu — right-click any row">
      <Col gap="0.375rem">
        {files.map((file) => {
          const items: MenuItemType[] = [
            { type: 'item', id: 'edit',   label: 'Rename',       icon: Edit,    onClick: () => {} },
            { type: 'item', id: 'star',   label: 'Add to starred', icon: Star,  onClick: () => {} },
            { type: 'item', id: 'copy',   label: 'Copy',         icon: Copy,    shortcut: '⌘C', onClick: () => {} },
            { type: 'separator', id: 'sep' },
            { type: 'item', id: 'delete', label: 'Delete',       icon: Trash2,  color: 'danger', onClick: () => {} },
          ];
          return (
            <ContextMenu key={file.id} items={items}>
              <div style={rowItemStyle}>
                <span style={{ flex: 1 }}>{file.name}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{file.type}</span>
              </div>
            </ContextMenu>
          );
        })}
      </Col>
    </Section>
  </Col>
);
