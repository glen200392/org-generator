// Headless canvas renderer — takes ctx + model, returns hitBoxes
// Extracted from index.html L2729-2818

import type { OrgNode, OrgModel, HitBox } from "../model/types";
import { PPI, PAD_X, PAD_Y, BASE_CARD_W, BASE_CARD_H } from "../model/types";
import { drawRR, fitText, getTC, drawEdges } from "./draw-helpers";

export interface RenderOptions {
  /** Scale factor (1 for screen, 3 for hi-res export) */
  scale: number;
  /** Whether rendering for export (ignores collapsed/search state) */
  forExport: boolean;
  /** Canvas title text */
  canvasTitle: string;
  /** Set of collapsed node IDs */
  collapsedIds: Set<string>;
  /** Current search query */
  searchQuery: string;
  /** Set of node IDs matching the search */
  searchMatchIds: Set<string>;
  /** Set of node IDs in the search context (ancestors of matches) */
  searchContextIds: Set<string>;
  /** Currently selected node ID (for highlighting) */
  selectedNodeId: string | null;
  /** Logo image to draw in the top-right (optional) */
  logoImg?: HTMLImageElement | null;
  /** Localized "vacant" prefix text */
  vacantPrefix: string;
  /** Localized cross-reference label */
  crossRefLabel: string;
}

export interface RenderResult {
  /** Hit boxes for click detection */
  hitBoxes: HitBox[];
  /** Canvas logical width in pixels */
  logicalWidth: number;
  /** Canvas logical height in pixels */
  logicalHeight: number;
}

/**
 * Render an org chart model to a Canvas 2D context.
 * This is the core rendering function — it is headless and takes all
 * dependencies as parameters.
 */
export function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: { width: number; height: number },
  model: OrgModel,
  opts: RenderOptions,
): RenderResult {
  const { scale, forExport, canvasTitle, collapsedIds, searchQuery,
    searchMatchIds, searchContextIds, selectedNodeId, logoImg,
    vacantPrefix, crossRefLabel } = opts;
  const roots = model.roots;
  const hitBoxes: HitBox[] = [];

  if (!roots.length) {
    return { hitBoxes, logicalWidth: 0, logicalHeight: 0 };
  }

  // Calculate canvas dimensions from layout (already applied)
  let maxX = 0, maxY = 0;
  function findBounds(node: OrgNode) {
    const nx = (node.renderX ?? 0) + BASE_CARD_W;
    const ny = (node.renderY ?? 0) + BASE_CARD_H;
    if (nx > maxX) maxX = nx;
    if (ny > maxY) maxY = ny;
    // Only traverse visible children
    const forceExpand = !forExport && searchQuery.trim() && node.searchHasMatch;
    const visCh = !collapsedIds.has(node.id) || forceExpand ? node.children : [];
    visCh.forEach(findBounds);
  }
  roots.forEach(findBounds);

  const logW = maxX * PPI + PAD_X * 2;
  const logH = maxY * PPI + PAD_Y * 2;
  canvas.width = logW * scale;
  canvas.height = logH * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, logW, logH);

  // Title
  ctx.fillStyle = "#0A192F";
  ctx.font = 'bold 20px "Microsoft JhengHei","PingFang TC","Helvetica Neue",sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(canvasTitle, PAD_X, 14);

  // Logo
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const maxLW = 180, maxLH = 55;
    const lr = Math.min(maxLW / logoImg.naturalWidth, maxLH / logoImg.naturalHeight, 1);
    ctx.drawImage(logoImg, logW - logoImg.naturalWidth * lr - PAD_X, 8,
      logoImg.naturalWidth * lr, logoImg.naturalHeight * lr);
  }

  // Draw nodes recursively
  function drawNode(node: OrgNode) {
    const cX = (node.renderX ?? 0) * PPI + PAD_X;
    const cY = (node.renderY ?? 0) * PPI + PAD_Y;
    const cW = BASE_CARD_W * PPI;
    const cH = BASE_CARD_H * PPI;
    const isC = collapsedIds.has(node.id);
    const tc = getTC(node.bgColor);
    const isSearchActive = !forExport && !!searchQuery.trim();
    const isMatch = isSearchActive && searchMatchIds.has(node.id);
    const isSelected = !forExport && node.id === selectedNodeId;
    const inContext = !isSearchActive || searchContextIds.has(node.id);
    const forceExpand = isSearchActive && node.searchHasMatch;

    if (scale === 1) {
      hitBoxes.push({ id: node.id, x: cX, y: cY, w: cW, h: cH });
    }

    const visibleChildren =
      (node.level ?? 1) < (model.maxLevels || 999) &&
      (!isC || forceExpand)
        ? node.children
        : [];

    // Draw connector lines
    if (visibleChildren.length > 0) {
      const pBY = cY + cH;
      const chTY = (visibleChildren[0].renderY ?? 0) * PPI + PAD_Y;
      const mY = pBY + (chTY - pBY) / 2;
      const pCX = cX + cW / 2;
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pCX, pBY); ctx.lineTo(pCX, mY); ctx.stroke();
      const fCX = (visibleChildren[0].renderX ?? 0) * PPI + PAD_X + cW / 2;
      const lCX = (visibleChildren[visibleChildren.length - 1].renderX ?? 0) * PPI + PAD_X + cW / 2;
      ctx.beginPath(); ctx.moveTo(fCX, mY); ctx.lineTo(lCX, mY); ctx.stroke();
      visibleChildren.forEach((ch) => {
        ctx.beginPath();
        ctx.moveTo((ch.renderX ?? 0) * PPI + PAD_X + cW / 2, mY);
        ctx.lineTo((ch.renderX ?? 0) * PPI + PAD_X + cW / 2, chTY);
        ctx.stroke();
        drawNode(ch);
      });
    }

    // Draw node card
    ctx.globalAlpha = inContext ? 1 : 0.22;
    ctx.fillStyle = node.bgColor;
    ctx.strokeStyle = isMatch ? "#F59E0B" : isSelected ? "#0F766E" : tc.border;
    ctx.lineWidth = isMatch || isSelected ? 4 : 2;
    if (node.roleType === "vacant") ctx.setLineDash([6, 4]);
    drawRR(ctx, cX, cY, cW, cH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Collapse/expand indicator
    if (node.children.length > 0) {
      ctx.fillStyle = tc.icon;
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(isC && !forceExpand ? "▶" : "▼", cX + cW - 5, cY + 5);
    }

    // Node text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 13px "Microsoft JhengHei","PingFang TC",sans-serif';
    ctx.fillStyle = tc.dept;
    ctx.fillText(fitText(ctx, node.dept, cW - 14), cX + cW / 2, cY + cH * 0.35);

    ctx.font = '12px "Microsoft JhengHei","PingFang TC",sans-serif';
    const nameLine =
      node.roleType === "vacant"
        ? `${vacantPrefix} ${node.title || ""}`
        : `${node.name} (${node.title})`;
    ctx.fillStyle = tc.name;
    ctx.fillText(fitText(ctx, nameLine, cW - 10), cX + cW / 2, cY + cH * 0.68);
    ctx.globalAlpha = 1;
  }

  roots.forEach((r) => drawNode(r));

  // Draw edges
  drawEdges(ctx, model, crossRefLabel);

  return { hitBoxes, logicalWidth: logW, logicalHeight: logH };
}
