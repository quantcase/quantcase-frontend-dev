"use client";

import { useState } from "react";
import type { Holding, SubScore, QuarterData } from "./portfolio-data";
import { PILLAR_COLOR, modColor, thesisConfig, capBadgeStyle, fmtLakhs, fmt } from "./portfolio-data";

// ── Primitives ────────────────────────────────────────────────────────────────

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
      border: `1px solid ${expanded ? "var(--qc-ink)" : "var(--qc-hair)"}`,
      background: expanded ? "var(--qc-ink)" : "transparent",
      color: expanded ? "#fff" : "var(--qc-ink-3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, transition: "all 0.2s",
      transform: expanded ? "rotate(180deg)" : "none",
    }}>▾</div>
  );
}

export function ConvictionDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: "50%",
          background: i < value ? "var(--qc-warn)" : "transparent",
          border: `1.5px solid ${i < value ? "var(--qc-warn)" : "var(--qc-ink-3)"}`,
        }} />
      ))}
    </div>
  );
}

// ── Expandable detail sub-panels ──────────────────────────────────────────────

function ModSubScores({ subScores, overall }: { subScores: SubScore[]; overall: number }) {
  return (
    <div style={{ background: "var(--qc-bg)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        MOD Sub-scores
        <span style={{ fontSize: 11, fontWeight: 700, color: modColor(overall) }}>{overall}/100</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subScores.map(s => (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: PILLAR_COLOR[s.pillar] }}>{s.label}</div>
            <div style={{ width: 60, height: 4, background: "var(--qc-hair)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${s.score}%`, height: "100%", background: PILLAR_COLOR[s.pillar], borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--qc-font-mono)", fontWeight: 600, minWidth: 24, textAlign: "right", color: s.score < 60 ? "#B91C1C" : s.score < 75 ? "var(--qc-warn)" : "inherit" }}>
              {s.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuarterTrend({ quarters }: { quarters: QuarterData[] }) {
  return (
    <div style={{ background: "var(--qc-bg)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)", marginBottom: 12 }}>
        4-Quarter MOD Trend
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {quarters.map(q => (
          <div key={q.q} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 9, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)", letterSpacing: "0.04em" }}>{q.q}</div>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              {q.bars.map((b, i) => (
                <div key={i} style={{ width: 10, height: b.height, borderRadius: "2px 2px 0 0", background: PILLAR_COLOR[b.pillar] }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--qc-font-mono)", fontWeight: 600, color: q.total < 60 ? "#B91C1C" : "var(--qc-ink)" }}>{q.total}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: q.delta === null || q.delta === 0 ? "var(--qc-ink-3)" : q.delta > 0 ? "var(--qc-up)" : "#B91C1C" }}>
              {q.delta === null || q.delta === 0 ? "—" : q.delta > 0 ? `+${q.delta}` : `${q.delta}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalBlock({ holding }: { holding: Holding }) {
  const tc = thesisConfig(holding.thesisHealth);
  return (
    <div style={{ background: "var(--qc-bg)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Investment Journal
        <button style={{ background: "transparent", border: "1px solid var(--qc-hair)", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "var(--qc-ink-2)", cursor: "pointer" }}>Edit</button>
      </div>

      {holding.thesisHealth === "none" ? (
        <div style={{ background: "var(--qc-card)", border: "1.5px dashed var(--qc-hair)", borderRadius: 8, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--qc-ink-3)", fontStyle: "italic", marginBottom: 8 }}>No thesis added yet</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", cursor: "pointer" }}>+ Add investment thesis</div>
        </div>
      ) : (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, background: tc.bg, color: tc.color }}>
            {tc.icon} Thesis {tc.label}
          </div>
          {holding.journal && (
            <>
              <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.5, marginBottom: 10 }}>
                {holding.journal.thesis}
              </div>
              <div style={{ fontSize: 10, color: "var(--qc-ink-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Conviction</div>
              <ConvictionDots value={holding.journal.conviction} />
              {holding.journal.aiNudge && (
                <div style={{ background: "linear-gradient(135deg,#EDE9FE,#F5F3FF)", border: "1px solid #DDD6FE", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#4C1D95", lineHeight: 1.5, marginTop: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>🤖 AI Thesis Check</div>
                  {holding.journal.aiNudge}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Main row component ────────────────────────────────────────────────────────

export function HoldingRow({ holding, defaultExpanded = false }: { holding: Holding; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const tc = thesisConfig(holding.thesisHealth);
  const pillarsPresent = (["mgmt", "opp", "deal"] as const).filter(p => holding.subScores.some(s => s.pillar === p));
  const last4 = holding.quarterTrend.slice(-4);
  const dirLabel = holding.trendDir === "up" ? "↑" : holding.trendDir === "down" ? "↓" : "→";

  return (
    <div style={{ borderBottom: "1px solid var(--qc-hair)", background: expanded ? "#FAFAF8" : "transparent", transition: "background 0.12s" }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto auto auto", gap: 14, alignItems: "center", padding: "14px 20px", cursor: "pointer" }}
      >
        <ExpandIcon expanded={expanded} />

        {/* Stock info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, letterSpacing: "0.01em", color: "var(--qc-ink)" }}>
            {holding.alert && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B91C1C", flexShrink: 0 }} />}
            {holding.symbol}
          </div>
          <div style={{ fontSize: 11, color: "var(--qc-ink-3)", marginTop: 1 }}>{holding.name} · {holding.sector}</div>
          <div style={{ display: "inline-block", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, marginTop: 4, ...capBadgeStyle(holding.capType) }}>
            {holding.capType} Cap
          </div>
        </div>

        {/* Thesis chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: tc.dot }} />
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: tc.color }}>{tc.label}</div>
        </div>

        {/* Qty / cost */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-3)" }}>{holding.qty} shares</div>
          <div style={{ fontSize: 10, color: "var(--qc-ink-3)", marginTop: 1 }}>@ ₹{fmt(holding.avgCost)}</div>
        </div>

        {/* Value + P&L */}
        <div style={{ textAlign: "right", minWidth: 70 }}>
          <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{fmtLakhs(holding.currentValue)}</div>
          <div style={{ fontSize: 10, marginTop: 2, fontFamily: "var(--qc-font-mono)", color: holding.pnl >= 0 ? "var(--qc-up)" : "#B91C1C" }}>
            {holding.pnl >= 0 ? "+" : ""}{fmtLakhs(holding.pnl)} ({holding.pnlPct >= 0 ? "+" : ""}{holding.pnlPct.toFixed(1)}%)
          </div>
        </div>

        {/* MOD mini score */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 80 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, color: modColor(holding.modScore) }}>{holding.modScore}</span>
            <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>/100</span>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {pillarsPresent.map(p => <div key={p} style={{ height: 3, width: 18, borderRadius: 2, background: PILLAR_COLOR[p] }} />)}
          </div>
        </div>

        {/* 4Q trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 70 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600 }}>4Q trend {dirLabel}</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
            {last4.map((q, i) => {
              const bar = q.bars[0];
              const h = 10 + (i / (last4.length - 1)) * 10;
              return <div key={i} style={{ width: 12, height: h, borderRadius: "2px 2px 0 0", background: bar ? PILLAR_COLOR[bar.pillar] : "var(--qc-ink-2)" }} />;
            })}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingTop: 16 }}>
            <ModSubScores subScores={holding.subScores} overall={holding.modScore} />
            <QuarterTrend quarters={holding.quarterTrend} />
            <JournalBlock holding={holding} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Holdings card (filter + list) ─────────────────────────────────────────────

type HoldingFilter = "all" | "alerts" | "winners" | "losers" | "broken" | "no-journal";

function FilterPill({ label, active, warn, onClick }: { label: string; active: boolean; warn?: boolean; onClick: () => void }) {
  const base: React.CSSProperties = { fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: "1px solid", whiteSpace: "nowrap" };
  if (active && warn) return <button onClick={onClick} style={{ ...base, background: "#92400E", color: "#fff", borderColor: "#92400E" }}>{label}</button>;
  if (active)         return <button onClick={onClick} style={{ ...base, background: "var(--qc-ink)", color: "#fff", borderColor: "var(--qc-ink)" }}>{label}</button>;
  if (warn)           return <button onClick={onClick} style={{ ...base, background: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>{label}</button>;
  return <button onClick={onClick} style={{ ...base, background: "var(--qc-card)", color: "var(--qc-ink-2)", borderColor: "var(--qc-hair)" }}>{label}</button>;
}

export function HoldingsCard({ holdings }: { holdings: Holding[] }) {
  const [filter, setFilter] = useState<HoldingFilter>("all");

  const filtered = holdings.filter(h => {
    if (filter === "alerts")     return !!h.alert;
    if (filter === "winners")    return h.pnl > 0;
    if (filter === "losers")     return h.pnl < 0;
    if (filter === "broken")     return h.thesisHealth === "broken";
    if (filter === "no-journal") return h.thesisHealth === "none";
    return true;
  });

  const alertCount = holdings.filter(h => h.alert).length;

  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--qc-hair)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-2)" }}>Equity holdings</span>
          <span style={{ background: "var(--qc-bg)", padding: "2px 8px", borderRadius: 999, fontSize: 11, color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>{holdings.length}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Sort by MOD", "Sort by value"].map(lbl => (
            <button key={lbl} style={{ background: "transparent", border: "1px solid var(--qc-hair)", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "var(--qc-ink-2)", cursor: "pointer" }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: "1px solid var(--qc-hair)", overflowX: "auto" }}>
        <FilterPill label={`All ${holdings.length}`}         active={filter === "all"}        onClick={() => setFilter("all")} />
        <FilterPill label={`⚠ Alerts (${alertCount})`}      active={filter === "alerts"}     warn onClick={() => setFilter("alerts")} />
        <FilterPill label="🏆 Winners"                       active={filter === "winners"}    onClick={() => setFilter("winners")} />
        <FilterPill label="📉 Losers"                        active={filter === "losers"}     onClick={() => setFilter("losers")} />
        <FilterPill label="Thesis broken"                    active={filter === "broken"}     onClick={() => setFilter("broken")} />
        <FilterPill label="No journal"                       active={filter === "no-journal"} onClick={() => setFilter("no-journal")} />
      </div>

      {/* Rows */}
      {filtered.map(h => (
        <HoldingRow key={h.symbol} holding={h} defaultExpanded={["HDFCBANK", "ASIANPAINT"].includes(h.symbol)} />
      ))}
    </div>
  );
}
