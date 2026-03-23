import { describe, it, expect } from "vitest";
import {
  ROLE_TYPES,
  LAYOUT_TYPES,
  EDGE_TYPES,
  validateRoleType,
  validateLayoutType,
  validateEdgeType,
  validateRenderMode,
  BASE_CARD_W,
  PPI,
} from "../src/model/types";

describe("types constants", () => {
  it("ROLE_TYPES includes all 6 role types including committee", () => {
    expect(ROLE_TYPES).toContain("committee");
    expect(ROLE_TYPES).toHaveLength(6);
  });

  it("LAYOUT_TYPES has 5 entries", () => {
    expect(LAYOUT_TYPES).toHaveLength(5);
  });

  it("EDGE_TYPES has 5 entries", () => {
    expect(EDGE_TYPES).toHaveLength(5);
  });

  it("layout constants are correct", () => {
    expect(BASE_CARD_W).toBe(1.8);
    expect(PPI).toBe(100);
  });
});

describe("validateRoleType", () => {
  it("returns valid role type as-is", () => {
    expect(validateRoleType("assistant")).toBe("assistant");
    expect(validateRoleType("committee")).toBe("committee");
  });

  it("returns fallback for invalid input", () => {
    expect(validateRoleType("invalid")).toBe("normal");
    expect(validateRoleType("")).toBe("normal");
  });

  it("respects custom fallback", () => {
    expect(validateRoleType("invalid", "vacant")).toBe("vacant");
  });
});

describe("validateLayoutType", () => {
  it("validates known layout types", () => {
    expect(validateLayoutType("sidecar")).toBe("sidecar");
    expect(validateLayoutType("bad")).toBe("standard");
  });
});

describe("validateEdgeType", () => {
  it("validates known edge types", () => {
    expect(validateEdgeType("advisory")).toBe("advisory");
    expect(validateEdgeType("bad")).toBe("dotted");
  });
});

describe("validateRenderMode", () => {
  it("validates known render modes", () => {
    expect(validateRenderMode("overview")).toBe("overview");
    expect(validateRenderMode("bad")).toBe("subtree");
  });
});
