// Test voice transcript parsing logic (same algorithm as Studio voice-input.ts)

import { describe, it, expect } from "vitest";

function parseVoiceTranscript(transcript: string) {
  const cleaned = transcript.trim();
  if (!cleaned) return null;
  let parts = cleaned.split(/[，,]/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) return { dept: parts[0], name: parts[1], title: parts.slice(2).join(" ") };
  if (parts.length === 2) return { dept: parts[0], name: parts[1], title: "" };
  if (parts.length === 1) return { dept: parts[0], name: "", title: "" };
  return null;
}

describe("parseVoiceTranscript", () => {
  it("parses space-separated Chinese input", () => {
    const result = parseVoiceTranscript("財務部 陳美華 財務長");
    expect(result).toEqual({ dept: "財務部", name: "陳美華", title: "財務長" });
  });

  it("parses comma-separated input", () => {
    const result = parseVoiceTranscript("研發中心，王大明，技術長");
    expect(result).toEqual({ dept: "研發中心", name: "王大明", title: "技術長" });
  });

  it("parses English input", () => {
    const result = parseVoiceTranscript("R&D Center David Wang CTO");
    expect(result).toEqual({ dept: "R&D", name: "Center", title: "David Wang CTO" });
  });

  it("handles 2 parts (dept + name)", () => {
    const result = parseVoiceTranscript("新部門 王大明");
    expect(result).toEqual({ dept: "新部門", name: "王大明", title: "" });
  });

  it("handles 1 part (dept only)", () => {
    const result = parseVoiceTranscript("AI部門");
    expect(result).toEqual({ dept: "AI部門", name: "", title: "" });
  });

  it("returns null for empty input", () => {
    expect(parseVoiceTranscript("")).toBeNull();
    expect(parseVoiceTranscript("  ")).toBeNull();
  });

  it("handles multi-word title", () => {
    const result = parseVoiceTranscript("人資部 林小芳 人力資源 副總裁");
    expect(result).toEqual({ dept: "人資部", name: "林小芳", title: "人力資源 副總裁" });
  });
});
