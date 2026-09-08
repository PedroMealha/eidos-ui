import type React from 'react';
import type { ComponentSizeProps } from '../../utils';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  disabled?: boolean;
  data?: unknown; // arbitrary payload the consumer can use
}

export interface TreeViewProps {
  data: TreeNode[];
  // Selection - single
  selectedId?: string; // controlled
  defaultSelectedId?: string; // uncontrolled
  onSelect?: (node: TreeNode) => void;
  // Selection - multi
  multiSelect?: boolean; // default: false
  selectedIds?: string[]; // controlled multi
  defaultSelectedIds?: string[];
  onSelectMulti?: (nodes: TreeNode[]) => void;
  // Expansion
  expandedIds?: string[]; // controlled
  defaultExpandedIds?: string[];
  onExpand?: (id: string, expanded: boolean) => void;
  defaultExpandAll?: boolean;
  // Appearance
  size?: ComponentSizeProps; // default: 'md'
  showLines?: boolean; // indent guide lines, default: false
  className?: string;
  // Rendering
  renderLabel?: (node: TreeNode, isSelected: boolean, isExpanded: boolean) => React.ReactNode;
}
