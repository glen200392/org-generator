// Convert @orgchart/core data model to React Flow nodes and edges

import type { OrgNode, OrgEdge as CoreEdge, ConditionalRule } from "@orgchart/core";
import { evaluateRules } from "@orgchart/core";
import type { OrgFlowNode, OrgFlowEdge, OrgNodeData } from "./types";

/**
 * Convert a tree of OrgNodes into flat React Flow node and edge arrays.
 * React Flow uses a flat list (not nested tree), so we flatten and create edges for parent-child.
 */
export function treeToFlowElements(
  roots: OrgNode[],
  rules: ConditionalRule[] = [],
  lang: "tw" | "en" = "tw",
): { nodes: OrgFlowNode[]; edges: OrgFlowEdge[] } {
  const nodes: OrgFlowNode[] = [];
  const edges: OrgFlowEdge[] = [];

  function walk(node: OrgNode, depth: number) {
    const ruleAction = rules.length > 0 ? evaluateRules(node, rules) : undefined;

    const data: OrgNodeData = {
      ...node,
      ruleAction,
      lang,
    } as OrgNodeData;

    nodes.push({
      id: node.id,
      type: "orgNode",
      position: { x: 0, y: 0 }, // will be set by ELK layout
      data,
    });

    // Create hierarchy edge (parent → child)
    if (node.parentId) {
      edges.push({
        id: `h_${node.parentId}_${node.id}`,
        source: node.parentId,
        target: node.id,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#CBD5E1", strokeWidth: 2 },
      });
    }

    node.children.forEach((child) => walk(child, depth + 1));
  }

  roots.forEach((root) => walk(root, 0));
  return { nodes, edges };
}

/**
 * Add extra edges (dotted lines, advisory, etc.) from core OrgEdge array.
 */
export function addCoreEdges(
  existingEdges: OrgFlowEdge[],
  coreEdges: CoreEdge[],
): OrgFlowEdge[] {
  const extraEdges: OrgFlowEdge[] = coreEdges.map((e) => {
    const isDotted = e.edgeType === "dotted" || e.edgeType === "reference" || e.edgeType === "advisory";
    const color = e.edgeType === "project" ? "#7C3AED"
      : e.edgeType === "advisory" ? "#F59E0B"
      : "#94A3B8";

    return {
      id: e.edgeId,
      source: e.fromNodeId,
      target: e.toNodeId,
      type: "smoothstep",
      animated: isDotted,
      style: { stroke: color, strokeWidth: 1.5, strokeDasharray: isDotted ? "8 4" : undefined },
      label: e.label || undefined,
      data: { coreEdge: e },
    };
  });

  return [...existingEdges, ...extraEdges];
}
