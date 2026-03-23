// Legacy CSV-style model parser — pure data transformation, no DOM
// Extracted from index.html L2200-2249

import type { OrgNode, OrgModel, ValidationIssue } from "./types";
import { createIssue } from "./validation";

/**
 * Parse legacy CSV text (Level, Dept, Name, Title[, Color]) into an OrgModel.
 * Takes theme colors as parameter instead of reading from DOM.
 */
export function parseLegacyCSV(
  text: string,
  themeColors: string[],
): OrgModel {
  const colors = themeColors;
  const issues: ValidationIssue[] = [];
  const roots: OrgNode[] = [];
  const stack: Record<number, OrgNode> = {};
  const signatureCounts = new Map<string, number>();

  const lines = text.split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    const lineNo = index + 1;
    const line = rawLine.trim();
    if (!line) return;
    const p = line.split(",").map((s) => s.trim());
    if (p.length < 4) {
      issues.push(createIssue("error", "errColumns", lineNo));
      return;
    }
    const level = parseInt(p[0], 10);
    if (!Number.isInteger(level) || level < 1) {
      issues.push(createIssue("error", "errLevel", lineNo));
      return;
    }
    const dept = p[1] || "";
    const name = p[2] || "";
    const title = p[3] || "";
    if (!dept) issues.push(createIssue("warning", "warnMissingDept", lineNo));
    if (!name) issues.push(createIssue("warning", "warnMissingName", lineNo));
    if (!title) issues.push(createIssue("warning", "warnMissingTitle", lineNo));

    let rawColor = p[4] ? p[4].replace("#", "") : null;
    if (!rawColor || !/^[0-9A-Fa-f]{6}$/.test(rawColor)) {
      rawColor = colors[Math.min(level - 1, colors.length - 1)];
    }

    const node: OrgNode = {
      id: "line-" + lineNo,
      parentId: "",
      level,
      dept,
      name,
      title,
      bgColor: "#" + rawColor,
      pageGroup: "",
      sortOrder: 0,
      roleType: "normal",
      layoutType: "standard",
      showInOverview: true,
      showInDetail: true,
      children: [],
      parent: null,
      searchMatched: false,
      searchHasMatch: false,
    };

    const signature = [dept, name, title].join("::");
    const nextCount = (signatureCounts.get(signature) || 0) + 1;
    signatureCounts.set(signature, nextCount);
    if (nextCount > 1) issues.push(createIssue("warning", "warnDuplicate", lineNo));

    if (level === 1) {
      roots.push(node);
    } else {
      let parentLevel = level - 1;
      while (parentLevel >= 1 && !stack[parentLevel]) parentLevel--;
      if (parentLevel !== level - 1) {
        issues.push(createIssue("warning", "warnLevelJump", lineNo));
      }
      if (stack[parentLevel]) {
        node.parent = stack[parentLevel];
        stack[parentLevel].children.push(node);
      } else {
        roots.push(node);
        issues.push(createIssue("warning", "warnRootFallback", lineNo));
      }
    }
    stack[level] = node;
    Object.keys(stack).forEach((k) => {
      if (parseInt(k, 10) > level) delete stack[parseInt(k, 10)];
    });
  });

  return { roots, issues, maxLevels: 999, canvasTitle: "" };
}
