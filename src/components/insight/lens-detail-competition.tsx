"use client";

import { useState, useEffect } from "react";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import { BACKEND_URL } from "@/lib/constants";

interface Props {
  lens: LensDetail;
  ticker?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
    }}>
      {children}
    </p>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: active ? 700 : 500,
      padding: "4px 12px", borderRadius: 20,
      border: `1px solid ${active ? "var(--qc-warn)" : "var(--qc-hair)"}`,
      color: active ? "var(--qc-warn)" : "var(--qc-ink-2)",
      background: active ? "var(--qc-warn-soft)" : "var(--qc-card)",
      whiteSpace: "nowrap", cursor: "default",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </span>
  );
}

function statusColor(s: string | null | undefined) {
  const u = (s ?? "").toUpperCase();
  if (u === "STRONG") return "var(--qc-up)";
  if (u === "WEAK") return "var(--qc-down)";
  return "var(--qc-warn)";
}


// Parse "KEY=val|KEY2=val2" statement from PEER_ROW signals
function parsePeerStatement(statement: string | null): Record<string, string> {
  if (!statement) return {};
  const result: Record<string, string> = {};
  statement.split("|").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) result[k.trim()] = v.trim();
  });
  return result;
}

function sigByMetric(signals: TopSignal[], metric: string): TopSignal | undefined {
  return signals.find((s) => s.metric === metric);
}

function sigsStartingWith(signals: TopSignal[], prefix: string): TopSignal[] {
  return signals.filter((s) => s.metric.startsWith(prefix));
}

// ── sub-components ────────────────────────────────────────────────────────────

interface PillarTileProps {
  label: string;
  rating: string;
  sub: string;
  color: string;
  score: number;
  max: number;
}

function PillarTile({ label, rating, sub, color, score, max }: PillarTileProps) {
  return (
    <div style={{ padding: "16px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0, lineHeight: 1.1 }}>{rating}</p>
      <p title={sub} style={{
        fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        cursor: sub ? "help" : "default",
      }}>{sub}</p>
      <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
        {Array.from({ length: max }).map((_, j) => (
          <div key={j} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: j < score ? color : "var(--qc-hair)",
          }} />
        ))}
      </div>
    </div>
  );
}

interface SignalCardProps {
  icon: "check" | "up" | "down" | "warn";
  headline: string;
  sub: string;
  badge: string;
  badgeColor: string;
}

function SignalCard({ icon, headline, sub, badge, badgeColor }: SignalCardProps) {
  const isPos = icon === "check" || icon === "up";
  const borderColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";
  const arrow = icon === "check" ? "✓" : icon === "up" ? "↑" : icon === "warn" ? "!" : "↓";
  const arrowColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 8,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: arrowColor, fontWeight: 700, fontSize: 14 }}>{arrow}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>{headline}</p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>{sub}</p>
      </div>
      {badge && (
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: badgeColor, whiteSpace: "nowrap" }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Peer KPI table ────────────────────────────────────────────────────────────

interface PeerRow {
  label: string;
  revenue: string;
  revGrowth: string;
  opm: string;
  roce: string;
  de: string;
  mktShare: string;
  isCurrent: boolean;
  isAvg: boolean;
}

function buildPeerTableRows(peerSignals: TopSignal[]): PeerRow[] {
  return peerSignals.map((s) => {
    const kv = parsePeerStatement(s.statement);
    const revRaw = s.actual_value;
    const roceRaw = s.guided_value;
    const deRaw = s.delta_pct;
    const revGrowth = kv["REV_GROWTH"] ?? "—";
    const mktShare = kv["MKT_SHARE"] ?? "—";
    const opm = kv["OPM"] ?? "—";

    // Revenue formatting: values are in actual Cr units (some come as full rupees)
    let revFormatted = "—";
    if (revRaw != null) {
      const crVal = revRaw > 1e9 ? Math.round(revRaw / 1e7) : Math.round(revRaw);
      revFormatted = `₹${crVal.toLocaleString("en-IN")} Cr`;
    }

    const roceFormatted = roceRaw != null ? `${roceRaw.toFixed(2)}%` : "—";
    const deFormatted = deRaw != null ? deRaw.toFixed(2) : "—";

    const isCurrentTicker = s.metric.endsWith("_CURRENT") ||
      (s.label.includes("(Current)") || s.label.toLowerCase().includes("(current)"));
    const isAvg = s.metric === "PEER_ROW_INDUSTRY_AVG" || s.label.toLowerCase().includes("industry");

    return {
      label: s.label,
      revenue: revFormatted,
      revGrowth: revGrowth !== "—" ? `+${revGrowth}` : "—",
      opm: opm !== "—" ? `${opm}%` : "—",
      roce: roceFormatted,
      de: deFormatted,
      mktShare: mktShare !== "—" ? `${mktShare}` : "—",
      isCurrent: isCurrentTicker,
      isAvg,
    };
  });
}

function PeerKpiTable({ peerSignals }: { peerSignals: TopSignal[] }) {
  const rows = buildPeerTableRows(peerSignals);
  if (rows.length === 0) return null;

  const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 500, textTransform: "uppercase",
    letterSpacing: "0.10em", color: "var(--qc-ink-3)",
    padding: "8px 12px", textAlign: "left" as const,
    borderBottom: "1px solid var(--qc-hair)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "var(--qc-section)" }}>
            <th style={thStyle}>COMPANY</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>REVENUE</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>REV GROWTH</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>OPM%</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>ROCE%</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>D/E</th>
            <th style={{ ...thStyle, textAlign: "right" as const }}>MKT SHARE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowStyle: React.CSSProperties = {
              fontWeight: row.isCurrent ? 700 : row.isAvg ? 400 : 400,
              fontStyle: row.isAvg ? "italic" : undefined,
              color: row.isCurrent ? "var(--qc-ink)" : "var(--qc-ink-2)",
              borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
            };
            const tdStyle: React.CSSProperties = { padding: "10px 12px" };
            const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: "right" as const };
            return (
              <tr key={i} style={rowStyle}>
                <td style={tdStyle}>{row.label}</td>
                <td style={tdRightStyle}>{row.revenue}</td>
                <td style={tdRightStyle}>{row.revGrowth}</td>
                <td style={tdRightStyle}>{row.opm}</td>
                <td style={tdRightStyle}>{row.roce}</td>
                <td style={tdRightStyle}>{row.de}</td>
                <td style={tdRightStyle}>{row.mktShare}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Peer company card ─────────────────────────────────────────────────────────

function ratingColor(r: string) {
  const l = r.toLowerCase();
  if (l === "strong" || l === "excellent" || l.includes("high")) return "var(--qc-up)";
  if (l === "weak" || l === "poor" || l.includes("decl")) return "var(--qc-down)";
  if (l === "expensive" || l.includes("under") || l.includes("down")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

function RatingChip({ label, value }: { label: string; value: string }) {
  const color = ratingColor(value);
  return (
    <div style={{
      border: `1px solid ${color}44`,
      borderRadius: 8, padding: "6px 10px",
      display: "inline-flex", flexDirection: "column", gap: 1,
      background: `${color}08`,
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

interface PeerCardData {
  ticker: string;
  callId: string;
  competitionLens: LensDetail | null;
  managementScore: number | null;
  opportunityScore: number | null;
  dealScore: number | null;
}

function scoreLabel(score: number | null): string {
  if (score === null) return "N/A";
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Weak";
}

function buildPeerMetrics(km: Record<string, string>, topSignals: TopSignal[]) {
  const sigItems = topSignals
    .filter((s) => s.actual_value != null)
    .slice(0, 4)
    .map((s) => ({ label: s.label.slice(0, 16), value: formatSigValue(s) }));

  if (sigItems.length >= 4) return sigItems;

  const kmItems = Object.entries(km).slice(0, 4 - sigItems.length).map(([k, v]) => ({
    label: k.replace(/_/g, " ").slice(0, 16),
    value: String(v).slice(0, 14),
  }));

  return [...sigItems, ...kmItems];
}

function formatSigValue(s: TopSignal): string {
  if (s.actual_value == null) return "—";
  const v = s.actual_value;
  const unit = s.unit ?? "";
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  return `${v}`;
}

function CompetitionPeerCard({ ticker, data }: { ticker: string; data: PeerCardData }) {
  const competitionLens = data.competitionLens;
  const km = competitionLens?.key_metrics ?? {};
  const topSigs = competitionLens?.top_signals ?? [];
  const statusCol = competitionLens ? statusColor(competitionLens.status) : "var(--qc-ink-3)";
  const metrics = buildPeerMetrics(km, topSigs).slice(0, 4);

  const mgmt = scoreLabel(data.managementScore);
  const opp = scoreLabel(data.opportunityScore);
  const deal = scoreLabel(data.dealScore);

  return (
    <div style={{ padding: "18px 20px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>NSE: {ticker}</p>
        </div>
        {competitionLens && (
          <span style={{ fontSize: 10, fontWeight: 700, color: statusCol, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {competitionLens.status}
          </span>
        )}
      </div>

      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
          M.O.D. FRAMEWORK
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <RatingChip label="MANAGEMENT" value={mgmt} />
          <RatingChip label="OPPORTUNITY" value={opp} />
          <RatingChip label="DEAL" value={deal} />
        </div>
      </div>

      {metrics.length > 0 && (
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            KEY METRICS
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {metrics.map((f) => (
              <RatingChip key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Primary card (current company) ────────────────────────────────────────────

function PrimaryPeerCard({ ticker, lens }: { ticker: string; lens: LensDetail }) {
  const km = lens.key_metrics;
  const topSigs = lens.top_signals ?? [];
  const statusCol = statusColor(lens.status);
  const metrics = buildPeerMetrics(km, topSigs).slice(0, 4);

  const modLabel = lens.score >= 70 ? "Strong" : lens.score >= 40 ? "Moderate" : "Weak";

  return (
    <div style={{ padding: "18px 20px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>NSE: {ticker}</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: statusCol, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {lens.status}
        </span>
      </div>

      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
          M.O.D. FRAMEWORK
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <RatingChip label="OPPORTUNITY" value={modLabel} />
        </div>
      </div>

      {metrics.length > 0 && (
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            KEY METRICS
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {metrics.map((f) => (
              <RatingChip key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Peer slot ─────────────────────────────────────────────────────────────────

interface LensesApiResponse {
  ticker: string;
  callId: string;
  categories: Record<string, LensDetail[]>;
}

function PeerSlot({ ticker, onDeselect }: { ticker: string; onDeselect: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PeerCardData | null>(null);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`${BACKEND_URL}/api/lenses?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: LensesApiResponse) => {
        const cats = res.categories ?? {};
        const competitionLens = cats.opportunity?.find((l) => l.slug === "competition" && l.computed) ?? null;
        const avg = (arr: LensDetail[]) => {
          const scores = arr.map((l) => l.score).filter((s): s is number => s !== null);
          return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        };
        setData({
          ticker,
          callId: res.callId,
          competitionLens,
          managementScore: avg(cats.management ?? []),
          opportunityScore: avg(cats.opportunity ?? []),
          dealScore: avg(cats.deal ?? []),
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  const cellStyle: React.CSSProperties = {
    background: "var(--qc-section)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const closeBtn = (
    <button
      onClick={onDeselect}
      style={{
        position: "absolute", top: 8, right: 8,
        background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
        borderRadius: 6, width: 22, height: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--qc-ink-3)", fontSize: 12, lineHeight: 1,
        zIndex: 1,
      }}
      aria-label={`Remove ${ticker}`}
    >
      ×
    </button>
  );

  if (loading) {
    return (
      <div style={{ ...cellStyle, alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", minHeight: 160 }}>
        {closeBtn}
        <div style={{
          width: 16, height: 16, border: "2px solid var(--qc-hair)",
          borderTopColor: "var(--qc-ink-3)", borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
          {ticker}
        </p>
      </div>
    );
  }

  const hasData = data && (data.competitionLens !== null || data.managementScore !== null);

  if (!hasData) {
    return (
      <div style={{ ...cellStyle, alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", minHeight: 160 }}>
        {closeBtn}
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
          Analysis not yet computed
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...cellStyle, flex: 1 }}>
      {closeBtn}
      <CompetitionPeerCard ticker={ticker} data={data} />
    </div>
  );
}

function PeerCell({ index: _index }: { index: number }) {
  return (
    <div style={{
      padding: "40px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, background: "var(--qc-section)", minHeight: 160,
    }}>
      <span style={{ fontSize: 22, color: "var(--qc-hair)", lineHeight: 1 }}>⊕</span>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
        SELECT PEER {_index}
      </p>
    </div>
  );
}

// ── Build pillar tiles from named metric signals ───────────────────────────────

function directionColor(dir: string | null | undefined): string {
  if (dir === "beat") return "var(--qc-up)";
  if (dir === "miss" || dir === "major_miss") return "var(--qc-down)";
  return "var(--qc-warn)"; // in_line or anything else
}

function pillarRating(sig: TopSignal | undefined, metric: string): { rating: string; sub: string; color: string; score: number; max: number } {
  if (!sig) return { rating: "—", sub: "", color: "var(--qc-ink-3)", score: 0, max: 3 };

  if (metric === "PORTERS_SCORE") {
    const actual = sig.actual_value ?? 0;
    // guided_value is the denominator for dot display; score is out of 10 for color logic
    const max = sig.guided_value ?? 10;
    const color = actual >= 7 ? "var(--qc-up)" : actual >= 5 ? "var(--qc-warn)" : "var(--qc-down)";
    return {
      rating: `${actual}/10`,
      sub: sig.statement ?? "",
      color,
      score: actual,
      max,
    };
  }

  // MARKET_POSITION, PRICING_POWER, ENTRY_BARRIERS
  // Label is derived from direction field only — never from actual_value ratio
  const dir = sig.direction;
  const color = directionColor(dir);
  const actual = sig.actual_value ?? 0;
  const max = sig.guided_value ?? 3; // treat missing guided_value as 3

  let rating = "";
  if (metric === "MARKET_POSITION") {
    rating = dir === "beat" ? "Strong" : dir === "in_line" ? "Moderate" : "Weak";
  } else if (metric === "PRICING_POWER") {
    rating = dir === "beat" ? "Strong" : dir === "in_line" ? "Moderate" : "Low";
  } else if (metric === "ENTRY_BARRIERS") {
    rating = dir === "beat" ? "High" : dir === "in_line" ? "Medium" : "Low";
  } else {
    rating = dir === "beat" ? "Strong" : dir === "in_line" ? "Moderate" : "Weak";
  }

  return {
    rating,
    sub: sig.statement ?? "",
    color,
    score: actual,
    max,
  };
}

// ── derive signal cards from COMP_STRENGTH_* and COMP_RISK_* ─────────────────

function buildSignalCardsFromNamed(topSignals: TopSignal[]): SignalCardProps[] {
  const cards: SignalCardProps[] = [];

  const strengths = sigsStartingWith(topSignals, "COMP_STRENGTH_");
  const risks = sigsStartingWith(topSignals, "COMP_RISK_");

  strengths.slice(0, 2).forEach((s) => {
    const badge = s.delta_pct != null ? `+${s.delta_pct} bps` :
      s.actual_value != null ? `${s.actual_value}${s.unit ?? ""}` : "Moat";
    cards.push({
      icon: "up",
      headline: s.label,
      sub: s.statement?.slice(0, 100) ?? "",
      badge,
      badgeColor: "var(--qc-up)",
    });
  });

  risks.slice(0, 2).forEach((s) => {
    const isWarn = s.direction === "tracking";
    const badge = s.delta_pct != null ? `${s.delta_pct > 0 ? "+" : ""}${s.delta_pct} bps` :
      s.actual_value != null ? `${s.actual_value}${s.unit ?? ""}` : "Risk";
    cards.push({
      icon: isWarn ? "warn" : "down",
      headline: s.label,
      sub: s.statement?.slice(0, 100) ?? "",
      badge,
      badgeColor: isWarn ? "var(--qc-warn)" : "var(--qc-down)",
    });
  });

  // Fill remaining slots from high-impact signals if needed
  if (cards.length < 4) {
    const pool = topSignals.filter((s) =>
      !s.metric.startsWith("COMP_STRENGTH_") &&
      !s.metric.startsWith("COMP_RISK_") &&
      !s.metric.startsWith("PEER_ROW_") &&
      !["MARKET_POSITION", "PRICING_POWER", "ENTRY_BARRIERS", "PORTERS_SCORE", "ROCE_VS_INDUSTRY"].includes(s.metric)
    );
    for (const s of pool) {
      if (cards.length >= 4) break;
      const isNeg = s.direction === "miss" || s.direction === "major_miss";
      cards.push({
        icon: isNeg ? "down" : "up",
        headline: s.label,
        sub: s.statement?.slice(0, 100) ?? "",
        badge: s.actual_value != null ? `${s.actual_value}${s.unit ?? ""}` : "",
        badgeColor: isNeg ? "var(--qc-down)" : "var(--qc-up)",
      });
    }
  }

  return cards.slice(0, 4);
}

// ── derive subtitle from ROCE_VS_INDUSTRY or strongest signal ────────────────

function buildSubtitle(lens: LensDetail, topSignals: TopSignal[]): string {
  const roce = sigByMetric(topSignals, "ROCE_VS_INDUSTRY");
  if (roce?.statement) return roce.statement;
  const str1 = sigByMetric(topSignals, "COMP_STRENGTH_1");
  if (str1?.statement) return str1.statement;
  return lens.takeaway ?? lens.description.slice(0, 140);
}

// ── Derive peer suggestions from PEER_ROW signals, falling back to a list ────

const FALLBACK_PEERS = ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "SBIN", "INFY", "TCS", "WIPRO", "TATAMOTORS", "MSWIL"];

function derivePeerSuggestions(peerSignals: TopSignal[], primaryTicker: string): string[] {
  const fromSignals = peerSignals
    .map((s) => {
      // Extract ticker from metric name: PEER_ROW_MSUMI → MSUMI
      const raw = s.metric.replace("PEER_ROW_", "");
      if (raw === "INDUSTRY_AVG" || raw === "INDUSTRY" || raw === primaryTicker) return null;
      // Verify label doesn't say "(Current)" or "Industry"
      if (s.label.includes("(Current)") || s.label.toLowerCase().includes("industry")) return null;
      return raw;
    })
    .filter((t): t is string => t !== null);

  if (fromSignals.length > 0) return fromSignals.slice(0, 8);
  return FALLBACK_PEERS.filter((t) => t !== primaryTicker).slice(0, 8);
}

// ── main export ───────────────────────────────────────────────────────────────

export function LensDetailCompetition({ lens, ticker }: Props) {
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [swotExpanded, setSwotExpanded] = useState(false);

  const topSignals = lens.top_signals ?? [];
  const statusCol = statusColor(lens.status);
  const primaryTicker = ticker ?? "COMPANY";

  // Named-metric signals
  const mktPosSig = sigByMetric(topSignals, "MARKET_POSITION");
  const pricingPowerSig = sigByMetric(topSignals, "PRICING_POWER");
  const entryBarriersSig = sigByMetric(topSignals, "ENTRY_BARRIERS");
  const portersSig = sigByMetric(topSignals, "PORTERS_SCORE");
  const roceVsIndustrySig = sigByMetric(topSignals, "ROCE_VS_INDUSTRY");
  const peerSignals = sigsStartingWith(topSignals, "PEER_ROW_");

  const pillars: PillarTileProps[] = (
    [
      ["MARKET POSITION", mktPosSig, "MARKET_POSITION"],
      ["PRICING POWER", pricingPowerSig, "PRICING_POWER"],
      ["ENTRY BARRIERS", entryBarriersSig, "ENTRY_BARRIERS"],
      ["PORTER'S SCORE", portersSig, "PORTERS_SCORE"],
    ] as [string, TopSignal | undefined, string][]
  ).map(([label, sig, metric]) => ({ label, ...pillarRating(sig, metric) }));

  const signalCards = buildSignalCardsFromNamed(topSignals);
  const subtitle = buildSubtitle(lens, topSignals);

  // ROCE vs industry context for the quote block
  const quoteSignal = roceVsIndustrySig ?? topSignals.find((s) => s.statement && s.statement.length > 60) ?? null;

  // Summary metrics for footer card
  const summaryMetrics = [
    roceVsIndustrySig,
    mktPosSig,
    sigByMetric(topSignals, "COMP_STRENGTH_1"),
  ]
    .filter((s): s is TopSignal => s != null && s.actual_value != null)
    .slice(0, 3)
    .map((s) => ({
      label: s.label.slice(0, 20),
      value: formatSigValue(s),
      sub: s.statement?.slice(0, 40) ?? "",
    }));

  // Quarter badge from callId (passed via lens or ticker context — use lens.computed_at as fallback)
  const periodLabel = lens.computed_at
    ? new Date(lens.computed_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
    : "";

  const peerSuggestions = derivePeerSuggestions(peerSignals, primaryTicker);

  function togglePeer(t: string) {
    setSelectedPeers((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev;
      return [...prev, t];
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── COMPETITIVE POSITION ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SectionLabel>COMPETITIVE POSITION</SectionLabel>
            {periodLabel && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
                borderRadius: 20, padding: "2px 10px",
                color: "var(--qc-ink-2)",
              }}>
                {periodLabel}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: `1px solid ${statusCol}`,
            borderRadius: 20, padding: "3px 12px",
            color: statusCol, background: "var(--qc-card)",
          }}>
            • {lens.status}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {subtitle.slice(0, 160)}
          </p>
        </div>

        {/* 4-pillar grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 1, background: "var(--qc-hair)" }}>
          {pillars.map((p, i) => <PillarTile key={i} {...p} />)}
        </div>

        {/* ROCE quote block */}
        {quoteSignal?.statement && (
          <div style={{ padding: "16px 20px", background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{
                fontSize: 13, fontStyle: "italic",
                color: "var(--qc-ink)", margin: 0, lineHeight: 1.7,
                fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {quoteSignal.statement.slice(0, 280)}{quoteSignal.statement.length > 280 ? "…" : ""}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "6px 0 0" }}>
                Quantcase peer analysis · {periodLabel}
              </p>
            </div>
          </div>
        )}

        {/* Strength / Risk signal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{
          gap: 10, padding: "14px 16px",
          background: "var(--qc-card)",
          borderTop: "1px solid var(--qc-hair)",
        }}>
          {signalCards.map((card, i) => <SignalCard key={i} {...card} />)}
        </div>

        {/* Collapsible: Detailed Peer KPI & SWOT */}
        <div
          onClick={() => setSwotExpanded((v) => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", cursor: "pointer",
            background: "var(--qc-section)", borderTop: "1px solid var(--qc-hair)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--qc-ink-2)", fontWeight: 500 }}>Detailed Peer KPI & SWOT</span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{swotExpanded ? "▲" : "▼"}</span>
        </div>
        {swotExpanded && (
          <div style={{ background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
            {peerSignals.length > 0 ? (
              <PeerKpiTable peerSignals={peerSignals} />
            ) : (
              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No peer data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway ?? lens.description}
        metrics={summaryMetrics}
      />

      {/* ── SIGNAL QUADRANT / PEER COMPARISON ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionLabel>SIGNAL QUADRANT</SectionLabel>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
                background: "var(--qc-section)", borderRadius: 20,
                padding: "2px 10px", border: "1px solid var(--qc-hair)",
              }}>
                vs Peer Set
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
              Select up to 3 peers to compare signals side-by-side
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: "1px solid var(--qc-warn)",
            borderRadius: 20, padding: "3px 12px",
            color: "var(--qc-warn)", background: "var(--qc-warn-soft)",
          }}>
            • Peer Comparison
          </span>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginRight: 4 }}>
              PEER SET
            </span>
            <Chip active>{primaryTicker} ✓</Chip>
            {peerSuggestions.map((t) => {
              const isActive = selectedPeers.includes(t);
              const isDisabled = !isActive && selectedPeers.length >= 3;
              return (
                <span key={t} onClick={() => !isDisabled && togglePeer(t)}
                  style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.45 : 1 }}>
                  <Chip active={isActive}>{t}{isActive ? " ✓" : ""}</Chip>
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{
          gridTemplateRows: "1fr 1fr", gap: 1, background: "var(--qc-hair)",
        }}>
          <div style={{ background: "var(--qc-card)", display: "flex", flexDirection: "column" }}>
            <PrimaryPeerCard ticker={primaryTicker} lens={lens} />
          </div>
          {selectedPeers[0] ? (
            <PeerSlot ticker={selectedPeers[0]} onDeselect={() => togglePeer(selectedPeers[0])} />
          ) : <PeerCell index={1} />}
          {selectedPeers[1] ? (
            <PeerSlot ticker={selectedPeers[1]} onDeselect={() => togglePeer(selectedPeers[1])} />
          ) : <PeerCell index={2} />}
          {selectedPeers[2] ? (
            <PeerSlot ticker={selectedPeers[2]} onDeselect={() => togglePeer(selectedPeers[2])} />
          ) : <PeerCell index={3} />}
        </div>
      </div>
    </div>
  );
}
