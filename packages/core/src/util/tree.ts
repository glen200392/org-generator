// Tree traversal and manipulation utilities
// Extracted from index.html L1997-2096, L2625-2638

import type { OrgNode } from "../model/types";

/** Options for cloneTreeWithFilter */
export interface CloneFilterOptions {
  /** Return false to exclude a node and its subtree */
  includeNode?: (node: OrgNode, depth: number) => boolean;
  /** Maximum depth to traverse (default: 999) */
  maxDepth?: number;
}

/**
 * Recursively clone a tree node, applying optional filters.
 * Creates a new tree with independent parent/children references.
 */
export function cloneTreeWithFilter(
  node: OrgNode,
  options: CloneFilterOptions = {},
  depth = 1,
  parent: OrgNode | null = null,
): OrgNode | null {
  const includeSelf = options.includeNode
    ? options.includeNode(node, depth)
    : true;
  if (!includeSelf) return null;

  const cloned: OrgNode = {
    id: node.id,
    parentId: node.parentId,
    level: depth,
    dept: node.dept,
    name: node.name,
    title: node.title,
    bgColor: node.bgColor,
    roleType: node.roleType,
    layoutType: node.layoutType,
    pageGroup: node.pageGroup,
    sortOrder: node.sortOrder || 0,
    showInOverview: node.showInOverview,
    showInDetail: node.showInDetail,
    children: [],
    parent,
    searchMatched: false,
    searchHasMatch: false,
  };

  const maxDepth = options.maxDepth ?? 999;
  if (depth < maxDepth) {
    node.children
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((child) => {
        const c = cloneTreeWithFilter(child, options, depth + 1, cloned);
        if (c) cloned.children.push(c);
      });
  }

  return cloned;
}

/**
 * Collect all descendant node IDs (including the root itself).
 * Takes a nodesById map instead of relying on global state.
 */
export function collectDescendantIds(
  rootId: string,
  nodesById: Map<string, OrgNode>,
): Set<string> {
  const ids = new Set<string>();
  const start = nodesById.get(rootId);
  if (!start) return ids;

  (function walk(node: OrgNode) {
    ids.add(node.id);
    node.children.forEach(walk);
  })(start);

  return ids;
}

/** Find a node by ID in a tree (recursive depth-first search) */
export function findNodeById(
  nodes: OrgNode[],
  id: string,
): OrgNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * Calculate the center point of a rendered node in pixel coordinates.
 * Takes layout constants as parameters instead of using globals.
 */
export function findNodeCenter(
  node: OrgNode,
  ppi: number,
  padX: number,
  padY: number,
  cardW: number,
  cardH: number,
): { x: number; y: number } {
  return {
    x: (node.renderX ?? 0) * ppi + padX + (cardW * ppi) / 2,
    y: (node.renderY ?? 0) * ppi + padY + (cardH * ppi) / 2,
  };
}
