"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import type { InvestmentThesis, RedFlag } from "@/types/management";

interface DecisionIntelligenceSectionProps {
  thesis: InvestmentThesis;
  redFlags: RedFlag[];
}

interface Column {
  key: "strengths" | "focus" | "red_flags";
  label: string;
  dotColor: string;
  accentColor: string;
  items: { title: string; body: string; source?: string }[];
}

function ColumnCard({ item, accentColor }: { item: Column["items"][0]; accentColor: string }) {
  return (
    <div style={{ paddingBottom: 18, borderBottom: "1px solid var(--qc-hair)" }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.4 }}>
        {item.title}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>
        {item.body}
      </p>
      {item.source && (
        <span style={{ fontSize: 10, color: "var(--qc-ink-3)", fontStyle: "italic" }}>{item.source}</span>
      )}
    </div>
  );
}

function IntelligenceColumn({ column }: { column: Column }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRight: column.key !== "red_flags" ? "1px solid var(--qc-hair)" : undefined,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 16px 12px",
          borderBottom: "1px solid var(--qc-hair)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: column.accentColor,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {column.label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--qc-ink-3)",
            letterSpacing: "0.05em",
          }}
        >
          {String(column.items.length).padStart(2, "0")}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 0, height: 260, overflowY: "auto" }}>
        {column.items.map((item, i) => (
          <div key={i} style={{ paddingTop: 14 }}>
            <ColumnCard item={item} accentColor={column.accentColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DecisionIntelligenceSection({ thesis, redFlags }: DecisionIntelligenceSectionProps) {
  const { bull_case, next_concall_watchlist } = thesis;

  const strengthItems = bull_case.map((point) => {
    const dotIdx = point.indexOf("—");
    if (dotIdx > -1) {
      return { title: point.slice(0, dotIdx).trim(), body: point.slice(dotIdx + 1).trim() };
    }
    const colonIdx = point.indexOf(":");
    if (colonIdx > -1 && colonIdx < 40) {
      return { title: point.slice(0, colonIdx).trim(), body: point.slice(colonIdx + 1).trim() };
    }
    return { title: point, body: "" };
  });

  const focusItems = next_concall_watchlist.map((w) => ({
    title: w.what_to_listen_for,
    body: w.why_it_matters,
  }));

  const flagItems = redFlags.map((f) => ({
    title: f.title,
    body: f.evidence.split(". ")[0],
    source: f.severity === "caution" ? "CAUTION" : "WATCH",
  }));

  const title = (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Decision Intelligence
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", letterSpacing: "0.01em" }}>
        Strengths · Focus · Red flags
      </span>
    </div>
  );

  const columns: Column[] = [
    {
      key: "strengths",
      label: "Strengths",
      dotColor: "var(--qc-up)",
      accentColor: "var(--qc-up)",
      items: strengthItems,
    },
    {
      key: "focus",
      label: "Current Focus",
      dotColor: "var(--qc-ink-3)",
      accentColor: "var(--qc-ink-2)",
      items: focusItems,
    },
    {
      key: "red_flags",
      label: "Red Flags",
      dotColor: "var(--qc-down)",
      accentColor: "var(--qc-down)",
      items: flagItems,
    },
  ];

  return (
    <SectionPanel title={title} contentClassName="!p-0 overflow-hidden">
      <div style={{ display: "flex" }}>
        {columns.map((col) => (
          <IntelligenceColumn key={col.key} column={col} />
        ))}
      </div>
    </SectionPanel>
  );
}
