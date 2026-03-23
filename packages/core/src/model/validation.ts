// Validation issue creation and helpers
// Extracted from index.html L1091-1093

import type { Severity, ValidationIssue } from "./types";

/** Create a validation issue */
export function createIssue(
  severity: Severity,
  code: string,
  lineNo: number | null = null,
): ValidationIssue {
  return { severity, code, lineNo };
}

/** Count errors in a list of issues */
export function countErrors(issues: ValidationIssue[]): number {
  return issues.filter((i) => i.severity === "error").length;
}

/** Count warnings in a list of issues */
export function countWarnings(issues: ValidationIssue[]): number {
  return issues.filter((i) => i.severity === "warning").length;
}

/** Check if any issue is an error (blocks rendering) */
export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}
