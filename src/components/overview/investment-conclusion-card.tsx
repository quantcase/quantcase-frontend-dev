"use client";

import type { DFactorResponse } from "@/types/deal";
import type { FinalTakeaways } from "@/types/opportunity";
import type { TechnicalsResponse } from "@/types/technicals";

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

  return (
    <div className="ic-section">
      <div className="ic-section-title">Investment Conclusion</div>

      {/* Hero row */}
      <div className="ic-hero-row">

        {/* Left: verdict hero */}
        <section className="ic-hero">
          <div className="ic-hero-top">
            <div className="ic-hero-eyebrow">Final call · Overall</div>
            <div className="ic-hero-date">As of today · Valid 5 trading days</div>
          </div>

          {/* Verdict + thesis */}
          <div className="ic-hero-body">
            <div className="ic-verdict">
              <span className="ic-verdict-tag">Verdict</span>
              {/* Show QC score rating as the primary big word */}
              <div className={`ic-verdict-word ${rKey}`}>{rating ?? "Hold"}</div>
              <div className="ic-verdict-sub">
                <span className={`ic-verdict-pill ${rKey}`}>
                  <span className="dot" />
                  {pillLabel(rKey)}
                </span>
                <span className="ic-verdict-conviction">Conviction · {conviction}</span>
              </div>
              {/* If deal data has a more specific label, show it beneath */}
              {verdictTitle && verdictTitle !== rating && (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 6 }}>
                  {verdictTitle}
                </div>
              )}
            </div>

            {investThesis && (
              <p className="ic-thesis" dangerouslySetInnerHTML={{ __html: investThesis }} />
            )}
          </div>

          {/* 4-meter row */}
          <div className="ic-meters">
            <div className="ic-meter">
              <div className="ic-meter-k">Entry trigger</div>
              <div className={`ic-meter-v${entryTrigger ? "" : " muted"}`}>
                {entryTrigger ?? "Pending"}
                {entryRationale && <span className="u">{entryRationale}</span>}
              </div>
              <div className="ic-meter-bar">
                <span style={{ width: `${entryFill}%`, background: "var(--qc-text-muted)" }} />
              </div>
            </div>

            <div className="ic-meter">
              <div className="ic-meter-k">Suggested stop</div>
              <div className={`ic-meter-v${stopLoss ? "" : " muted"}`}>
                {stopLoss ?? "—"}
              </div>
              <div className="ic-meter-bar">
                <span style={{ width: `${stopFill}%`, background: "var(--qc-down, #B23A2F)" }} />
              </div>
            </div>

            <div className="ic-meter">
              <div className="ic-meter-k">Upside target</div>
              <div className={`ic-meter-v${upside ? "" : " muted"}`}>
                {upside ?? "—"}
                {riskReward && <span className="u">· R/R {riskReward}</span>}
              </div>
              <div className="ic-meter-bar">
                <span style={{ width: `${upsideFill}%`, background: "var(--qc-up, #1F7A4A)" }} />
              </div>
            </div>

            <div className="ic-meter">
              <div className="ic-meter-k">Time horizon</div>
              <div className={`ic-meter-v${holdingPeriod ? "" : " muted"}`}>
                {holdingPeriod ?? "—"}
              </div>
              <div className="ic-meter-bar">
                <span style={{ width: `${timeFill}%`, background: "var(--qc-blue, #3A6BEF)" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Right: narrative aside */}
        <aside className="fx-narr">
          <div className="fx-narr-lime" />
          <div className="fx-narr-inner">
            <div className="fx-narr-eyebrow">Market context</div>
            <div className="fx-narr-title">
              {marketBias && marketCondition
                ? `${marketBias} bias — ${marketCondition.toLowerCase()}.`
                : "Market context unavailable for this analysis."}
            </div>
            <p className="fx-narr-body">
              {marketSummary ?? "Market analysis data is being loaded. Check the Technicals section for current signal readings."}
            </p>
            <div className="fx-narr-tags">
              {marketBias && (
                <span className="fx-tag">
                  <span className="d" style={{ background: marketBias.toLowerCase().includes("bear") ? "var(--qc-down)" : marketBias.toLowerCase().includes("bull") ? "var(--qc-up)" : "var(--qc-warn)" }} />
                  {marketBias}
                </span>
              )}
              {marketCondition && (
                <span className="fx-tag">
                  <span className="d" style={{ background: "var(--qc-warn)" }} />
                  {marketCondition}
                </span>
              )}
              {conviction && (
                <span className="fx-tag">
                  <span className="d" style={{ background: "var(--qc-text-muted)" }} />
                  Conviction {conviction}
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Pros & Cons */}
      {(keyHighlights.length > 0 || keyRisks.length > 0) && (
        <div className="ic-pro-con">

          {/* Key highlights */}
          <div className="ic-col">
            <div className="ic-col-head">
              <h4>
                <span className="swatch" style={{ background: "var(--qc-up, #1F7A4A)" }} />
                Key highlights
              </h4>
              <span className="count">{keyHighlights.length} reason{keyHighlights.length !== 1 ? "s" : ""} to own</span>
            </div>
            {keyHighlights.map((h, i) => {
              const [tagRaw, ...rest] = h.split(":");
              const hasTag = rest.length > 0 && tagRaw.length < 20;
              const tag  = hasTag ? tagRaw.trim() : null;
              const body = hasTag ? rest.join(":").trim() : h;
              return (
                <div key={i} className="ic-item">
                  {tag && <span className="ic-item-tag pos">{tag}</span>}
                  {!tag && <span className="ic-item-tag pos">Pro</span>}
                  <div className="ic-item-body">
                    <div className="ic-item-title">{body.split(". ")[0]}</div>
                    {body.split(". ").length > 1 && (
                      <div className="ic-item-sub">{body.split(". ").slice(1).join(". ")}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key risks */}
          <div className="ic-col">
            <div className="ic-col-head">
              <h4>
                <span className="swatch" style={{ background: "var(--qc-down, #B23A2F)" }} />
                Key risks
              </h4>
              <span className="count">{keyRisks.length} reason{keyRisks.length !== 1 ? "s" : ""} to wait</span>
            </div>
            {keyRisks.map((r, i) => {
              const [tagRaw, ...rest] = r.split(":");
              const hasTag = rest.length > 0 && tagRaw.length < 20;
              const tag  = hasTag ? tagRaw.trim() : null;
              const body = hasTag ? rest.join(":").trim() : r;
              return (
                <div key={i} className="ic-item">
                  {tag && <span className="ic-item-tag neg">{tag}</span>}
                  {!tag && <span className="ic-item-tag neg">Risk</span>}
                  <div className="ic-item-body">
                    <div className="ic-item-title">{body.split(". ")[0]}</div>
                    {body.split(". ").length > 1 && (
                      <div className="ic-item-sub">{body.split(". ").slice(1).join(". ")}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Action bar */}
      <div className="ic-actions">
        <div className="ic-act-col">
          <div className="ic-act-eyebrow">{actionOwn.eyebrow}</div>
          <div className="ic-act-title"><span className="ic-act-arrow">→</span>{actionOwn.title}</div>
          <div className="ic-act-sub">{actionOwn.sub}</div>
        </div>
        <div className="ic-act-col">
          <div className="ic-act-eyebrow">{actionDontOwn.eyebrow}</div>
          <div className="ic-act-title"><span className="ic-act-arrow">→</span>{actionDontOwn.title}</div>
          <div className="ic-act-sub">{actionDontOwn.sub}</div>
        </div>
      </div>

    </div>
  );
}
