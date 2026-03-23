// @orgchart/core — Data model types
// Extracted from index.html global variables and V2 workbook spec

/** Role type for org chart nodes */
export type RoleType =
  | "normal"
  | "assistant"
  | "acting"
  | "vacant"
  | "committee"
  | "shared-service";

/** Layout type controlling how a node is rendered */
export type LayoutType =
  | "standard"
  | "between"
  | "sidecar"
  | "stacked"
  | "hidden-overview";

/** Edge relationship type */
export type EdgeType = "solid" | "dotted" | "advisory" | "project" | "reference";

/** Slide render mode */
export type RenderMode = "overview" | "subtree" | "focus";

/** Page scope for edges */
export type PageScope = "local" | "cross-page" | string;

/** Validation issue severity */
export type Severity = "error" | "warning";

/** Valid role type values (readonly, includes all RoleType members) */
export const ROLE_TYPES: readonly RoleType[] = [
  "normal",
  "assistant",
  "shared-service",
  "vacant",
  "acting",
  "committee",
] as const;

/** Valid layout type values */
export const LAYOUT_TYPES: readonly LayoutType[] = [
  "standard",
  "between",
  "sidecar",
  "stacked",
  "hidden-overview",
] as const;

/** Valid edge type values */
export const EDGE_TYPES: readonly EdgeType[] = [
  "solid",
  "dotted",
  "advisory",
  "project",
  "reference",
] as const;

/** Validate and coerce a string to a RoleType, returning fallback if invalid */
export function validateRoleType(value: string, fallback: RoleType = "normal"): RoleType {
  return (ROLE_TYPES as readonly string[]).includes(value) ? value as RoleType : fallback;
}

/** Validate and coerce a string to a LayoutType, returning fallback if invalid */
export function validateLayoutType(value: string, fallback: LayoutType = "standard"): LayoutType {
  return (LAYOUT_TYPES as readonly string[]).includes(value) ? value as LayoutType : fallback;
}

/** Validate and coerce a string to an EdgeType, returning fallback if invalid */
export function validateEdgeType(value: string, fallback: EdgeType = "dotted"): EdgeType {
  return (EDGE_TYPES as readonly string[]).includes(value) ? value as EdgeType : fallback;
}

/** Validate and coerce a string to a RenderMode, returning fallback if invalid */
export function validateRenderMode(value: string, fallback: RenderMode = "subtree"): RenderMode {
  const RENDER_MODES: readonly string[] = ["overview", "subtree", "focus"];
  return RENDER_MODES.includes(value) ? value as RenderMode : fallback;
}

/** Workbook sheet names */
export const EDITOR_SHEETS = [
  "Nodes",
  "Edges",
  "Slides",
  "LayoutOverrides",
] as const;

/** Metadata prefix for encoded payloads */
export const METADATA_PREFIX = "OGMODELV2:";

// ── Layout constants ──

/** Base card width in inches */
export const BASE_CARD_W = 1.8;
/** Base card height in inches */
export const BASE_CARD_H = 0.8;
/** Base horizontal gap in inches */
export const BASE_GAP_X = 0.4;
/** Base vertical gap in inches */
export const BASE_GAP_Y = 1.0;
/** Pixels per inch */
export const PPI = 100;
/** Horizontal padding in pixels */
export const PAD_X = 0.5 * PPI;
/** Vertical padding in pixels */
export const PAD_Y = 1.0 * PPI;

// ── Interfaces ──

/** A single node in the org chart tree */
export interface OrgNode {
  id: string;
  parentId: string;
  dept: string;
  name: string;
  title: string;
  pageGroup: string;
  sortOrder: number;
  roleType: RoleType;
  layoutType: LayoutType;
  bgColor: string;
  showInOverview: boolean;
  showInDetail: boolean;
  level: number;
  children: OrgNode[];
  parent: OrgNode | null;
  /** Runtime: node matched search query */
  searchMatched: boolean;
  /** Runtime: node has a matched descendant */
  searchHasMatch: boolean;
  /** Runtime: rendered X position in inches */
  renderX?: number;
  /** Runtime: rendered Y position in inches */
  renderY?: number;
}

/** An edge (relationship) between two nodes */
export interface OrgEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: EdgeType;
  pageScope: PageScope;
  label: string;
  showInOverview: boolean;
  showInDetail: boolean;
}

/** A slide definition for multi-page export */
export interface OrgSlide {
  pageGroup: string;
  slideTitle: string;
  renderMode: RenderMode;
  rootNodeId: string;
  maxDepth: number;
  includeCrossLinks: boolean;
  slideOrder: number;
  parentGroup: string;
  layoutPreset: string;
  overflowStrategy: string;
}

/** A layout override for manual node positioning */
export interface LayoutOverride {
  targetType: string;
  targetId: string;
  pageGroup: string;
  offsetX: number;
  offsetY: number;
  anchorMode: string;
  zIndex: number;
}

/** A validation issue found during parsing */
export interface ValidationIssue {
  severity: Severity;
  code: string;
  lineNo: number | null;
}

/** The runtime state of a V2 workbook */
export interface WorkbookState {
  mode: "v2";
  nodesRows: Record<string, unknown>[];
  edgesRows: Record<string, unknown>[];
  slidesRows: Record<string, unknown>[];
  layoutRows: Record<string, unknown>[];
  edges: OrgEdge[];
  slides: OrgSlide[];
  layoutOverrides: LayoutOverride[];
  nodesById: Map<string, OrgNode>;
  /** Root nodes (nodes with no parent) */
  roots: OrgNode[];
  issues: ValidationIssue[];
  selectedPageGroup: string;
  sourceWorkbook: unknown;
}

/** The complete model for rendering one view */
export interface OrgModel {
  roots: OrgNode[];
  issues: ValidationIssue[];
  maxLevels: number;
  canvasTitle: string;
  renderMode?: RenderMode;
  pageGroup?: string;
  edges?: OrgEdge[];
  referenceEdges?: OrgEdge[];
  exportSlide?: OrgSlide;
}

/** Hit box for click detection on the canvas */
export interface HitBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ── V3 Schema: Position/Person Separation + Bilingual ──

/** Employment type */
export type EmploymentType = "FT" | "PT" | "Contract" | "Intern";

/** Position status */
export type PositionStatus = "active" | "planned" | "frozen";

/**
 * A person (incumbent) filling a position.
 * Separated from the position itself — a position can be vacant (incumbent = null).
 */
export interface OrgPerson {
  /** Employee ID — primary key from HRIS (e.g., SAP SuccessFactors userId) */
  employeeId: string;
  /** Name in local language (Traditional Chinese) */
  name: string;
  /** Name in English */
  nameEn: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Photo URL */
  photoUrl: string;
  /** Office location */
  location: string;
  /** Start / hire date (ISO 8601) */
  startDate: string;
  /** Employment type */
  employmentType: EmploymentType;
  /** Roles & Responsibilities (local language) */
  rr: string;
  /** Roles & Responsibilities (English) */
  rrEn: string;
}

/**
 * A position (structural slot) in the org chart.
 * Exists independently of any person — supports vacancy management.
 * This is a superset of OrgNode: all OrgNode fields are present for backward compatibility.
 */
export interface OrgPosition extends OrgNode {
  /** Department/unit code (e.g., FIN-001) — maps to SAP externalCode */
  code: string;
  /** Department name in English */
  deptEn: string;
  /** Job title in English */
  titleEn: string;
  /** Full-Time Equivalent (0.5 = part-time, 1.0 = full-time) */
  fte: number;
  /** Job grade / level (e.g., L10, M5) */
  grade: string;
  /** Cost center code */
  costCenter: string;
  /** Whether this is a staff/assistant unit (layout hint: placed beside parent) */
  isAssistant: boolean;
  /** Whether this is an independent subsidiary (layout hint: dashed connection) */
  isSubsidiary: boolean;
  /** Position status */
  status: PositionStatus;
  /** The person filling this position (null = vacancy) */
  incumbent: OrgPerson | null;
  /** Custom metadata for extensibility (Lucidchart-style custom data) */
  metadata: Record<string, unknown>;
}

/** Layout direction for ELK.js adapter */
export type LayoutDirection = "vertical" | "horizontal" | "compact";

// ── Conditional Formatting Rules Engine ──

/** Comparison operator for rule conditions */
export type RuleOperator =
  | "eq" | "ne" | "gt" | "lt" | "gte" | "lte"
  | "contains" | "notContains"
  | "isEmpty" | "isNotEmpty";

/** A single condition check within a rule */
export interface RuleCheck {
  /** Field path to evaluate (e.g., "incumbent", "dept", "fte", "grade", "incumbent.location") */
  field: string;
  /** Comparison operator */
  operator: RuleOperator;
  /** Value to compare against (ignored for isEmpty/isNotEmpty) */
  value: string | number | boolean;
}

/** Compound condition with AND/OR logic */
export interface RuleCondition {
  /** Logical combinator */
  logic: "and" | "or";
  /** Individual checks */
  checks: RuleCheck[];
}

/** Visual action to apply when a rule matches */
export interface RuleAction {
  /** Override background fill color */
  fillColor?: string;
  /** Override border color */
  borderColor?: string;
  /** Override border style */
  borderStyle?: "solid" | "dashed" | "bold";
  /** Override text color */
  textColor?: string;
  /** Icon to display on the node (e.g., "⚠️", "🔴") */
  icon?: string;
  /** Badge text to display (e.g., "TBH", "Acting") */
  badge?: string;
}

/** A conditional formatting rule */
export interface ConditionalRule {
  /** Unique rule ID */
  id: string;
  /** Human-readable name (e.g., "空缺標紅", "Highlight Vacancies") */
  name: string;
  /** Condition to evaluate */
  condition: RuleCondition;
  /** Visual action to apply if condition matches */
  action: RuleAction;
  /** Priority (higher number = evaluated later, overrides earlier rules) */
  priority: number;
  /** Whether this rule is enabled */
  enabled: boolean;
}

// ── Organization Metrics ──

/** Calculated metrics for a node/subtree */
export interface OrgMetrics {
  /** Total headcount (recursive, only filled positions) */
  headcount: number;
  /** Direct reports count */
  directReports: number;
  /** Span of control (direct reports with their own reports) */
  spanOfControl: number;
  /** Total FTE sum (recursive) */
  totalFte: number;
  /** Number of vacant positions (recursive) */
  vacancyCount: number;
  /** Vacancy rate (vacancyCount / total positions) */
  vacancyRate: number;
  /** Maximum depth of subtree */
  treeDepth: number;
}

/** Serialized workbook payload for metadata embedding */
export interface SerializedPayload {
  version: number;
  exportedAt: string;
  theme: string;
  exportMode: string;
  selectedPageGroup: string;
  workbook: {
    nodesRows: Record<string, unknown>[];
    edgesRows: Record<string, unknown>[];
    slidesRows: Record<string, unknown>[];
    layoutRows: Record<string, unknown>[];
  };
}
