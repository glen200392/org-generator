import { describe, it, expect } from "vitest";
import {
  evaluateRules,
  hasVisualEffect,
  createVacancyHighlightRule,
  createMissingEmailRule,
  createHighSpanRule,
} from "../src/model/rules";
import { nodeToPosition } from "../src/model/position";
import type { OrgNode, ConditionalRule } from "../src/model/types";

function makeNode(overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id: "N1", parentId: "", dept: "HR", name: "Alice", title: "Manager",
    pageGroup: "OVR", sortOrder: 0, roleType: "normal", layoutType: "standard",
    showInOverview: true, showInDetail: true, bgColor: "#0A192F",
    level: 1, children: [], parent: null,
    searchMatched: false, searchHasMatch: false,
    ...overrides,
  };
}

describe("evaluateRules", () => {
  it("returns empty action when no rules match", () => {
    const node = nodeToPosition(makeNode());
    const rules: ConditionalRule[] = [{
      id: "r1", name: "test", priority: 1, enabled: true,
      condition: { logic: "and", checks: [{ field: "dept", operator: "eq", value: "Finance" }] },
      action: { fillColor: "#FF0000" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.fillColor).toBeUndefined();
  });

  it("applies action when condition matches", () => {
    const node = nodeToPosition(makeNode({ dept: "Finance" }));
    const rules: ConditionalRule[] = [{
      id: "r1", name: "test", priority: 1, enabled: true,
      condition: { logic: "and", checks: [{ field: "dept", operator: "eq", value: "Finance" }] },
      action: { fillColor: "#FF0000" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.fillColor).toBe("#FF0000");
  });

  it("supports nested field paths (incumbent.email)", () => {
    const node = nodeToPosition(makeNode());
    node.incumbent!.email = "";
    const rules: ConditionalRule[] = [{
      id: "r1", name: "no-email", priority: 1, enabled: true,
      condition: { logic: "and", checks: [{ field: "incumbent.email", operator: "isEmpty", value: "" }] },
      action: { borderColor: "#F59E0B" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.borderColor).toBe("#F59E0B");
  });

  it("higher priority rules override lower", () => {
    const node = nodeToPosition(makeNode());
    const rules: ConditionalRule[] = [
      { id: "r1", name: "low", priority: 1, enabled: true,
        condition: { logic: "and", checks: [{ field: "dept", operator: "isNotEmpty", value: "" }] },
        action: { fillColor: "#BLUE" } },
      { id: "r2", name: "high", priority: 10, enabled: true,
        condition: { logic: "and", checks: [{ field: "dept", operator: "isNotEmpty", value: "" }] },
        action: { fillColor: "#RED" } },
    ];
    const result = evaluateRules(node, rules);
    expect(result.fillColor).toBe("#RED");
  });

  it("skips disabled rules", () => {
    const node = nodeToPosition(makeNode());
    const rules: ConditionalRule[] = [{
      id: "r1", name: "disabled", priority: 1, enabled: false,
      condition: { logic: "and", checks: [{ field: "dept", operator: "isNotEmpty", value: "" }] },
      action: { fillColor: "#FF0000" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.fillColor).toBeUndefined();
  });

  it("supports OR logic", () => {
    const node = nodeToPosition(makeNode({ dept: "Sales" }));
    const rules: ConditionalRule[] = [{
      id: "r1", name: "or-test", priority: 1, enabled: true,
      condition: { logic: "or", checks: [
        { field: "dept", operator: "eq", value: "HR" },
        { field: "dept", operator: "eq", value: "Sales" },
      ]},
      action: { badge: "Priority" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.badge).toBe("Priority");
  });

  it("supports numeric comparisons", () => {
    const node = nodeToPosition(makeNode());
    node.fte = 0.5;
    const rules: ConditionalRule[] = [{
      id: "r1", name: "part-time", priority: 1, enabled: true,
      condition: { logic: "and", checks: [{ field: "fte", operator: "lt", value: 1.0 }] },
      action: { icon: "⏰" },
    }];
    const result = evaluateRules(node, rules);
    expect(result.icon).toBe("⏰");
  });
});

describe("hasVisualEffect", () => {
  it("returns false for empty action", () => {
    expect(hasVisualEffect({})).toBe(false);
  });

  it("returns true when any field is set", () => {
    expect(hasVisualEffect({ badge: "TBH" })).toBe(true);
    expect(hasVisualEffect({ fillColor: "#FFF" })).toBe(true);
  });
});

describe("preset rules", () => {
  it("vacancy rule matches vacant positions", () => {
    const vacant = nodeToPosition(makeNode({ roleType: "vacant", name: "" }));
    const result = evaluateRules(vacant, [createVacancyHighlightRule()]);
    expect(result.borderColor).toBe("#DC2626");
    expect(result.badge).toBe("TBH");
  });

  it("vacancy rule does not match filled positions", () => {
    const filled = nodeToPosition(makeNode());
    const result = evaluateRules(filled, [createVacancyHighlightRule()]);
    expect(result.borderColor).toBeUndefined();
  });

  it("missing email rule matches", () => {
    const node = nodeToPosition(makeNode());
    node.incumbent!.email = "";
    const result = evaluateRules(node, [createMissingEmailRule()]);
    expect(result.icon).toBe("⚠️");
  });
});
