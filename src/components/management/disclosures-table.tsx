"use client";

import type { ReactNode } from "react";
import { TabularCard } from "@/components/molecules/tabular-card";

export interface DisclosureRow {
  /** Primary label shown bold */
  title: string;
  /** Tag shown below the title in monospace brackets, e.g. "Market Risk" */
  tag?: string;
  /** Dot color severity: "high" | "medium" | "low" | string hex */
  severity?: "high" | "medium" | "low" | string;
  /** Right-column content */
  detail: string | null;
  /** Timing badge: proactive | reactive | partial | forced | past */
  timing?: string | null;
}

export interface DisclosuresTableConfig {
  title: string;
  subtitle?: string;
  /** Label for left column header */
  leftHeader?: string;
  /** Label for right column header */
  rightHeader?: string;
  /** Placeholder shown when detail is absent */
  detailPlaceholder?: string;
  /** Key finding text shown above the table */
  keyFinding?: string;
  /** Overall rating badge */
  rating?: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
}

function severityDotColor(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case "high":   return "#ef4444";
    case "medium": return "#f59e0b";
    case "low":    return "#22c55e";
    default:       return severity?.startsWith("#") ? severity : "#71717a";
  }
}

const TIMING_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  proactive: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  reactive:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  partial:   { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  forced:    { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  past:      { color: "#71717a", bg: "#f5f5f5", border: "#e2e2e2" },
};

function TimingBadge({ timing }: { timing: string }) {
  const style = TIMING_STYLES[timing.toLowerCase()] ?? TIMING_STYLES["past"];
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 9999,
        padding: "2px 8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {timing}
    </span>
  );
}

export interface DisclosuresTab {
  label: string;
  count: number;
}

interface DisclosuresTableProps {
  config: DisclosuresTableConfig;
  rows: DisclosureRow[];
  tabs?: DisclosuresTab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  headerAction?: ReactNode;
}

export function DisclosuresTable({ config, rows, tabs, activeTab, onTabChange, headerAction }: DisclosuresTableProps) {
  const tabsEl = tabs && tabs.length > 0 ? (
    <div className="inline-flex items-center gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={() => onTabChange?.(t.label)}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${activeTab === t.label ? "#0F172B" : "#E2E2E2"}`,
            background: activeTab === t.label ? "#0F172B" : "transparent",
            color: activeTab === t.label ? "#ffffff" : "#888888",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t.label}{t.count > 0 ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  ) : null;

  const ratingEl = config.rating ? (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 600,
        color: config.rating.color,
        background: config.rating.bg,
        border: `1px solid ${config.rating.border}`,
        borderRadius: 9999,
        padding: "3px 10px",
      }}
    >
      {config.rating.label}
    </div>
  ) : null;

  const composedHeaderAction = (tabsEl || ratingEl || headerAction) ? (
    <div className="flex items-center gap-3">
      {headerAction}
      {tabsEl}
      {ratingEl}
    </div>
  ) : undefined;

  const hasTimingColumn = rows.some((r) => r.timing);

  return (
    <TabularCard
      title={config.title}
      subtitle={config.subtitle}
      titleCase
      headerAction={composedHeaderAction}
    >
      {/* Key Finding */}
      {config.keyFinding && (
        <div className="flex items-center gap-3 mb-4">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#ffffff",
              background: "#2563eb",
              borderRadius: 6,
              padding: "3px 10px",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            Key Finding
          </span>
          <span style={{ fontSize: 14, color: "#121212" }}>{config.keyFinding}</span>
        </div>
      )}

      {rows.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No {config.title.toLowerCase()} available</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: "38%", textAlign: "left", fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 8, borderBottom: "1px solid #E2E2E2" }}>
                  {config.leftHeader ?? "Item & Type"}
                </th>
                {hasTimingColumn && (
                  <th style={{ width: "14%", textAlign: "left", fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 8, borderBottom: "1px solid #E2E2E2" }}>
                    Timing
                  </th>
                )}
                <th style={{ textAlign: "left", fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 8, borderBottom: "1px solid #E2E2E2" }}>
                  {config.rightHeader ?? "Detail"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                  <td style={{ padding: "12px 8px 12px 0", verticalAlign: "top" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: severityDotColor(row.severity),
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", lineHeight: 1.3 }}>{row.title}</div>
                        {row.tag && (
                          <div style={{ fontSize: 11, color: "#888888", fontFamily: "monospace", marginTop: 2 }}>[{row.tag}]</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {hasTimingColumn && (
                    <td style={{ padding: "12px 8px 12px 0", verticalAlign: "top" }}>
                      {row.timing ? <TimingBadge timing={row.timing} /> : null}
                    </td>
                  )}
                  <td style={{ padding: "12px 0 12px 16px", verticalAlign: "top" }}>
                    {row.detail ? (
                      <span style={{ fontSize: 14, color: "#121212" }}>{row.detail}</span>
                    ) : (
                      <span style={{ fontSize: 14, color: "#888888", fontStyle: "italic" }}>
                        {config.detailPlaceholder ?? "No details available"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </TabularCard>
  );
}
