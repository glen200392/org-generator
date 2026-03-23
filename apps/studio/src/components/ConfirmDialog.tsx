// Styled confirm dialog replacing window.confirm

import { useEffect, useRef } from "react";

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "確定",
  cancelLabel = "取消",
  danger = false,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter") onConfirm();
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000,
    }}>
      <div ref={ref} style={{
        background: "#1E293B", borderRadius: 10, padding: "20px 24px",
        border: "1px solid #334155", maxWidth: 380, width: "90%",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ color: "#E2E8F0", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={{
            padding: "6px 16px", borderRadius: 6, border: "1px solid #475569",
            background: "#0F172A", color: "#94A3B8", cursor: "pointer", fontSize: 13,
          }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} style={{
            padding: "6px 16px", borderRadius: 6, border: "none",
            background: danger ? "#DC2626" : "#0F766E",
            color: "#FFF", cursor: "pointer", fontSize: 13, fontWeight: "bold",
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
