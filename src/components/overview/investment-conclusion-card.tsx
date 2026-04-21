"use client";

import type { DFactorResponse } from "@/types/deal";
import type { FinalTakeaways } from "@/types/opportunity";
import type { TechnicalsResponse } from "@/types/technicals";
import { SectionShell, SectionLabel, NarrativeSidebar, MonoEyebrow } from "./primitives";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  dealData: DFactorResponse | null;
  oppTakeaways: FinalTakeaways | null;
  technicalsData: TechnicalsResponse | null;
  rating: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ratingKey(rating: string | null): string {
  if (!rating) return "hold";
  const r = rating.toLowerCase().replace(/\s+/g, "-");
  if (r === "strong-buy" || r === "buy") return r;
  if (r === "sell" || r === "underperform") return r;
  return "hold";
}

function pillLabel(key: string): string {
  if (key === "strong-buy") return "Add aggressively";
  if (key === "buy")         return "Add on dips";
  if (key === "sell")        return "Reduce exposure";
  if (key === "underperform")return "Trim position";
  return "Reassess position";
}

function convictionFromStatus(status: string | undefined): string {
  if (!status) return "Moderate";
  if (status === "STRONG") return "High";
  if (status === "WEAK")   return "Low";
  return "Moderate";
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function InvestmentConclusionCard({ dealData, oppTakeaways, technicalsData, rating }: Props) {
  const verdict       = dealData?.overview?.deal_verdict;
  // Display label: deal verdict title if available, otherwise QC score rating
  const verdictTitle  = verdict?.title ?? rating;
  const investThesis  = oppTakeaways?.investment_thesis ?? verdict?.description ?? null;
  const keyHighlights = oppTakeaways?.key_highlights ?? dealData?.overview?.key_takeaway ?? [];
  const keyRisks      = oppTakeaways?.key_risks ?? [];

  const baseScenario  = dealData?.target_price_matrix?.base;
  const entryTrigger  = baseScenario?.target_range ?? null;
  const entryRationale= baseScenario?.pe_rationale ?? null;
  const stopLoss      = baseScenario?.from_cmp ?? null;
  const holdingPeriod = dealData?.target_price_matrix?.holding_period ?? null;

  const rr            = dealData?.risk_reward_summary;
  const upside        = rr?.probability_weighted_return?.value ?? null;
  const riskReward    = rr?.risk_reward_ratio?.value ?? null;

  const re              = technicalsData?.ruleEngine;
  const marketBias      = re?.decisionContext?.marketBias ?? null;
  const marketCondition = re?.decisionContext?.overallCondition ?? null;
  const marketSummary   = re?.decisionContext?.summary ?? null;
  const conviction      = convictionFromStatus(oppTakeaways?.overall_status);

  // Always derive color/style from the QC score rating, not the free-form deal verdict title
  const rKey = ratingKey(rating);

  const hasContent = rating || verdictTitle || investThesis;
  if (!hasContent) return null;

  // Meter bar fills (0–100%)
  const entryFill  = entryTrigger  ? 0   : 0;    // pending = 0
  const stopFill   = stopLoss      ? 38  : 0;
  const upsideFill = upside        ? 52  : 0;
  const timeFill   = holdingPeriod ? 66  : 0;

  // Action bar text — derive from technicals + rating
  const isBullish = rKey === "buy" || rKey === "strong-buy";
  const actionOwn = isBullish
    ? { eyebrow: "If you own", title: "Hold and add on every dip", sub: `${marketSummary ? marketSummary.slice(0, 90) + "." : "Monitor key support and resistance levels."}` }
    : { eyebrow: "If you own", title: `Trim into strength${entryTrigger ? " above " + entryTrigger : ""}`, sub: `${marketCondition ? "Market condition: " + marketCondition + "." : ""} Keep core exposure only if macro thesis is your primary reason.` };

  const actionDontOwn = isBullish
    ? { eyebrow: "If you don't own", title: "Enter on a pullback to support", sub: "Wait for a clean base or breakout with volume confirmation before adding." }
    : { eyebrow: "If you don't own", title: "Wait for pullback or breadth turn", sub: `${marketBias ? "Market bias: " + marketBias + "." : ""} Re-assess when breadth frameworks flip neutral.` };

  const verdictColor =
    rKey === "strong-buy" || rKey === "buy" ? "var(--qc-up, #1F7A4A)"
    : rKey === "sell" || rKey === "underperform" ? "var(--qc-down, #B23A2F)"
    : "var(--qc-warn, #B4731A)";

  const narrativeTags = [
    ...(marketBias ? [{ label: marketBias, color: marketBias.toLowerCase().includes("bear") ? "var(--qc-down)" : marketBias.toLowerCase().includes("bull") ? "var(--qc-up)" : "var(--qc-warn)" }] : []),
    ...(marketCondition ? [{ label: marketCondition, color: "var(--qc-warn)" }] : []),
    ...(conviction ? [{ label: `Conviction ${conviction}`, color: "var(--qc-text-muted)" }] : []),
  ];

  const meters = [
    { label: "Entry trigger", value: entryTrigger ?? "Pending", sub: entryRationale, fill: entryFill, color: "var(--qc-text-muted)" },
    { label: "Suggested stop", value: stopLoss ?? "—", sub: null, fill: stopFill, color: "var(--qc-down, #B23A2F)" },
    { label: "Upside target", value: upside ?? "—", sub: riskReward ? `R/R ${riskReward}` : null, fill: upsideFill, color: "var(--qc-up, #1F7A4A)" },
    { label: "Time horizon", value: holdingPeriod ?? "—", sub: null, fill: timeFill, color: "var(--qc-blue, #3A6BEF)" },
  ];

  return (
    <SectionShell>
      <SectionLabel>Investment Conclusion</SectionLabel>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>

        {/* Left: verdict hero */}
        <section
          style={{
            background: "var(--qc-surface-white)",
            border: "1px solid var(--qc-border-default)",
            borderRadius: 18,
            padding: "16px 20px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <MonoEyebrow>Final call · Overall</MonoEyebrow>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: ".06em" }}>
              As of today · Valid 5 trading days
            </span>
          </div>

          {/* Verdict + thesis */}
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--qc-text-muted)", marginBottom: 6 }}>
                Verdict
              </div>
              <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", color: verdictColor, lineHeight: 1 }}>
                {rating ?? "Hold"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: 999,
                    background: rKey === "buy" || rKey === "strong-buy" ? "var(--qc-up-soft, #EAF4EE)" : rKey === "sell" || rKey === "underperform" ? "var(--qc-down-soft, #FDECEA)" : "var(--qc-warn-soft, #FEF3E2)",
                    color: verdictColor,
                    fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase",
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: verdictColor, display: "inline-block" }} />
                  {pillLabel(rKey)}
                </span>
                <span style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>Conviction · {conviction}</span>
              </div>
              {verdictTitle && verdictTitle !== rating && (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 8 }}>
                  {verdictTitle}
                </div>
              )}
            </div>
            {investThesis && (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--qc-text-body)", lineHeight: 1.6, flex: 1 }} dangerouslySetInnerHTML={{ __html: investThesis }} />
            )}
          </div>

          {/* 4-meter row */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
              borderTop: "1px solid var(--qc-border-inner)", paddingTop: 14,
            }}
          >
            {meters.map(({ label, value, sub, fill, color }) => (
              <div key={label}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--qc-text-muted)", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: value === "—" || value === "Pending" ? "var(--qc-text-muted)" : "var(--qc-text-heading)", marginBottom: 2 }}>
                  {value}
                  {sub && <span style={{ fontSize: 11, color: "var(--qc-text-muted)", marginLeft: 4 }}>{sub}</span>}
                </div>
                <div style={{ height: 4, background: "var(--qc-chip-bg, #F2F1EC)", borderRadius: 999, overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${fill}%`, borderRadius: 999, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: narrative sidebar */}
        <NarrativeSidebar
          eyebrow="Market context"
          headline={
            marketBias && marketCondition
              ? `${marketBias} bias — ${marketCondition.toLowerCase()}.`
              : "Market context unavailable for this analysis."
          }
          body={marketSummary ?? "Market analysis data is being loaded. Check the Technicals section for current signal readings."}
          tags={narrativeTags}
        />
      </div>

      {/* Pros & Cons */}
      {(keyHighlights.length > 0 || keyRisks.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { items: keyHighlights, heading: "Key highlights", count: "reason to own", color: "var(--qc-up, #1F7A4A)", tagLabel: "Pro", tagClass: "pos" },
            { items: keyRisks,      heading: "Key risks",      count: "reason to wait", color: "var(--qc-down, #B23A2F)", tagLabel: "Risk", tagClass: "neg" },
          ].map(({ items, heading, count, color, tagLabel }) => (
            <div
              key={heading}
              style={{
                background: "var(--qc-surface-white)",
                border: "1px solid var(--qc-border-default)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {heading}
                </h4>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: ".06em" }}>
                  {items.length} {count}{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((h, i) => {
                  const [tagRaw, ...rest] = h.split(":");
                  const hasTag = rest.length > 0 && tagRaw.length < 20;
                  const tag  = hasTag ? tagRaw.trim() : tagLabel;
                  const body = hasTag ? rest.join(":").trim() : h;
                  const [first, ...more] = body.split(". ");
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span
                        style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 600, letterSpacing: ".04em",
                          textTransform: "uppercase", color, padding: "2px 6px",
                          borderRadius: 4, background: color === "var(--qc-up, #1F7A4A)" ? "var(--qc-up-soft, #EAF4EE)" : "var(--qc-down-soft, #FDECEA)",
                          marginTop: 1,
                        }}
                      >
                        {tag}
                      </span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--qc-text-heading)", lineHeight: 1.4 }}>{first}</div>
                        {more.length > 0 && (
                          <div style={{ fontSize: 11.5, color: "var(--qc-text-body)", marginTop: 2, lineHeight: 1.45 }}>{more.join(". ")}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          background: "var(--qc-surface-white)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 14,
          padding: "14px 16px",
        }}
      >
        {[actionOwn, actionDontOwn].map((act) => (
          <div key={act.eyebrow} style={{ borderRight: act === actionOwn ? "1px solid var(--qc-border-inner)" : "none", paddingRight: act === actionOwn ? 16 : 0 }}>
            <MonoEyebrow style={{ marginBottom: 6 }}>{act.eyebrow}</MonoEyebrow>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-text-heading)", marginBottom: 4, display: "flex", gap: 6 }}>
              <span style={{ color: verdictColor }}>→</span>
              {act.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--qc-text-body)", lineHeight: 1.5 }}>{act.sub}</div>
          </div>
        ))}
      </div>

    </SectionShell>
  );
}
