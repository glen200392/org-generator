// Position/Person model utilities — conversion between V2 OrgNode and V3 OrgPosition
// Supports backward compatibility: OrgPosition extends OrgNode

import type { OrgNode, OrgPosition, OrgPerson } from "./types";

/** Create an empty OrgPerson with default values */
export function createEmptyPerson(): OrgPerson {
  return {
    employeeId: "",
    name: "",
    nameEn: "",
    email: "",
    phone: "",
    photoUrl: "",
    location: "",
    startDate: "",
    employmentType: "FT",
    rr: "",
    rrEn: "",
  };
}

/**
 * Convert a V2 OrgNode to a V3 OrgPosition.
 * Maps: node.name → incumbent.name, node.dept → dept, node.title → title.
 * If the node has roleType "vacant", incumbent is set to null.
 */
export function nodeToPosition(node: OrgNode): OrgPosition {
  const isVacant = node.roleType === "vacant";

  const incumbent: OrgPerson | null = isVacant
    ? null
    : {
        ...createEmptyPerson(),
        name: node.name,
      };

  return {
    // All OrgNode fields (spread preserves runtime properties like renderX/Y)
    ...node,
    // V3 extensions
    code: "",
    deptEn: "",
    titleEn: "",
    fte: 1.0,
    grade: "",
    costCenter: "",
    isAssistant: node.roleType === "assistant",
    isSubsidiary: false,
    status: "active",
    incumbent,
    metadata: {},
  };
}

/**
 * Convert a V3 OrgPosition back to a V2-compatible OrgNode.
 * Maps: incumbent.name → node.name. Vacant positions get name = "".
 */
export function positionToNode(pos: OrgPosition): OrgNode {
  return {
    id: pos.id,
    parentId: pos.parentId,
    dept: pos.dept,
    name: pos.incumbent?.name ?? "",
    title: pos.title,
    pageGroup: pos.pageGroup,
    sortOrder: pos.sortOrder,
    roleType: pos.roleType,
    layoutType: pos.layoutType,
    bgColor: pos.bgColor,
    showInOverview: pos.showInOverview,
    showInDetail: pos.showInDetail,
    level: pos.level,
    children: pos.children,
    parent: pos.parent,
    searchMatched: pos.searchMatched,
    searchHasMatch: pos.searchHasMatch,
    renderX: pos.renderX,
    renderY: pos.renderY,
  };
}

/**
 * Upgrade an entire tree of OrgNodes to OrgPositions (recursive).
 */
export function upgradeTreeToPositions(nodes: OrgNode[]): OrgPosition[] {
  return nodes.map((node) => {
    const pos = nodeToPosition(node);
    pos.children = upgradeTreeToPositions(node.children) as OrgNode[];
    return pos;
  });
}

/**
 * Get a display name for a position, respecting language preference.
 * Returns incumbent name if filled, or a vacancy label if empty.
 */
export function getPositionDisplayName(
  pos: OrgPosition,
  lang: "tw" | "en" = "tw",
  vacantLabel = "空缺",
): string {
  if (!pos.incumbent) return vacantLabel;
  return lang === "en" && pos.incumbent.nameEn
    ? pos.incumbent.nameEn
    : pos.incumbent.name;
}

/**
 * Get the bilingual department name.
 */
export function getDeptDisplay(pos: OrgPosition, lang: "tw" | "en" = "tw"): string {
  return lang === "en" && pos.deptEn ? pos.deptEn : pos.dept;
}

/**
 * Get the bilingual title.
 */
export function getTitleDisplay(pos: OrgPosition, lang: "tw" | "en" = "tw"): string {
  return lang === "en" && pos.titleEn ? pos.titleEn : pos.title;
}
