// Theme color palettes for org chart rendering
// Extracted from index.html L993-1001

/** Color palette: array of 5 hex color strings (no # prefix), from darkest (L1) to lightest (L5) */
export type ThemePalette = [string, string, string, string, string];

/** All available theme palettes */
export const THEMES: Record<string, ThemePalette> = {
  blue: ["0A192F", "1A365D", "2C5282", "2B6CB0", "3182CE"],
  gray: ["2D3748", "4A5568", "718096", "A0AEC0", "CBD5E0"],
  orange: ["7B341E", "9C4221", "C05621", "DD6B20", "ED8936"],
  primax: ["004D4D", "006666", "007A7A", "009999", "00B3B3"],
  tymphany: ["0D2440", "152E52", "1B3F6E", "22508A", "2B63A8"],
  white: ["FFFFFF", "F8FAFC", "F1F5F9", "E2E8F0", "CBD5E1"],
  bw: ["1A1A1A", "333333", "4D4D4D", "666666", "808080"],
};

/** Default theme key */
export const DEFAULT_THEME = "blue";

/**
 * Calculate perceived brightness of a hex color (0-1 range).
 * Uses ITU-R BT.601 luma formula: 0.299R + 0.587G + 0.114B.
 * Shared by all text color functions to ensure consistency.
 */
export function hexBrightness(bgHex: string): number {
  const hex = bgHex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Brightness threshold for switching between light and dark text */
export const BRIGHTNESS_THRESHOLD = 0.55;

/**
 * Determine text color (black or white) based on background hex brightness.
 * Returns CSS-ready hex strings with # prefix.
 */
export function getTextColor(bgHex: string): string {
  return hexBrightness(bgHex) > BRIGHTNESS_THRESHOLD ? "#1A202C" : "#FFFFFF";
}

/**
 * Get PPT-compatible text color (6-digit hex without #).
 */
export function getPptTextColor(bgHex: string): string {
  return getTextColor(bgHex).replace(/^#/, "");
}

/**
 * Get the theme color for a given hierarchy depth level (1-based).
 * Clamps to the palette range.
 */
export function getColorForLevel(
  palette: ThemePalette,
  level: number,
): string {
  const idx = Math.max(0, Math.min(palette.length - 1, level - 1));
  return palette[idx];
}
