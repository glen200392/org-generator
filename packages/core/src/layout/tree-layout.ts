// Tree layout calculation — pure math, no DOM
// Extracted from index.html L2474-2534

import type { OrgNode } from "../model/types";
import { BASE_CARD_W, BASE_CARD_H, BASE_GAP_X, BASE_GAP_Y } from "../model/types";

export interface LayoutResult {
  /** Total width of the tree in inches */
  totalWidth: number;
  /** Actual depth of the tree in levels */
  actualDepth: number;
}

/**
 * Calculate layout positions for all nodes in the tree.
 * Mutates node.renderX and node.renderY in place.
 *
 * @param nodes - Root nodes of the tree
 * @param maxLevels - Maximum depth to render
 * @param collapsedIds - Set of node IDs that are collapsed (ignored during export)
 * @param forExport - When true, ignores collapsed state and search state
 * @param searchQuery - Current search query (for expanding matched branches)
 */
export function calculateLayout(
  nodes: OrgNode[],
  maxLevels: number,
  collapsedIds: Set<string> = new Set(),
  forExport = false,
  searchQuery = "",
): LayoutResult {
  let leafX = 0;
  let maxD = 1;

  function getVisibleChildren(node: OrgNode, d: number): OrgNode[] {
    if (d >= maxLevels) return [];
    const forceExpand = !forExport && searchQuery.trim() && node.searchHasMatch;
    return !collapsedIds.has(node.id) || forceExpand ? node.children : [];
  }

  function calc(node: OrgNode, d: number) {
    if (d > maxD) maxD = d;
    node.renderY = (d - 1) * (BASE_CARD_H + BASE_GAP_Y);
    const visCh = getVisibleChildren(node, d);
    if (!visCh.length) {
      node.renderX = leafX;
      leafX += BASE_CARD_W + BASE_GAP_X;
    } else {
      visCh.forEach((c) => calc(c, d + 1));
      node.renderX = (visCh[0].renderX! + visCh[visCh.length - 1].renderX!) / 2;
    }
  }

  nodes.forEach((r) => calc(r, 1));
  return { totalWidth: leafX, actualDepth: maxD };
}

/**
 * Apply special layout adjustments based on role type and layout type.
 * Mutates renderX/renderY in place.
 */
export function applyRoleLayoutAdjustments(nodes: OrgNode[]): void {
  function walk(node: OrgNode) {
    if (
      node.layoutType === "sidecar" ||
      node.roleType === "assistant" ||
      node.roleType === "shared-service"
    ) {
      node.renderX = (node.renderX ?? 0) + 1.0;
      node.renderY = (node.renderY ?? 0) - 0.18;
    }
    if (node.layoutType === "between") {
      node.renderY = (node.renderY ?? 0) - 0.55;
      node.renderX = (node.renderX ?? 0) + 0.35;
    }
    if (node.layoutType === "stacked") {
      node.renderY = (node.renderY ?? 0) + 0.25;
    }
    if (node.roleType === "vacant") {
      node.title = node.title || "Vacant";
    }
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
}
