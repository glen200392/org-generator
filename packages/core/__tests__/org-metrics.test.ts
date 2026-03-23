import { describe, it, expect } from "vitest";
import { calculateMetrics, calculateHeadcountRollup } from "../src/metrics/org-metrics";
import { nodeToPosition } from "../src/model/position";
import type { OrgNode } from "../src/model/types";

function makeNode(id: string, children: OrgNode[] = [], overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id, parentId: "", dept: id, name: `Person ${id}`, title: "Role",
    pageGroup: "OVR", sortOrder: 0, roleType: "normal", layoutType: "standard",
    showInOverview: true, showInDetail: true, bgColor: "#000",
    level: 1, children, parent: null,
    searchMatched: false, searchHasMatch: false,
    ...overrides,
  };
}

describe("calculateMetrics", () => {
  it("calculates metrics for a single node (leaf)", () => {
    const node = makeNode("A");
    const m = calculateMetrics(node);
    expect(m.headcount).toBe(1); // the node itself
    expect(m.directReports).toBe(0);
    expect(m.spanOfControl).toBe(0);
    expect(m.vacancyCount).toBe(0);
    expect(m.treeDepth).toBe(0);
  });

  it("calculates metrics for a tree", () => {
    const gc1 = makeNode("GC1");
    const gc2 = makeNode("GC2");
    const c1 = makeNode("C1", [gc1, gc2]); // manager with 2 reports
    const c2 = makeNode("C2");             // individual contributor
    const root = makeNode("ROOT", [c1, c2]);

    const m = calculateMetrics(root);
    expect(m.headcount).toBe(5);      // ROOT + C1 + C2 + GC1 + GC2
    expect(m.directReports).toBe(2);  // C1, C2
    expect(m.spanOfControl).toBe(1);  // only C1 has children
    expect(m.treeDepth).toBe(2);      // C1→GC1 = 2 levels
    expect(m.vacancyCount).toBe(0);
    expect(m.vacancyRate).toBe(0);
  });

  it("counts vacancies correctly", () => {
    const filled = makeNode("FILLED");
    const vacant = makeNode("VACANT", [], { roleType: "vacant", name: "" });
    const root = makeNode("ROOT", [filled, vacant]);

    const m = calculateMetrics(root);
    expect(m.headcount).toBe(2);      // ROOT + FILLED
    expect(m.vacancyCount).toBe(1);   // VACANT
    expect(m.vacancyRate).toBeCloseTo(1 / 3, 2); // 1 vacant / 3 total
  });

  it("works with OrgPosition (FTE)", () => {
    const child = nodeToPosition(makeNode("C1"));
    child.fte = 0.5;
    const root = nodeToPosition(makeNode("ROOT", [child as OrgNode]));
    root.fte = 1.0;

    const m = calculateMetrics(root as OrgNode);
    expect(m.totalFte).toBe(1.5);
  });
});

describe("calculateHeadcountRollup", () => {
  it("returns headcount per node", () => {
    const c1 = makeNode("C1");
    const c2 = makeNode("C2");
    const root = makeNode("ROOT", [c1, c2]);

    const rollup = calculateHeadcountRollup([root]);
    expect(rollup.get("ROOT")).toBe(3); // ROOT + C1 + C2
    expect(rollup.get("C1")).toBe(1);
    expect(rollup.get("C2")).toBe(1);
  });

  it("excludes vacant from headcount", () => {
    const vacant = makeNode("V", [], { roleType: "vacant", name: "" });
    const root = makeNode("ROOT", [vacant]);

    const rollup = calculateHeadcountRollup([root]);
    expect(rollup.get("ROOT")).toBe(1); // only ROOT, not VACANT
  });
});
