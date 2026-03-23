// Data normalization utilities
// Extracted from index.html L1094-1126

const BANNED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Deep-clone an array of row objects, filtering out prototype pollution keys.
 *  Object values are deep-cloned via JSON round-trip to prevent shared references. */
export function cloneRows(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const clean: Record<string, unknown> = Object.create(null);
    for (const k of Object.keys(row)) {
      if (BANNED_KEYS.has(k)) continue;
      const v = row[k];
      // Deep-clone objects to prevent shared reference mutation
      clean[k] = v !== null && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v;
    }
    return clean;
  });
}

/** Normalize a value to boolean with a fallback default */
export function normalizeBool(v: unknown, fallback = true): boolean {
  if (v === "" || v === null || v === undefined) return fallback;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return fallback;
}

/** Normalize a value to integer with a fallback default */
export function normalizeInt(v: unknown, fallback: number | null = null): number | null {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = parseInt(String(v), 10);
  return Number.isInteger(n) ? n : fallback;
}

/** Pick the first non-empty value from a row by trying multiple key names */
export function pickField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ""
    )
      return String(row[key]);
  }
  return "";
}

/** Find a sheet name case-insensitively from a list of sheet names */
export function findSheetName(
  sheetNames: string[],
  target: string,
): string | null {
  const found = sheetNames.find(
    (name) => name.toLowerCase() === target.toLowerCase(),
  );
  return found ?? null;
}
