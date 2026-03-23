// V2 workbook parsing — pure data transformation, no DOM
// Extracted from index.html L1127-1141, L2251-2370

import type {
  OrgNode,
  OrgEdge,
  OrgSlide,
  LayoutOverride,
  ValidationIssue,
  WorkbookState,
} from "./types";
import { validateRoleType, validateLayoutType, validateEdgeType, validateRenderMode } from "./types";
import { createIssue } from "./validation";
import { cloneRows, normalizeBool, normalizeInt, pickField, findSheetName } from "../util/normalize";

/** XLSX-compatible workbook interface (minimal subset we need) */
export interface XlsxWorkbook {
  SheetNames: string[];
  Sheets: Record<string, unknown>;
}

/** XLSX utility interface — passed in to avoid hard dependency on xlsx library */
export interface XlsxUtils {
  sheet_to_json(sheet: unknown, opts?: { defval?: string }): Record<string, unknown>[];
  book_new(): XlsxWorkbook;
  json_to_sheet(data: Record<string, unknown>[], opts?: { header?: string[] }): unknown;
  aoa_to_sheet(data: unknown[][]): unknown;
  book_append_sheet(wb: XlsxWorkbook, ws: unknown, name: string): void;
}

/** Build an XLSX workbook from raw row arrays */
export function buildWorkbookFromRows(
  data: {
    nodesRows?: Record<string, unknown>[];
    edgesRows?: Record<string, unknown>[];
    slidesRows?: Record<string, unknown>[];
    layoutRows?: Record<string, unknown>[];
  },
  xlsx: XlsxUtils,
): XlsxWorkbook {
  const wb = xlsx.book_new();
  const sheets: [string, Record<string, unknown>[]][] = [
    ["Nodes", data.nodesRows || []],
    ["Edges", data.edgesRows || []],
    ["Slides", data.slidesRows || []],
    ["LayoutOverrides", data.layoutRows || []],
  ];
  sheets.forEach(([name, rows]) => {
    const headers = rows.length
      ? Object.keys(rows.reduce((acc, row) => Object.assign(acc, row), Object.create(null) as Record<string, unknown>))
      : [];
    const ws = headers.length
      ? xlsx.json_to_sheet(rows, { header: headers })
      : xlsx.aoa_to_sheet([[]]);
    xlsx.book_append_sheet(wb, ws, name);
  });
  return wb;
}

/** Extract NodeID from a row, handling multiple column name conventions */
export function getNodeIdFromRow(row: Record<string, unknown>): string {
  return String(pickField(row, ["NodeID", "nodeId", "節點ID"])).trim();
}

/** Default values for new rows in each sheet */
export function getSheetDefaults(sheetName: string): Record<string, string> {
  if (sheetName === "Nodes")
    return {
      NodeID: "", ParentID: "", Dept: "", Name: "", Title: "",
      PageGroup: "", SortOrder: "", RoleType: "normal", LayoutType: "standard",
      LevelHint: "", Color: "", ShowInOverview: "true", ShowInDetail: "true",
      AliasOf: "", OffsetX: "", OffsetY: "", WidthHint: "", HeightHint: "",
    };
  if (sheetName === "Edges")
    return { EdgeID: "", FromNodeID: "", ToNodeID: "", EdgeType: "dotted", PageScope: "local", Label: "" };
  if (sheetName === "Slides")
    return {
      PageGroup: "", SlideTitle: "", RenderMode: "subtree", RootNodeID: "",
      MaxDepth: "", SlideOrder: "", ParentGroup: "", IncludeCrossLinks: "false",
      LayoutPreset: "", OverflowStrategy: "split-by-child-group",
    };
  return { TargetType: "node", TargetID: "", PageGroup: "", OffsetX: "0", OffsetY: "0", AnchorMode: "center", ZIndex: "0" };
}

/**
 * Parse a V2 workbook into a WorkbookState.
 * This is the core parsing function — it takes theme colors as a parameter
 * instead of reading from DOM.
 */
export function parseWorkbookV2(
  wb: XlsxWorkbook,
  themeColors: string[],
  xlsx: XlsxUtils,
): WorkbookState {
  const issues: ValidationIssue[] = [];
  const sheetNames = wb.SheetNames || [];
  const nodesSheetName = findSheetName(sheetNames, "Nodes");
  const slidesSheetName = findSheetName(sheetNames, "Slides");
  const edgesSheetName = findSheetName(sheetNames, "Edges");
  const layoutSheetName = findSheetName(sheetNames, "LayoutOverrides");

  const emptyState: WorkbookState = {
    mode: "v2",
    issues,
    nodesById: new Map(),
    slides: [],
    selectedPageGroup: "",
    roots: [],
    nodesRows: [],
    edgesRows: [],
    slidesRows: [],
    layoutRows: [],
    edges: [],
    layoutOverrides: [],
    sourceWorkbook: wb,
  };

  if (!nodesSheetName) {
    issues.push(createIssue("error", "errNodesSheet", null));
    return emptyState;
  }
  if (!slidesSheetName) {
    issues.push(createIssue("error", "errSlidesSheet", null));
    return emptyState;
  }

  const colors = themeColors;
  const nodeRows = cloneRows(
    xlsx.sheet_to_json(wb.Sheets[nodesSheetName], { defval: "" }),
  );
  const slideRows = cloneRows(
    xlsx.sheet_to_json(wb.Sheets[slidesSheetName], { defval: "" }),
  );
  const edgeRows = edgesSheetName
    ? cloneRows(xlsx.sheet_to_json(wb.Sheets[edgesSheetName], { defval: "" }))
    : [];
  const layoutRows = layoutSheetName
    ? cloneRows(xlsx.sheet_to_json(wb.Sheets[layoutSheetName], { defval: "" }))
    : [];

  // Parse nodes
  const nodesById = new Map<string, OrgNode>();
  nodeRows.forEach((row, index) => {
    const lineNo = index + 2; // Excel rows are 1-indexed + header
    const id = String(pickField(row, ["NodeID", "nodeId", "節點ID"])).trim();
    if (!id || nodesById.has(id)) {
      issues.push(createIssue("error", "errNodeId", lineNo));
      return;
    }
    const dept = String(pickField(row, ["Dept", "dept", "部門"])).trim();
    const name = String(pickField(row, ["Name", "name", "姓名"])).trim();
    const title = String(pickField(row, ["Title", "title", "職稱"])).trim();
    const pageGroup = String(pickField(row, ["PageGroup", "pageGroup", "頁群組"])).trim();
    const parentId = String(pickField(row, ["ParentID", "parentId", "上層NodeID"])).trim();
    const sortOrder = normalizeInt(pickField(row, ["SortOrder", "sortOrder", "排序"]), 9999) ?? 9999;
    const roleType = String(pickField(row, ["RoleType", "roleType"])).trim() || "normal";
    const layoutType = String(pickField(row, ["LayoutType", "layoutType"])).trim() || "standard";
    const showInOverview = normalizeBool(pickField(row, ["ShowInOverview", "showInOverview"]), true);
    const showInDetail = normalizeBool(pickField(row, ["ShowInDetail", "showInDetail"]), true);
    let rawColor = String(pickField(row, ["Color", "color", "顏色"])).trim().replace("#", "");
    const levelHint = normalizeInt(pickField(row, ["LevelHint", "levelHint"]), 1) ?? 1;
    const fallbackColor = colors[Math.min(Math.max(levelHint - 1, 0), colors.length - 1)];
    if (!rawColor || !/^[0-9A-Fa-f]{6}$/.test(rawColor)) rawColor = fallbackColor;

    if (!dept) issues.push(createIssue("warning", "warnMissingDept", lineNo));
    if (!name) issues.push(createIssue("warning", "warnMissingName", lineNo));
    if (!title) issues.push(createIssue("warning", "warnMissingTitle", lineNo));

    nodesById.set(id, {
      id, parentId, dept, name, title, pageGroup, sortOrder,
      roleType: validateRoleType(roleType),
      layoutType: validateLayoutType(layoutType),
      showInOverview, showInDetail,
      bgColor: "#" + rawColor,
      children: [], parent: null, level: 0,
      searchMatched: false, searchHasMatch: false,
    });
  });

  // Parse slides
  const slides: OrgSlide[] = slideRows
    .map((row, index) => ({
      pageGroup: String(pickField(row, ["PageGroup", "pageGroup", "頁群組"])).trim(),
      slideTitle: String(pickField(row, ["SlideTitle", "slideTitle", "投影片標題"])).trim(),
      renderMode: validateRenderMode(String(pickField(row, ["RenderMode", "renderMode"])).trim() || "subtree"),
      rootNodeId: String(pickField(row, ["RootNodeID", "rootNodeId"])).trim(),
      maxDepth: normalizeInt(pickField(row, ["MaxDepth", "maxDepth"]), 999) ?? 999,
      includeCrossLinks: normalizeBool(pickField(row, ["IncludeCrossLinks", "includeCrossLinks"]), false),
      slideOrder: normalizeInt(pickField(row, ["SlideOrder", "slideOrder"]), index + 1) ?? index + 1,
      parentGroup: String(pickField(row, ["ParentGroup", "parentGroup"])).trim(),
      layoutPreset: String(pickField(row, ["LayoutPreset", "layoutPreset"])).trim() || "default",
      overflowStrategy: String(pickField(row, ["OverflowStrategy", "overflowStrategy"])).trim() || "split-by-child-group",
    }))
    .filter((slide) => slide.pageGroup);
  slides.sort((a, b) => a.slideOrder - b.slideOrder);

  // Parse edges
  const edges: OrgEdge[] = edgeRows
    .map((row, index) => ({
      edgeId: String(pickField(row, ["EdgeID", "edgeId"])).trim() || `EDGE_${index + 1}`,
      fromNodeId: String(pickField(row, ["FromNodeID", "fromNodeId"])).trim(),
      toNodeId: String(pickField(row, ["ToNodeID", "toNodeId"])).trim(),
      edgeType: validateEdgeType(String(pickField(row, ["EdgeType", "edgeType"])).trim() || "dotted"),
      pageScope: String(pickField(row, ["PageScope", "pageScope"])).trim() || "local",
      label: String(pickField(row, ["Label", "label"])).trim(),
      showInOverview: normalizeBool(pickField(row, ["ShowInOverview", "showInOverview"]), true),
      showInDetail: normalizeBool(pickField(row, ["ShowInDetail", "showInDetail"]), true),
    }))
    .filter((edge) => edge.fromNodeId && edge.toNodeId);

  // Parse layout overrides
  const layoutOverrides: LayoutOverride[] = [];
  layoutRows.forEach((row) => {
    const targetType = String(pickField(row, ["TargetType", "targetType"])).trim() || "node";
    const targetId = String(pickField(row, ["TargetID", "targetId"])).trim();
    const pageGroup = String(pickField(row, ["PageGroup", "pageGroup"])).trim();
    if (!targetId || !pageGroup) return;
    layoutOverrides.push({
      targetType, targetId, pageGroup,
      offsetX: Number(pickField(row, ["OffsetX", "offsetX"]) || 0),
      offsetY: Number(pickField(row, ["OffsetY", "offsetY"]) || 0),
      anchorMode: String(pickField(row, ["AnchorMode", "anchorMode"])).trim() || "center",
      zIndex: normalizeInt(pickField(row, ["ZIndex", "zIndex"]), 0) ?? 0,
    });
  });

  // Build a Set of valid page groups for O(1) lookup (fix W3)
  const validPageGroups = new Set(slides.map((s) => s.pageGroup));

  // Build parent-child relationships with cycle detection (fix W11)
  nodesById.forEach((node, _id, map) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (!parent) {
        // Find the row index for better error reporting (fix W4)
        const rowIdx = nodeRows.findIndex((r) => getNodeIdFromRow(r) === node.id);
        issues.push(createIssue("error", "errParentRef", rowIdx >= 0 ? rowIdx + 2 : null));
      } else {
        // Cycle detection: walk up from parent to check if we'd create a loop
        let ancestor: OrgNode | null = parent;
        let hasCycle = false;
        while (ancestor) {
          if (ancestor.id === node.id) { hasCycle = true; break; }
          ancestor = ancestor.parent;
        }
        if (hasCycle) {
          const rowIdx = nodeRows.findIndex((r) => getNodeIdFromRow(r) === node.id);
          issues.push(createIssue("error", "errParentRef", rowIdx >= 0 ? rowIdx + 2 : null));
        } else {
          node.parent = parent;
          parent.children.push(node);
        }
      }
    }
    if (!validPageGroups.has(node.pageGroup)) {
      const rowIdx = nodeRows.findIndex((r) => getNodeIdFromRow(r) === node.id);
      issues.push(createIssue("error", "errPageGroup", rowIdx >= 0 ? rowIdx + 2 : null));
    }
  });

  // Sort children
  nodesById.forEach((node) => node.children.sort((a, b) => a.sortOrder - b.sortOrder));

  // Assign correct level values via BFS (fix W10)
  const roots = [...nodesById.values()].filter((node) => !node.parent);
  function assignLevels(node: OrgNode, depth: number) {
    node.level = depth;
    node.children.forEach((child) => assignLevels(child, depth + 1));
  }
  roots.forEach((root) => assignLevels(root, 1));

  // Validate slides
  slides.forEach((slide, index) => {
    if (!slide.rootNodeId || !nodesById.has(slide.rootNodeId)) {
      issues.push(createIssue("error", "errSlideRoot", index + 2));
    }
  });

  // Validate edges
  edges.forEach((edge, index) => {
    if (!nodesById.has(edge.fromNodeId) || !nodesById.has(edge.toNodeId)) {
      issues.push(createIssue("error", "errEdgeRef", index + 2));
    }
  });

  return {
    mode: "v2",
    issues,
    nodesById,
    slides,
    edges,
    layoutOverrides,
    selectedPageGroup: slides[0]?.pageGroup ?? "",
    roots,
    sourceWorkbook: wb,
    nodesRows: nodeRows,
    edgesRows: edgeRows,
    slidesRows: slideRows,
    layoutRows,
  };
}
