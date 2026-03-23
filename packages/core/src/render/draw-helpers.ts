// Canvas drawing helper functions — pure, no DOM references
// Extracted from index.html L2585-2610, L2667-2703

import type { OrgNode, OrgModel } from "../model/types";
import { PPI, PAD_X, PAD_Y, BASE_CARD_W, BASE_CARD_H } from "../model/types";
import { findNodeById } from "../util/tree";
import { hexBrightness, BRIGHTNESS_THRESHOLD } from "../theme/themes";

/** Draw a rounded rectangle path */
export function drawRR(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Fit text into a maximum width, truncating with ellipsis if needed */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string {
  if (ctx.measureText(text).width <= maxW) return text;
  while (text.length > 1 && ctx.measureText(text + "…").width > maxW) {
    text = text.slice(0, -1);
  }
  return text + "…";
}

/** Get text colors based on background hex (for canvas rendering).
 *  Uses shared hexBrightness() for consistent threshold with PPT export. */
export function getTC(hex: string): {
  dept: string; name: string; icon: string; border: string;
} {
  const light = hexBrightness(hex) > BRIGHTNESS_THRESHOLD;
  return {
    dept: light ? "#1E293B" : "#E2E8F0",
    name: light ? "#0A192F" : "#FFFFFF",
    icon: light ? "#0A192F" : "#64FFDA",
    border: light ? "#94A3B8" : "#64FFDA",
  };
}

/** Get text colors for PPT export (hex without #).
 *  Uses shared hexBrightness() for consistent threshold with canvas rendering. */
export function getPptTC(hex: string): {
  dept: string; name: string; border: string;
} {
  const light = hexBrightness(hex) > BRIGHTNESS_THRESHOLD;
  return {
    dept: light ? "1E293B" : "E2E8F0",
    name: light ? "0A192F" : "FFFFFF",
    border: light ? "94A3B8" : "64FFDA",
  };
}

/**
 * Draw edge lines (dotted, advisory, project, reference) on the canvas.
 */
export function drawEdges(
  ctx: CanvasRenderingContext2D,
  model: OrgModel,
  crossRefLabel: string,
): void {
  if (!model.edges?.length) return;

  const findCenter = (node: OrgNode) => ({
    x: (node.renderX ?? 0) * PPI + PAD_X + (BASE_CARD_W * PPI) / 2,
    y: (node.renderY ?? 0) * PPI + PAD_Y + (BASE_CARD_H * PPI) / 2,
  });

  model.edges.forEach((edge) => {
    const from = findNodeById(model.roots, edge.fromNodeId);
    const to = findNodeById(model.roots, edge.toNodeId);
    if (!from || !to) return;
    const p1 = findCenter(from);
    const p2 = findCenter(to);
    ctx.save();
    if (edge.edgeType === "dotted" || edge.edgeType === "reference") ctx.setLineDash([8, 6]);
    else if (edge.edgeType === "advisory") ctx.setLineDash([4, 4]);
    ctx.strokeStyle =
      edge.edgeType === "project" ? "#7C3AED" :
      edge.edgeType === "advisory" ? "#F59E0B" : "#94A3B8";
    ctx.lineWidth = edge.edgeType === "project" ? 2.5 : 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(p1.x, p1.y + 30, p2.x, p2.y - 30, p2.x, p2.y);
    ctx.stroke();
    if (edge.label) {
      ctx.fillStyle = "#334155";
      ctx.font = '11px "Microsoft JhengHei","PingFang TC",sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(edge.label, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 6);
    }
    ctx.restore();
  });

  if (model.referenceEdges?.length && model.renderMode === "overview") {
    ctx.save();
    ctx.fillStyle = "#B45309";
    ctx.font = 'bold 11px "Microsoft JhengHei","PingFang TC",sans-serif';
    model.referenceEdges.forEach((edge) => {
      const from = findNodeById(model.roots, edge.fromNodeId) ||
                   findNodeById(model.roots, edge.toNodeId);
      if (!from) return;
      const p = findCenter(from);
      ctx.fillText(`↗ ${crossRefLabel}`, p.x + 38, p.y - 24);
    });
    ctx.restore();
  }
}
