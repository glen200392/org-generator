// Scenario diff algorithm — compare two org chart trees
// Produces a structured diff that can be visualized on the canvas

import type { OrgNode, RuleAction } from "@orgchart/core";

export interface NodeDiff {
  nodeId: string;
  type: "added" | "removed" | "moved" | "modified" | "unchanged";
  fromParent?: string;
  toParent?: string;
  changes?: Record<string, { old: string; new: string }>;
}

export interface ScenarioDiffResult {
  diffs: NodeDiff[];
  added: string[];
  removed: string[];
  moved: string[];
  modified: string[];
  unchanged: string[];
}

/** Flatten a tree into a Map of id → { parentId, dept, name, title, ... } */
function flattenTree(roots: OrgNode[]): Map<string, { parentId: string; dept: string; name: string; title: string }> {
  const map = new Map<string, { parentId: string; dept: string; name: string; title: string }>();
  function walk(node: OrgNode) {
    map.set(node.id, {
      parentId: node.parentId,
      dept: node.dept,
      name: node.name,
      title: node.title,
    });
    node.children.forEach(walk);
  }
  roots.forEach(walk);
  return map;
}

/**
 * Compare two scenarios (before/after trees).
 * Returns structured diff with categorized changes.
 */
export function diffScenarios(
  before: OrgNode[],
  after: OrgNode[],
): ScenarioDiffResult {
  const beforeMap = flattenTree(before);
  const afterMap = flattenTree(after);
  const diffs: NodeDiff[] = [];

  const added: string[] = [];
  const removed: string[] = [];
  const moved: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  // Check nodes in "after" — find added, moved, modified
  afterMap.forEach((afterNode, id) => {
    const beforeNode = beforeMap.get(id);

    if (!beforeNode) {
      // Node exists in after but not before → added
      diffs.push({ nodeId: id, type: "added" });
      added.push(id);
      return;
    }

    // Check if parent changed → moved
    if (beforeNode.parentId !== afterNode.parentId) {
      diffs.push({
        nodeId: id,
        type: "moved",
        fromParent: beforeNode.parentId,
        toParent: afterNode.parentId,
      });
      moved.push(id);
      return;
    }

    // Check if content changed → modified
    const changes: Record<string, { old: string; new: string }> = {};
    if (beforeNode.dept !== afterNode.dept) changes.dept = { old: beforeNode.dept, new: afterNode.dept };
    if (beforeNode.name !== afterNode.name) changes.name = { old: beforeNode.name, new: afterNode.name };
    if (beforeNode.title !== afterNode.title) changes.title = { old: beforeNode.title, new: afterNode.title };

    if (Object.keys(changes).length > 0) {
      diffs.push({ nodeId: id, type: "modified", changes });
      modified.push(id);
    } else {
      diffs.push({ nodeId: id, type: "unchanged" });
      unchanged.push(id);
    }
  });

  // Check nodes in "before" that don't exist in "after" → removed
  beforeMap.forEach((_, id) => {
    if (!afterMap.has(id)) {
      diffs.push({ nodeId: id, type: "removed" });
      removed.push(id);
    }
  });

  return { diffs, added, removed, moved, modified, unchanged };
}

/**
 * Convert a diff type to a visual RuleAction for highlighting on the canvas.
 */
export function diffToRuleAction(type: NodeDiff["type"]): RuleAction {
  switch (type) {
    case "added":
      return { borderColor: "#22C55E", borderStyle: "bold", badge: "➕" };
    case "removed":
      return { borderColor: "#EF4444", borderStyle: "dashed", badge: "➖", fillColor: "#FEE2E2" };
    case "moved":
      return { borderColor: "#F59E0B", borderStyle: "bold", badge: "↔" };
    case "modified":
      return { borderColor: "#3B82F6", borderStyle: "bold", badge: "✏️" };
    default:
      return {};
  }
}
