// Conditional formatting rules engine — pure functions
// Reference: Lucidchart conditional formatting (field × operator × value → action)

import type {
  OrgPosition,
  OrgNode,
  ConditionalRule,
  RuleCheck,
  RuleCondition,
  RuleAction,
} from "./types";

/**
 * Resolve a dot-path field value from a node or position.
 * Supports paths like "dept", "incumbent", "incumbent.location", "fte", "metadata.customField".
 */
function resolveField(node: Record<string, unknown>, field: string): unknown {
  const parts = field.split(".");
  let current: unknown = node;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Evaluate a single rule check against a node */
function evaluateCheck(node: Record<string, unknown>, check: RuleCheck): boolean {
  const value = resolveField(node, check.field);

  switch (check.operator) {
    case "isEmpty":
      return value === null || value === undefined || value === "";
    case "isNotEmpty":
      return value !== null && value !== undefined && value !== "";
    case "eq":
      return String(value) === String(check.value);
    case "ne":
      return String(value) !== String(check.value);
    case "gt":
      return Number(value) > Number(check.value);
    case "lt":
      return Number(value) < Number(check.value);
    case "gte":
      return Number(value) >= Number(check.value);
    case "lte":
      return Number(value) <= Number(check.value);
    case "contains":
      return String(value ?? "").toLowerCase().includes(String(check.value).toLowerCase());
    case "notContains":
      return !String(value ?? "").toLowerCase().includes(String(check.value).toLowerCase());
    default:
      return false;
  }
}

/** Evaluate a compound condition (AND/OR logic) */
function evaluateCondition(
  node: Record<string, unknown>,
  condition: RuleCondition,
): boolean {
  if (!condition.checks.length) return false;

  if (condition.logic === "and") {
    return condition.checks.every((check) => evaluateCheck(node, check));
  }
  return condition.checks.some((check) => evaluateCheck(node, check));
}

/**
 * Evaluate all enabled rules against a node, returning the merged action.
 * Rules are evaluated in priority order (lower first). Later rules override earlier ones.
 */
export function evaluateRules(
  node: OrgPosition | OrgNode,
  rules: ConditionalRule[],
): RuleAction {
  const result: RuleAction = {};
  const sorted = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  const nodeRecord = node as unknown as Record<string, unknown>;

  for (const rule of sorted) {
    if (evaluateCondition(nodeRecord, rule.condition)) {
      // Merge: later rules override earlier ones field by field
      if (rule.action.fillColor) result.fillColor = rule.action.fillColor;
      if (rule.action.borderColor) result.borderColor = rule.action.borderColor;
      if (rule.action.borderStyle) result.borderStyle = rule.action.borderStyle;
      if (rule.action.textColor) result.textColor = rule.action.textColor;
      if (rule.action.icon) result.icon = rule.action.icon;
      if (rule.action.badge) result.badge = rule.action.badge;
    }
  }

  return result;
}

/** Check if a rule action has any visual effect */
export function hasVisualEffect(action: RuleAction): boolean {
  return !!(
    action.fillColor ||
    action.borderColor ||
    action.borderStyle ||
    action.textColor ||
    action.icon ||
    action.badge
  );
}

// ── Preset Rules (common HR scenarios) ──

/** Create a rule that highlights vacant positions with red border */
export function createVacancyHighlightRule(id = "preset-vacancy"): ConditionalRule {
  return {
    id,
    name: "空缺職位標紅 / Highlight Vacancies",
    condition: {
      logic: "and",
      checks: [{ field: "incumbent", operator: "isEmpty", value: "" }],
    },
    action: {
      borderColor: "#DC2626",
      borderStyle: "dashed",
      badge: "TBH",
    },
    priority: 10,
    enabled: true,
  };
}

/** Create a rule that highlights positions missing email */
export function createMissingEmailRule(id = "preset-no-email"): ConditionalRule {
  return {
    id,
    name: "缺少信箱 / Missing Email",
    condition: {
      logic: "and",
      checks: [
        { field: "incumbent", operator: "isNotEmpty", value: "" },
        { field: "incumbent.email", operator: "isEmpty", value: "" },
      ],
    },
    action: {
      borderColor: "#F59E0B",
      icon: "⚠️",
    },
    priority: 20,
    enabled: true,
  };
}

/** Create a rule that highlights high span of control */
export function createHighSpanRule(
  threshold = 10,
  id = "preset-high-span",
): ConditionalRule {
  return {
    id,
    name: `管控幅度 >${threshold} / High Span of Control`,
    condition: {
      logic: "and",
      checks: [{ field: "children.length", operator: "gt", value: threshold }],
    },
    action: {
      fillColor: "#FEF3C7",
      icon: "📊",
    },
    priority: 30,
    enabled: true,
  };
}
