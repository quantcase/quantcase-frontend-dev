"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { InsightData } from "@/types/analysis";
import type { TechnicalsResponse } from "@/types/technicals";
import type { ScreenerData } from "@/types/screener";
import type { OverviewAnalysis } from "@/types/overview";
import { MonoEyebrow } from "./primitives";

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

function sentColor(s: "positive" | "negative" | "neutral" | "transitional"): string {
  if (s === "positive") return "var(--qc-up, #1F7A4A)";
  if (s === "negative") return "var(--qc-down, #B23A2F)";
  return "var(--qc-warn, #B4731A)";
}

function sentBg(s: "positive" | "negative" | "neutral" | "transitional"): string {
  if (s === "positive") return "var(--qc-up-soft, #EAF4EE)";
  if (s === "negative") return "var(--qc-down-soft, #FDECEA)";
  return "var(--qc-warn-soft, #FEF3E2)";
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

// ─── Compact Card (shared by MOD, Fundamentals, Technicals) ──────────────────

function CompactCard({
  label,
  value,
  sentiment = "neutral",
}: {
  label: string;
  value: string;
  sentiment?: "positive" | "negative" | "neutral";
}) {
  const bg = sentBg(sentiment);
  const color = sentColor(sentiment);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "7px 10px",
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: 8,
      }}
    >
      <span
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--qc-ink-2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--qc-font-sans)",
          fontSize: "var(--qc-fz-12)",
          fontWeight: "var(--qc-w-semi)",
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Linkable Compact Card (for QuantCase Framework) ─────────────────────────

function LinkableCompactCard({
  label,
  value,
  sentiment = "neutral",
  href,
}: {
  label: string;
  value: string;
  sentiment?: "positive" | "negative" | "neutral";
  href: string;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = sentBg(sentiment);
  const color = sentColor(sentiment);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "7px 10px",
        background: bg,
        border: `1px solid ${hovered ? color : color + "30"}`,
        borderRadius: 8,
        transition: "border-color 0.15s ease",
      }}
    >
      <span
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--qc-ink-2)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--qc-font-sans)",
          fontSize: "var(--qc-fz-12)",
          fontWeight: "var(--qc-w-semi)",
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
      <Link
        href={href}
        aria-label={`Go to ${label} page`}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--qc-ink)",
          color: "var(--qc-card)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.6)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <ArrowUpRight size={10} strokeWidth={2.5} />
      </Link>
    </div>
  );
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

  const fundamentalChips: { label: string; value: string; sentiment?: "positive" | "negative" | "neutral" }[] = [];

  if (fin?.eps_cagr_3y != null) {
    const pct = (fin.eps_cagr_3y * 100).toFixed(0);
    fundamentalChips.push({
      label: "Growth",
      value: fin.eps_cagr_3y_label ?? (Number(pct) >= 10 ? "Growing" : Number(pct) < 0 ? "Declining" : "Moderate"),
      sentiment:
        Number(pct) >= 10 ? "positive" : Number(pct) < 0 ? "negative" : "neutral",
    });
  } else {
    fundamentalChips.push({ label: "Growth", value: "—" });
  }

  if (val?.peValuationLabel) {
    fundamentalChips.push({
      label: "Valuation",
      value: val.peValuationLabel,
      sentiment: val.peValuationLabel.toLowerCase().includes("cheap") || val.peValuationLabel.toLowerCase().includes("fair")
        ? "positive"
        : val.peValuationLabel.toLowerCase().includes("expensive") || val.peValuationLabel.toLowerCase().includes("premium")
        ? "negative"
        : "neutral",
    });
  } else {
    fundamentalChips.push({ label: "Valuation", value: "—" });
  }

  // Balance sheet / debt status
  const debtStatus = ratios?.debtStatus ?? null;
  if (debtStatus) {
    fundamentalChips.push({
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
    fundamentalChips.push({
      label: "Bal. Sheet",
      value: de < 0.3 ? "Strong" : de < 1.0 ? "Moderate" : "Leveraged",
      sentiment: de < 0.3 ? "positive" : de < 1.0 ? "neutral" : "negative",
    });
  } else {
    fundamentalChips.push({ label: "Bal. Sheet", value: "—" });
  }

  // Profitability
  const profitMargin = screenerData?.financialPerformance?.profitMargins;
  if (profitMargin != null) {
    const pct = profitMargin * 100;
    fundamentalChips.push({
      label: "Profit.",
      value: pct >= 20 ? "Excellent" : pct >= 10 ? "Stable" : pct >= 0 ? "Thin" : "Loss",
      sentiment: pct >= 10 ? "positive" : pct >= 0 ? "neutral" : "negative",
    });
  } else {
    fundamentalChips.push({ label: "Profit.", value: "—" });
  }

  // Cash conversion
  const cfoPct = fin?.cfo_ebitda_pct;
  if (cfoPct != null) {
    fundamentalChips.push({
      label: "Cash Co.",
      value: cfoPct >= 0.8 ? "Excellent" : cfoPct >= 0.5 ? "Good" : "Weak",
      sentiment: cfoPct >= 0.5 ? "positive" : "negative",
    });
  } else {
    fundamentalChips.push({ label: "Cash Co.", value: "—" });
  }

  // ROCE
  const roce = screenerData?.ratios?.roce ?? screenerData?.ratios?.roce3yAvg ?? null;
  if (roce != null) {
    const rocePct = roce * 100;
    fundamentalChips.push({
      label: "ROCE",
      value: rocePct >= 15 ? "Excellent" : rocePct >= 10 ? "Adequate" : "Weak",
      sentiment: rocePct >= 15 ? "positive" : rocePct >= 10 ? "neutral" : "negative",
    });
  } else {
    fundamentalChips.push({ label: "ROCE", value: "—" });
  }

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

  // DI risk alerts
  if (di?.riskAlerts?.length) {
    alerts.push({ source: "Macro", text: di.riskAlerts[0], sentiment: "negative" });
  }

  // Fallback
  if (reAlerts.length === 0 && !di?.riskAlerts?.length) {
    const trendSent = technicalsData?.trend?.direction ? techSent(technicalsData.trend.direction) : "neutral";
    if (trendSent === "negative") {
      alerts.push({ source: "Technical", text: "Price below key moving averages — caution until structure recovers.", sentiment: "negative" });
    }
  }

  const displayAlerts = alerts.slice(0, 5);

  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "sticky",
        top: 60,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <MonoEyebrow>Decision Intelligence</MonoEyebrow>
      </div>

      {/* Overall Rating card — prominent */}
      <div
        style={{
          background: "var(--qc-card)",
          border: `1.5px solid ${ratingColor}40`,
          borderRadius: 12,
          padding: "14px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Top row: label + composite score */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <MonoEyebrow style={{ marginBottom: 5 }}>Overall Rating</MonoEyebrow>
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
      </div>

      {/* QuantCase Framework + Fundamentals + Technicals — shared white card */}
      <div
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 12,
          padding: "12px 12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* QuantCase Framework */}
        <div>
          <MonoEyebrow style={{ marginBottom: 6 }}>QuantCase Framework</MonoEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            <LinkableCompactCard
              label="Management"
              value={mVerdict ? humanize(mVerdict) : "—"}
              sentiment={mScore !== null ? (mScore >= 70 ? "positive" : mScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/management?symbol=${encodeURIComponent(symbol)}`}
            />
            <LinkableCompactCard
              label="Opportunity"
              value={oVerdict ? humanize(oVerdict) : "—"}
              sentiment={oScore !== null ? (oScore >= 70 ? "positive" : oScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/opportunity?symbol=${encodeURIComponent(symbol)}`}
            />
            <LinkableCompactCard
              label="Deal"
              value={dVerdict ? humanize(dVerdict) : "—"}
              sentiment={dScore !== null ? (dScore >= 70 ? "positive" : dScore >= 50 ? "neutral" : "negative") : "neutral"}
              href={`/screener/deal?symbol=${encodeURIComponent(symbol)}`}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--qc-hair)" }} />

        {/* Fundamentals */}
        <div>
          <MonoEyebrow style={{ marginBottom: 6 }}>Fundamentals</MonoEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {fundamentalChips.map(({ label, value, sentiment = "neutral" }) => (
              <CompactCard key={label} label={label} value={value} sentiment={sentiment} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--qc-hair)" }} />

        {/* Technicals */}
        <div>
          <MonoEyebrow style={{ marginBottom: 6 }}>Technicals</MonoEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 5 }}>
            <CompactCard label="Structure" value={structureZone} sentiment={techSent(structureZone)} />
            <CompactCard label="Trend" value={trendDir} sentiment={techSent(trendDir)} />
            <CompactCard
              label="Timing"
              value={`RSI ${technicalsData?.momentum?.rsi?.value != null ? Math.round(technicalsData.momentum.rsi.value) : "—"}`}
              sentiment="neutral"
            />
            <CompactCard label="Rel. Str." value={rsNifty} sentiment={techSent(rsNifty)} />
          </div>
        </div>
      </div>

      {/* Key Alerts */}
      {displayAlerts.length > 0 && (
        <div
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 10,
            padding: "10px 12px 4px",
          }}
        >
          <MonoEyebrow style={{ marginBottom: 8 }}>Key Alerts</MonoEyebrow>
          <div style={{ height: 1, background: "var(--qc-hair)", marginBottom: 4 }} />
          {displayAlerts.map((a, i) => (
            <div key={i} style={{ borderBottom: i < displayAlerts.length - 1 ? "1px solid var(--qc-hair-2)" : "none" }}>
              <AlertRow source={a.source} text={a.text} sentiment={a.sentiment} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
