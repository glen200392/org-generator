// Test the scenario diff algorithm (it lives in Studio but uses core types)
// We test the pure diff logic here since it only depends on OrgNode

import { describe, it, expect } from "vitest";
import type { OrgNode } from "../src/model/types";

// Inline the diff logic for testing (same algorithm as apps/studio/src/features/scenario/diff.ts)
function flattenTree(roots: OrgNode[]): Map<string, { parentId: string; dept: string; name: string; title: string }> {
  const map = new Map();
  function walk(node: OrgNode) {
    map.set(node.id, { parentId: node.parentId, dept: node.dept, name: node.name, title: node.title });
    node.children.forEach(walk);
  }
  roots.forEach(walk);
  return map;
}

function diffScenarios(before: OrgNode[], after: OrgNode[]) {
  const beforeMap = flattenTree(before);
  const afterMap = flattenTree(after);
  const added: string[] = [], removed: string[] = [], moved: string[] = [], modified: string[] = [], unchanged: string[] = [];

  afterMap.forEach((afterNode, id) => {
    const beforeNode = beforeMap.get(id);
    if (!beforeNode) { added.push(id); return; }
    if (beforeNode.parentId !== afterNode.parentId) { moved.push(id); return; }
    const changed = beforeNode.dept !== afterNode.dept || beforeNode.name !== afterNode.name || beforeNode.title !== afterNode.title;
    if (changed) modified.push(id);
    else unchanged.push(id);
  });

  beforeMap.forEach((_, id) => { if (!afterMap.has(id)) removed.push(id); });
  return { added, removed, moved, modified, unchanged };
}

function makeNode(id: string, parentId = "", children: OrgNode[] = [], overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id, parentId, dept: `Dept-${id}`, name: `Name-${id}`, title: `Title-${id}`,
    pageGroup: "", sortOrder: 0, roleType: "normal", layoutType: "standard",
    showInOverview: true, showInDetail: true, bgColor: "#000",
    level: 1, children, parent: null, searchMatched: false, searchHasMatch: false,
    ...overrides,
  };
}

describe("diffScenarios", () => {
  it("detects no changes for identical trees", () => {
    const tree = [makeNode("A", "", [makeNode("B", "A")])];
    const result = diffScenarios(tree, tree);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(2);
  });

  it("detects added nodes", () => {
    const before = [makeNode("A")];
    const after = [makeNode("A", "", [makeNode("B", "A")])];
    const result = diffScenarios(before, after);
    expect(result.added).toEqual(["B"]);
  });

  it("detects removed nodes", () => {
    const before = [makeNode("A", "", [makeNode("B", "A")])];
    const after = [makeNode("A")];
    const result = diffScenarios(before, after);
    expect(result.removed).toEqual(["B"]);
  });

  it("detects moved nodes", () => {
    const before = [makeNode("A", "", [makeNode("B", "A")]), makeNode("C")];
    const after = [makeNode("A"), makeNode("C", "", [makeNode("B", "C")])]; // B moved from A to C
    const result = diffScenarios(before, after);
    expect(result.moved).toEqual(["B"]);
  });

  it("detects modified nodes", () => {
    const before = [makeNode("A", "", [], { dept: "Old Dept" })];
    const after = [makeNode("A", "", [], { dept: "New Dept" })];
    const result = diffScenarios(before, after);
    expect(result.modified).toEqual(["A"]);
  });
});
