"use client";

import { useState } from "react";
import { ActionButton, GoldenCard, MonoLabel } from "@/components/ds";
import { LayoutGrid } from "lucide-react";

const SEGMENTS = [
  { id: "1", label: "Needs immediate action", count: 3  },
  { id: "2", label: "Portfolio drift alerts", count: 5  },
  { id: "3", label: "High AUM (₹5Cr+)",       count: 7  },
  { id: "4", label: "EV / Green Energy interest", count: 4 },
  { id: "5", label: "Conservative",           count: 6  },
  { id: "6", label: "Inactive > 30 days",     count: 2  },
  { id: "7", label: "KYC expiring",           count: 1  },
];

interface SegmentContent {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  cta: string;
  ctaHref?: string;
}

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const SEGMENT_CONTENT: Record<string, SegmentContent> = {
  "1": {
    icon: <AlertIcon />,
    title: "Needs Immediate Action",
    subtitle: "3 clients need attention today · KYC deadline, SIP failure & portfolio breach",
    stats: [
      { label: "KYC deadline", value: "1 client" },
      { label: "SIP failure", value: "1 client" },
      { label: "Risk breach", value: "1 client" },
    ],
    cta: "Review All →",
  },
  "2": {
    icon: <AlertIcon />,
    title: "Portfolio Drift Alerts",
    subtitle: "5 portfolios have drifted beyond tolerance · Rebalance recommended",
    stats: [
      { label: "Avg drift", value: "+8.4%" },
      { label: "Max deviation", value: "14.2%" },
      { label: "Rebalance due", value: "3 today" },
    ],
    cta: "Rebalance →",
  },
  "3": {
    icon: <TrendUpIcon />,
    title: "High AUM Clients (₹5Cr+)",
    subtitle: "7 clients · ₹89Cr AUM · 2 with upcoming review meetings",
    stats: [
      { label: "Total AUM", value: "₹89Cr" },
      { label: "Avg ticket", value: "₹12.7Cr" },
      { label: "Meetings due", value: "2 this week" },
    ],
    cta: "Open Segment →",
  },
  "4": {
    icon: <LeafIcon />,
    title: "EV / Green Energy Interest",
    subtitle: "4 clients expressed interest · 2 new thematic funds available to pitch",
    stats: [
      { label: "Investable intent", value: "₹3.2Cr" },
      { label: "New funds", value: "2 available" },
      { label: "Last pitched", value: "18 days ago" },
    ],
    cta: "View Opportunities →",
  },
  "5": {
    icon: <ShieldIcon />,
    title: "Conservative Investors",
    subtitle: "6 clients · Prefer debt & hybrid · FD maturities worth pitching",
    stats: [
      { label: "Debt allocation", value: "avg 74%" },
      { label: "FD maturities", value: "2 in 30 days" },
      { label: "Suitable products", value: "4 options" },
    ],
    cta: "Suggest Products →",
  },
  "6": {
    icon: <ClockIcon />,
    title: "Inactive > 30 Days",
    subtitle: "2 clients with no engagement · Last seen 34 & 47 days ago",
    stats: [
      { label: "Longest inactive", value: "47 days" },
      { label: "Combined AUM", value: "₹6.1Cr" },
      { label: "Open tasks", value: "0" },
    ],
    cta: "Schedule Re-engagement →",
  },
  "7": {
    icon: <FileIcon />,
    title: "KYC Expiring Soon",
    subtitle: "1 client · KYC expires in 8 days · Action required to avoid lock",
    stats: [
      { label: "Expires in", value: "8 days" },
      { label: "AUM at risk", value: "₹4.3Cr" },
      { label: "Status", value: "Pending docs" },
    ],
    cta: "Send KYC Reminder →",
  },
};

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      padding: "8px 14px",
      borderRadius: 8,
      background: "rgba(255,255,255,0.35)",
      border: "1px solid rgba(255,255,255,0.55)",
      minWidth: 90,
    }}>
      <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-lime-ink-2)" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-lime-ink)", fontFamily: "var(--qc-font-sans)" }}>
        {value}
      </span>
    </div>
  );
}

export function SmartSegmentsPills() {
  const [active, setActive] = useState("1");
  const seg = SEGMENT_CONTENT[active];

  return (
    <section style={{ marginBottom: 22 }}>
      <div
        className="rounded-[10px] p-2"
        style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
      >
        {/* Header */}
        <div className="px-2 pt-1 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
            <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Smart segments</MonoLabel>
          </div>
          <MonoLabel tracking="0.04em" color="var(--qc-ink-3)" style={{ cursor: "pointer" }}>
            Create segment →
          </MonoLabel>
        </div>

        {/* Pills */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: "var(--qc-card)", padding: "14px 16px", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
        >
          {SEGMENTS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: isActive ? "var(--primary)" : "var(--qc-section)",
                  border: isActive ? "1px solid var(--qc-lime-edge)" : "1px solid var(--qc-hair)",
                  fontSize: 12.5,
                  color: isActive ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
                  cursor: "pointer",
                  fontFamily: "var(--qc-font-sans)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {s.label}
                <span
                  style={{
                    fontFamily: "var(--qc-font-mono)",
                    fontSize: 10.5,
                    color: isActive ? "var(--qc-lime-ink)" : "var(--qc-ink-3)",
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: isActive ? "rgba(255,255,255,0.6)" : "var(--qc-chip)",
                    border: isActive ? "1px solid rgba(46,74,10,0.18)" : "1px solid var(--qc-hair)",
                  }}
                >
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Segment detail card */}
        <GoldenCard
          radius={10}
          columns="28px minmax(0,1fr) auto auto"
          rail={seg.icon}
          entity={
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3, color: "var(--qc-lime-ink)" }}>
                {seg.title}
              </div>
              <MonoLabel size={10.5} tracking="0.04em" color="var(--qc-lime-ink-2)">
                {seg.subtitle}
              </MonoLabel>
            </div>
          }
          content={
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {seg.stats.map((stat) => (
                <StatChip key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          }
          actions={
            <ActionButton
              noWrap
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.7)",
                color: "var(--qc-lime-ink)",
                borderRadius: 999,
              }}
            >
              {seg.cta}
            </ActionButton>
          }
          style={{ padding: "14px 18px" }}
        />
      </div>
    </section>
  );
}
