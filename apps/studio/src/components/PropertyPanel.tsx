// Right-side property panel for editing selected node fields
// Slides in when a node is selected, supports bilingual fields

import { useState } from "react";
import { useOrgStore } from "../store/org-store";

type Tab = "basic" | "person" | "advanced";

const tabLabels: Record<Tab, { tw: string; en: string }> = {
  basic: { tw: "基本資訊", en: "Basic" },
  person: { tw: "人員資訊", en: "Person" },
  advanced: { tw: "進階", en: "Advanced" },
};

function FieldRow({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 11, color: "#94A3B8", display: "block", marginBottom: 2 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "5px 8px", borderRadius: 4,
          border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0",
          fontSize: 12, fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 11, color: "#94A3B8", display: "block", marginBottom: 2 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "5px 8px", borderRadius: 4,
          border: "1px solid #334155", background: "#0F172A", color: "#E2E8F0",
          fontSize: 12,
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function PropertyPanel() {
  const { selectedNodeId, flowNodes, updateNodeField, lang } = useOrgStore();
  const [tab, setTab] = useState<Tab>("basic");

  if (!selectedNodeId) return null;

  const node = flowNodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const d = node.data as Record<string, unknown>;
  const get = (field: string) => String(d[field] ?? "");
  const update = (field: string) => (value: string) => updateNodeField(selectedNodeId, field, value);

  const isEn = lang === "en";

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 280,
      background: "#1E293B", borderLeft: "2px solid #64FFDA",
      padding: "12px 14px", overflowY: "auto", zIndex: 50,
      fontFamily: '"Microsoft JhengHei", "PingFang TC", sans-serif',
      color: "#E2E8F0", fontSize: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: "#64FFDA", fontSize: 14 }}>
          {isEn ? "Properties" : "節點屬性"}
        </strong>
        <button
          onClick={() => useOrgStore.getState().selectNode(null)}
          style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* Node ID */}
      <div style={{ fontSize: 10, color: "#475569", marginBottom: 10 }}>ID: {selectedNodeId}</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {(["basic", "person", "advanced"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 11,
              border: "1px solid #334155", cursor: "pointer",
              background: tab === t ? "#0F766E" : "#0F172A",
              color: "#E2E8F0",
            }}
          >
            {isEn ? tabLabels[t].en : tabLabels[t].tw}
          </button>
        ))}
      </div>

      {/* Basic tab */}
      {tab === "basic" && (
        <>
          <FieldRow label={isEn ? "Department" : "部門"} value={get("dept")} onChange={update("dept")} />
          <FieldRow label={isEn ? "Dept (EN)" : "部門 EN"} value={get("deptEn")} onChange={update("deptEn")} />
          <FieldRow label={isEn ? "Title" : "職稱"} value={get("title")} onChange={update("title")} />
          <FieldRow label={isEn ? "Title (EN)" : "職稱 EN"} value={get("titleEn")} onChange={update("titleEn")} />
          <SelectRow
            label={isEn ? "Role Type" : "角色類型"}
            value={get("roleType")}
            options={[
              { value: "normal", label: "Normal" },
              { value: "assistant", label: "Assistant / 幕僚" },
              { value: "acting", label: "Acting / 代理" },
              { value: "vacant", label: "Vacant / 空缺" },
              { value: "committee", label: "Committee / 委員會" },
              { value: "shared-service", label: "Shared Service" },
            ]}
            onChange={update("roleType")}
          />
          <SelectRow
            label={isEn ? "Layout" : "排版"}
            value={get("layoutType")}
            options={[
              { value: "standard", label: "Standard" },
              { value: "sidecar", label: "Sidecar / 側邊" },
              { value: "between", label: "Between / 中間" },
              { value: "stacked", label: "Stacked / 堆疊" },
              { value: "hidden-overview", label: "Hidden in Overview" },
            ]}
            onChange={update("layoutType")}
          />
        </>
      )}

      {/* Person tab */}
      {tab === "person" && (
        <>
          <FieldRow label={isEn ? "Name" : "姓名"} value={get("name")} onChange={update("name")} />
          <FieldRow label={isEn ? "Name (EN)" : "姓名 EN"} value={get("nameEn")} onChange={update("nameEn")} />
          <FieldRow label="Email" value={get("email")} onChange={update("email")} />
          <FieldRow label={isEn ? "Phone" : "電話"} value={get("phone")} onChange={update("phone")} />
          <FieldRow label={isEn ? "Location" : "地點"} value={get("location")} onChange={update("location")} />
          <FieldRow label={isEn ? "Start Date" : "到職日"} value={get("startDate")} onChange={update("startDate")} />
          <FieldRow label={isEn ? "Photo URL" : "照片 URL"} value={get("photoUrl")} onChange={update("photoUrl")} />
        </>
      )}

      {/* Advanced tab */}
      {tab === "advanced" && (
        <>
          <FieldRow label={isEn ? "Code" : "單位代碼"} value={get("code")} onChange={update("code")} />
          <FieldRow label="FTE" value={get("fte")} onChange={update("fte")} />
          <FieldRow label={isEn ? "Grade" : "職等"} value={get("grade")} onChange={update("grade")} />
          <FieldRow label={isEn ? "Cost Center" : "成本中心"} value={get("costCenter")} onChange={update("costCenter")} />
          <SelectRow
            label={isEn ? "Status" : "狀態"}
            value={get("status")}
            options={[
              { value: "active", label: isEn ? "Active" : "在職" },
              { value: "planned", label: isEn ? "Planned" : "規劃中" },
              { value: "frozen", label: isEn ? "Frozen" : "凍結" },
            ]}
            onChange={update("status")}
          />
          <FieldRow label={isEn ? "Background Color" : "背景色"} value={get("bgColor")} onChange={update("bgColor")} />
        </>
      )}
    </div>
  );
}
