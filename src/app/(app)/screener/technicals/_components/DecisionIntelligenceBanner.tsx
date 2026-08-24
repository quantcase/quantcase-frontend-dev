"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, Braces, Brain, Loader2, RefreshCw, TrendingUp, type LucideIcon } from "lucide-react";
import type {
  ActionableInsight,
  DecisionIntelligence,
  DecisionIntelligenceIndicator,
  StockTypeLabel,
  TechnicalsScores,
} from "@/types/technicals";
import { SignalCard, type SignalSentiment } from "@/components/overview/signal-card";
import { TechnicalsScoreDial } from "./TechnicalsScoreDial";
import { RawDataDialog } from "./RawDataDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSignalSentiment(sentiment: DecisionIntelligenceIndicator["sentiment"]): SignalSentiment {
  if (sentiment === "positive") return "positive";
  if (sentiment === "negative") return "negative";
  return "neutral"; // "transitional" / "neutral" both render as amber
}

type Horizon = "SWING" | "POSITIONAL" | "INVESTOR";

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "SWING", label: "Swing" },
  { id: "POSITIONAL", label: "Positional" },
  { id: "INVESTOR", label: "Investor" },
];

/** `.actionableInsight` is the swing variant; the other two are suffixed. */
function insightFor(di: DecisionIntelligence, horizon: Horizon): ActionableInsight | null {
  if (horizon === "POSITIONAL") return di.actionableInsight_positional ?? null;
  if (horizon === "INVESTOR") return di.actionableInsight_investor ?? null;
  return di.actionableInsight ?? null;
}

function hasContent(insight: ActionableInsight | null): boolean {
  return !!(insight && (insight.new_position || insight.existing_position || insight.watch_for));
}

/**
 * Prefer the horizon the model scored highest, then whatever the narrative
 * implies — but always land on a horizon that actually has content.
 */
function defaultHorizon(di: DecisionIntelligence): Horizon {
  const scored = di.idealForScores;
  let preferred: Horizon | null = null;

  if (scored) {
    const swingScore = scored.swing ?? 0;
    const posScore = scored.positional ?? 0;
    const invScore = scored.investor ?? 0;
    
    const maxScore = Math.max(swingScore, posScore, invScore);
    const maxCount = [swingScore, posScore, invScore].filter((s) => s === maxScore).length;

    if (maxCount === 1) {
      if (swingScore === maxScore) preferred = "SWING";
      else if (posScore === maxScore) preferred = "POSITIONAL";
      else preferred = "INVESTOR";
    }
  }

  if (!preferred) {
    const hint = `${di.idealFor ?? ""} ${di.timeframe ?? ""}`.toLowerCase();
    if (hint.includes("swing")) preferred = "SWING";
    else if (hint.includes("position")) preferred = "POSITIONAL";
    else if (hint.includes("investor")) preferred = "INVESTOR";
    else preferred = "SWING";
  }

  if (hasContent(insightFor(di, preferred))) return preferred;
  return HORIZONS.find((h) => hasContent(insightFor(di, h.id)))?.id ?? preferred;
}

function horizonScore(di: DecisionIntelligence, horizon: Horizon): number | null {
  const s = di.idealForScores;
  if (!s) return null;
  if (horizon === "POSITIONAL") return s.positional ?? null;
  if (horizon === "INVESTOR") return s.investor ?? null;
  return s.swing ?? null;
}

function tagColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("bullish") || t.includes("buy") || t.includes("strong")) return "var(--qc-up)";
  if (t.includes("bearish") || t.includes("sell") || t.includes("avoid")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

function convictionBarWidth(score: number | undefined, level: string | undefined): string {
  if (score != null) return `${Math.min(100, Math.max(0, score))}%`;
  const l = (level ?? "").toLowerCase();
  if (l === "high") return "100%";
  if (l === "medium") return "66%";
  return "33%";
}

function convictionBarColor(level: string | undefined): string {
  const l = (level ?? "").toLowerCase();
  if (l === "high") return "var(--qc-up)";
  if (l === "medium") return "var(--qc-warn)";
  return "var(--qc-down)";
}

// ─── Signal tile ──────────────────────────────────────────────────────────────

function SignalTile({
  indicator,
  stockType,
  tooltipAlign = "left",
}: {
  indicator: DecisionIntelligenceIndicator;
  stockType: StockTypeLabel | null;
  tooltipAlign?: "left" | "right";
}) {
  // stock_type picks the lens; Mixed (the common case) falls back to whichever exists.
  const watchout =
    stockType === "Value"
      ? indicator.valueWatchout || indicator.growthWatchout
      : indicator.growthWatchout || indicator.valueWatchout;

  return (
    <SignalCard
      label={indicator.name}
      value={indicator.tag}
      sentiment={toSignalSentiment(indicator.sentiment)}
      tooltipAlign={tooltipAlign}
      tooltip={
        indicator.explanation
          ? {
              title: indicator.name,
              description: indicator.explanation,
              watch: watchout ?? undefined,
            }
          : undefined
      }
    />
  );
}

// ─── Shell button ─────────────────────────────────────────────────────────────

/** The card-footer button: full-width when alone, half-width inside the grid row. */
function ShellButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  title,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        width: "100%", padding: "10px 14px",
        background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s, border-color .15s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "var(--qc-chip)";
        e.currentTarget.style.borderColor = "var(--qc-ink-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--qc-card)";
        e.currentTarget.style.borderColor = "var(--qc-hair)";
      }}
    >
      <Icon style={{ width: 13, height: 13, color: "var(--qc-ink-2)" }} />
      <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink)", textTransform: "uppercase" as const }}>
        {label}
      </span>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface BannerProps {
  di: DecisionIntelligence;
  stockType?: StockTypeLabel | null;
  /** Technical score — rendered as the header ring with a hover breakdown. */
  scores?: TechnicalsScores | null;
  /** A newer insight is generating — this one is stale but still worth showing. */
  isUpdating?: boolean;
  onRefresh?: () => void;
  refreshDisabled?: boolean;
}

export function DecisionIntelligenceBanner({
  di,
  stockType = null,
  scores = null,
  isUpdating,
  onRefresh,
  refreshDisabled,
}: BannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbol = searchParams.get("symbol") ?? "";

  const [horizon, setHorizon] = useState<Horizon>(() => defaultHorizon(di));
  const [showRaw, setShowRaw] = useState(false);
  const activeInsight = insightFor(di, horizon);
  const anyInsight = HORIZONS.some((h) => hasContent(insightFor(di, h.id)));

  const tc = tagColor(di.tag);
  const barWidth = convictionBarWidth(di.convictionScore, di.convictionLevel);
  const barColor = convictionBarColor(di.convictionLevel);
  const score = di.convictionScore != null ? `${di.convictionLevel} — ${di.convictionScore}/100` : di.convictionLevel;

  return (
    <div style={{
      background: "var(--qc-section)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 18,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 2px" }}>
        <div style={{ padding: 6, borderRadius: 8, display: "grid", placeItems: "center", border: "1px solid var(--qc-hair)", background: "var(--qc-chip)" }}>
          <Brain style={{ width: 14, height: 14, color: "var(--qc-ink)" }} />
        </div>
        <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", letterSpacing: "0.01em", fontFamily: "var(--qc-font-sans)" }}>
          Decision Intelligence
        </span>
        {isUpdating && (
          <span
            title="A newer analysis is generating; showing the previous one."
            className="inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5"
            style={{ background: "var(--qc-blue-soft)", color: "var(--qc-blue)" }}
          >
            <Loader2 className="animate-spin" style={{ width: 9, height: 9 }} />
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Updating
            </span>
          </span>
        )}
        <div style={{ flex: 1 }} />

        <TechnicalsScoreDial scores={scores} />
      </div>

      {/* ── Main card ── */}
      <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, overflow: "hidden" }}>

        {/* TAG banner */}
        <div style={{ background: tc, padding: "10px 14px" }}>
          {di.breakoutQuality && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 3 }}>
              <span style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#fff", background: "rgba(255,255,255,0.22)",
                borderRadius: 4, padding: "2px 6px",
              }}>
                {di.breakoutQuality}
              </span>
            </div>
          )}
          <p style={{ margin: 0, fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", color: "#fff", lineHeight: 1.3, fontFamily: "var(--qc-font-sans)" }}>{di.tag}</p>
          {di.currentRegime?.label && (
            <p style={{ margin: "4px 0 0", fontSize: "var(--qc-fz-11)", color: "rgba(255,255,255,0.85)", lineHeight: 1.4, fontFamily: "var(--qc-font-sans)" }}>
              {di.currentRegime.label}
              {di.currentRegime.description ? ` — ${di.currentRegime.description}` : ""}
            </p>
          )}
        </div>

        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Lens / Ideal For / Timeframe */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[
              { label: "Lens", value: di.lens, sub: null },
              { label: "Ideal For", value: di.idealFor, sub: null },
              { label: "Timeframe", value: di.timeframe, sub: null },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>{label}</p>
                <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", lineHeight: 1.3, fontFamily: "var(--qc-font-sans)" }}>{value}</p>
                {sub && <p style={{ margin: "1px 0 0", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)" }}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* Actionable Insight — hidden entirely when the model skipped every
              horizon, rather than leaving orphan New/Hold labels behind. */}
          {anyInsight && (
            <>
              <div style={{ height: 1, background: "var(--qc-hair)" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Actionable Insight</p>
                </div>

                {/* Horizon selector — a segment with no content is disabled, not hidden,
                    so the set of horizons stays legible. */}
                <div
                  className="inline-flex rounded-[8px] border p-0.5 gap-0.5 self-start"
                  style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
                >
                  {HORIZONS.map(({ id, label }) => {
                    const available = hasContent(insightFor(di, id));
                    const active = horizon === id;
                    const score = horizonScore(di, id);
                    return (
                      <button
                        key={id}
                        onClick={() => available && setHorizon(id)}
                        disabled={!available}
                        title={available ? undefined : "Not provided for this stock"}
                        className="px-2.5 py-1 rounded-[6px] font-mono text-[10px] uppercase tracking-[0.1em] transition-all whitespace-nowrap"
                        style={
                          active
                            ? { background: "var(--qc-ink)", color: "var(--qc-card)" }
                            : { color: available ? "var(--qc-ink-2)" : "var(--qc-hair)", cursor: available ? "pointer" : "not-allowed" }
                        }
                      >
                        {label}
                        {/* 0–6: six indicators, one vote each. Not a percentage. */}
                        {score != null && <span style={{ marginLeft: 4, opacity: 0.7 }}>{score}/6</span>}
                      </button>
                    );
                  })}
                </div>

                {[
                  { label: "New", text: activeInsight?.new_position, color: "var(--qc-up)" },
                  { label: "Hold", text: activeInsight?.existing_position, color: "var(--qc-warn)" },
                ]
                  .filter(({ text }) => !!text)
                  .map(({ label, text, color }) => (
                    <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{
                        flexShrink: 0, marginTop: 1,
                        background: color, color: "#fff",
                        fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
                        fontWeight: "var(--qc-w-semi)", borderRadius: 4,
                        padding: "1px 5px", letterSpacing: "0.06em",
                      }}>{label}</span>
                      <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>{text}</p>
                    </div>
                  ))}

                {activeInsight?.watch_for && (
                  <div style={{
                    marginTop: 2, padding: "7px 10px", borderRadius: 8,
                    background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                  }}>
                    <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>{activeInsight.watch_for}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Priority Watchout — the single most important risk line in the payload */}
          {di.priorityWatchout && (
            <>
              <div style={{ height: 1, background: "var(--qc-hair)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <AlertCircle style={{ width: 12, height: 12, color: "var(--qc-warn)" }} />
                  <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Priority Watchout
                  </span>
                </div>
                <div style={{ padding: "7px 10px", borderRadius: 8, background: "var(--qc-warn-soft)" }}>
                  <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-warn)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>
                    {di.priorityWatchout}
                  </p>
                </div>
              </div>
            </>
          )}

          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Signal grid */}
          <div className="grid grid-cols-2 gap-2">
            {di.indicators.map((ind, i) => (
              <SignalTile
                key={ind.id ?? ind.name}
                indicator={ind}
                stockType={stockType}
                tooltipAlign={i % 2 === 1 ? "right" : "left"}
              />
            ))}
          </div>

          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Conviction */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Conviction</span>
              <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: barColor, fontFamily: "var(--qc-font-sans)" }}>{score}</span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, width: barWidth, background: barColor, transition: "width .4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Low", "Medium", "High"].map((l) => (
                <span key={l} style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)" }}>{l}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* "What Can Change" lives in the left column alongside Levels To Watch —
          see the technicals page layout. */}

      {/* Wyckoff button - Hidden as requested */}
      {/* {symbol && (
        <ShellButton icon={TrendingUp} label="Wyckoff Analysis" onClick={() => router.push(`/screener/wyckoff?symbol=${symbol}`)} />
      )} */}

      {/* Utility row — regenerate the insight / inspect the payload behind it - Hidden as requested */}
      {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ShellButton
          icon={RefreshCw}
          label="Refresh"
          onClick={onRefresh}
          disabled={!onRefresh || refreshDisabled}
          title="Regenerate the AI analysis"
        />
        <ShellButton
          icon={Braces}
          label="Data"
          onClick={() => setShowRaw(true)}
          title="View the raw Decision Intelligence payload"
        />
      </div> */}

      {showRaw && (
        <RawDataDialog
          title={`Decision Intelligence — ${symbol || "payload"}`}
          data={di}
          onClose={() => setShowRaw(false)}
        />
      )}

    </div>
  );
}
