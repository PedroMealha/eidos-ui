import { useState } from 'react';
import { File } from 'lucide-react';
import { TreeView } from '../../../src/components/TreeView';
import type { TreeNode } from '../../../src/components/TreeView';
import { Section, Col, Grid } from '../shared/Section';

// ─── Shared data ─────────────────────────────────────────────────────────────

const fileTree: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [
          {
            id: 'src/components/Button',
            label: 'Button',
            children: [
              { id: 'src/components/Button/Button.tsx', label: 'Button.tsx', icon: File },
              { id: 'src/components/Button/Button.scss', label: 'Button.scss', icon: File },
            ],
          },
          {
            id: 'src/components/Input',
            label: 'Input',
            children: [
              { id: 'src/components/Input/Input.tsx', label: 'Input.tsx', icon: File },
            ],
          },
        ],
      },
      {
        id: 'src/utils',
        label: 'utils',
        children: [
          { id: 'src/utils/helpers.ts', label: 'helpers.ts', icon: File },
          { id: 'src/utils/types.ts', label: 'types.ts', icon: File },
        ],
      },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'public/index.html', label: 'index.html', icon: File },
      { id: 'public/favicon.ico', label: 'favicon.ico', icon: File },
    ],
  },
];

const simpleNodes: TreeNode[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
  { id: 'blog', label: 'Blog' },
];

const disabledNodes: TreeNode[] = [
  {
    id: 'accessible',
    label: 'accessible',
    children: [
      { id: 'accessible/open.ts', label: 'open.ts', icon: File },
      { id: 'accessible/read.ts', label: 'read.ts', icon: File },
    ],
  },
  {
    id: 'restricted',
    label: 'restricted',
    disabled: true,
    children: [
      { id: 'restricted/secret.ts', label: 'secret.ts', icon: File, disabled: true },
    ],
  },
  { id: 'config.json', label: 'config.json', icon: File },
  { id: 'package.json', label: 'package.json', icon: File, disabled: true },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const metaStyle: React.CSSProperties = {
  marginTop: '0.5rem',
  fontSize: '0.75rem',
  color: '#94a3b8',
};

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const TreeViewShowcase = () => {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <Col>
      <Grid cols={2}>
        <Section label="File Explorer – click to select">
          <TreeView
            data={fileTree}
            selectedId={selectedId}
            onSelect={(node) => setSelectedId(node.id)}
          />
          <p style={metaStyle}>
            {selectedId ? `Selected: ${selectedId}` : 'No selection'}
          </p>
        </Section>

        <Section label="Simple List – flat nodes, no children">
          <TreeView data={simpleNodes} />
        </Section>

        <Section label="Expanded by Default – defaultExpandedIds">
          <TreeView
            data={fileTree}
            defaultExpandedIds={['src', 'src/components', 'src/utils', 'public']}
          />
        </Section>

        <Section label="Multi-select – hold Shift or Ctrl/⌘ to select multiple">
          <TreeView
            data={fileTree}
            multiSelect
            selectedIds={selectedIds}
            onSelectMulti={(nodes) => setSelectedIds(nodes.map((n) => n.id))}
          />
          <p style={metaStyle}>
            {selectedIds.length > 0
              ? `${selectedIds.length} node(s) selected`
              : 'No selection'}
          </p>
        </Section>
      </Grid>

      <Section label="Disabled Nodes – restricted folder and package.json are non-interactive">
        <TreeView
          data={disabledNodes}
          defaultExpandedIds={['accessible', 'restricted']}
        />
      </Section>
    </Col>
  );
};
