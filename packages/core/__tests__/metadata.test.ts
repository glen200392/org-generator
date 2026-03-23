import { describe, it, expect } from "vitest";
import {
  encodeMetadataPayload,
  decodeMetadataPayload,
  extractMetadataPayload,
} from "../src/export/metadata";
import type { SerializedPayload } from "../src/model/types";

const samplePayload: SerializedPayload = {
  version: 2,
  exportedAt: "2026-03-23T10:00:00.000Z",
  theme: "blue",
  exportMode: "stable",
  selectedPageGroup: "OVR",
  workbook: {
    nodesRows: [{ NodeID: "N1", Dept: "HQ" }],
    edgesRows: [],
    slidesRows: [{ PageGroup: "OVR" }],
    layoutRows: [],
  },
};

describe("encodeMetadataPayload", () => {
  it("produces a string starting with OGMODELV2:", () => {
    const encoded = encodeMetadataPayload(samplePayload);
    expect(encoded).toMatch(/^OGMODELV2:/);
  });
});

describe("decodeMetadataPayload", () => {
  it("round-trips encode → decode", () => {
    const encoded = encodeMetadataPayload(samplePayload);
    const decoded = decodeMetadataPayload(encoded);
    expect(decoded).toEqual(samplePayload);
  });

  it("returns null for invalid input", () => {
    expect(decodeMetadataPayload("")).toBeNull();
    expect(decodeMetadataPayload("OGMODELV2:!!!invalid")).toBeNull();
    expect(decodeMetadataPayload("wrong-prefix")).toBeNull();
  });

  it("rejects payloads missing required fields (C2 fix)", () => {
    // Encode a non-payload object directly
    const fakeEncoded = "OGMODELV2:" + btoa('{"bad":"data"}');
    expect(decodeMetadataPayload(fakeEncoded)).toBeNull();
  });
});

describe("extractMetadataPayload", () => {
  it("extracts payload from surrounding text", () => {
    const encoded = encodeMetadataPayload(samplePayload);
    const text = `Some PPT notes before ${encoded} and after`;
    const result = extractMetadataPayload(text);
    expect(result?.version).toBe(2);
    expect(result?.workbook.nodesRows).toHaveLength(1);
  });

  it("returns null when no payload found", () => {
    expect(extractMetadataPayload("no payload here")).toBeNull();
  });
});
