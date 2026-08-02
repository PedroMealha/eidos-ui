import { useEffect, useState } from 'react';
import { Kbd } from '../../../src/components/Kbd';
import { Menu } from '../../../src/components/Menu';
import { Button } from '../../../src/components/Button';
import { Copy, Scissors, Clipboard, Undo2, Redo2 } from 'lucide-react';
import type { MenuItemType } from '../../../src/components/Menu';
import { Section, Row, Grid, Col } from '../shared/Section';

const sep = <span style={{ color: 'var(--gray-400)', fontSize: 11, lineHeight: 1 }}>+</span>;

const MENU_ITEMS: MenuItemType[] = [
  { type: 'item', id: 'undo',  label: 'Undo',  icon: Undo2,     shortcut: '⌘Z',  onClick: () => {} },
  { type: 'item', id: 'redo',  label: 'Redo',  icon: Redo2,     shortcut: '⌘⇧Z', onClick: () => {} },
  { type: 'separator', id: 'sep1' },
  { type: 'item', id: 'cut',   label: 'Cut',   icon: Scissors,  shortcut: '⌘X',  onClick: () => {} },
  { type: 'item', id: 'copy',  label: 'Copy',  icon: Copy,      shortcut: '⌘C',  onClick: () => {} },
  { type: 'item', id: 'paste', label: 'Paste', icon: Clipboard, shortcut: '⌘V',  onClick: () => {} },
];

// ── Interactive demo: last pressed key ────────────────────────────────────────

const KeyWatcher = () => {
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.metaKey)  parts.push('⌘');
      if (e.ctrlKey)  parts.push('⌃');
      if (e.altKey)   parts.push('⌥');
      if (e.shiftKey) parts.push('⇧');
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) parts.push(key);
      if (parts.length) setLastKey(parts.join(' + '));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        Press any key combination to see it rendered as <code style={{ fontSize: '0.75rem' }}>Kbd</code>.
      </p>
      <div style={{ minHeight: '2rem', display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
        {lastKey
          ? lastKey.split(' + ').map((k, i) => <Kbd key={i}>{k}</Kbd>)
          : <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>waiting for input…</span>
        }
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export const KbdShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Sizes">
        <Row>
          <Kbd size="small">⌘K</Kbd>
          <Kbd size="medium">⌘K</Kbd>
          <Kbd size="large">⌘K</Kbd>
        </Row>
      </Section>

      <Section label="Common keys">
        <Row>
          {['⌘', '⌥', '⇧', '⌃', 'Enter', 'Esc', 'Tab', '↑', '↓', '←', '→', 'Del'].map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
        </Row>
      </Section>

      <Section label="Compound shortcuts">
        <Col>
          <Row wrap={false}><Kbd>⌘</Kbd>{sep}<Kbd>K</Kbd></Row>
          <Row wrap={false}><Kbd>⌘</Kbd>{sep}<Kbd>⇧</Kbd>{sep}<Kbd>P</Kbd></Row>
          <Row wrap={false}><Kbd>Ctrl</Kbd>{sep}<Kbd>S</Kbd></Row>
          <Row wrap={false}><Kbd>Alt</Kbd>{sep}<Kbd>F4</Kbd></Row>
        </Col>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Live key watcher — press any key">
        <KeyWatcher />
      </Section>

      <Section label="Inline in prose">
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.8, margin: 0 }}>
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette,{' '}
          <Kbd>Esc</Kbd> to dismiss, or <Kbd>↑</Kbd> / <Kbd>↓</Kbd> to navigate.
        </p>
      </Section>
    </Grid>

    <Section label="In a menu (shortcut prop)">
      <Menu
        trigger={<Button variant="outlined">Edit ▾</Button>}
        items={MENU_ITEMS}
      />
    </Section>
  </Col>
);
