// Popup selector for choosing edge type when creating a new relationship

import { useEffect, useRef } from "react";
import type { EdgeType } from "@orgchart/core";

const edgeOptions: { value: EdgeType; label: string; color: string }[] = [
  { value: "dotted", label: "虛線匯報 / Dotted Line", color: "#94A3B8" },
  { value: "advisory", label: "顧問關係 / Advisory", color: "#F59E0B" },
  { value: "project", label: "專案關係 / Project", color: "#7C3AED" },
  { value: "reference", label: "參照連結 / Reference", color: "#94A3B8" },
];

export function EdgeTypeSelector({
  x, y, onSelect, onCancel,
}: {
  x: number;
  y: number;
  onSelect: (type: EdgeType) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCancel]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", left: x, top: y,
        background: "#1E293B", border: "1px solid #334155",
        borderRadius: 8, padding: "6px 0", zIndex: 1000,
        minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748B" }}>
        選擇關係類型 / Edge Type
      </div>
      {edgeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "8px 12px",
            background: "transparent", border: "none",
            color: "#E2E8F0", fontSize: 13, textAlign: "left",
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{
            width: 20, height: 3, background: opt.color,
            borderRadius: 1, display: "inline-block",
            borderTop: opt.value === "dotted" || opt.value === "reference" ? "2px dashed " + opt.color : undefined,
          }} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
