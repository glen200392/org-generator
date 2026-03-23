// ELK.js layout adapter — converts OrgNode tree to ELK graph and back
// Supports vertical/horizontal/compact layout directions
// ELK.js is a peer dependency (loaded async to reduce bundle size)

import type { OrgNode, OrgEdge, LayoutDirection } from "../model/types";

/** ELK layout options */
export interface ElkLayoutOptions {
  /** Layout direction */
  direction: LayoutDirection;
  /** Horizontal spacing between nodes (px) */
  horizontalSpacing: number;
  /** Vertical spacing between levels (px) */
  verticalSpacing: number;
  /** Node width (px) */
  nodeWidth: number;
  /** Node height (px) */
  nodeHeight: number;
  /** How to place assistant nodes */
  assistantPlacement: "side" | "between";
}

/** Default ELK layout options */
export const DEFAULT_ELK_OPTIONS: ElkLayoutOptions = {
  direction: "vertical",
  horizontalSpacing: 40,
  verticalSpacing: 80,
  nodeWidth: 180,
  nodeHeight: 80,
  assistantPlacement: "side",
};

/** Minimal ELK types (avoid hard dependency on elkjs type package) */
interface ElkNode {
  id: string;
  width?: number;
  height?: number;
  children?: ElkNode[];
  edges?: ElkEdge[];
  layoutOptions?: Record<string, string>;
  x?: number;
  y?: number;
}

interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
}

interface ElkInstance {
  layout(graph: ElkNode): Promise<ElkNode>;
}

/** Position result for a single node */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Map a LayoutDirection to ELK algorithm option values.
 */
function directionToElkOptions(direction: LayoutDirection): Record<string, string> {
  switch (direction) {
    case "horizontal":
      return {
        "elk.algorithm": "mrtree",
        "elk.direction": "RIGHT",
      };
    case "compact":
      return {
        "elk.algorithm": "mrtree",
        "elk.direction": "DOWN",
        "elk.mrtree.compaction": "true",
      };
    case "vertical":
    default:
      return {
        "elk.algorithm": "mrtree",
        "elk.direction": "DOWN",
      };
  }
}

/**
 * Convert OrgNode tree + edges to an ELK graph structure.
 */
function buildElkGraph(
  roots: OrgNode[],
  edges: OrgEdge[],
  options: ElkLayoutOptions,
): ElkNode {
  const elkEdges: ElkEdge[] = [];

  function buildNode(node: OrgNode): ElkNode {
    const elkNode: ElkNode = {
      id: node.id,
      width: options.nodeWidth,
      height: options.nodeHeight,
      children: node.children.map(buildNode),
    };
    return elkNode;
  }

  // Build hierarchy edges from parent-child relationships
  function collectEdges(node: OrgNode) {
    for (const child of node.children) {
      elkEdges.push({
        id: `e_${node.id}_${child.id}`,
        sources: [node.id],
        targets: [child.id],
      });
      collectEdges(child);
    }
  }
  roots.forEach(collectEdges);

  // Add explicit edges (dotted lines, advisory, etc.)
  edges.forEach((edge, i) => {
    elkEdges.push({
      id: edge.edgeId || `edge_${i}`,
      sources: [edge.fromNodeId],
      targets: [edge.toNodeId],
    });
  });

  const dirOpts = directionToElkOptions(options.direction);

  return {
    id: "root",
    layoutOptions: {
      ...dirOpts,
      "elk.spacing.nodeNode": String(options.horizontalSpacing),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(options.verticalSpacing),
      "elk.mrtree.weighting": "CONSTRAINT",
    },
    children: roots.map(buildNode),
    edges: elkEdges,
  };
}

/**
 * Extract node positions from a laid-out ELK graph.
 */
function extractPositions(elkGraph: ElkNode): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  function walk(node: ElkNode, offsetX: number, offsetY: number) {
    const x = (node.x ?? 0) + offsetX;
    const y = (node.y ?? 0) + offsetY;
    positions.set(node.id, { x, y });
    if (node.children) {
      node.children.forEach((child) => walk(child, x, y));
    }
  }

  if (elkGraph.children) {
    elkGraph.children.forEach((child) => walk(child, 0, 0));
  }

  return positions;
}

/**
 * Run ELK layout on an org chart tree.
 * Requires an ELK instance to be passed in (dependency injection for async loading).
 *
 * Usage:
 * ```ts
 * import ELK from 'elkjs/lib/elk.bundled';
 * const elk = new ELK();
 * const positions = await elkLayout(elk, roots, edges, options);
 * ```
 */
export async function elkLayout(
  elk: ElkInstance,
  roots: OrgNode[],
  edges: OrgEdge[],
  options: Partial<ElkLayoutOptions> = {},
): Promise<Map<string, NodePosition>> {
  const mergedOptions: ElkLayoutOptions = { ...DEFAULT_ELK_OPTIONS, ...options };
  const graph = buildElkGraph(roots, edges, mergedOptions);
  const laid = await elk.layout(graph);
  return extractPositions(laid);
}

/**
 * Apply ELK positions to OrgNode tree (mutates renderX/renderY).
 * Converts px positions to inches (divides by PPI).
 */
export function applyElkPositions(
  roots: OrgNode[],
  positions: Map<string, NodePosition>,
  ppi: number,
): void {
  function walk(node: OrgNode) {
    const pos = positions.get(node.id);
    if (pos) {
      node.renderX = pos.x / ppi;
      node.renderY = pos.y / ppi;
    }
    node.children.forEach(walk);
  }
  roots.forEach(walk);
}
