"use client";

import type { DFactorResponse } from "@/types/deal";
import type { FinalTakeaways } from "@/types/opportunity";
import type { TechnicalsResponse } from "@/types/technicals";
import type { InsightData } from "@/types/analysis";
import type { OverviewAnalysis } from "@/types/overview";
import { SectionShell, MonoEyebrow, InlineMd } from "./primitives";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  dealData: DFactorResponse | null;
  oppTakeaways: FinalTakeaways | null;
  technicalsData: TechnicalsResponse | null;
  rating: string | null;
  oppInsight?: InsightData | null;
  overviewData?: OverviewAnalysis | null;
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

export function InvestmentConclusionCard({ dealData, oppTakeaways, technicalsData, rating, oppInsight, overviewData }: Props) {
  const verdict       = dealData?.overview?.deal_verdict;
  const verdictTitle  = verdict?.title ?? rating;

  // Prefer overviewData fields, then InsightData, then legacy typed data
  const investThesis  = overviewData?.thesis ?? oppInsight?.thesis ?? oppTakeaways?.investment_thesis ?? verdict?.description ?? null;

  const keyHighlights: string[] = overviewData
    ? overviewData.evidence
    : oppInsight
    ? [
        ...(oppInsight.key_signals.filter(s => s.sentiment === "positive").map(s => s.label)),
        ...(oppInsight.evidence ?? []),
      ]
    : (oppTakeaways?.key_highlights ?? dealData?.overview?.key_takeaway ?? []);

  const keyRisks: string[] = overviewData
    ? overviewData.watch_outs
    : oppInsight
    ? [
        ...(oppInsight.key_signals.filter(s => s.sentiment === "negative").map(s => s.label)),
        ...(oppInsight.watch_outs ?? []),
      ]
    : (oppTakeaways?.key_risks ?? []);

  // Technicals — for action bar fallbacks only
  const di              = technicalsData?.decisionIntelligence;
  const re              = technicalsData?.ruleEngine;
  const marketBias      = re?.decisionContext?.marketBias ?? null;
  const marketCondition = re?.decisionContext?.overallCondition ?? null;
  const marketSummary   = re?.decisionContext?.summary ?? null;

  // Conviction
  const rawConviction = overviewData?.conviction ?? di?.convictionLevel ?? convictionFromStatus(oppTakeaways?.overall_status);
  const conviction = rawConviction
    ? rawConviction.charAt(0).toUpperCase() + rawConviction.slice(1).toLowerCase()
    : "Moderate";

  // Use overviewData.action_bias as display rating when available
  const effectiveRating = overviewData?.action_bias ?? rating;
  const rKey = ratingKey(effectiveRating);

  const hasContent = rating || verdictTitle || investThesis || di || overviewData;
  if (!hasContent) return null;

  // Action bar — use decisionIntelligence.actionableInsight when available
  const isBullish = rKey === "buy" || rKey === "strong-buy";
  const aiInsight = di?.actionableInsight;
  const entryTriggerFallback = dealData?.target_price_matrix?.base?.target_range ?? null;

  const actionOwn = aiInsight?.existingHolderAction
    ? { eyebrow: "If you own", title: aiInsight.existingHolderAction.split(";")[0].trim(), sub: aiInsight.existingHolderAction.split(";").slice(1).join(";").trim() || di?.actionBias || "" }
    : isBullish
      ? { eyebrow: "If you own", title: "Hold and add on every dip", sub: marketSummary ? marketSummary.slice(0, 90) + "." : "Monitor key support and resistance levels." }
      : { eyebrow: "If you own", title: `Trim into strength${entryTriggerFallback ? " above " + entryTriggerFallback : ""}`, sub: `${marketCondition ? "Market condition: " + marketCondition + "." : ""} Keep core exposure only if macro thesis is your primary reason.` };

  const actionDontOwn = (aiInsight?.firstShift || aiInsight?.reEvaluateCondition)
    ? { eyebrow: "If you don't own", title: aiInsight.action ?? "Wait for entry signal", sub: aiInsight.firstShift ?? aiInsight.reEvaluateCondition ?? "" }
    : isBullish
      ? { eyebrow: "If you don't own", title: "Enter on a pullback to support", sub: "Wait for a clean base or breakout with volume confirmation before adding." }
      : { eyebrow: "If you don't own", title: "Wait for pullback or breadth turn", sub: `${marketBias ? "Market bias: " + marketBias + "." : ""} Re-assess when breadth frameworks flip neutral.` };

  const verdictColor =
    rKey === "strong-buy" || rKey === "buy" ? "var(--qc-up, #1F7A4A)"
    : rKey === "sell" || rKey === "underperform" ? "var(--qc-down, #B23A2F)"
    : "var(--qc-warn, #B4731A)";

  // ic_metrics: bar color and fill driven by status
  const icMetrics = overviewData?.ic_metrics ?? [];
  function icBarColor(status: string): string {
    if (status === "avoid")   return "var(--qc-down, #B23A2F)";
    if (status === "pending") return "var(--qc-ink-2)";
    // active — color per category
    return "var(--qc-ink-2)";
  }
  function icBarFill(status: string, category: string): number {
    if (status === "pending") return 0;
    if (category === "suggested_stop") return 65;
    if (category === "upside_target")  return 55;
    if (category === "time_horizon")   return 66;
    return 30;
  }
  function icValueColor(status: string): string {
    if (status === "avoid")   return "var(--qc-down, #B23A2F)";
    if (status === "pending") return "var(--qc-ink-2)";
    return "var(--qc-ink)";
  }

  return (
    <SectionShell>
      {/* Section header row: title + timestamp on same line */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-11)", letterSpacing: "var(--qc-track-eyebrow-l)", color: "var(--qc-ink)", textTransform: "uppercase" }}>
          Investment Conclusion
        </div>
        <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", letterSpacing: ".06em", whiteSpace: "nowrap", flexShrink: 0 }}>
          As of today · Valid 5 trading days
        </span>
      </div>

      {/* Thesis */}
      {investThesis && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.6 }}>
            <InlineMd text={investThesis} />
          </p>
        </div>
      )}

      {/* Hero row: small golden verdict card + 4-meter stats card */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, marginBottom: 14 }}>

        {/* Left: verdict + conviction — golden gradient card */}
        <section
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 18,
            padding: "16px 20px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: "55%",
              background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <MonoEyebrow style={{ marginBottom: 14 }}>Overall Verdict</MonoEyebrow>
            <div style={{ fontSize: "var(--qc-fz-30)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", letterSpacing: "-0.02em", color: verdictColor, lineHeight: 1 }}>
              {effectiveRating ?? "Hold"}
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: rKey === "buy" || rKey === "strong-buy" ? "var(--qc-up-soft, #EAF4EE)" : rKey === "sell" || rKey === "underperform" ? "var(--qc-down-soft, #FDECEA)" : "var(--qc-warn-soft, #FEF3E2)",
                  color: verdictColor,
                  fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-semi)", letterSpacing: "var(--qc-track-pill)", textTransform: "uppercase",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: verdictColor, display: "inline-block" }} />
                {pillLabel(rKey)}
              </span>
            </div>
            {/* Conviction meter */}
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 4, background: "var(--qc-chip, #F2F1EC)", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
                <span style={{
                  display: "block", height: "100%", borderRadius: 999,
                  width: conviction === "High" ? "100%" : conviction === "Moderate" ? "50%" : "20%",
                  background: verdictColor,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
              <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", marginTop: 4 }}>
                {conviction === "High" ? "Add aggressively on conviction" : conviction === "Low" ? "Build position carefully" : "Accumulate on dips carefully"}
              </div>
            </div>
          </div>
        </section>

        {/* Right: 4-meter stats — plain white */}
        <section
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 18,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {icMetrics.map((m) => (
              <div key={m.category}>
                <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--qc-ink-2)", marginBottom: 6 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: icValueColor(m.status), marginBottom: 6, letterSpacing: "-0.01em" }}>
                  {m.value}
                </div>
                <div style={{ height: 4, background: "var(--qc-chip, #F2F1EC)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                  <span style={{ display: "block", height: "100%", width: `${icBarFill(m.status, m.category)}%`, borderRadius: 999, background: icBarColor(m.status) }} />
                </div>
                {m.description && (
                  <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
                    <InlineMd text={m.description} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Combined card: Key Highlights, Key Risks, If You Own, If You Don't Own */}
      {(keyHighlights.length > 0 || keyRisks.length > 0) && (
        <div
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Top half: Key Highlights | Key Risks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[
              { items: keyHighlights.slice(0, 3), heading: "Key highlights", count: "reasons to own", color: "var(--qc-up, #1F7A4A)" },
              { items: keyRisks.slice(0, 3),      heading: "Key risks",      count: "reasons to wait", color: "var(--qc-down, #B23A2F)" },
            ].map(({ items, heading, count, color }, idx) => (
              <div
                key={heading}
                style={{
                  padding: "14px 16px",
                  borderRight: idx === 0 ? "1px solid var(--qc-hair)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <MonoEyebrow>{heading}</MonoEyebrow>
                  <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", letterSpacing: ".06em" }}>
                    {items.length} {count}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((h, i) => {
                    const [tagRaw, ...rest] = h.split(":");
                    const hasTag = rest.length > 0 && tagRaw.length < 20;
                    const body = hasTag ? rest.join(":").trim() : h;
                    const [first, ...more] = body.split(". ");
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: 2, background: color }} />
                        <div>
                          <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", lineHeight: 1.4 }}>{first}</div>
                          {more.length > 0 && (
                            <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", marginTop: 2, lineHeight: 1.45 }}>{more.join(". ")}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Horizontal divider */}
          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Bottom half: If You Own | If You Don't Own */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[actionOwn, actionDontOwn].map((act, idx) => (
              <div
                key={act.eyebrow}
                style={{
                  padding: "14px 16px",
                  borderRight: idx === 0 ? "1px solid var(--qc-hair)" : "none",
                }}
              >
                <MonoEyebrow style={{ marginBottom: 6 }}>{act.eyebrow}</MonoEyebrow>
                <div style={{ fontSize: "var(--qc-fz-14)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)", marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: verdictColor }}>→</span>
                  {act.title}
                </div>
                <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.5 }}>{act.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </SectionShell>
  );
}
