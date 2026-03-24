// localStorage persistence for Studio scenarios
// Auto-save on changes, auto-load on startup
// Uses jsonReplacer to strip circular parent refs before serialization

import { jsonReplacer, rebuildParentRefs } from "../store/org-store";
import type { OrgNode } from "@orgchart/core";

const STORAGE_KEY = "orgchart_studio_state";
const SCHEMA_VERSION = 1;

export interface PersistedState {
  version?: number;
  scenarios: unknown[];
  activeScenarioId: string | null;
  layoutDirection: string;
  lang: string;
}

/** Save state to localStorage (strips circular parent refs) */
export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: SCHEMA_VERSION }, jsonReplacer),
    );
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Load state from localStorage. Rebuilds parent refs after parse. */
export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.scenarios)) return null;
    if (parsed.version !== undefined && parsed.version > SCHEMA_VERSION) return null;
    // Rebuild parent refs lost during serialization (fix C1)
    parsed.scenarios.forEach((sc: { roots?: OrgNode[] }) => {
      if (sc.roots) rebuildParentRefs(sc.roots);
    });
    return parsed as PersistedState;
  } catch {
    return null;
  }
}

/** Clear saved state */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
