// React hook for ELK.js auto-layout
// Async layout calculation that doesn't block the UI thread

import { useCallback, useRef } from "react";
import type { OrgFlowNode, OrgFlowEdge } from "./types";
import type { LayoutDirection } from "@orgchart/core";

/** ELK graph types (minimal) */
interface ElkNode {
  id: string;
  width?: number;
  height?: number;
  children?: ElkNode[];
  layoutOptions?: Record<string, string>;
  x?: number;
  y?: number;
}

interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
}

interface ElkGraph extends ElkNode {
  edges?: ElkEdge[];
}

interface ElkInstance {
  layout(graph: ElkGraph): Promise<ElkGraph>;
}

export interface UseElkLayoutOptions {
  direction: LayoutDirection;
  horizontalSpacing: number;
  verticalSpacing: number;
  nodeWidth: number;
  nodeHeight: number;
}

const DEFAULT_OPTIONS: UseElkLayoutOptions = {
  direction: "vertical",
  horizontalSpacing: 40,
  verticalSpacing: 100,
  nodeWidth: 200,
  nodeHeight: 90,
};

function directionToElk(d: LayoutDirection): string {
  switch (d) {
    case "horizontal": return "RIGHT";
    case "compact": return "DOWN";
    default: return "DOWN";
  }
}

/**
 * Hook that provides an async layout function using ELK.js.
 * Lazily loads ELK on first use to avoid 300KB upfront cost.
 */
export function useElkLayout(options: Partial<UseElkLayoutOptions> = {}) {
  const elkRef = useRef<ElkInstance | null>(null);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const getElk = useCallback(async (): Promise<ElkInstance> => {
    if (elkRef.current) return elkRef.current;
    // Dynamic import — ELK.js is loaded on demand
    const ELK = (await import("elkjs/lib/elk.bundled.js")).default;
    elkRef.current = new ELK();
    return elkRef.current;
  }, []);

  /**
   * Calculate layout positions for the given nodes and edges.
   * Returns new arrays with updated positions (does not mutate input).
   */
  const layoutNodes = useCallback(
    async (
      nodes: OrgFlowNode[],
      edges: OrgFlowEdge[],
    ): Promise<OrgFlowNode[]> => {
      const elk = await getElk();

      // Build flat ELK graph (React Flow uses flat node list, not nested)
      const elkGraph: ElkGraph = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "mrtree",
          "elk.direction": directionToElk(opts.direction),
          "elk.spacing.nodeNode": String(opts.horizontalSpacing),
          "elk.layered.spacing.nodeNodeBetweenLayers": String(opts.verticalSpacing),
        },
        children: nodes.map((n) => ({
          id: n.id,
          width: opts.nodeWidth,
          height: opts.nodeHeight,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          sources: [e.source],
          targets: [e.target],
        })),
      };

      const laid = await elk.layout(elkGraph);

      // Map ELK positions back to React Flow nodes
      const posMap = new Map<string, { x: number; y: number }>();
      laid.children?.forEach((child) => {
        posMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
      });

      return nodes.map((node) => {
        const pos = posMap.get(node.id);
        if (!pos) return node;
        return { ...node, position: { x: pos.x, y: pos.y } };
      });
    },
    [getElk, opts.direction, opts.horizontalSpacing, opts.verticalSpacing, opts.nodeWidth, opts.nodeHeight],
  );

  return { layoutNodes };
}
