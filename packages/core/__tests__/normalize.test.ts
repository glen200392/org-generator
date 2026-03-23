import { describe, it, expect } from "vitest";
import {
  cloneRows,
  normalizeBool,
  normalizeInt,
  pickField,
  findSheetName,
} from "../src/util/normalize";

describe("cloneRows", () => {
  it("clones rows and filters prototype pollution keys", () => {
    const rows = [{ name: "test", __proto__: "bad", constructor: "evil" }];
    const result = cloneRows(rows);
    expect(result[0]).toHaveProperty("name", "test");
    expect(Object.keys(result[0])).not.toContain("__proto__");
    expect(Object.keys(result[0])).not.toContain("constructor");
  });

  it("deep clones object values", () => {
    const nested = { inner: "value" };
    const rows = [{ data: nested }];
    const result = cloneRows(rows);
    expect(result[0].data).toEqual({ inner: "value" });
    expect(result[0].data).not.toBe(nested); // different reference
  });

  it("handles empty array", () => {
    expect(cloneRows([])).toEqual([]);
  });
});

describe("normalizeBool", () => {
  it("returns true for truthy strings", () => {
    expect(normalizeBool("true")).toBe(true);
    expect(normalizeBool("1")).toBe(true);
    expect(normalizeBool("yes")).toBe(true);
    expect(normalizeBool("Y")).toBe(true);
  });

  it("returns false for falsy strings", () => {
    expect(normalizeBool("false")).toBe(false);
    expect(normalizeBool("0")).toBe(false);
    expect(normalizeBool("no")).toBe(false);
  });

  it("returns fallback for empty/null/undefined", () => {
    expect(normalizeBool("", true)).toBe(true);
    expect(normalizeBool(null, false)).toBe(false);
    expect(normalizeBool(undefined, true)).toBe(true);
  });

  it("passes through booleans", () => {
    expect(normalizeBool(true)).toBe(true);
    expect(normalizeBool(false)).toBe(false);
  });
});

describe("normalizeInt", () => {
  it("parses valid integers", () => {
    expect(normalizeInt("42")).toBe(42);
    expect(normalizeInt(7)).toBe(7);
  });

  it("returns fallback for invalid input", () => {
    expect(normalizeInt("abc", 0)).toBe(0);
    expect(normalizeInt("", 99)).toBe(99);
    expect(normalizeInt(null, 5)).toBe(5);
  });
});

describe("pickField", () => {
  it("picks first non-empty value by key priority", () => {
    const row = { Name: "", name: "found" };
    expect(pickField(row, ["Name", "name"])).toBe("found");
  });

  it("returns empty string when no key matches", () => {
    expect(pickField({}, ["a", "b"])).toBe("");
  });
});

describe("findSheetName", () => {
  it("finds case-insensitive match", () => {
    expect(findSheetName(["NODES", "Edges"], "nodes")).toBe("NODES");
    expect(findSheetName(["Slides"], "slides")).toBe("Slides");
  });

  it("returns null when not found", () => {
    expect(findSheetName(["Nodes"], "Missing")).toBeNull();
  });
});
