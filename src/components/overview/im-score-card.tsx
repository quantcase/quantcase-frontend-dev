"use client";

import { useState, useCallback } from "react";
import type { FactorScore } from "@/types/management";
import type { FinalTakeaways, OFactorResponse } from "@/types/opportunity";
import type { OverviewSection } from "@/types/deal";

interface TitledBullet {
  title: string;
  text: string;
  score?: number | null;
  max?: number;
}

interface IMScoreCardProps {
  managementScore?: number | null;
  managementMax?: number | null;
  opportunityScore?: number | null;
  opportunityMax?: number | null;
  dealScore?: number | null;
  dealMax?: number | null;
  managementFactors?: FactorScore[];
  opportunityTakeaways?: FinalTakeaways | null;
  opportunityData?: OFactorResponse | null;
  dealOverview?: OverviewSection | null;
}

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

function clampWeights(m: number, o: number, d: number): [number, number, number] {
  const total = m + o + d;
  if (total === 0) return [33, 34, 33];
  return [
    Math.round((m / total) * 100),
    Math.round((o / total) * 100),
    100 - Math.round((m / total) * 100) - Math.round((o / total) * 100),
  ];
}

const PILLAR_COLORS = {
  M: { dot: "var(--qc-blue, #2563EB)", seg: "#0E0E0C" },
  O: { dot: "var(--qc-up, #1F7A4A)", seg: "#1E3A2B" },
  D: { dot: "var(--qc-warn, #B4731A)", seg: "#7A5A12" },
} as const;

const PILLAR_META = {
  M: { label: "Management", letter: "M" as const, sub: "Quality · credibility · track record · guidance" },
  O: { label: "Opportunity", letter: "O" as const, sub: "Industry · competition · strength · customer traction" },
  D: { label: "Deal", letter: "D" as const, sub: "EPS engine · valuation · re-rating · margin of safety" },
};

type PillarKey = "M" | "O" | "D";

// --- Sub-pillar item ---
function FwxSub({ item, color, muted }: { item: TitledBullet; color: string; muted?: boolean }) {
  const pct = item.score != null && item.max ? Math.round((item.score / item.max) * 100) : 0;
  return (
    <div style={{ minWidth: 0, opacity: muted ? 1 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: muted ? "var(--qc-border-default)" : color,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: muted ? "var(--qc-text-muted)" : "var(--qc-text-heading)" }}>
          {item.title}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
            color: muted ? "var(--qc-text-muted)" : "var(--qc-text-heading)", letterSpacing: "-0.01em",
          }}
        >
          {item.score != null ? item.score : "—"}
          <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>/{item.max ?? 5}</span>
        </span>
      </div>
      <div style={{ height: 3, background: "var(--qc-chip-bg)", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, borderRadius: 999, background: muted ? "var(--qc-border-default)" : color }} />
      </div>
      <div style={{ fontSize: 12, color: "var(--qc-text-muted)", lineHeight: 1.45 }}>{item.text}</div>
    </div>
  );
}

// --- Custom slider track (design-sample wx-track style) ---
function WxSlider({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--qc-text-heading)" }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "var(--qc-text-heading)", letterSpacing: 0 }}>
          {value}<span style={{ color: "#4A5F20", fontSize: 10.5, marginLeft: 1 }}>%</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: "rgba(14,14,12,0.14)", borderRadius: 999 }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${value}%`, background: "#0E0E0C", borderRadius: 999 }} />
        <input
          type="range"
          min={5}
          max={90}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", opacity: 0,
            cursor: "pointer", height: "100%", margin: 0,
          }}
        />
        <span
          style={{
            position: "absolute", top: "50%", transform: `translate(-50%, -50%)`,
            left: `${value}%`,
            width: 14, height: 14, borderRadius: "50%",
            background: "var(--qc-surface-card, #FFFFFF)",
            border: "2px solid #0E0E0C",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export function IMScoreCard({
  managementScore,
  managementMax,
  opportunityScore,
  opportunityMax,
  dealScore,
  dealMax,
  managementFactors,
  opportunityTakeaways,
  opportunityData,
  dealOverview,
}: IMScoreCardProps) {
  const mScore = managementScore ?? null;
  const oScore = opportunityScore ?? null;
  const dScore = dealScore ?? null;

  const mMax = managementMax ?? 50;
  const oMax = opportunityMax ?? 30;
  const dMax = dealMax ?? 20;

  const [mWeight, setMWeight] = useState(40);
  const [oWeight, setOWeight] = useState(40);
  const [dWeight, setDWeight] = useState(20);
  const [activePillar, setActivePillar] = useState<PillarKey>("O");

  const handleMWeight = useCallback((val: number) => {
    const newM = Math.max(5, Math.min(90, val));
    const remaining = 100 - newM;
    const ratio = oWeight / (oWeight + dWeight || 1);
    setMWeight(newM);
    setOWeight(Math.max(5, Math.round(remaining * ratio)));
    setDWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [oWeight, dWeight]);

  const handleOWeight = useCallback((val: number) => {
    const newO = Math.max(5, Math.min(90, val));
    const remaining = 100 - newO;
    const ratio = mWeight / (mWeight + dWeight || 1);
    setOWeight(newO);
    setMWeight(Math.max(5, Math.round(remaining * ratio)));
    setDWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [mWeight, dWeight]);

  const handleDWeight = useCallback((val: number) => {
    const newD = Math.max(5, Math.min(90, val));
    const remaining = 100 - newD;
    const ratio = mWeight / (mWeight + oWeight || 1);
    setDWeight(newD);
    setMWeight(Math.max(5, Math.round(remaining * ratio)));
    setOWeight(Math.max(5, remaining - Math.max(5, Math.round(remaining * ratio))));
  }, [mWeight, oWeight]);

  const [cMW, cOW, cDW] = clampWeights(mWeight, oWeight, dWeight);

  let partialNumer = 0, partialDenom = 0;
  if (mScore !== null) { partialNumer += (mScore / mMax) * cMW; partialDenom += cMW; }
  if (oScore !== null) { partialNumer += (oScore / oMax) * cOW; partialDenom += cOW; }
  if (dScore !== null) { partialNumer += (dScore / dMax) * cDW; partialDenom += cDW; }
  const hasAnyScore = partialDenom > 0;
  const weightedPct = hasAnyScore ? partialNumer / partialDenom : 0;
  const displayScore = hasAnyScore ? Math.round(weightedPct * 100) : null;
  const rating = hasAnyScore ? getRating(weightedPct) : null;

  // Pill scores
  const pillScores: Record<PillarKey, { score: number | null; max: number }> = {
    M: { score: mScore, max: mMax },
    O: { score: oScore, max: oMax },
    D: { score: dScore, max: dMax },
  };

  // Active pillar gauge
  const ap = activePillar;
  const apScore = pillScores[ap].score;
  const apMax = pillScores[ap].max;
  const apWeight = ap === "M" ? cMW : ap === "O" ? cOW : cDW;
  const apPct = apScore != null && apMax > 0 ? Math.round((apScore / apMax) * 100) : 0;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (circumference * apPct) / 100;

  // Sub-items per pillar
  const mItems: TitledBullet[] = managementFactors
    ? managementFactors.slice(0, 4).map((f) => ({ title: f.factor, text: f.descriptor ?? "" }))
    : [];

  const oSubScores = opportunityTakeaways?.section_scores;
  const oEntries: { key: string; label: string; max: number }[] = [
    { key: "industry", label: "Industry", max: 10 },
    { key: "competition", label: "Competition", max: 10 },
    { key: "financial_strength", label: "Financial Strength", max: 5 },
    { key: "customer_traction", label: "Customer Traction", max: 5 },
  ];
  const oItems: TitledBullet[] = oEntries.map((e) => {
    const sec = oSubScores?.[e.key as keyof typeof oSubScores];
    const takeaway = sec?.takeaway
      ?? (opportunityData?.[e.key as keyof OFactorResponse] as { text?: { takeaway?: string } } | undefined)?.text?.takeaway
      ?? "";
    return { title: e.label, text: takeaway, score: (sec as { score?: number } | undefined)?.score ?? null, max: e.max };
  });

  const dItems: TitledBullet[] = (() => {
    const items: TitledBullet[] = [];
    const eps = dealOverview?.eps_engine_card;
    if (eps?.drivers?.length) items.push({ title: "EPS Engine", text: eps.drivers.slice(0, 2).join("; ") });
    const val = dealOverview?.valuation_rerating_card;
    if (val?.drivers?.length) items.push({ title: "Valuation Re-Rating", text: val.drivers.slice(0, 2).join("; ") });
    if (items.length === 0 && dealOverview?.key_takeaway?.length) {
      dealOverview.key_takeaway.slice(0, 4).forEach((t) => items.push({ title: "Key Takeaway", text: t }));
    }
    return items;
  })();

  const activeItems: TitledBullet[] = ap === "M" ? mItems : ap === "O" ? oItems : dItems;
  const apColor = PILLAR_COLORS[ap].dot;

  return (
    <div>
      {/* .section outer card — hair-2 bg, hair border, 18px radius, 16px padding */}
      <div
        style={{
          background: "var(--qc-surface-row-alt, #EFEDE7)",
          border: "1px solid var(--qc-border-default, #E9E7E1)",
          borderRadius: 18,
          padding: 16,
          marginBottom: 0,
        }}
      >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--qc-text-body, #5A5A54)",
          textTransform: "uppercase",
          marginBottom: 12,
          whiteSpace: "nowrap",
        }}
      >
        Weighting &amp; Framework
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 360px",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* LEFT: hero-chart — Framework pillars */}
        <section
          style={{
            background: "var(--qc-surface-card, #FFFFFF)",
            border: "1px solid var(--qc-border-default)",
            borderRadius: 18,
            padding: "16px 20px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* header */}
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--qc-text-muted)", textTransform: "uppercase" }}>
              M · O · D Framework
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                <svg key="filter" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
                <svg key="expand" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 14v6h6M20 10V4h-6M20 4l-7 7M4 20l7-7" /></svg>,
              ].map((icon, i) => (
                <button
                  key={i}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: "1px solid var(--qc-border-default)",
                    background: "var(--qc-surface-card, #FFFFFF)",
                    color: "var(--qc-text-muted)",
                    display: "grid", placeItems: "center", cursor: "pointer",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </header>

          {/* fwx-summary: pillar pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "4px 0 14px" }}>
            {(["M", "O", "D"] as PillarKey[]).map((key) => {
              const isOn = activePillar === key;
              const { label } = PILLAR_META[key];
              const { score, max } = pillScores[key];
              const hasMuted = score == null;
              return (
                <button
                  key={key}
                  onClick={() => setActivePillar(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    border: `1px solid ${isOn ? "#0E0E0C" : "var(--qc-border-default)"}`,
                    borderRadius: 10,
                    background: isOn ? "#0E0E0C" : "var(--qc-surface-card, #FFFFFF)",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    color: isOn ? "#fff" : "inherit",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: PILLAR_COLORS[key].dot }} />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: isOn ? "#fff" : "var(--qc-text-heading)" }}>{label}</span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
                      color: isOn ? "#fff" : hasMuted ? "var(--qc-text-muted)" : "var(--qc-text-heading)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {score != null ? score : "—"}
                    <span style={{ fontSize: 10.5, color: isOn ? "rgba(255,255,255,0.55)" : "var(--qc-text-muted)", marginLeft: 1 }}>/{max}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* fwx-hero: active pillar */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              gap: 20, alignItems: "center",
              padding: "14px 4px 16px",
              borderTop: "1px solid var(--qc-border-inner, #EFEDE7)",
              borderBottom: "1px solid var(--qc-border-inner, #EFEDE7)",
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--qc-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Active pillar
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", display: "flex", alignItems: "center", gap: 10 }}>
                {PILLAR_META[ap].label}
                <span
                  style={{
                    display: "inline-grid", placeItems: "center",
                    width: 22, height: 22, borderRadius: 6,
                    background: PILLAR_COLORS[ap].dot, color: "#fff",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  {ap}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--qc-text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                {PILLAR_META[ap].sub}
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "0 10px" }}>
              <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {apScore != null ? apScore : "—"}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "var(--qc-text-muted)", letterSpacing: 0, fontWeight: 400, marginLeft: 2 }}>
                  /{apMax}
                </span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-text-muted)", marginTop: 8 }}>
                {apPct}% of max · {apWeight}% weight
              </div>
            </div>
            {/* Gauge ring */}
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="52" stroke="var(--qc-border-default)" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r="52"
                  stroke={apColor}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${dashOffset}`}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: "absolute", inset: 0, display: "grid", placeItems: "center",
                  fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
                }}
              >
                {apPct}<span style={{ fontSize: 12, color: "var(--qc-text-muted)", fontWeight: 400, marginLeft: 1 }}>%</span>
              </div>
            </div>
          </div>

          {/* fwx-sublist: sub-pillar breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            {activeItems.length > 0 ? (
              activeItems.map((item, i) => (
                <FwxSub
                  key={i}
                  item={item}
                  color={apColor}
                  muted={item.score == null && item.text === ""}
                />
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--qc-text-muted)" }}>No analysis available.</div>
            )}
          </div>
        </section>

        {/* RIGHT: insight-card — lime gradient weighting panel */}
        <aside
          style={{
            background: "linear-gradient(175deg, #E8F3BD 0%, #D6E996 100%)",
            border: "1px solid #C6DC8A",
            borderRadius: 18,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* insight-head */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "#4A5F20", textTransform: "uppercase" }}>
              Adjust Weightings
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                <svg key="reset" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>,
                <svg key="check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>,
              ].map((icon, i) => (
                <button
                  key={i}
                  style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "1px solid rgba(14,14,12,0.12)",
                    background: "rgba(255,255,255,0.35)",
                    color: "#0E0E0C",
                    display: "grid", placeItems: "center", cursor: "pointer",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* insight-title */}
          <h3 style={{ margin: "2px 0 8px", fontSize: 18, fontWeight: 500, lineHeight: 1.35, letterSpacing: "-0.01em", color: "#0E0E0C", paddingRight: 20 }}>
            Weights must total <b style={{ fontWeight: 600 }}>100%</b> — drag to rebalance.
          </h3>

          {/* wx-split */}
          <div style={{ display: "flex", height: 44, borderRadius: 10, overflow: "hidden", gap: 2, marginBottom: 16 }}>
            {([
              { key: "M" as PillarKey, label: "Mgmt", weight: cMW, bg: "#0E0E0C" },
              { key: "O" as PillarKey, label: "Opp", weight: cOW, bg: "#1E3A2B" },
              { key: "D" as PillarKey, label: "Deal", weight: cDW, bg: "#7A5A12" },
            ]).map(({ key, label, weight, bg }) => (
              <div
                key={key}
                style={{
                  flex: weight, background: bg,
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-start", justifyContent: "center",
                  padding: "0 12px", color: "#fff", minWidth: 0,
                }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, lineHeight: 1 }}>{weight}%</span>
                <span style={{ fontSize: 10.5, opacity: 0.75, marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* wx-sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14, flex: 1 }}>
            <WxSlider label="Management" value={cMW} onChange={handleMWeight} />
            <WxSlider label="Opportunity" value={cOW} onChange={handleOWeight} />
            <WxSlider label="Deal" value={cDW} onChange={handleDWeight} />
          </div>

          {/* insight-foot */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginTop: 6 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "#0E0E0C", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                100<span style={{ fontSize: 16, marginLeft: 1 }}>%</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>
                Allocated
              </div>
            </div>
            <button
              style={{
                width: 38, height: 38, borderRadius: "50%",
                border: "1px solid rgba(14,14,12,0.12)",
                background: "rgba(255,255,255,0.5)",
                color: "#0E0E0C",
                display: "grid", placeItems: "center", cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "#0E0E0C", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {displayScore != null ? displayScore : "—"}
                <span style={{ fontSize: 16, marginLeft: 1 }}>/100</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, textAlign: "right" }}>
                Resulting QC
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* qc-strip: overall score strip (shown when rating available) */}
      {rating && displayScore != null && (
        <div
          style={{
            display: "grid", gridTemplateColumns: "auto 1px 1fr",
            gap: 20,
            background: "var(--qc-surface-card, #FFFFFF)",
            border: "1px solid var(--qc-border-default)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          {/* Score + rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
              <svg viewBox="0 0 60 60" width="60" height="60">
                <circle cx="30" cy="30" r="24" stroke="var(--qc-border-default)" strokeWidth="5" fill="none" />
                <circle
                  cx="30" cy="30" r="24"
                  stroke={weightedPct >= 0.65 ? "var(--qc-up, #1F7A4A)" : weightedPct >= 0.35 ? "var(--qc-warn, #B4731A)" : "var(--qc-down, #B23A2F)"}
                  strokeWidth="5" fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - displayScore / 100)}`}
                  transform="rotate(-90 30 30)"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 20, fontWeight: 500, letterSpacing: "-0.015em" }}>
                {displayScore}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "#fff",
                    background: weightedPct >= 0.65 ? "var(--qc-up, #1F7A4A)" : weightedPct >= 0.35 ? "var(--qc-warn, #B4731A)" : "var(--qc-down, #B23A2F)",
                    padding: "4px 9px", borderRadius: 999,
                  }}
                >
                  {rating}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--qc-text-muted)", lineHeight: 1.4 }}>
                Weighted QC score across M · O · D framework
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ alignSelf: "stretch", background: "var(--qc-border-inner, #EFEDE7)" }} />

          {/* Weights summary */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "var(--qc-text-muted)", textTransform: "uppercase" }}>
                Current Weighting
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--qc-text-muted)", letterSpacing: "0.04em" }}>
                {cMW + cOW + cDW}% total
              </span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {([
                { key: "M" as PillarKey, label: "Management", weight: cMW },
                { key: "O" as PillarKey, label: "Opportunity", weight: cOW },
                { key: "D" as PillarKey, label: "Deal", weight: cDW },
              ]).map(({ key, label, weight }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: PILLAR_COLORS[key].dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>{label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "var(--qc-text-heading)", fontWeight: 500 }}>{weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>{/* end .section outer card */}
    </div>
  );
}
