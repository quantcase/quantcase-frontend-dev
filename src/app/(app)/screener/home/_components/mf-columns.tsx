"use client";

import type { MfScreenerScheme } from "@/types/mutual-fund";

export function pct(v: number | null | undefined) {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

export function cr(v: number | null | undefined) {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

export interface ColDef {
  key: string;
  label: string;
  align: "left" | "right";
  sortKey?: string;
  render: (s: MfScreenerScheme) => React.ReactNode;
}

export const MF_COLUMNS: ColDef[] = [
  {
    key: "name",
    label: "Fund Name",
    align: "left",
    sortKey: "name",
    render: (s) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate max-w-[300px] block" style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>
          {s.name}
        </span>
        <span className="truncate max-w-[300px] block" style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
          {[s.amc_name, s.category].filter(Boolean).join(" · ")}
        </span>
      </div>
    ),
  },
  {
    key: "plan_type",
    label: "Plan",
    align: "left",
    render: (s) => (
      <span
        className="inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
        style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}
      >
        {s.plan_type ?? "—"}
      </span>
    ),
  },
  {
    key: "risk_label",
    label: "Risk",
    align: "left",
    render: (s) => <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>{s.risk_label ?? "—"}</span>,
  },
  {
    key: "morningstar",
    label: "★ Rating",
    align: "right",
    sortKey: "morningstar",
    render: (s) =>
      s.morningstar == null ? (
        <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)" }}>—</span>
      ) : (
        <span className="flex items-center justify-end gap-0.5">
          <span style={{ color: "var(--qc-warn)", fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", letterSpacing: 1 }}>{"★".repeat(s.morningstar)}</span>
        </span>
      ),
  },
  {
    key: "aum",
    label: "AUM",
    align: "right",
    sortKey: "aum",
    render: (s) => <span style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)" }}>{cr(s.aum)}</span>,
  },
  {
    key: "expense_ratio",
    label: "Exp. Ratio",
    align: "right",
    sortKey: "expense_ratio",
    render: (s) => <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-2)" }}>{pct(s.expense_ratio)}</span>,
  },
  {
    key: "nav",
    label: "NAV",
    align: "right",
    sortKey: "nav",
    render: (s) => (
      <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)" }}>
        {s.nav == null ? <span style={{ color: "var(--qc-ink-3)" }}>—</span> : `₹${s.nav.toFixed(2)}`}
      </span>
    ),
  },
];
