"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Star,
  Shield,
  BarChart3,
  PieChart,
  Layers,
  Calendar,
  DollarSign,
  Activity,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import type {
  MutualFundDetailResponse,
  MutualFundDetail,
  EquityHolding,
  DebtHolding,
  MFReturns,
  MFRatios,
  MFSector,
  MFNavHistory,
  MFRelatedVariant,
} from "@/types/mutual-fund";

/* ─────────── helpers ─────────── */

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function fmtCr(n: number | null | undefined) {
  if (n == null) return "—";
  const cr = n / 1e7;
  if (cr >= 1e5) return `₹${fmt(cr / 1e5, 1)}L Cr`;
  if (cr >= 1e3) return `₹${fmt(cr / 1e3, 1)}K Cr`;
  return `₹${fmt(cr, 0)} Cr`;
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${fmt(n, 2)}%`;
}

function returnColor(n: number | null | undefined) {
  if (n == null) return "var(--qc-text-muted)";
  return n >= 0 ? "var(--qc-up)" : "var(--qc-down)";
}

/* ─────────── design atoms ─────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--qc-text-muted)" }}>
      {children}
    </p>
  );
}

function CardHeader({
  icon: Icon,
  title,
  badge,
  right,
}: {
  icon?: React.ElementType;
  title: string;
  badge?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 border-b"
      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className="flex items-center justify-center w-6 h-6 rounded-[6px]"
            style={{ background: "var(--qc-accent-lime-bg)", border: "1px solid var(--qc-border-default)" }}
          >
            <Icon size={12} style={{ color: "var(--qc-text-heading)" }} />
          </span>
        )}
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--qc-text-heading)" }}
        >
          {title}
        </span>
        {badge}
      </div>
      {right}
    </div>
  );
}

function Card({
  children,
  className = "",
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border overflow-hidden ${className}`}
      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
    >
      {noPadding ? children : <div className="p-5">{children}</div>}
    </div>
  );
}

function RiskBadge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Low:               { bg: "var(--qc-up-soft)",   color: "var(--qc-up)" },
    "Low to Moderate": { bg: "var(--qc-warn-soft)",  color: "var(--qc-warn)" },
    Moderate:          { bg: "var(--qc-warn-soft)",  color: "var(--qc-warn)" },
    "Moderately High": { bg: "var(--qc-warn-soft)",              color: "var(--qc-down)" },
    High:              { bg: "var(--qc-down-soft)",  color: "var(--qc-down)" },
    "Very High":       { bg: "var(--qc-down-soft)",  color: "var(--qc-down)" },
  };
  const style = map[label] ?? { bg: "var(--qc-surface-panel)", color: "var(--qc-text-muted)" };
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} fill={i < stars ? "var(--qc-warn)" : "none"} stroke={i < stars ? "var(--qc-warn)" : "var(--qc-border-default)"} />
      ))}
    </span>
  );
}

/* ─────────── hero metric tile ─────────── */

function HeroTile({
  label,
  value,
  sub,
  valueColor,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-[10px] border px-4 py-4 flex flex-col gap-1.5 relative overflow-hidden"
      style={{
        borderColor: accent ? "var(--qc-accent-lime)" : "var(--qc-border-default)",
        background: accent ? "var(--qc-accent-lime-bg)" : "var(--qc-surface-white)",
      }}
    >
      {accent && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(107, 33, 168, 0.10) 0%, transparent 60%)",
          }}
        />
      )}
      <SectionLabel>{label}</SectionLabel>
      <p
        className="text-[18px] font-semibold leading-tight tabular-nums relative"
        style={{ color: valueColor ?? "var(--qc-text-heading)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] relative" style={{ color: "var(--qc-text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─────────── returns strip ─────────── */

function ReturnsStrip({ returns, rankTotal }: { returns: MFReturns; rankTotal: number | null }) {
  const periods: { label: string; ret: number | null; rank: number | null }[] = [
    { label: "1M",        ret: returns.return_1m,        rank: returns.rank_1m },
    { label: "3M",        ret: returns.return_3m,        rank: returns.rank_3m },
    { label: "6M",        ret: returns.return_6m,        rank: returns.rank_6m },
    { label: "1Y",        ret: returns.return_1y,        rank: returns.rank_1y },
    { label: "3Y CAGR",  ret: returns.return_3y,        rank: returns.rank_3y },
    { label: "5Y CAGR",  ret: returns.return_5y,        rank: returns.rank_5y },
    { label: "Inception", ret: returns.return_inception, rank: null },
  ];

  return (
    <div
      className="grid gap-px"
      style={{
        gridTemplateColumns: `repeat(${periods.length}, 1fr)`,
        background: "var(--qc-border-default)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {periods.map(({ label, ret, rank }) => {
        const positive = ret != null && ret >= 0;
        const isTop = rank != null && rankTotal != null && rank <= Math.ceil(rankTotal * 0.25);
        return (
          <div
            key={label}
            className="flex flex-col items-center py-4 px-2 gap-1"
            style={{ background: "var(--qc-surface-white)" }}
          >
            <SectionLabel>{label}</SectionLabel>
            <span
              className="text-[17px] font-semibold tabular-nums"
              style={{ color: returnColor(ret) }}
            >
              {ret != null ? `${ret >= 0 ? "+" : ""}${fmt(ret, 1)}%` : "—"}
            </span>
            {rank != null && rankTotal != null ? (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-sm tabular-nums"
                style={{
                  background: isTop ? "var(--qc-accent-lime-bg)" : "var(--qc-surface-panel)",
                  color: isTop ? "var(--qc-text-heading)" : "var(--qc-text-muted)",
                }}
              >
                #{rank}/{rankTotal}
              </span>
            ) : (
              <span className="text-[9px] invisible">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── allocation bar ─────────── */

function AllocationBar({ equity, debt, other }: { equity: number; debt: number; other: number }) {
  const segments = [
    { label: "Equity", pct: equity, color: "var(--qc-text-heading)" },
    { label: "Debt",   pct: debt,   color: "var(--qc-text-muted)" },
    { label: "Other",  pct: other,  color: "var(--qc-border-default)" },
  ].filter(s => s.pct > 0);

  return (
    <div className="space-y-3">
      <div className="flex rounded-full overflow-hidden h-3 gap-px">
        {segments.map(s => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {segments.map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            {s.label} <span className="font-semibold tabular-nums" style={{ color: "var(--qc-text-heading)" }}>{fmt(s.pct, 1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────── sector breakdown ─────────── */

function SectorBar({ sector, pct, max }: { sector: string; pct: number; max: number }) {
  const width = (pct / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-[11px] truncate flex-shrink-0" style={{ color: "var(--qc-text-muted)" }}>
        {sector}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--qc-border-default)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, var(--qc-accent-lime) 0%, var(--qc-text-heading) 100%)`,
          }}
        />
      </div>
      <span className="w-10 text-right text-[11px] font-semibold tabular-nums" style={{ color: "var(--qc-text-heading)" }}>
        {fmt(pct, 1)}%
      </span>
    </div>
  );
}

function SectorBreakdown({ sectors }: { sectors: MFSector[] }) {
  const sorted = [...sectors].sort((a, b) => b.total_weight - a.total_weight).slice(0, 10);
  const max = sorted[0]?.total_weight ?? 1;
  return (
    <div className="space-y-2.5">
      {sorted.map(({ sector, total_weight }) => (
        <SectorBar key={sector} sector={sector} pct={total_weight} max={max} />
      ))}
    </div>
  );
}

function SectorBreakdownFromHoldings({ holdings }: { holdings: EquityHolding[] }) {
  const sectorMap: Record<string, number> = {};
  for (const h of holdings) {
    const sector = h.sector ?? "Other";
    sectorMap[sector] = (sectorMap[sector] ?? 0) + h.weight_pct;
  }
  const sorted = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = sorted[0]?.[1] ?? 1;
  return (
    <div className="space-y-2.5">
      {sorted.map(([sector, pct]) => (
        <SectorBar key={sector} sector={sector} pct={pct} max={max} />
      ))}
    </div>
  );
}

/* ─────────── ratios ─────────── */

function RatioRow({ label, value, avg }: { label: string; value: string; avg?: string }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-b-0"
      style={{ borderColor: "var(--qc-border-inner)" }}
    >
      <span className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>
        {label}
      </span>
      <div className="flex items-center gap-3 text-right">
        {avg && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-muted)" }}>
            Cat. avg: {avg}
          </span>
        )}
        <span className="text-[13px] font-semibold tabular-nums w-14" style={{ color: "var(--qc-text-heading)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function RatiosPanel({ ratios }: { ratios: MFRatios }) {
  const risk = ratios.risk;
  const ret = ratios.returns;
  const val = ratios.valuation;
  const cat = ratios.category_averages;

  const hasRiskData = risk && Object.values(risk).some(v => v != null);
  const hasRetData = ret && Object.values(ret).some(v => v != null);
  const hasValData = val && Object.values(val).some(v => v != null);

  if (!hasRiskData && !hasRetData && !hasValData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {hasRiskData && (
        <Card noPadding>
          <CardHeader icon={Shield} title="Risk Metrics" right={
            ratios.as_of_date && (
              <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{ratios.as_of_date}</span>
            )
          } />
          <div className="p-4">
            {risk!.std_deviation != null && <RatioRow label="Std. Deviation" value={`${fmt(risk!.std_deviation, 2)}%`} />}
            {risk!.beta != null && <RatioRow label="Beta" value={fmt(risk!.beta, 2)} avg={cat?.beta != null ? fmt(cat.beta, 2) : undefined} />}
            {risk!.sortino_ratio != null && <RatioRow label="Sortino Ratio" value={fmt(risk!.sortino_ratio, 2)} />}
            {risk!.r_squared != null && <RatioRow label="R-Squared" value={fmt(risk!.r_squared, 2)} />}
          </div>
        </Card>
      )}
      {hasRetData && (
        <Card noPadding>
          <CardHeader icon={Activity} title="Performance Ratios" right={
            ratios.as_of_date && (
              <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{ratios.as_of_date}</span>
            )
          } />
          <div className="p-4">
            {ret!.sharpe_ratio != null && <RatioRow label="Sharpe Ratio" value={fmt(ret!.sharpe_ratio, 2)} avg={cat?.sharpe != null ? fmt(cat.sharpe, 2) : undefined} />}
            {ret!.jensens_alpha != null && <RatioRow label="Jensen's Alpha" value={fmt(ret!.jensens_alpha, 2)} />}
            {ret!.treynor_ratio != null && <RatioRow label="Treynor Ratio" value={fmt(ret!.treynor_ratio, 2)} />}
            {ret!.information_ratio != null && <RatioRow label="Information Ratio" value={fmt(ret!.information_ratio, 2)} />}
          </div>
        </Card>
      )}
      {hasValData && (
        <Card noPadding>
          <CardHeader icon={BarChart3} title="Valuation" right={
            ratios.as_of_date && (
              <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{ratios.as_of_date}</span>
            )
          } />
          <div className="p-4">
            {val!.pe_ratio != null && <RatioRow label="P/E Ratio" value={fmt(val!.pe_ratio, 1)} avg={cat?.pe != null ? fmt(cat.pe, 1) : undefined} />}
            {val!.pb_ratio != null && <RatioRow label="P/B Ratio" value={fmt(val!.pb_ratio, 2)} />}
            {val!.ps_ratio != null && <RatioRow label="P/S Ratio" value={fmt(val!.ps_ratio, 2)} />}
            {val!.dividend_yield != null && <RatioRow label="Dividend Yield" value={`${fmt(val!.dividend_yield, 2)}%`} />}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────── NAV chart ─────────── */

function NavChart({ navHistory }: { navHistory: MFNavHistory }) {
  const { data, summary } = navHistory;
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 800;
  const H = 140;
  const pad = 8;

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.close - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${W - pad},${H - pad} L ${pad},${H - pad} Z`;

  const isPositive = summary?.total_return_pct != null ? summary.total_return_pct >= 0 : true;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <SectionLabel>NAV History</SectionLabel>
          <p className="text-[13px] mt-0.5 font-medium" style={{ color: "var(--qc-text-heading)" }}>5-Year Performance</p>
        </div>
        {summary && (
          <div className="flex items-center gap-6">
            {summary.cagr_pct != null && (
              <div className="text-right">
                <SectionLabel>5Y CAGR</SectionLabel>
                <p className="text-[16px] font-semibold tabular-nums mt-0.5" style={{ color: returnColor(summary.cagr_pct) }}>
                  {fmtPct(summary.cagr_pct)}
                </p>
              </div>
            )}
            {summary.total_return_pct != null && (
              <div className="text-right">
                <SectionLabel>Total Return</SectionLabel>
                <p className="text-[16px] font-semibold tabular-nums mt-0.5" style={{ color: returnColor(summary.total_return_pct) }}>
                  {fmtPct(summary.total_return_pct)}
                </p>
              </div>
            )}
            {summary.drawdown_from_high_pct != null && (
              <div className="text-right">
                <SectionLabel>Max Drawdown</SectionLabel>
                <p className="text-[16px] font-semibold tabular-nums mt-0.5" style={{ color: "var(--qc-down)" }}>
                  {fmtPct(summary.drawdown_from_high_pct)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="navAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "var(--qc-accent-primary)" : "var(--qc-down)"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={isPositive ? "var(--qc-accent-primary)" : "var(--qc-down)"} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="navLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isPositive ? "var(--qc-accent-primary)" : "var(--qc-down)"} />
            <stop offset="100%" stopColor={isPositive ? "var(--qc-accent-primary)" : "var(--qc-down)"} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#navAreaGrad)" />
        <path d={pathD} fill="none" stroke="url(#navLineGrad)" strokeWidth="2" />
      </svg>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--qc-text-muted)" }}>
        <span>{data[0]?.period}</span>
        <span>{data[data.length - 1]?.period}</span>
      </div>
    </div>
  );
}

/* ─────────── AUM trend ─────────── */

function AumTrend({ history }: { history: { month: string; total_aum: number; stock_count: number }[] }) {
  const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  if (sorted.length === 0) return null;

  const maxAum = Math.max(...sorted.map(d => d.total_aum));
  const lastTwo = sorted.slice(-2);
  const trend = lastTwo.length === 2 ? lastTwo[1].total_aum - lastTwo[0].total_aum : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <SectionLabel>AUM Trend</SectionLabel>
          <p className="text-[13px] mt-0.5 font-medium" style={{ color: "var(--qc-text-heading)" }}>Last 12 Months</p>
        </div>
        {trend !== 0 && (
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: trend >= 0 ? "var(--qc-up)" : "var(--qc-down)" }}>
            {trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {fmtCr(Math.abs(trend))} MoM
          </div>
        )}
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {sorted.map(({ month, total_aum }) => {
          const heightPct = (total_aum / maxAum) * 100;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                style={{
                  height: `${heightPct}%`,
                  background: "linear-gradient(180deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)",
                  minHeight: 3,
                }}
              />
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg" style={{ background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }}>
                <p className="font-semibold">{fmtCr(total_aum)}</p>
                <p className="opacity-60">{month}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--qc-text-muted)" }}>
        <span>{sorted[0]?.month}</span>
        <span>{sorted[sorted.length - 1]?.month}</span>
      </div>
    </div>
  );
}

/* ─────────── related variants ─────────── */

function RelatedVariants({ variants, currentCode }: { variants: MFRelatedVariant[]; currentCode: string }) {
  const sorted = [...variants].sort((a, b) => a.plan_type.localeCompare(b.plan_type));
  return (
    <Card noPadding>
      <CardHeader icon={Layers} title="Plan Variants" right={
        <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>Direct vs Regular · Growth vs IDCW</span>
      } />
      <div className="divide-y" style={{ borderColor: "var(--qc-border-inner)" }}>
        {sorted.map(v => (
          <div
            key={v.amfi_code}
            className="flex items-center justify-between px-5 py-3 transition-colors"
            style={{ background: v.amfi_code === currentCode ? "var(--qc-accent-lime-bg)" : undefined }}
            onMouseEnter={e => { if (v.amfi_code !== currentCode) e.currentTarget.style.background = "var(--qc-surface-hover)"; }}
            onMouseLeave={e => { if (v.amfi_code !== currentCode) e.currentTarget.style.background = ""; }}
          >
            <div>
              <p className="text-[12px] font-medium flex items-center gap-2" style={{ color: "var(--qc-text-heading)" }}>
                {v.plan_type.replace(/_/g, " ")} · {v.option_type.replace(/_/g, " ")}
                {v.amfi_code === currentCode && (
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wide rounded-sm px-1.5 py-0.5"
                    style={{ background: "var(--qc-accent-lime)", color: "var(--qc-text-heading)" }}
                  >
                    Current
                  </span>
                )}
              </p>
              <p className="text-[11px] tabular-nums mt-0.5" style={{ color: "var(--qc-text-muted)" }}>
                NAV ₹{fmt(v.nav)} · AUM {fmtCr(v.aum)}
              </p>
            </div>
            <p className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--qc-text-heading)" }}>
              {v.expense_ratio != null ? `${fmt(v.expense_ratio)}%` : "—"}
              <span className="text-[10px] font-normal ml-1" style={{ color: "var(--qc-text-muted)" }}>ER</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── equity holdings ─────────── */

function EquityHoldingsTable({ holdings }: { holdings: EquityHolding[] }) {
  const top = holdings.slice(0, 20);
  const top10Weight = holdings.slice(0, 10).reduce((s, h) => s + h.weight_pct, 0);

  return (
    <div>
      {top10Weight > 0 && (
        <div
          className="px-5 py-2.5 border-b flex gap-6 text-[11px]"
          style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-accent-lime-bg)" }}
        >
          <span style={{ color: "var(--qc-text-muted)" }}>
            Top-10 concentration:{" "}
            <span className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>
              {fmt(top10Weight, 1)}%
            </span>
          </span>
          <span style={{ color: "var(--qc-text-muted)" }}>
            Total holdings:{" "}
            <span className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>
              {holdings.length}
            </span>
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
              {["#", "Stock", "Sector", "Weight", "Market Value", "Qty Δ MoM"].map(h => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider font-medium"
                  style={{ color: "var(--qc-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--qc-border-inner)" }}>
            {top.map((h, i) => (
              <tr
                key={i}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-surface-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td className="py-2.5 px-3 tabular-nums text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{i + 1}</td>
                <td className="py-2.5 px-3 font-medium" style={{ color: "var(--qc-text-heading)" }}>{h.stock_name}</td>
                <td className="py-2.5 px-3 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{h.sector ?? "—"}</td>
                <td className="py-2.5 px-3 tabular-nums font-medium" style={{ color: "var(--qc-text-heading)" }}>
                  {fmt(h.weight_pct, 2)}%
                </td>
                <td className="py-2.5 px-3 tabular-nums text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
                  {fmtCr(h.market_value)}
                </td>
                <td className="py-2.5 px-3 tabular-nums">
                  {h.month_change_pct != null ? (
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: h.month_change_pct >= 0 ? "var(--qc-up)" : "var(--qc-down)" }}
                    >
                      {h.month_change_pct >= 0 ? "+" : ""}{fmt(h.month_change_pct, 1)}%
                    </span>
                  ) : (
                    <span style={{ color: "var(--qc-text-muted)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────── debt holdings ─────────── */

type DebtSortKey = "name" | "holding_type" | "credit_rating" | "weight_pct" | "market_value" | "maturity_date";

function DebtHoldingsTable({ holdings }: { holdings: DebtHolding[] }) {
  const PAGE_SIZE = 15;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [sortKey, setSortKey] = useState<DebtSortKey>("weight_pct");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const types = ["All", ...Array.from(new Set(holdings.map(h => h.holding_type))).sort()];
  const ratings = ["All", ...Array.from(new Set(holdings.map(h => h.credit_rating ?? "—"))).sort()];

  const filtered = holdings.filter(h => {
    if (typeFilter !== "All" && h.holding_type !== typeFilter) return false;
    if (ratingFilter !== "All" && (h.credit_rating ?? "—") !== ratingFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return h.name.toLowerCase().includes(q) || (h.credit_rating ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number | null = a[sortKey];
    let bv: string | number | null = b[sortKey];
    if (av == null) av = sortKey === "weight_pct" || sortKey === "market_value" ? -Infinity : "";
    if (bv == null) bv = sortKey === "weight_pct" || sortKey === "market_value" ? -Infinity : "";
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSort(key: DebtSortKey) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  function SortIcon({ col }: { col: DebtSortKey }) {
    if (sortKey !== col) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>;
  }

  const inputStyle = {
    background: "var(--qc-surface-white)",
    border: "1px solid var(--qc-border-default)",
    color: "var(--qc-text-body)",
    borderRadius: 6,
  };

  return (
    <div>
      <div
        className="px-4 py-3 border-b flex flex-wrap items-center gap-3"
        style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
      >
        <div className="relative flex items-center">
          <svg className="absolute left-2.5 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--qc-text-muted)" }}>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search instruments…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-3 py-1.5 text-[12px] w-52 focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Type</span>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="px-2 py-1.5 text-[12px] focus:outline-none" style={inputStyle}>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Rating</span>
          <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setPage(1); }} className="px-2 py-1.5 text-[12px] focus:outline-none" style={inputStyle}>
            {ratings.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <span className="ml-auto text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
          {sorted.length} of {holdings.length} instruments
        </span>
        {(search || typeFilter !== "All" || ratingFilter !== "All") && (
          <button
            onClick={() => { setSearch(""); setTypeFilter("All"); setRatingFilter("All"); setPage(1); }}
            className="text-[11px] px-2 py-1 rounded-md transition-opacity hover:opacity-70"
            style={{ background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)", color: "var(--qc-text-muted)" }}
          >
            Reset
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
              {(
                [
                  ["name", "Instrument"],
                  ["holding_type", "Type"],
                  ["credit_rating", "Rating"],
                  ["weight_pct", "Weight %"],
                  ["market_value", "Market Value"],
                  ["maturity_date", "Maturity"],
                ] as [DebtSortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider font-medium select-none cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "var(--qc-text-muted)" }}
                  onClick={() => toggleSort(key)}
                >
                  {label} <SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--qc-border-inner)" }}>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[12px]" style={{ color: "var(--qc-text-muted)" }}>
                  No instruments match the current filters.
                </td>
              </tr>
            ) : pageRows.map((h, i) => (
              <tr
                key={i}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-surface-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <td className="py-2.5 px-3 font-medium" style={{ color: "var(--qc-text-heading)" }}>{h.name}</td>
                <td className="py-2.5 px-3 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{h.holding_type}</td>
                <td className="py-2.5 px-3 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{h.credit_rating ?? "—"}</td>
                <td className="py-2.5 px-3 tabular-nums font-medium" style={{ color: "var(--qc-text-heading)" }}>{fmt(h.weight_pct, 2)}%</td>
                <td className="py-2.5 px-3 tabular-nums text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{fmtCr(h.market_value)}</td>
                <td className="py-2.5 px-3 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{h.maturity_date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
            Page {safePage} of {totalPages} · rows {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)}
          </span>
          <div className="flex items-center gap-1">
            {[
              { label: "«", action: () => setPage(1), disabled: safePage === 1 },
              { label: "‹", action: () => setPage(p => p - 1), disabled: safePage === 1 },
            ].map(btn => (
              <button
                key={btn.label}
                disabled={btn.disabled}
                onClick={btn.action}
                className="px-2 py-1 rounded text-[11px] disabled:opacity-30 hover:opacity-70 transition-opacity"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)", color: "var(--qc-text-muted)" }}
              >
                {btn.label}
              </button>
            ))}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="px-2.5 py-1 rounded text-[11px] transition-colors"
                  style={{
                    border: "1px solid var(--qc-border-default)",
                    background: p === safePage ? "var(--qc-text-heading)" : "var(--qc-surface-white)",
                    color: p === safePage ? "var(--qc-accent-primary-fg)" : "var(--qc-text-muted)",
                  }}
                >
                  {p}
                </button>
              );
            })}
            {[
              { label: "›", action: () => setPage(p => p + 1), disabled: safePage === totalPages },
              { label: "»", action: () => setPage(totalPages), disabled: safePage === totalPages },
            ].map(btn => (
              <button
                key={btn.label}
                disabled={btn.disabled}
                onClick={btn.action}
                className="px-2 py-1 rounded text-[11px] disabled:opacity-30 hover:opacity-70 transition-opacity"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)", color: "var(--qc-text-muted)" }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── main page ─────────── */

export default function MutualFundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const amfiCode = params.amfi_code as string;

  const [data, setData] = useState<MutualFundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!amfiCode) return;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/mutual-funds/${amfiCode}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json() as Promise<MutualFundDetailResponse>;
      })
      .then(json => {
        if (json.success) setData(json.data);
        else throw new Error("Unexpected response");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [amfiCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="space-y-3 w-full max-w-4xl px-6">
          <div className="h-24 rounded-[10px] animate-pulse" style={{ background: "var(--qc-surface-panel)" }} />
          <div className="grid grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-[10px] animate-pulse" style={{ background: "var(--qc-surface-panel)", animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <div className="h-40 rounded-[10px] animate-pulse" style={{ background: "var(--qc-surface-panel)", animationDelay: "360ms" }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="flex items-center gap-2" style={{ color: "var(--qc-down)" }}>
          <AlertCircle className="size-4" />
          <p className="text-sm">{error ?? "Fund not found"}</p>
        </div>
      </div>
    );
  }

  const holdings = data.holdings;
  const returns = data.returns;
  const ratios = data.ratios;
  const sectors = data.sectors ?? [];
  const navHistory = data.nav_history;
  const holdingsHistory = data.holdings_history ?? [];
  const dayChangePositive = data.day_change != null ? data.day_change >= 0 : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-surface-base)" }}>

      {/* ── Sticky topbar ── */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{ background: "var(--qc-surface-white)", borderColor: "var(--qc-border-default)" }}
      >
        {/* Hero gradient strip */}
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg, var(--qc-accent-primary) 0%, var(--qc-text-heading) 100%)" }}
        />
        <div className="px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60 flex-shrink-0"
            style={{ color: "var(--qc-text-muted)" }}
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <div className="h-4 w-px flex-shrink-0" style={{ background: "var(--qc-border-default)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold leading-tight truncate" style={{ color: "var(--qc-text-heading)" }}>
              {data.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>
                {[data.amc_name, data.category].filter(Boolean).join(" · ")}
              </span>
              {data.risk_label && <RiskBadge label={data.risk_label} />}
              {data.morningstar != null && data.morningstar > 0 && <StarRating stars={data.morningstar} />}
            </div>
          </div>
          {data.nav != null && (
            <div className="text-right flex-shrink-0">
              <p className="text-[22px] font-semibold tabular-nums leading-tight" style={{ color: "var(--qc-text-heading)" }}>
                ₹{fmt(data.nav)}
              </p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                {data.day_change != null && (
                  <span
                    className="text-[11px] tabular-nums font-semibold flex items-center gap-0.5"
                    style={{ color: dayChangePositive ? "var(--qc-up)" : "var(--qc-down)" }}
                  >
                    {dayChangePositive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {dayChangePositive ? "+" : ""}{fmt(data.day_change)} ({fmtPct(data.day_change_pct)})
                  </span>
                )}
                {data.nav_date && (
                  <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{data.nav_date}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Key metrics grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <HeroTile
            label="Expense Ratio"
            value={data.expense_ratio != null ? `${fmt(data.expense_ratio)}%` : "—"}
            sub={data.plan_type?.replace(/_/g, " ")}
            accent={data.expense_ratio != null && data.expense_ratio < 0.5}
          />
          <HeroTile
            label="AUM"
            value={fmtCr(data.aum ?? holdings?.total_aum)}
            sub={holdings?.month}
          />
          <HeroTile label="Category" value={data.category ?? "—"} />
          <HeroTile label="Benchmark" value={data.benchmark ?? "—"} />
          <HeroTile
            label="Launch Date"
            value={data.launch_date ?? "—"}
          />
          <HeroTile label="Exit Load" value={data.exit_load ?? "—"} />
        </div>

        {/* ── Min investment ── */}
        {(data.min_sip != null || data.min_lumpsum != null || data.min_additional != null) && (
          <div className="grid grid-cols-3 gap-3">
            {data.min_sip != null && (
              <HeroTile label="Min SIP" value={`₹${fmt(data.min_sip, 0)}`} />
            )}
            {data.min_lumpsum != null && (
              <HeroTile label="Min Lumpsum" value={`₹${fmt(data.min_lumpsum, 0)}`} />
            )}
            {data.min_additional != null && (
              <HeroTile label="Min Additional" value={`₹${fmt(data.min_additional, 0)}`} />
            )}
          </div>
        )}

        {/* ── Performance returns ── */}
        {returns && (
          <Card noPadding>
            <CardHeader
              icon={TrendingUp}
              title="Performance"
              right={
                returns.as_of_date && (
                  <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>
                    As of {returns.as_of_date}
                  </span>
                )
              }
            />
            <div className="p-4">
              <ReturnsStrip returns={returns} rankTotal={returns.rank_total} />
            </div>
          </Card>
        )}

        {/* ── NAV chart ── */}
        {navHistory && navHistory.data.length > 0 && (
          <Card noPadding>
            <CardHeader icon={Activity} title="NAV History" />
            <div className="p-5">
              <NavChart navHistory={navHistory} />
            </div>
          </Card>
        )}

        {/* ── Ratios ── */}
        {ratios && <RatiosPanel ratios={ratios} />}

        {/* ── Allocation + Sector (2-col) ── */}
        {holdings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card noPadding>
              <CardHeader
                icon={PieChart}
                title="Asset Allocation"
                right={
                  holdings.month && (
                    <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{holdings.month}</span>
                  )
                }
              />
              <div className="p-5">
                <AllocationBar equity={holdings.equity_pct} debt={holdings.debt_pct} other={holdings.other_pct} />
              </div>
            </Card>
            {(sectors.length > 0 || holdings.equity_holdings.length > 0) && (
              <Card noPadding>
                <CardHeader icon={BarChart3} title="Sector Breakdown" />
                <div className="p-5">
                  {sectors.length > 0
                    ? <SectorBreakdown sectors={sectors} />
                    : <SectorBreakdownFromHoldings holdings={holdings.equity_holdings} />
                  }
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── AUM trend ── */}
        {holdingsHistory.length > 1 && (
          <Card noPadding>
            <CardHeader icon={Calendar} title="AUM Trend" />
            <div className="p-5">
              <AumTrend history={holdingsHistory} />
            </div>
          </Card>
        )}

        {/* ── Plan variants ── */}
        {data.related_variants?.length > 0 && (
          <RelatedVariants variants={data.related_variants} currentCode={amfiCode} />
        )}

        {/* ── Equity holdings ── */}
        {holdings && holdings.equity_holdings.length > 0 && (
          <Card noPadding>
            <CardHeader
              icon={TrendingUp}
              title="Equity Holdings"
              badge={
                <span
                  className="ml-1 text-[10px] font-semibold rounded-sm px-1.5 py-0.5 tabular-nums"
                  style={{ background: "var(--qc-accent-lime-bg)", color: "var(--qc-text-heading)" }}
                >
                  {holdings.equity_holdings.length}
                </span>
              }
            />
            <EquityHoldingsTable holdings={holdings.equity_holdings} />
          </Card>
        )}

        {/* ── Debt holdings ── */}
        {holdings && holdings.debt_holdings.length > 0 && (
          <Card noPadding>
            <CardHeader
              icon={DollarSign}
              title="Debt Holdings"
              badge={
                <span
                  className="ml-1 text-[10px] font-semibold rounded-sm px-1.5 py-0.5 tabular-nums"
                  style={{ background: "var(--qc-accent-lime-bg)", color: "var(--qc-text-heading)" }}
                >
                  {holdings.debt_holdings.length}
                </span>
              }
            />
            <DebtHoldingsTable holdings={holdings.debt_holdings} />
          </Card>
        )}

        {/* ── Identity footer ── */}
        <div
          className="rounded-[10px] border p-5 grid grid-cols-2 sm:grid-cols-4 gap-5"
          style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
        >
          {[
            { label: "AMFI Code", value: data.amfi_code },
            { label: "ISIN",      value: data.isin ?? "—" },
            { label: "AMC",       value: data.amc_name ?? "—" },
            {
              label: "Plan / Option",
              value: [data.plan_type, data.option_type]
                .filter(Boolean)
                .map(s => s.replace(/_/g, " "))
                .join(" · ") || "—",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <SectionLabel>{label}</SectionLabel>
              <p className="text-[13px] font-semibold mt-1" style={{ color: "var(--qc-text-heading)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
