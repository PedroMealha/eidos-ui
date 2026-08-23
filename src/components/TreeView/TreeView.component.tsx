import React, { useState, useCallback, useMemo, useRef, useContext, createContext } from 'react';
import { ChevronRight, Folder, FolderOpen, File } from 'lucide-react';
import type { TreeViewProps, TreeNode } from './TreeView.types';
import './TreeView.scss';

// ============================================================================
// HELPERS
// ============================================================================

/** Collect all branch node IDs by recursively traversing the tree. */
function collectAllBranchIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  function traverse(items: TreeNode[]): void {
    for (const node of items) {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return ids;
}

/** Build a flat Map of id → node for O(1) lookups. */
function buildNodeMap(nodes: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();
  function traverse(items: TreeNode[]): void {
    for (const node of items) {
      map.set(node.id, node);
      if (node.children) traverse(node.children);
    }
  }
  traverse(nodes);
  return map;
}

/** Build a Map of id → parentId (null for root nodes). */
function buildParentMap(nodes: TreeNode[]): Map<string, string | null> {
  const map = new Map<string, string | null>();
  function traverse(items: TreeNode[], parentId: string | null): void {
    for (const node of items) {
      map.set(node.id, parentId);
      if (node.children) traverse(node.children, node.id);
    }
  }
  traverse(nodes, null);
  return map;
}

/**
 * Return an ordered list of all node IDs that are currently visible -
 * i.e. not hidden because an ancestor is collapsed.
 */
function computeVisibleIds(nodes: TreeNode[], expandedIds: Set<string>): string[] {
  const result: string[] = [];
  function traverse(items: TreeNode[]): void {
    for (const node of items) {
      result.push(node.id);
      if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return result;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface TreeContextValue {
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  /** ID of the node that currently owns tabIndex=0 (roving tabindex). */
  tabFocusId: string | null;
  multiSelect: boolean;
  size: NonNullable<TreeViewProps['size']>;
  showLines: boolean;
  renderLabel: TreeViewProps['renderLabel'];
  onNodeClick: (node: TreeNode) => void;
  onToggleExpand: (id: string) => void;
  onNodeFocus: (id: string) => void;
  onNodeKeyDown: (e: React.KeyboardEvent<HTMLLIElement>, node: TreeNode, isBranch: boolean) => void;
  /** Map of node id → li element, populated by TreeNodeItem via callback ref. */
  nodeRefs: React.MutableRefObject<Map<string, HTMLLIElement>>;
}

const TreeContext = createContext<TreeContextValue | null>(null);

function useTreeContext(): TreeContextValue {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error('TreeNodeItem must be rendered inside <TreeView>');
  return ctx;
}

// ============================================================================
// INTERNAL TREE NODE ITEM - renders itself and its children recursively
// ============================================================================

interface TreeNodeItemProps {
  node: TreeNode;
  /** 1-based nesting depth for aria-level. */
  depth: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, depth }) => {
  const ctx = useTreeContext();
  const { nodeRefs } = ctx;

  const isBranch = Boolean(node.children && node.children.length > 0);
  const isExpanded = isBranch && ctx.expandedIds.has(node.id);
  const isSelected = ctx.selectedIds.has(node.id);
  const isDisabled = node.disabled === true;

  // Register/unregister this li element so the root can programmatically focus it.
  const liRef = useCallback(
    (el: HTMLLIElement | null) => {
      if (el) nodeRefs.current.set(node.id, el);
      else nodeRefs.current.delete(node.id);
    },
    [node.id, nodeRefs],
  );

  const handleRowClick = () => {
    if (!isDisabled) ctx.onNodeClick(node);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    // stopPropagation prevents the row's onClick from firing (no accidental selection).
    e.stopPropagation();
    if (!isDisabled && isBranch) ctx.onToggleExpand(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    ctx.onNodeKeyDown(e, node, isBranch);
  };

  // Default icon: folder (open/closed) for branches, file for leaves.
  const DefaultIcon = isBranch ? (isExpanded ? FolderOpen : Folder) : File;
  const NodeIcon = (node.icon ?? DefaultIcon) as React.FC<{ className?: string; size?: number }>;
  const iconSize = ctx.size === 'small' ? 14 : ctx.size === 'large' ? 18 : 16;

  const rowClasses = [
    'eidos-tree-node-row',
    isSelected && 'eidos-tree-node-row--selected',
    isDisabled && 'eidos-tree-node-row--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  const toggleClasses = [
    'eidos-tree-toggle',
    isExpanded && 'eidos-tree-toggle--expanded',
    !isBranch && 'eidos-tree-toggle--leaf',
  ]
    .filter(Boolean)
    .join(' ');

  const childrenClasses = [
    'eidos-tree-children',
    ctx.showLines && 'eidos-tree-children--lines',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      ref={liRef}
      role="treeitem"
      aria-expanded={isBranch ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      aria-level={depth}
      tabIndex={ctx.tabFocusId === node.id ? 0 : -1}
      className="eidos-tree-node"
      onFocus={() => ctx.onNodeFocus(node.id)}
      onKeyDown={handleKeyDown}
    >
      {/* ── Clickable row: toggle + icon + label ─────────────────────────────── */}
      <div className={rowClasses} onClick={handleRowClick}>
        {/*
          Toggle chevron: always rendered for visual alignment.
          tabIndex -1 removes it from tab order; aria-hidden hides it from AT
          since expand/collapse is handled via the treeitem's keyboard events.
        */}
        <button
          type="button"
          className={toggleClasses}
          onClick={handleToggleClick}
          tabIndex={-1}
          aria-hidden="true"
        >
          {isBranch && <ChevronRight aria-hidden="true" />}
        </button>

        <span className="eidos-tree-icon" aria-hidden="true">
          <NodeIcon size={iconSize} />
        </span>

        <span className="eidos-tree-label">
          {ctx.renderLabel
            ? ctx.renderLabel(node, isSelected, isExpanded)
            : node.label}
        </span>
      </div>

      {/* ── Children (only when branch is expanded) ───────────────────────────── */}
      {isBranch && isExpanded && (
        <ul role="group" className={childrenClasses}>
          {node.children!.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

TreeNodeItem.displayName = 'TreeNodeItem';

// ============================================================================
// TREE VIEW ROOT
// ============================================================================

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  // Single selection
  selectedId,
  defaultSelectedId,
  onSelect,
  // Multi selection
  multiSelect = false,
  selectedIds: selectedIdsProp,
  defaultSelectedIds,
  onSelectMulti,
  // Expansion
  expandedIds: expandedIdsProp,
  defaultExpandedIds,
  onExpand,
  defaultExpandAll = false,
  // Appearance
  size = 'medium',
  showLines = false,
  className,
  // Rendering
  renderLabel,
}) => {
  // ── Node maps (stable across renders until data changes) ────────────────────
  const nodeMap = useMemo(() => buildNodeMap(data), [data]);
  const parentMap = useMemo(() => buildParentMap(data), [data]);

  // ── Single-selection state ──────────────────────────────────────────────────
  const isSingleControlled = selectedId !== undefined;
  const [localSingleId, setLocalSingleId] = useState<string | undefined>(defaultSelectedId);
  const effectiveSingleId = isSingleControlled ? selectedId : localSingleId;

  // ── Multi-selection state ───────────────────────────────────────────────────
  const isMultiControlled = selectedIdsProp !== undefined;
  const [localMultiIds, setLocalMultiIds] = useState<string[]>(defaultSelectedIds ?? []);
  const effectiveMultiIds = isMultiControlled ? selectedIdsProp! : localMultiIds;

  // ── Derived selected set ────────────────────────────────────────────────────
  const selectedSet = useMemo<Set<string>>(() => {
    if (multiSelect) return new Set(effectiveMultiIds);
    return effectiveSingleId !== undefined ? new Set([effectiveSingleId]) : new Set();
  }, [multiSelect, effectiveMultiIds, effectiveSingleId]);

  // ── Expansion state ─────────────────────────────────────────────────────────
  const isExpansionControlled = expandedIdsProp !== undefined;
  const [localExpandedIds, setLocalExpandedIds] = useState<string[]>(() => {
    // defaultExpandAll wins over defaultExpandedIds.
    if (defaultExpandAll) return collectAllBranchIds(data);
    return defaultExpandedIds ?? [];
  });
  const effectiveExpandedIds = isExpansionControlled ? expandedIdsProp! : localExpandedIds;
  const expandedSet = useMemo(() => new Set(effectiveExpandedIds), [effectiveExpandedIds]);

  // ── Roving tabindex focus tracking ──────────────────────────────────────────
  const [tabFocusId, setTabFocusId] = useState<string | null>(() => data[0]?.id ?? null);

  /** Map of node id → li DOM element. Populated by TreeNodeItem callback refs. */
  const nodeRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // ── Expand / collapse ───────────────────────────────────────────────────────
  const handleToggleExpand = useCallback(
    (id: string) => {
      const willExpand = !expandedSet.has(id);
      if (!isExpansionControlled) {
        setLocalExpandedIds((prev) =>
          willExpand ? [...prev, id] : prev.filter((eid) => eid !== id),
        );
      }
      onExpand?.(id, willExpand);
    },
    [expandedSet, isExpansionControlled, onExpand],
  );

  // ── Select ──────────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback(
    (node: TreeNode) => {
      if (node.disabled) return;

      if (multiSelect) {
        const isCurrentlySelected = selectedSet.has(node.id);
        const nextIds = isCurrentlySelected
          ? effectiveMultiIds.filter((id) => id !== node.id)
          : [...effectiveMultiIds, node.id];

        if (!isMultiControlled) setLocalMultiIds(nextIds);

        const nextNodes = nextIds
          .map((id) => nodeMap.get(id))
          .filter((n): n is TreeNode => n !== undefined);
        onSelectMulti?.(nextNodes);
      } else {
        if (!isSingleControlled) setLocalSingleId(node.id);
        onSelect?.(node);
      }

      // Move roving tabindex to the interacted node.
      setTabFocusId(node.id);
    },
    [
      multiSelect,
      selectedSet,
      effectiveMultiIds,
      isMultiControlled,
      isSingleControlled,
      nodeMap,
      onSelect,
      onSelectMulti,
    ],
  );

  // ── Focus ───────────────────────────────────────────────────────────────────
  const handleNodeFocus = useCallback((id: string) => {
    setTabFocusId(id);
  }, []);

  // ── Keyboard navigation (ARIA tree pattern) ─────────────────────────────────
  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, node: TreeNode, isBranch: boolean) => {
      const visibleIds = computeVisibleIds(data, expandedSet);
      const currentIndex = visibleIds.indexOf(node.id);

      /** Move roving tabindex to id and immediately focus the li element. */
      const focusNode = (id: string): void => {
        setTabFocusId(id);
        nodeRefs.current.get(id)?.focus();
      };

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextId = visibleIds[currentIndex + 1];
          if (nextId !== undefined) focusNode(nextId);
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          const prevId = visibleIds[currentIndex - 1];
          if (prevId !== undefined) focusNode(prevId);
          break;
        }

        case 'ArrowRight': {
          e.preventDefault();
          if (!isBranch) break;
          if (!expandedSet.has(node.id)) {
            // Expand; per ARIA APG focus stays on current node after opening.
            handleToggleExpand(node.id);
          } else {
            // Already expanded - move into first child.
            const firstChildId = visibleIds[currentIndex + 1];
            if (firstChildId !== undefined) focusNode(firstChildId);
          }
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          if (isBranch && expandedSet.has(node.id)) {
            // Collapse this branch; focus stays on it.
            handleToggleExpand(node.id);
          } else {
            // Move to parent (no-op for root nodes).
            const parentId = parentMap.get(node.id);
            if (parentId !== undefined && parentId !== null) focusNode(parentId);
          }
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (!node.disabled) handleNodeClick(node);
          break;
        }

        case 'Home': {
          e.preventDefault();
          const firstId = visibleIds[0];
          if (firstId !== undefined) focusNode(firstId);
          break;
        }

        case 'End': {
          e.preventDefault();
          const lastId = visibleIds[visibleIds.length - 1];
          if (lastId !== undefined) focusNode(lastId);
          break;
        }

        default:
          break;
      }
    },
    [data, expandedSet, parentMap, handleToggleExpand, handleNodeClick],
  );

  // ── Context ─────────────────────────────────────────────────────────────────
  const contextValue = useMemo<TreeContextValue>(
    () => ({
      selectedIds: selectedSet,
      expandedIds: expandedSet,
      tabFocusId,
      multiSelect,
      size,
      showLines,
      renderLabel,
      onNodeClick: handleNodeClick,
      onToggleExpand: handleToggleExpand,
      onNodeFocus: handleNodeFocus,
      onNodeKeyDown: handleNodeKeyDown,
      nodeRefs,
    }),
    [
      selectedSet,
      expandedSet,
      tabFocusId,
      multiSelect,
      size,
      showLines,
      renderLabel,
      handleNodeClick,
      handleToggleExpand,
      handleNodeFocus,
      handleNodeKeyDown,
    ],
  );

  const rootClasses = ['eidos-tree', `eidos-tree--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <TreeContext.Provider value={contextValue}>
      <ul
        role="tree"
        aria-multiselectable={multiSelect || undefined}
        className={rootClasses}
      >
        {data.map((node) => (
          <TreeNodeItem key={node.id} node={node} depth={1} />
        ))}
      </ul>
    </TreeContext.Provider>
  );
};

TreeView.displayName = 'TreeView';
