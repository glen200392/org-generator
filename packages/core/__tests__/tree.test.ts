import { describe, it, expect } from "vitest";
import {
  findNodeById,
  collectDescendantIds,
  cloneTreeWithFilter,
} from "../src/util/tree";
import type { OrgNode } from "../src/model/types";

function makeNode(id: string, children: OrgNode[] = []): OrgNode {
  return {
    id, parentId: "", dept: id, name: "", title: "", pageGroup: "",
    sortOrder: 0, roleType: "normal", layoutType: "standard",
    showInOverview: true, showInDetail: true, bgColor: "#000",
    level: 1, children, parent: null,
    searchMatched: false, searchHasMatch: false,
  };
}

describe("findNodeById", () => {
  it("finds root node", () => {
    const root = makeNode("A");
    expect(findNodeById([root], "A")?.id).toBe("A");
  });

  it("finds nested node", () => {
    const child = makeNode("B");
    const root = makeNode("A", [child]);
    expect(findNodeById([root], "B")?.id).toBe("B");
  });

  it("returns null for missing node", () => {
    expect(findNodeById([makeNode("A")], "Z")).toBeNull();
  });
});

describe("collectDescendantIds", () => {
  it("collects all descendants including root", () => {
    const c1 = makeNode("C1");
    const c2 = makeNode("C2");
    const root = makeNode("R", [c1, c2]);
    const map = new Map<string, OrgNode>([["R", root], ["C1", c1], ["C2", c2]]);
    const ids = collectDescendantIds("R", map);
    expect(ids).toEqual(new Set(["R", "C1", "C2"]));
  });
});

describe("cloneTreeWithFilter", () => {
  it("clones entire tree by default", () => {
    const child = makeNode("B");
    const root = makeNode("A", [child]);
    const cloned = cloneTreeWithFilter(root);
    expect(cloned?.id).toBe("A");
    expect(cloned?.children).toHaveLength(1);
    expect(cloned?.children[0].id).toBe("B");
    expect(cloned).not.toBe(root); // different reference
  });

  it("respects maxDepth", () => {
    const grandchild = makeNode("GC");
    const child = makeNode("C", [grandchild]);
    const root = makeNode("R", [child]);
    const cloned = cloneTreeWithFilter(root, { maxDepth: 2 });
    expect(cloned?.children[0].children).toHaveLength(0);
  });

  it("respects includeNode filter", () => {
    const keep = makeNode("KEEP");
    const skip = makeNode("SKIP");
    const root = makeNode("R", [keep, skip]);
    const cloned = cloneTreeWithFilter(root, {
      includeNode: (n) => n.id !== "SKIP",
    });
    expect(cloned?.children).toHaveLength(1);
    expect(cloned?.children[0].id).toBe("KEEP");
  });
});
