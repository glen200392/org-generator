// Right-click context menu for org chart nodes

import { useEffect, useRef } from "react";

export interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDelete: () => void;
  onCreateEdge: () => void;
}

export function ContextMenu({
  x, y, onClose, onAddChild, onAddSibling, onDelete, onCreateEdge,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const items: { label: string; action: () => void; danger?: boolean }[] = [
    { label: "＋ 新增子節點", action: onAddChild },
    { label: "＋ 新增同層節點", action: onAddSibling },
    { label: "---", action: () => {} },
    { label: "🔗 建立虛線關係", action: onCreateEdge },
    { label: "---", action: () => {} },
    { label: "🗑️ 刪除節點", action: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "4px 0",
        zIndex: 1000,
        minWidth: 180,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {items.map((item, i) =>
        item.label === "---" ? (
          <div key={i} style={{ height: 1, background: "#334155", margin: "4px 0" }} />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              color: item.danger ? "#F87171" : "#E2E8F0",
              fontSize: 13,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
