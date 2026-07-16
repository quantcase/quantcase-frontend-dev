"use client";

import { useMemo } from "react";
import type { InsightData } from "@/types/analysis";
import type { TechnicalsResponse } from "@/types/technicals";
import type { ScreenerData } from "@/types/screener";
import type { OverviewAnalysis } from "@/types/overview";
import { SignalCard, type SignalTooltip } from "./signal-card";
import {
  DecisionIntelligenceShell,
  DecisionSection,
  DecisionEyebrow,
  DecisionDivider,
} from "@/components/ds";

interface Props {
  management: InsightData | null;
  opportunity: InsightData | null;
  deal: InsightData | null;
  technicalsData: TechnicalsResponse | null;
  screenerData: ScreenerData | null;
  rating: string | null;
  overviewData?: OverviewAnalysis | null;
  symbol?: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--qc-up, #1F7A4A)";
  if (score >= 50) return "var(--qc-warn, #B4731A)";
  return "var(--qc-down, #B23A2F)";
}

function scoreBg(score: number): string {
  if (score >= 70) return "var(--qc-up-soft, #EAF4EE)";
  if (score >= 50) return "var(--qc-warn-soft, #FEF3E2)";
  return "var(--qc-down-soft, #FDECEA)";
}

function ratingKey(rating: string | null): "buy" | "strong-buy" | "hold" | "sell" | "underperform" {
  if (!rating) return "hold";
  const r = rating.toLowerCase().replace(/\s+/g, "-");
  if (r === "strong-buy") return "strong-buy";
  if (r === "buy") return "buy";
  if (r === "sell") return "sell";
  if (r === "underperform") return "underperform";
  return "hold";
}

function humanize(val: string | null | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Key Alert Row ────────────────────────────────────────────────────────────

function AlertRow({
  source,
  text,
  sentiment,
}: {
  source: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
}) {
  const color =
    sentiment === "positive"
      ? "var(--qc-up)"
      : sentiment === "negative"
      ? "var(--qc-down)"
      : "var(--qc-warn)";

  const bg =
    sentiment === "positive"
      ? "var(--qc-up-soft)"
      : sentiment === "negative"
      ? "var(--qc-down-soft)"
      : "var(--qc-warn-soft)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "9px 0",
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color,
          background: bg,
          border: `1px solid ${color}30`,
          borderRadius: 4,
          padding: "2px 7px",
        }}
      >
        {source}
      </span>
      <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink)", lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function DecisionIntelligencePanel({
  management,
  opportunity,
  deal,
  technicalsData,
  screenerData,
  rating,
  overviewData,
  symbol = "",
}: Props) {
  // Prefer Investment Conclusion's action_bias as the authoritative verdict
  const effectiveRating = overviewData?.action_bias ?? rating;
  const rKey = ratingKey(effectiveRating);
  const ratingColor =
    rKey === "strong-buy" || rKey === "buy"
      ? "var(--qc-up)"
      : rKey === "sell" || rKey === "underperform"
      ? "var(--qc-down)"
      : "var(--qc-warn)";

  // MOD scores
  const mScore = management?.score ?? null;
  const oScore = opportunity?.score ?? null;
  const dScore = deal?.score ?? null;

  // MOD verdict labels
  const mVerdict = management?.verdict_band ?? null;
  const oVerdict = opportunity?.verdict_band ?? null;
  const dVerdict = deal?.verdict_band ?? null;

  // Fundamentals chips from screenerData
  const val = screenerData?.valuation;
  const fin = screenerData?.financials;
  const ratios = screenerData?.ratios;

  const fundamentalChips = useMemo(() => {
    const chips: { label: string; value: string; sentiment?: "positive" | "negative" | "neutral" }[] = [];

    if (fin?.eps_cagr_3y != null) {
      const pct = (fin.eps_cagr_3y * 100).toFixed(0);
      chips.push({
        label: "Growth",
        value: fin.eps_cagr_3y_label ?? (Number(pct) >= 10 ? "Growing" : Number(pct) < 0 ? "Declining" : "Moderate"),
        sentiment: Number(pct) >= 10 ? "positive" : Number(pct) < 0 ? "negative" : "neutral",
      });
    } else {
      chips.push({ label: "Growth", value: "—" });
    }

    if (val?.peValuationLabel) {
      chips.push({
        label: "Valuation",
        value: val.peValuationLabel,
        sentiment: val.peValuationLabel.toLowerCase().includes("cheap") || val.peValuationLabel.toLowerCase().includes("fair")
          ? "positive"
          : val.peValuationLabel.toLowerCase().includes("expensive") || val.peValuationLabel.toLowerCase().includes("premium")
          ? "negative"
          : "neutral",
      });
    } else {
      chips.push({ label: "Valuation", value: "—" });
    }

    const debtStatus = ratios?.debtStatus ?? null;
    if (debtStatus) {
      chips.push({
        label: "Bal. Sheet",
        value: debtStatus,
        sentiment:
          debtStatus.toLowerCase().includes("strong") || debtStatus.toLowerCase().includes("debt-free")
            ? "positive"
            : debtStatus.toLowerCase().includes("high") || debtStatus.toLowerCase().includes("stressed")
            ? "negative"
            : "neutral",
      });
    } else if (screenerData?.efficiency?.debtToEquity != null) {
      const de = screenerData.efficiency.debtToEquity;
      chips.push({
        label: "Bal. Sheet",
        value: de < 0.3 ? "Strong" : de < 1.0 ? "Moderate" : "Leveraged",
        sentiment: de < 0.3 ? "positive" : de < 1.0 ? "neutral" : "negative",
      });
    } else {
      chips.push({ label: "Bal. Sheet", value: "—" });
    }

    const profitMargin = screenerData?.financialPerformance?.profitMargins;
    if (profitMargin != null) {
      const pct = profitMargin * 100;
      chips.push({
        label: "Profit.",
        value: pct >= 20 ? "Excellent" : pct >= 10 ? "Stable" : pct >= 0 ? "Thin" : "Loss",
        sentiment: pct >= 10 ? "positive" : pct >= 0 ? "neutral" : "negative",
      });
    } else {
      chips.push({ label: "Profit.", value: "—" });
    }

    const cfoPct = fin?.cfo_ebitda_pct;
    if (cfoPct != null) {
      chips.push({
        label: "Cash Co.",
        value: cfoPct >= 0.8 ? "Excellent" : cfoPct >= 0.5 ? "Good" : "Weak",
        sentiment: cfoPct >= 0.5 ? "positive" : "negative",
      });
    } else {
      chips.push({ label: "Cash Co.", value: "—" });
    }

    const roce = screenerData?.ratios?.roce ?? screenerData?.ratios?.roce3yAvg ?? null;
    if (roce != null) {
      const rocePct = roce * 100;
      chips.push({
        label: "ROCE",
        value: rocePct >= 15 ? "Excellent" : rocePct >= 10 ? "Adequate" : "Weak",
        sentiment: rocePct >= 15 ? "positive" : rocePct >= 10 ? "neutral" : "negative",
      });
    } else {
      chips.push({ label: "ROCE", value: "—" });
    }

    return chips;
  }, [fin, val, ratios, screenerData]);

  // Technicals rows
  const re = technicalsData?.ruleEngine;
  const structureZone = re?.structureEngine?.priceStructure?.zone
    ? humanize(re.structureEngine.priceStructure.zone)
    : "—";
  const trendDir = technicalsData?.trend?.direction
    ? humanize(technicalsData.trend.direction)
    : "—";
  const rsNifty = re?.dominanceEngine?.leadership?.vsNifty?.signal
    ? humanize(re.dominanceEngine.leadership.vsNifty.signal)
    : "—";

  function techSent(val: string): "positive" | "negative" | "neutral" {
    const v = val.toUpperCase();
    if (v.includes("UPTREND") || v.includes("STRONG") || v.includes("OUTPERFORM") || v.includes("MID RANGE") || v.includes("ABOVE") || v.includes("HIGH")) return "positive";
    if (v.includes("DOWNTREND") || v.includes("WEAK") || v.includes("UNDERPERFORM") || v.includes("BELOW")) return "negative";
    return "neutral";
  }

  // Optional hover tooltips for the Technicals cards, sourced from the
  // decision-intelligence indicators (explanation + watchout) when available.
  const techIndicators = technicalsData?.decisionIntelligence?.indicators ?? [];
  function techTip(...keywords: string[]): SignalTooltip | undefined {
    const ind = techIndicators.find((i) =>
      keywords.some((k) => i.name.toLowerCase().includes(k.toLowerCase()))
    );
    if (!ind?.explanation) return undefined;
    return {
      title: ind.name,
      description: ind.explanation,
      watch: ind.growthWatchout ?? ind.valueWatchout ?? undefined,
    };
  }

  // Key alerts — simple source + one-line text
  const di = technicalsData?.decisionIntelligence;
  const reAlerts = re?.decisionContext?.alerts ?? [];

  type Alert = { source: string; text: string; sentiment: "positive" | "negative" | "neutral" };
  const alerts: Alert[] = [];

  // MOD-level alerts
  if (dScore !== null && dScore < 50) {
    alerts.push({
      source: "QuantCase",
      text: dVerdict ? `Deal ${dVerdict.toLowerCase()} — entry attractiveness limited.` : "Deal score below threshold.",
      sentiment: "negative",
    });
  }
  if (oScore !== null && oScore < 60) {
    alerts.push({
      source: "QuantCase",
      text: oVerdict ? `Opportunity ${oVerdict.toLowerCase()} — growth revival depends on macro recovery.` : "Opportunity score is moderate.",
      sentiment: "neutral",
    });
  }
  if (mScore !== null && mScore >= 70) {
    alerts.push({
      source: "QuantCase",
      text: mVerdict ? `Management ${mVerdict.toLowerCase()} — guidance track record is solid.` : "Management quality is strong.",
      sentiment: "positive",
    });
  }

  // Fundamental alert
  if (fin?.eps_cagr_3y != null && fin.eps_cagr_3y < 0) {
    alerts.push({ source: "Fundamental", text: "Revenue decelerating — below sector average, re-rating risk.", sentiment: "negative" });
  }

  // Technical alerts from rule engine
  reAlerts.forEach((a) => {
    const s = a.toLowerCase();
    const sent: Alert["sentiment"] =
      s.includes("caution") || s.includes("below") || s.includes("risk") || s.includes("negative")
        ? "negative"
        : s.includes("strong") || s.includes("above") || s.includes("positive")
        ? "positive"
        : "neutral";
    alerts.push({ source: "Technical", text: a, sentiment: sent });
  });

  // Fallback
  if (reAlerts.length === 0) {
    const trendSent = technicalsData?.trend?.direction ? techSent(technicalsData.trend.direction) : "neutral";
    if (trendSent === "negative") {
      alerts.push({ source: "Technical", text: "Price below key moving averages — caution until structure recovers.", sentiment: "negative" });
    }
  }

  const displayAlerts = alerts.slice(0, 5);

  return (
    <DecisionIntelligenceShell>
      {/* Overall Rating card — prominent */}
      <DecisionSection style={{ borderColor: `${ratingColor}40` }}>
        {/* Top row: label + composite score */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <DecisionEyebrow className="mb-[5px]">Overall Rating</DecisionEyebrow>
            <span
              style={{
                fontFamily: "var(--qc-font-sans)",
                fontSize: "var(--qc-fz-22)",
                fontWeight: "var(--qc-w-bold)",
                color: ratingColor,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {effectiveRating ?? "—"}
            </span>
          </div>
          {mScore !== null && oScore !== null && dScore !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                background: scoreBg(Math.round((mScore + oScore + dScore) / 3)),
                borderRadius: 999,
                border: `1px solid ${scoreColor(Math.round((mScore + oScore + dScore) / 3))}30`,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)",
                  fontSize: "var(--qc-fz-16)",
                  fontWeight: "var(--qc-w-bold)",
                  color: scoreColor(Math.round((mScore + oScore + dScore) / 3)),
                }}
              >
                {Math.round((mScore + oScore + dScore) / 3)}
              </span>
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)",
                  fontSize: "var(--qc-fz-9)",
                  color: "var(--qc-ink-2)",
                  letterSpacing: ".1em",
                }}
              >
                / 100
              </span>
            </div>
          )}
        </div>

        {/* Fundamental interest sub-row — shown when action_bias overrides MOD rating */}
        {overviewData?.action_bias && rating && overviewData.action_bias.toLowerCase() !== rating.toLowerCase() && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              background: `${scoreColor(Math.round(((mScore ?? 0) + (oScore ?? 0) + (dScore ?? 0)) / Math.max(1, [mScore, oScore, dScore].filter(s => s !== null).length)))}12`,
              borderRadius: 8,
              border: `1px solid ${scoreColor(Math.round(((mScore ?? 0) + (oScore ?? 0) + (dScore ?? 0)) / Math.max(1, [mScore, oScore, dScore].filter(s => s !== null).length)))}25`,
            }}
          >
            <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", lineHeight: 1.4 }}>
              Quality strong; timing unfavorable now
            </span>
          </div>
        )}

        {/* Investor style tags inside the card */}
        {di && (di.tag || di.idealFor) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {di.tag && (
              <span
                style={{
                  fontFamily: "var(--qc-font-sans)",
                  fontSize: "var(--qc-fz-11)",
                  fontWeight: "var(--qc-w-medium)",
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "var(--qc-chip)",
                  color: "var(--qc-ink)",
                  border: "1px solid var(--qc-hair)",
                }}
              >
                {di.tag}
              </span>
            )}
            {di.idealFor && (
              <span
                style={{
                  fontFamily: "var(--qc-font-sans)",
                  fontSize: "var(--qc-fz-11)",
                  fontWeight: "var(--qc-w-medium)",
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "var(--qc-chip)",
                  color: "var(--qc-ink-2)",
                  border: "1px solid var(--qc-hair)",
                }}
              >
                {di.idealFor}
              </span>
            )}
          </div>
        )}
      </DecisionSection>

      {/* QuantCase Framework + Fundamentals + Technicals — shared white card */}
      <DecisionSection className="gap-3">
        {/* QuantCase Framework */}
        <div>
          <DecisionEyebrow className="mb-1.5">QuantCase Framework</DecisionEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            <SignalCard
              label="Management"
              value={mVerdict ? humanize(mVerdict) : "—"}
              sentiment={mScore !== null ? (mScore >= 70 ? "positive" : mScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/management?symbol=${encodeURIComponent(symbol)}`}
            />
            <SignalCard
              label="Opportunity"
              value={oVerdict ? humanize(oVerdict) : "—"}
              sentiment={oScore !== null ? (oScore >= 70 ? "positive" : oScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/opportunity?symbol=${encodeURIComponent(symbol)}`}
            />
            <SignalCard
              label="Deal"
              value={dVerdict ? humanize(dVerdict) : "—"}
              sentiment={dScore !== null ? (dScore >= 70 ? "positive" : dScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/deal?symbol=${encodeURIComponent(symbol)}`}
            />
          </div>
        </div>

        <DecisionDivider />

        {/* Fundamentals */}
        <div>
          <DecisionEyebrow className="mb-1.5">Fundamentals</DecisionEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {fundamentalChips.map(({ label, value, sentiment = "neutral" }) => (
              <SignalCard key={label} label={label} value={value} sentiment={sentiment} />
            ))}
          </div>
        </div>

        <DecisionDivider />

        {/* Technicals */}
        <div>
          <DecisionEyebrow className="mb-1.5">Technicals</DecisionEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 5 }}>
            <SignalCard
              label="Structure"
              value={structureZone}
              sentiment={techSent(structureZone)}
              tooltip={techTip("structure", "trend quality")}
            />
            <SignalCard
              label="Trend"
              value={trendDir}
              sentiment={techSent(trendDir)}
              tooltip={techTip("trend")}
            />
            <SignalCard
              label="Timing"
              value={`RSI ${technicalsData?.momentum?.rsi?.value != null ? Math.round(technicalsData.momentum.rsi.value) : "—"}`}
              sentiment="neutral"
              tooltip={techTip("timing", "momentum", "rsi")}
            />
            <SignalCard
              label="Rel. Str."
              value={rsNifty}
              sentiment={techSent(rsNifty)}
              tooltip={techTip("relative strength", "rel. str", "leadership")}
            />
          </div>
        </div>
      </DecisionSection>

      {/* Key Alerts */}
      {displayAlerts.length > 0 && (
        <DecisionSection className="gap-2">
          <DecisionEyebrow>Key Alerts</DecisionEyebrow>
          <DecisionDivider />
          <div className="flex flex-col">
            {displayAlerts.map((a, i) => (
              <div
                key={i}
                style={{ borderBottom: i < displayAlerts.length - 1 ? "1px solid var(--qc-hair-2)" : "none" }}
              >
                <AlertRow source={a.source} text={a.text} sentiment={a.sentiment} />
              </div>
            ))}
          </div>
        </DecisionSection>
      )}
    </DecisionIntelligenceShell>
  );
}
