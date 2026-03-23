import { describe, it, expect } from "vitest";
import {
  THEMES,
  hexBrightness,
  BRIGHTNESS_THRESHOLD,
  getTextColor,
  getColorForLevel,
} from "../src/theme/themes";

describe("THEMES", () => {
  it("has 7 theme palettes", () => {
    expect(Object.keys(THEMES)).toHaveLength(7);
  });

  it("each palette has 5 colors", () => {
    for (const [, palette] of Object.entries(THEMES)) {
      expect(palette).toHaveLength(5);
      palette.forEach((c) => expect(c).toMatch(/^[0-9A-Fa-f]{6}$/));
    }
  });
});

describe("hexBrightness", () => {
  it("black is 0", () => {
    expect(hexBrightness("000000")).toBeCloseTo(0, 2);
  });

  it("white is 1", () => {
    expect(hexBrightness("FFFFFF")).toBeCloseTo(1, 2);
  });

  it("handles # prefix", () => {
    expect(hexBrightness("#FFFFFF")).toBeCloseTo(1, 2);
  });
});

describe("getTextColor", () => {
  it("returns dark text for light background", () => {
    expect(getTextColor("FFFFFF")).toBe("#1A202C");
  });

  it("returns light text for dark background", () => {
    expect(getTextColor("0A192F")).toBe("#FFFFFF");
  });
});

describe("getColorForLevel", () => {
  it("returns correct color for level", () => {
    expect(getColorForLevel(THEMES.blue, 1)).toBe("0A192F");
    expect(getColorForLevel(THEMES.blue, 3)).toBe("2C5282");
  });

  it("clamps to palette range", () => {
    expect(getColorForLevel(THEMES.blue, 99)).toBe("3182CE");
    expect(getColorForLevel(THEMES.blue, 0)).toBe("0A192F");
  });
});
