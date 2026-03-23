import { useState, useEffect, useRef } from "react";
import type { OrgPosition, OrgEdge, OrgModel } from "@orgchart/core";
import {
  calculateLayout,
  applyRoleLayoutAdjustments,
  renderToCanvas,
  calculateMetrics,
  THEMES,
} from "@orgchart/core";
import { mapSFToOrgChart } from "./api/sf-mapper";
import {
  mockDepartments,
  mockPositions,
  mockEmpJobs,
  mockPersons,
} from "./api/sf-mock-data";

// i18n available via createI18n() when needed for full localization

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roots, setRoots] = useState<OrgPosition[]>([]);
  const [edges, setEdges] = useState<OrgEdge[]>([]);
  const [lang, setLang] = useState<"tw" | "en">("tw");
  const [theme, setTheme] = useState("blue");
  const [syncStatus, setSyncStatus] = useState("idle");

  // Load mock data on mount
  useEffect(() => {
    handleSync();
  }, []);

  function handleSync() {
    setSyncStatus("syncing");
    // Simulate API delay
    setTimeout(() => {
      const result = mapSFToOrgChart(mockDepartments, mockPositions, mockEmpJobs, mockPersons, theme);
      setRoots(result.roots);
      setEdges(result.edges);
      setSyncStatus("done");
    }, 500);
  }

  // Render canvas whenever data changes
  useEffect(() => {
    if (!canvasRef.current || roots.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clone roots for layout (don't mutate state)
    const cloned = JSON.parse(JSON.stringify(roots));
    applyRoleLayoutAdjustments(cloned);
    calculateLayout(cloned, 999);

    const model: OrgModel = {
      roots: cloned,
      issues: [],
      maxLevels: 999,
      canvasTitle: lang === "en" ? "Tymphany Organization Chart" : "Tymphany 企業組織架構圖",
      edges,
    };

    renderToCanvas(ctx, canvasRef.current, model, {
      scale: 1,
      forExport: false,
      canvasTitle: model.canvasTitle,
      collapsedIds: new Set(),
      searchQuery: "",
      searchMatchIds: new Set(),
      searchContextIds: new Set(),
      selectedNodeId: null,
      vacantPrefix: lang === "en" ? "[Vacant]" : "[空缺]",
      crossRefLabel: lang === "en" ? "ref" : "參照",
    });
  }, [roots, edges, lang, theme]);

  // Calculate metrics for root
  const rootMetrics = roots.length > 0 ? calculateMetrics(roots[0]) : null;

  // Conditional formatting rules — will be used for data integrity visualization
  // const rules = [createVacancyHighlightRule(), createMissingEmailRule()];

  return (
    <div style={{ fontFamily: '"Microsoft JhengHei", "PingFang TC", sans-serif', background: "#F0F2F5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
        background: "#0A192F", color: "#E2E8F0", borderBottom: "2px solid #64FFDA",
      }}>
        <strong style={{ fontSize: 16, color: "#64FFDA" }}>OrgChart SAP Edition</strong>
        <span style={{ color: "#475569", fontSize: 12 }}>SuccessFactors Integration</span>
        <div style={{ flex: 1 }} />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{ background: "#1E293B", color: "#E2E8F0", border: "1px solid #334155", borderRadius: 4, padding: "4px 8px", fontSize: 12 }}
        >
          {Object.keys(THEMES).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button onClick={() => setLang(lang === "tw" ? "en" : "tw")} style={btnStyle}>
          {lang === "tw" ? "EN" : "繁中"}
        </button>
        <button onClick={handleSync} style={{ ...btnStyle, background: "#065F46", borderColor: "#10B981" }}>
          {syncStatus === "syncing" ? "⏳ Syncing..." : "🔄 Sync SF Data"}
        </button>
      </div>

      {/* Dashboard metrics */}
      {rootMetrics && (
        <div style={{ display: "flex", gap: 16, padding: "12px 20px", flexWrap: "wrap" }}>
          {[
            { label: lang === "en" ? "Headcount" : "在職人數", value: rootMetrics.headcount },
            { label: lang === "en" ? "Direct Reports" : "直接下屬", value: rootMetrics.directReports },
            { label: lang === "en" ? "Span of Control" : "管控幅度", value: rootMetrics.spanOfControl },
            { label: lang === "en" ? "Total FTE" : "總 FTE", value: rootMetrics.totalFte },
            { label: lang === "en" ? "Vacancies" : "空缺數", value: rootMetrics.vacancyCount, alert: rootMetrics.vacancyCount > 0 },
            { label: lang === "en" ? "Vacancy Rate" : "空缺率", value: (rootMetrics.vacancyRate * 100).toFixed(1) + "%" },
          ].map((m) => (
            <div key={m.label} style={{
              background: "#FFF", borderRadius: 8, padding: "12px 20px", minWidth: 120,
              border: m.alert ? "2px solid #DC2626" : "1px solid #E2E8F0",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: "bold", color: m.alert ? "#DC2626" : "#0A192F" }}>
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Canvas preview */}
      <div style={{ padding: "0 20px 20px", overflow: "auto" }}>
        <div style={{
          background: "#FFF", borderRadius: 8, border: "1px solid #E2E8F0",
          padding: 16, overflow: "auto", maxHeight: "70vh",
        }}>
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
      </div>

      {/* Sync status */}
      <div style={{ padding: "8px 20px", fontSize: 11, color: "#64748B" }}>
        Mode: Mock Data | {mockPositions.length} positions | {mockPersons.length} persons | {edges.length} matrix edges
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "4px 12px", borderRadius: 4, border: "1px solid #334155",
  background: "#1E293B", color: "#E2E8F0", cursor: "pointer", fontSize: 12,
};
