// Organization metrics calculation — pure functions
// Reference: ChartHop Smart Calculations, OrgChart Now Span of Control

import type { OrgNode, OrgPosition, OrgMetrics } from "../model/types";

/** Check if a node is an OrgPosition (has incumbent field) */
function isPosition(node: OrgNode): node is OrgPosition {
  return "incumbent" in node;
}

/** Check if a position is filled (has an incumbent) */
function isFilled(node: OrgNode): boolean {
  if (isPosition(node)) return node.incumbent !== null;
  // V2 OrgNode: consider filled if name is non-empty and roleType !== "vacant"
  return node.name !== "" && node.roleType !== "vacant";
}

/** Get FTE value from a node */
function getFte(node: OrgNode): number {
  if (isPosition(node)) return node.fte ?? 1.0;
  return 1.0;
}

/**
 * Calculate organization metrics for a node and its entire subtree.
 * Works with both V2 OrgNode and V3 OrgPosition.
 */
export function calculateMetrics(node: OrgNode): OrgMetrics {
  let headcount = 0;
  let totalFte = 0;
  let vacancyCount = 0;
  let totalPositions = 0;
  let maxDepth = 0;

  function walk(n: OrgNode, depth: number) {
    totalPositions++;
    if (depth > maxDepth) maxDepth = depth;

    if (isFilled(n)) {
      headcount++;
      totalFte += getFte(n);
    } else {
      vacancyCount++;
    }

    n.children.forEach((child) => walk(child, depth + 1));
  }

  // Walk all children (not the node itself for headcount — the node is the "manager")
  node.children.forEach((child) => walk(child, 1));

  const directReports = node.children.length;

  // Span of control: direct reports who themselves have reports (managers, not individual contributors)
  const spanOfControl = node.children.filter((c) => c.children.length > 0).length;

  // Include the node itself in total positions count
  totalPositions++;
  if (isFilled(node)) {
    headcount++;
    totalFte += getFte(node);
  } else {
    vacancyCount++;
  }

  return {
    headcount,
    directReports,
    spanOfControl,
    totalFte: Math.round(totalFte * 100) / 100,
    vacancyCount,
    vacancyRate: totalPositions > 0 ? Math.round((vacancyCount / totalPositions) * 1000) / 1000 : 0,
    treeDepth: maxDepth,
  };
}

/**
 * Calculate metrics for a specific node by ID, looking up from a nodesById map.
 */
export function calculateMetricsById(
  nodeId: string,
  nodesById: Map<string, OrgNode>,
): OrgMetrics | null {
  const node = nodesById.get(nodeId);
  if (!node) return null;
  return calculateMetrics(node);
}

/**
 * Calculate headcount rollup for all nodes in a tree.
 * Returns a Map of nodeId → headcount (recursive subordinate count).
 */
export function calculateHeadcountRollup(
  roots: OrgNode[],
): Map<string, number> {
  const rollup = new Map<string, number>();

  function walk(node: OrgNode): number {
    let count = isFilled(node) ? 1 : 0;
    for (const child of node.children) {
      count += walk(child);
    }
    rollup.set(node.id, count);
    return count;
  }

  roots.forEach(walk);
  return rollup;
}
