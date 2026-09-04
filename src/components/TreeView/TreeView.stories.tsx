import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeView } from './TreeView.component';
import { InlineEdit } from '../InlineEdit/InlineEdit.component';
import type { TreeNode } from './TreeView.types';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const FILE_TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        children: [{ id: 'helpers', label: 'helpers.ts' }],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'package', label: 'package.json' },
  { id: 'readme', label: 'README.md' },
];

const DISABLED_TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        disabled: true,
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
        ],
      },
      {
        id: 'utils',
        label: 'utils',
        children: [{ id: 'helpers', label: 'helpers.ts', disabled: true }],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'package', label: 'package.json', disabled: true },
  { id: 'readme', label: 'README.md' },
];

// ============================================================================
// WRAPPER COMPONENTS for stateful stories
// (hooks cannot be called directly inside Storybook render functions)
// ============================================================================

const ControlledSelectionDemo: React.FC = () => {
  const [selectedId, setSelectedId] = React.useState<string>('button');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
        Selected node: <strong style={{ color: 'var(--primary-700)' }}>{selectedId || '-'}</strong>
      </p>
      <TreeView
        data={FILE_TREE}
        selectedId={selectedId}
        onSelect={(node) => setSelectedId(node.id)}
        defaultExpandedIds={['src', 'components']}
      />
    </div>
  );
};

const MultiSelectDemo: React.FC = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
        Selected:{' '}
        <strong style={{ color: 'var(--primary-700)' }}>
          {selectedIds.length > 0 ? selectedIds.join(', ') : '-'}
        </strong>
      </p>
      <TreeView
        data={FILE_TREE}
        multiSelect
        selectedIds={selectedIds}
        onSelectMulti={(nodes) => setSelectedIds(nodes.map((n) => n.id))}
        defaultExpandedIds={['src', 'components', 'utils']}
      />
    </div>
  );
};

// ============================================================================
// META
// ============================================================================

const meta = {
  title: 'Navigation/TreeView',
  component: TreeView,
  parameters: { layout: 'padded' },
  args: {
    data: FILE_TREE,
  },
  argTypes: {
    data: {
      control: false,
      description: 'Tree data - array of `TreeNode` objects (recursive)',
      table: { type: { summary: 'TreeNode[]' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls font size and row padding',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    showLines: {
      control: 'boolean',
      description: 'Draw vertical indent guide lines between levels',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    multiSelect: {
      control: 'boolean',
      description: 'Allow selecting multiple nodes simultaneously',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    defaultExpandAll: {
      control: 'boolean',
      description: 'Expand all branch nodes on mount (uncontrolled)',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    selectedId: {
      control: false,
      description: 'Controlled single-selection node id',
      table: { type: { summary: 'string' } },
    },
    defaultSelectedId: {
      control: false,
      description: 'Uncontrolled initial single-selection node id',
      table: { type: { summary: 'string' } },
    },
    onSelect: {
      control: false,
      description: 'Called when a node is selected (single mode)',
      table: { type: { summary: '(node: TreeNode) => void' } },
    },
    selectedIds: {
      control: false,
      description: 'Controlled multi-selection node ids',
      table: { type: { summary: 'string[]' } },
    },
    defaultSelectedIds: {
      control: false,
      description: 'Uncontrolled initial multi-selection node ids',
      table: { type: { summary: 'string[]' } },
    },
    onSelectMulti: {
      control: false,
      description: 'Called when selection changes (multi mode)',
      table: { type: { summary: '(nodes: TreeNode[]) => void' } },
    },
    expandedIds: {
      control: false,
      description: 'Controlled list of expanded branch node ids',
      table: { type: { summary: 'string[]' } },
    },
    defaultExpandedIds: {
      control: false,
      description: 'Uncontrolled initial list of expanded branch node ids',
      table: { type: { summary: 'string[]' } },
    },
    onExpand: {
      control: false,
      description: 'Called when a branch is expanded or collapsed',
      table: { type: { summary: '(id: string, expanded: boolean) => void' } },
    },
    renderLabel: {
      control: false,
      description: 'Custom label renderer for each node',
      table: {
        type: {
          summary: '(node: TreeNode, isSelected: boolean, isExpanded: boolean) => React.ReactNode',
        },
      },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// STORIES
// ============================================================================

/** Basic tree with a couple of branches pre-expanded. */
export const Default: Story = {
  args: {
    defaultExpandedIds: ['src', 'components'],
  },
};

/** Vertical indent guide lines on every nested level (showLines). */
export const WithLines: Story = {
  args: {
    showLines: true,
    defaultExpandedIds: ['src', 'components', 'utils'],
  },
};

/** All branch nodes expanded on mount via defaultExpandAll. */
export const DefaultExpandAll: Story = {
  args: {
    defaultExpandAll: true,
  },
};

/**
 * Controlled selection: the selected node is driven by external state.
 * Click any node to update the selection.
 */
export const ControlledSelection: Story = {
  render: () => <ControlledSelectionDemo />,
  parameters: {
    docs: {
      source: {
        code: `
const [selectedId, setSelectedId] = useState<string>();

<TreeView
  data={data}
  selectedId={selectedId}
  onSelect={(node) => setSelectedId(node.id)}
/>`.trim(),
      },
    },
  },
};

/** Some nodes are marked disabled - they cannot be clicked or selected. */
export const Disabled: Story = {
  args: {
    data: DISABLED_TREE,
    defaultExpandAll: true,
  },
};

/**
 * Multi-select mode: click nodes to build a selection set.
 * Clicking a selected node deselects it.
 */
export const MultiSelect: Story = {
  render: () => <MultiSelectDemo />,
  parameters: {
    docs: {
      source: {
        code: `
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<TreeView
  data={data}
  multiSelect
  selectedIds={selectedIds}
  onSelectMulti={(nodes) => setSelectedIds(nodes.map((n) => n.id))}
/>`.trim(),
      },
    },
  },
};

/**
 * renderLabel lets you replace the default label text with any React node.
 * Here, branch nodes show a child-count badge next to their label.
 */
export const CustomRenderLabel: Story = {
  render: () => (
    <TreeView
      data={FILE_TREE}
      defaultExpandAll
      renderLabel={(node, isSelected) => (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.label}
          </span>

          {node.children !== undefined && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                lineHeight: 1,
                padding: '2px 6px',
                borderRadius: '10px',
                flexShrink: 0,
                backgroundColor: isSelected ? 'var(--primary-100)' : 'var(--gray-100)',
                color: isSelected ? 'var(--primary-700)' : 'var(--gray-500)',
              }}
            >
              {node.children.length}
            </span>
          )}
        </span>
      )}
    />
  ),
};

/**
 * `renderLabel` combined with `InlineEdit` enables in-place node rename.
 * Hover a node to reveal the pencil icon, then click it to rename. Press
 * Enter or click away to confirm, Esc to cancel.
 *
 * Note: clicking the label itself expands/collapses the node (TreeView
 * behaviour). The rename is intentionally triggered via the icon button so
 * the two interactions don't conflict.
 */
export const InlineRename = {
  render: () => {
    const [data, setData] = React.useState<TreeNode[]>(FILE_TREE);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    const renameNode = (nodes: TreeNode[], id: string, newLabel: string): TreeNode[] =>
      nodes.map((n) => ({
        ...n,
        label: n.id === id ? newLabel : n.label,
        children: n.children ? renameNode(n.children, id, newLabel) : undefined,
      }));

    return (
      <TreeView
        data={data}
        defaultExpandAll
        renderLabel={(node) => (
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}
            className="treeview-rename-row"
          >
            <InlineEdit
              value={node.label}
              editing={editingId === node.id}
              onEditingChange={(open) => setEditingId(open ? node.id : null)}
              onConfirm={(v) => {
                setData((prev) => renameNode(prev, node.id, v));
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              size="sm"
              inputVariant="outlined"
              showEditIcon={false}
              renderDisplay={(v) => (
                <span
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {v}
                </span>
              )}
            />
            {editingId !== node.id && (
              <button
                aria-label={`Rename ${node.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(node.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--gray-400)',
                  borderRadius: '3px',
                  opacity: 0,
                  transition: 'opacity 0.15s',
                }}
                className="treeview-rename-btn"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </span>
        )}
      />
    );
  },
  decorators: [
    (Story: React.ComponentType) => (
      <>
        <style>{`
          .treeview-rename-row:hover .treeview-rename-btn,
          .treeview-rename-row:focus-within .treeview-rename-btn { opacity: 1 !important; }
        `}</style>
        <Story />
      </>
    ),
  ],
};
