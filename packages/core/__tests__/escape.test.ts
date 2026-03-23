import { describe, it, expect } from "vitest";
import { escapeHtml, escapeJs } from "../src/util/escape";

describe("escapeHtml", () => {
  it("escapes all HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersand and single quote", () => {
    expect(escapeHtml("A & B's")).toBe("A &amp; B&#39;s");
  });

  it("handles non-string input", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(null)).toBe("null");
  });
});

describe("escapeJs", () => {
  it("escapes backslash and quotes", () => {
    expect(escapeJs('say "hello"')).toBe('say \\"hello\\"');
    expect(escapeJs("it's")).toBe("it\\'s");
  });

  it("escapes newlines and < for script context", () => {
    expect(escapeJs("a\nb")).toBe("a\\nb");
    expect(escapeJs("<tag>")).toBe("\\x3ctag>");
  });
});
