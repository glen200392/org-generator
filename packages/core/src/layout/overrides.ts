// Layout override application — pure functions
// Extracted from index.html L2511-2528

import type { OrgNode, LayoutOverride } from "../model/types";

/** Build a lookup key for layout overrides */
export function overrideKey(targetType: string, pageGroup: string, targetId: string): string {
  return `${targetType}::${pageGroup}::${targetId}`;
}

/** Get a node's layout override from a map */
export function getNodeOverride(
  overrides: Map<string, LayoutOverride>,
  pageGroup: string,
  nodeId: string,
): LayoutOverride | null {
  return overrides.get(overrideKey("node", pageGroup, nodeId)) ?? null;
}

/** Clamp an override offset based on export mode */
export function clampOverride(offset: number, exportMode: string): number {
  if (exportMode !== "stable") return offset;
  return Math.max(-0.8, Math.min(0.8, offset));
}

/**
 * Apply layout overrides to a tree of nodes.
 * Mutates renderX/renderY in place.
 */
export function applyLayoutOverrides(
  nodes: OrgNode[],
  pageGroup: string,
  exportMode: string,
  overrides: Map<string, LayoutOverride>,
): void {
  function walk(node: OrgNode) {
    const override = getNodeOverride(overrides, pageGroup, node.id);
    const ox = override ? clampOverride(Number(override.offsetX || 0), exportMode) : 0;
    const oy = override ? clampOverride(Number(override.offsetY || 0), exportMode) : 0;
    node.renderX = (node.renderX ?? 0) + ox;
    node.renderY = (node.renderY ?? 0) + oy;
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
}

/** Build a Map from a list of layout overrides */
export function buildOverrideMap(overrides: LayoutOverride[]): Map<string, LayoutOverride> {
  const map = new Map<string, LayoutOverride>();
  for (const o of overrides) {
    map.set(overrideKey(o.targetType, o.pageGroup, o.targetId), o);
  }
  return map;
}
