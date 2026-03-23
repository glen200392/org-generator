// Slide building for multi-page export — pure functions
// Extracted from index.html L2535-2578

import type { OrgNode, OrgSlide, WorkbookState } from "../model/types";
import { cloneTreeWithFilter } from "../util/tree";
import { calculateLayout, applyRoleLayoutAdjustments } from "./tree-layout";
import { applyLayoutOverrides, buildOverrideMap } from "./overrides";

/** Count all visible nodes in a tree */
export function getVisibleNodeCount(nodes: OrgNode[]): number {
  let count = 0;
  (function walk(list: OrgNode[]) {
    list.forEach((node) => {
      count++;
      walk(node.children);
    });
  })(nodes);
  return count;
}

/** Build auto-focus sub-slides for overflow handling */
export function buildAutoFocusSlides(
  roots: OrgNode[],
  baseSlide: OrgSlide,
): OrgSlide[] {
  const focusSlides: OrgSlide[] = [];
  roots.forEach((root) => {
    root.children.forEach((child) => {
      if (
        (child.children && child.children.length > 2) ||
        child.roleType === "shared-service"
      ) {
        focusSlides.push({
          pageGroup: `${baseSlide.pageGroup}_${child.id}`,
          slideTitle: `${baseSlide.slideTitle || baseSlide.pageGroup} - ${child.dept}`,
          renderMode: "focus",
          rootNodeId: child.id,
          maxDepth: 999,
          includeCrossLinks: true,
          slideOrder: (baseSlide.slideOrder || 0) + focusSlides.length + 0.1,
          parentGroup: baseSlide.pageGroup,
          layoutPreset: baseSlide.layoutPreset || "default",
          overflowStrategy: "none",
        });
      }
    });
  });
  return focusSlides;
}

/**
 * Build the complete list of export slides, including auto-generated overflow slides.
 */
export function buildExportSlides(
  state: WorkbookState,
  exportMode: string,
): OrgSlide[] {
  if (!state || state.mode !== "v2") return [];
  const overrideMap = buildOverrideMap(state.layoutOverrides);
  const slides: OrgSlide[] = [];

  state.slides.forEach((slide) => {
    slides.push(slide);
    const root = state.nodesById.get(slide.rootNodeId);
    if (!root) return;

    const includeNode = (node: OrgNode) => {
      if (slide.renderMode === "overview") {
        return node.showInOverview !== false && node.layoutType !== "hidden-overview";
      }
      return node.showInDetail !== false;
    };

    const roots = [
      cloneTreeWithFilter(root, {
        maxDepth: slide.maxDepth || 999,
        includeNode,
      }),
    ].filter(Boolean) as OrgNode[];

    if (!roots.length) return;
    applyRoleLayoutAdjustments(roots);
    applyLayoutOverrides(roots, slide.pageGroup, exportMode, overrideMap);
    const li = calculateLayout(roots, slide.maxDepth || 999, new Set(), true);
    const visibleCount = getVisibleNodeCount(roots);
    const overflowed =
      (li.totalWidth > 16 || li.actualDepth > 5 || visibleCount > 14) &&
      slide.overflowStrategy === "split-by-child-group";

    if (overflowed) {
      buildAutoFocusSlides(roots, slide).forEach((focus) => slides.push(focus));
    }
  });

  return slides.sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0));
}
