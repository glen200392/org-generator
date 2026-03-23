// AI Layout suggestion — rule-based (Level 1, no LLM required)
// Analyzes node count and tree depth to recommend optimal layout settings

import type { LayoutDirection } from "@orgchart/core";

export interface LayoutSuggestion {
  direction: LayoutDirection;
  horizontalSpacing: number;
  verticalSpacing: number;
  reason: string;
  reasonEn: string;
}

/**
 * Suggest optimal layout based on org chart dimensions.
 * Pure function — no API calls.
 */
export function suggestLayout(
  nodeCount: number,
  maxDepth: number,
  maxBreadth: number, // widest level
): LayoutSuggestion {
  // Very small org → vertical with generous spacing
  if (nodeCount <= 10) {
    return {
      direction: "vertical",
      horizontalSpacing: 60,
      verticalSpacing: 110,
      reason: "小型組織，垂直佈局最清晰",
      reasonEn: "Small org, vertical layout is clearest",
    };
  }

  // Wide but shallow → horizontal works better
  if (maxBreadth > 8 && maxDepth <= 3) {
    return {
      direction: "horizontal",
      horizontalSpacing: 35,
      verticalSpacing: 60,
      reason: "寬扁結構，水平佈局減少橫向捲動",
      reasonEn: "Wide & shallow, horizontal reduces scrolling",
    };
  }

  // Medium org → compact
  if (nodeCount <= 40) {
    return {
      direction: "compact",
      horizontalSpacing: 35,
      verticalSpacing: 80,
      reason: "中型組織，緊密佈局節省空間",
      reasonEn: "Medium org, compact saves space",
    };
  }

  // Deep hierarchy → vertical with tight spacing
  if (maxDepth > 5) {
    return {
      direction: "vertical",
      horizontalSpacing: 30,
      verticalSpacing: 70,
      reason: "深層架構，垂直佈局配合緊密間距",
      reasonEn: "Deep hierarchy, vertical with tight spacing",
    };
  }

  // Large org → horizontal
  return {
    direction: "horizontal",
    horizontalSpacing: 30,
    verticalSpacing: 65,
    reason: "大型組織，水平佈局最大化螢幕利用",
    reasonEn: "Large org, horizontal maximizes screen usage",
  };
}

/**
 * Calculate tree dimensions for layout suggestion.
 */
export function analyzeTreeDimensions(
  nodes: { id: string; children: { id: string }[] }[],
): { nodeCount: number; maxDepth: number; maxBreadth: number } {
  let nodeCount = 0;
  let maxDepth = 0;
  const levelCounts = new Map<number, number>();

  function walk(node: { children: { id: string }[] }, depth: number) {
    nodeCount++;
    if (depth > maxDepth) maxDepth = depth;
    levelCounts.set(depth, (levelCounts.get(depth) ?? 0) + 1);
    (node.children as { id: string; children: { id: string }[] }[]).forEach(
      (c) => walk(c, depth + 1),
    );
  }

  nodes.forEach((r) => walk(r as { children: { id: string }[] }, 1));

  let maxBreadth = 0;
  for (const count of levelCounts.values()) {
    if (count > maxBreadth) maxBreadth = count;
  }

  return { nodeCount, maxDepth, maxBreadth };
}
