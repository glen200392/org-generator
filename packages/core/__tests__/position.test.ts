import { describe, it, expect } from "vitest";
import {
  nodeToPosition,
  positionToNode,
  getPositionDisplayName,
  getDeptDisplay,
  getTitleDisplay,
  createEmptyPerson,
} from "../src/model/position";
import type { OrgNode } from "../src/model/types";

function makeNode(overrides: Partial<OrgNode> = {}): OrgNode {
  return {
    id: "N1", parentId: "", dept: "研發部", name: "王大明", title: "CTO",
    pageGroup: "OVR", sortOrder: 0, roleType: "normal", layoutType: "standard",
    showInOverview: true, showInDetail: true, bgColor: "#0A192F",
    level: 1, children: [], parent: null,
    searchMatched: false, searchHasMatch: false,
    ...overrides,
  };
}

describe("nodeToPosition", () => {
  it("converts OrgNode to OrgPosition with incumbent", () => {
    const pos = nodeToPosition(makeNode());
    expect(pos.id).toBe("N1");
    expect(pos.dept).toBe("研發部");
    expect(pos.incumbent).not.toBeNull();
    expect(pos.incumbent?.name).toBe("王大明");
    expect(pos.fte).toBe(1.0);
    expect(pos.code).toBe("");
    expect(pos.isAssistant).toBe(false);
  });

  it("sets incumbent to null for vacant nodes", () => {
    const pos = nodeToPosition(makeNode({ roleType: "vacant", name: "" }));
    expect(pos.incumbent).toBeNull();
  });

  it("sets isAssistant for assistant roleType", () => {
    const pos = nodeToPosition(makeNode({ roleType: "assistant" }));
    expect(pos.isAssistant).toBe(true);
  });
});

describe("positionToNode", () => {
  it("round-trips correctly", () => {
    const original = makeNode();
    const pos = nodeToPosition(original);
    const back = positionToNode(pos);
    expect(back.id).toBe("N1");
    expect(back.name).toBe("王大明");
    expect(back.dept).toBe("研發部");
  });

  it("maps vacant position name to empty string", () => {
    const pos = nodeToPosition(makeNode({ roleType: "vacant", name: "" }));
    const back = positionToNode(pos);
    expect(back.name).toBe("");
  });
});

describe("getPositionDisplayName", () => {
  it("returns incumbent name in TW", () => {
    const pos = nodeToPosition(makeNode());
    expect(getPositionDisplayName(pos, "tw")).toBe("王大明");
  });

  it("returns vacancy label when no incumbent", () => {
    const pos = nodeToPosition(makeNode({ roleType: "vacant" }));
    expect(getPositionDisplayName(pos, "tw", "空缺")).toBe("空缺");
  });

  it("returns English name when available", () => {
    const pos = nodeToPosition(makeNode());
    pos.incumbent!.nameEn = "David Wang";
    expect(getPositionDisplayName(pos, "en")).toBe("David Wang");
  });
});

describe("getDeptDisplay / getTitleDisplay", () => {
  it("returns local language by default", () => {
    const pos = nodeToPosition(makeNode());
    expect(getDeptDisplay(pos)).toBe("研發部");
    expect(getTitleDisplay(pos)).toBe("CTO");
  });

  it("returns English when available", () => {
    const pos = nodeToPosition(makeNode());
    pos.deptEn = "R&D";
    pos.titleEn = "Chief Technology Officer";
    expect(getDeptDisplay(pos, "en")).toBe("R&D");
    expect(getTitleDisplay(pos, "en")).toBe("Chief Technology Officer");
  });

  it("falls back to local if English is empty", () => {
    const pos = nodeToPosition(makeNode());
    expect(getDeptDisplay(pos, "en")).toBe("研發部");
  });
});

describe("createEmptyPerson", () => {
  it("creates a person with all fields defaulted", () => {
    const p = createEmptyPerson();
    expect(p.employeeId).toBe("");
    expect(p.employmentType).toBe("FT");
  });
});
