"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import { BACKEND_URL } from "@/lib/constants";

// ─── API types ────────────────────────────────────────────────────────────────

interface PeScenario {
  scenario: "bear" | "base" | "bull";
  pe_low: number | null;
  pe_high: number | null;
  pe_range_label: string;
  return_low: number | null;
  return_high: number | null;
  return_label: string | null;
  what_happens: string;
}

interface Catalyst {
  label: string;
  statement: string;
}

interface PeReratingData {
  ticker: string;
  call_id: string;
  available: boolean;
  is_stale: boolean;
  computed_at: string | null;
  score: number;
  status: string | null;
  z_score: number | null;
  takeaway: string | null;
  highlights: string[];
  risks: string[];
  current_pe: number | null;
  current_eps: number | null;
  current_price: number | null;
  pe_as_of: string | null;
  pe_3y: {
    min: number; max: number; avg: number;
    p25: number; p50: number; p75: number;
  } | null;
  fair_value_zone: {
    cheap_below: number;
    fair_low: number;
    fair_high: number;
    expensive_above: number;
    midpoint: number;
  } | null;
  scenarios: PeScenario[];
  summary_bar: {
    base_pe_range_label: string | null;
    base_pe_low: number | null;
    base_pe_high: number | null;
    base_return_label: string | null;
    holding_years: number | null;
    current_pe: number | null;
  } | null;
  narrative: {
    score: number;
    label: string;
    description: string | null;
  } | null;
  positive_catalysts: Catalyst[];
  negative_catalysts: Catalyst[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function usePeRerating(ticker: string | undefined) {
  const [data, setData] = useState<PeReratingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker?.trim()) return;
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/deal/pe-rerating-potential?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: { success: boolean; data: PeReratingData }) => {
        setData(res.data ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ticker]);

  return { data, loading, error };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPe(lo: number | null, hi: number | null): string {
  if (lo == null && hi == null) return "—";
  if (lo != null && hi != null) return `${lo}–${hi}x`;
  if (lo != null) return `${lo}x`;
  return `${hi}x`;
}

function fmtReturn(lo: number | null, hi: number | null): string {
  if (lo == null && hi == null) return "—";
  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n}%`;
  if (lo != null && hi != null) return `${fmt(lo)} to ${fmt(hi)}`;
  if (lo != null) return fmt(lo);
  return fmt(hi!);
}

// ─── Scenario config ──────────────────────────────────────────────────────────

const SCENARIO_CONFIG = {
  bear: {
    label: "Bear Case",
    icon: "🐻",
    color: "var(--qc-down)",
    borderColor: "rgba(220,38,38,0.30)",
    bg: "rgba(220,38,38,0.04)",
    pillBg: "rgba(220,38,38,0.12)",
    pillColor: "var(--qc-down)",
  },
  base: {
    label: "Base Case",
    icon: "⊙",
    color: "var(--qc-blue)",
    borderColor: "rgba(59,130,246,0.30)",
    bg: "rgba(59,130,246,0.04)",
    pillBg: "rgba(59,130,246,0.12)",
    pillColor: "var(--qc-blue)",
  },
  bull: {
    label: "Bull Case",
    icon: "🐂",
    color: "var(--qc-up)",
    borderColor: "rgba(31,122,74,0.30)",
    bg: "rgba(31,122,74,0.04)",
    pillBg: "rgba(31,122,74,0.12)",
    pillColor: "var(--qc-up)",
  },
} as const;

// ─── MarketPerceptionPanel ────────────────────────────────────────────────────

function MarketPerceptionPanel({ data }: { data: PeReratingData }) {
  const fvz = data.fair_value_zone;
  const pe3y = data.pe_3y;
  const currentPe = data.current_pe;

  // Position the marker along the P/E range
  let markerPct = 50;
  if (fvz && currentPe != null) {
    const rangeMin = fvz.cheap_below * 0.7;
    const rangeMax = fvz.expensive_above * 1.3;
    markerPct = Math.min(95, Math.max(5, ((currentPe - rangeMin) / (rangeMax - rangeMin)) * 100));
  }

  // Zone label
  let peZone = "Fair";
  if (fvz && currentPe != null) {
    if (currentPe < fvz.cheap_below) peZone = "Cheap";
    else if (currentPe > fvz.expensive_above) peZone = "Expensive";
    else peZone = "Fair Value";
  }

  const headlineSentence = data.takeaway?.split(".")?.[0]?.trim() ?? "";
  const headline = headlineSentence.length > 0 && headlineSentence.length <= 80
    ? headlineSentence
    : (data.highlights?.[0] ?? "Current market perception");

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>👤</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Current Market Perception
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 8px", lineHeight: 1.35 }}>
          {headline}
        </h3>
        {currentPe != null && (
          <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
            Current P/E: <strong style={{ color: "var(--qc-ink)" }}>{currentPe}x</strong>
            {data.current_price != null && <> · ₹{data.current_price}</>}
          </p>
        )}
      </div>

      {/* 3Y P/E range mini stats */}
      {pe3y && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, paddingTop: 10, borderTop: "1px solid var(--qc-hair)",
        }}>
          {[
            { label: "3Y Min", value: `${pe3y.min}x` },
            { label: "3Y Avg", value: `${pe3y.avg}x` },
            { label: "3Y Max", value: `${pe3y.max}x` },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fair value zone slider */}
      {fvz && (
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 10px" }}>
            Fair Value Zone (P/E)
          </p>
          <div style={{ position: "relative", height: 8, borderRadius: 99, background: "linear-gradient(to right, var(--qc-up), var(--qc-warn), var(--qc-down))", marginBottom: 8 }}>
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${markerPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
                width: 16, height: 16, borderRadius: "50%",
                background: "var(--qc-ink)", border: "2px solid var(--qc-card)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "var(--qc-up)" }}>Cheap &lt;{fvz.cheap_below}x</span>
            <span style={{ fontSize: 10, color: "var(--qc-warn)" }}>Fair {fvz.fair_low}–{fvz.fair_high}x</span>
            <span style={{ fontSize: 10, color: "var(--qc-down)" }}>Expensive &gt;{fvz.expensive_above}x</span>
          </div>
          {currentPe != null && (
            <span style={{
              fontSize: 12, fontWeight: 600, color: "var(--qc-ink)",
              background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
              borderRadius: 6, padding: "4px 12px", display: "inline-block",
            }}>
              Current: {currentPe}x
            </span>
          )}
          <span style={{
            fontSize: 12, fontWeight: 600, color: "var(--qc-ink)",
            background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
            borderRadius: 6, padding: "4px 12px", display: "inline-block", marginLeft: 8,
          }}>
            Zone: {peZone}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── ScenarioCard ─────────────────────────────────────────────────────────────

function ScenarioCard({ s, delay }: { s: PeScenario; delay: number }) {
  const cfg = SCENARIO_CONFIG[s.scenario];
  const peRange = fmtPe(s.pe_low, s.pe_high);
  const retRange = fmtReturn(s.return_low, s.return_high);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        flex: 1,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 8,
        overflow: "hidden",
        background: cfg.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "10px 12px 8px", borderBottom: `1px solid ${cfg.borderColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>{cfg.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ fontSize: 26, fontWeight: 700, color: cfg.color, margin: "0 0 6px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {peRange}
        </p>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
          background: cfg.pillBg, color: cfg.pillColor,
          display: "inline-block", marginBottom: 4,
        }}>
          {retRange}
        </span>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>vs current {data_currentPe(s)}</p>
      </div>

      <div style={{ padding: "10px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.color, margin: "0 0 6px" }}>
          What happens?
        </p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          {s.what_happens}
        </p>
      </div>
    </motion.div>
  );
}

function data_currentPe(_s: PeScenario): string {
  return "P/E";
}

function ScenarioEnginePanel({ data }: { data: PeReratingData }) {
  const bear = data.scenarios.find((s) => s.scenario === "bear");
  const base = data.scenarios.find((s) => s.scenario === "base");
  const bull = data.scenarios.find((s) => s.scenario === "bull");
  const ordered = [bear, base, bull].filter((s): s is PeScenario => s != null);

  const footerNote = data.risks?.[0] ?? "Re-rating potential depends on earnings momentum and market confidence.";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>⚙</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Re-Rating Scenario Engine (Exit P/E)
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flex: 1 }}>
        {ordered.map((s, i) => (
          <ScenarioCard key={s.scenario} s={s} delay={i * 0.08} />
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: "var(--qc-section)",
        borderRadius: 6,
        border: "1px solid var(--qc-hair)",
      }}>
        <span style={{ fontSize: 13 }}>✏️</span>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
          {footerNote.length > 140 ? footerNote.slice(0, 137) + "..." : footerNote}
        </p>
      </div>
    </div>
  );
}

// ─── CatalystsPanel ───────────────────────────────────────────────────────────

function CatalystItem({ label, statement, positive }: { label: string; statement: string; positive: boolean }) {
  const [showPopup, setShowPopup] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const color = positive ? "var(--qc-up)" : "var(--qc-down)";
  const bg = positive ? "rgba(31,122,74,0.07)" : "rgba(220,38,38,0.06)";
  const border = positive ? "rgba(31,122,74,0.18)" : "rgba(220,38,38,0.15)";
  const popupBg = positive ? "rgba(31,122,74,0.06)" : "rgba(220,38,38,0.05)";
  const icon = positive ? "📈" : "⚠️";

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setShowPopup(true);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex", gap: 10, alignItems: "center",
        padding: "8px 12px",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 7,
        cursor: "default",
        position: "relative",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: positive ? "rgba(31,122,74,0.12)" : "rgba(220,38,38,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color, margin: 0 }}>{label}</p>

      {showPopup && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          ...(alignRight ? { right: 0 } : { left: 0 }),
          zIndex: 50,
          width: 240,
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: "var(--qc-card)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${border}`,
            background: popupBg,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--qc-ink)" }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-3)", lineHeight: 1.6 }}>{statement}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCatalystsPanel({ data }: { data: PeReratingData }) {
  const positives = data.positive_catalysts.slice(0, 3);
  const negatives = data.negative_catalysts.slice(0, 3);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>⚡</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          What Changes Market Perception?
        </span>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-up)", margin: "0 0 8px" }}>
          Positive Catalysts
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {positives.map((c) => (
            <CatalystItem key={c.label} label={c.label} statement={c.statement} positive={true} />
          ))}
          {positives.length === 0 && (
            <CatalystItem label="Strong fundamentals" statement={data.takeaway ?? "Solid operational metrics."} positive={true} />
          )}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-down)", margin: "0 0 8px" }}>
          Negative Catalysts
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {negatives.map((c) => (
            <CatalystItem key={c.label} label={c.label} statement={c.statement} positive={false} />
          ))}
          {negatives.length === 0 && (
            <CatalystItem label="Execution risk" statement="Monitor guidance delivery and macro conditions." positive={false} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NarrativeStrip ───────────────────────────────────────────────────────────

function NarrativeStrip({ data }: { data: PeReratingData }) {
  const score = data.narrative?.score ?? data.score;
  const narrativeLabel = data.narrative?.label ?? (
    score >= 70 ? "Earnings re-rating candidate"
    : score >= 50 ? "Transition phase, execution watch"
    : "De-rating risk, narrative weak"
  );
  const markerPct = Math.min(95, Math.max(5, (score / 100) * 100));

  const shiftNote = data.narrative?.description
    ?? data.risks?.[0]
    ?? "Narrative can shift if execution on guidance targets improves and macro conditions ease.";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_220px]" style={{
      alignItems: "center",
      gap: 28,
      padding: "20px 24px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
    }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 6px" }}>
          Current Narrative
        </p>
        <h4 style={{ fontSize: 18, fontWeight: 400, color: "var(--qc-ink)", margin: 0, lineHeight: 1.25 }}>
          {narrativeLabel}
        </h4>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(to right, var(--qc-down), var(--qc-warn) 50%, var(--qc-up))", marginBottom: 10 }}>
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${markerPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
              width: 18, height: 18, borderRadius: "50%",
              background: "var(--qc-ink)", border: "2.5px solid var(--qc-card)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <span style={{ fontSize: 9, color: "var(--qc-down)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.4 }}>
            Weak Narrative · De-Rating Risk
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.4 }}>
            Neutral · Fairly Valued
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-up)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", lineHeight: 1.4 }}>
            Strong Narrative · Re-Rating Potential
          </span>
        </div>
      </div>

      <div style={{ borderLeft: "3px solid var(--qc-blue)", paddingLeft: 16 }}>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          {shiftNote.length > 120 ? shiftNote.slice(0, 117) + "..." : shiftNote}
        </p>
      </div>
    </div>
  );
}

// ─── SummaryFooter ────────────────────────────────────────────────────────────

function SummaryFooter({ data }: { data: PeReratingData }) {
  const sb = data.summary_bar;
  const base = data.scenarios.find((s) => s.scenario === "base");

  const basePeStr = sb ? fmtPe(sb.base_pe_low, sb.base_pe_high) : fmtPe(base?.pe_low ?? null, base?.pe_high ?? null);
  const baseRetStr = fmtReturn(base?.return_low ?? null, base?.return_high ?? null);
  const years = sb?.holding_years ?? 3;

  const title = data.score >= 70
    ? "Strong re-rating potential exists."
    : data.score >= 50
    ? "Moderate re-rating potential exists."
    : "Limited re-rating potential; monitor execution.";

  const metrics = [
    { label: "Base Case Exit P/E", value: basePeStr, sub: "Most Probable" },
    { label: "Implied Upside", value: baseRetStr, sub: "vs current P/E" },
    { label: "Time Horizon", value: `${years} Years`, sub: "Investment View" },
  ];

  return (
    <LensDrawerSummaryCard
      title={title}
      body={data.takeaway ?? data.highlights?.[0] ?? null}
      metrics={metrics}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  lens?: LensDetail;
  ticker?: string;
}

export function LensDetailPeRerating({ ticker }: Props) {
  const { data, loading, error } = usePeRerating(ticker);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, color: "var(--qc-ink-3)", fontSize: 13 }}>
        Loading P/E re-rating analysis…
      </div>
    );
  }

  if (error || !data || !data.available) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, color: "var(--qc-ink-3)", fontSize: 13 }}>
        {error ?? "P/E re-rating analysis not yet available for this ticker."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Valuation Intelligence
        </span>
        <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontStyle: "italic" }}>
          Will the market pay a higher multiple in the future?
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]" style={{ gap: 14, alignItems: "stretch" }}>
        <MarketPerceptionPanel data={data} />
        <ScenarioEnginePanel data={data} />
        <MarketCatalystsPanel data={data} />
      </div>

      <NarrativeStrip data={data} />

      <SummaryFooter data={data} />
    </div>
  );
}
