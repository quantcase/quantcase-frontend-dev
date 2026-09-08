"use client";

import React, { useMemo, useState } from "react";
import { Loader2, RefreshCw, Braces } from "lucide-react";
import type {
  ActionableInsight,
  DecisionIntelligence,
  DecisionIntelligenceIndicator,
  StockTypeLabel,
  TechnicalsScores,
} from "@/types/technicals";
import { SCORE_MODULES } from "@/lib/technicals-scores";
import { RawDataDialog } from "./RawDataDialog";

// ─── Constants & Mappings from decision_intelligence_v4 ─────────────────────────

const LABELS: Record<string, string> = {
  market_structure: "Market Structure",
  capital_participation: "Capital Participation",
  price_architecture: "Price Architecture",
  trend_direction: "Trend Direction",
  trend_quality: "Trend Quality",
  momentum: "Momentum",
  volatility: "Volatility",
  relative_strength: "Relative Strength",
};

const ORDERED_INDICATOR_IDS: string[] = [
  "market_structure",
  "capital_participation",
  "price_architecture",
  "trend_direction",
  "trend_quality",
  "momentum",
  "volatility",
  "relative_strength",
];

type HorizonKey = "swing" | "positional" | "investor";

const HORIZON_LABEL: Record<HorizonKey, string> = {
  swing: "SWING",
  positional: "POSITIONAL",
  investor: "INVESTOR",
};

const HORIZON_TRADING_STYLE: Record<HorizonKey, string> = {
  swing: "short-term trading",
  positional: "medium-term trading",
  investor: "long-term investing",
};

// Fixed per horizon — independent of any data field, matches the prompt's timeframe definition.
const HORIZON_TIMEFRAME: Record<HorizonKey, string> = {
  swing: "0-3 Months",
  positional: "3-6 Months",
  investor: "> 6 Months",
};

const IDEAL_FOR_HORIZON: Record<string, string> = {
  "Swing Entry": "Swing",
  "Positional Add": "Positional",
  "Investor Entry": "Investor",
  "Not Suitable": "",
};

// ─── Formatting Helpers ────────────────────────────────────────────────────────

function fmtLevel(v: number | string | null | undefined): string {
  if (v === undefined || v === null || v === "") return "—";
  const num = typeof v === "number" ? v : parseFloat(String(v));
  if (isNaN(num)) return "—";
  return Math.round(num).toLocaleString("en-IN");
}

function horizonFit(score: number): { level: "strong" | "weak"; phrase: string } {
  if (score <= 1) return { level: "weak", phrase: "Not a fit right now" };
  if (score <= 3) return { level: "weak", phrase: "Possible, but not compelling" };
  return { level: "strong", phrase: "Strong fit" };
}

function getHorizonScore(di: DecisionIntelligence, horizon: HorizonKey): number {
  if (horizon === "swing") return di.swingScore ?? di.idealForScores?.swing ?? 0;
  if (horizon === "positional") return di.positionalScore ?? di.idealForScores?.positional ?? 0;
  return di.investorScore ?? di.idealForScores?.investor ?? 0;
}

function getInsightForHorizon(di: DecisionIntelligence, horizon: HorizonKey): ActionableInsight | null {
  if (Array.isArray(di.actionableInsights) && di.actionableInsights.length > 0) {
    const found = di.actionableInsights.find(
      (a) => a?.horizon?.toLowerCase() === horizon
    );
    if (found) return found;
  }
  if (horizon === "positional") return di.actionableInsight_positional ?? null;
  if (horizon === "investor") return di.actionableInsight_investor ?? null;
  return di.actionableInsight ?? null;
}

function getInitialHorizon(di: DecisionIntelligence): HorizonKey {
  const hint = (di.idealFor || "").toLowerCase();
  if (hint.includes("position")) return "positional";
  if (hint.includes("invest")) return "investor";
  if (hint.includes("swing")) return "swing";
  return "swing";
}

// ─── Signal Tile Component ─────────────────────────────────────────────────────

function SignalTile({
  id,
  indicator,
  stockType,
  align = "left",
}: {
  id: string;
  indicator?: DecisionIntelligenceIndicator;
  stockType?: StockTypeLabel | null;
  align?: "left" | "right";
}) {
  const [showTip, setShowTip] = useState(false);

  const label = (LABELS[id] || indicator?.name || id.replace(/_/g, " ")).toUpperCase();
  const tag = indicator?.tag || "—";
  const sentiment = (indicator?.sentiment || "transitional").toLowerCase();

  const isPositive = sentiment === "positive" || sentiment === "bullish";
  const isNegative = sentiment === "negative" || sentiment === "bearish";
  const sentimentClass = isPositive ? "positive" : isNegative ? "negative" : "transitional";

  const watchout =
    stockType === "Value"
      ? indicator?.valueWatchout || indicator?.growthWatchout
      : indicator?.growthWatchout || indicator?.valueWatchout;

  const hasTooltip = Boolean(indicator?.explanation || watchout);

  return (
    <div
      className={`relative rounded-[10px] p-[11px_12px] transition-all cursor-default select-none ${
        sentimentClass === "positive"
          ? "bg-[#e7f4ed]"
          : sentimentClass === "negative"
          ? "bg-[#fbe9ea]"
          : "bg-[#fbf1de]"
      }`}
      onMouseEnter={hasTooltip ? () => setShowTip(true) : undefined}
      onMouseLeave={hasTooltip ? () => setShowTip(false) : undefined}
    >
      <div className="text-[9.5px] font-semibold tracking-[0.03em] text-[#6b7178] mb-1">
        {label}
      </div>
      <div
        className={`text-[12.5px] font-bold leading-[1.35] ${
          sentimentClass === "positive"
            ? "text-[#20744a]"
            : sentimentClass === "negative"
            ? "text-[#b13a4c]"
            : "text-[#9a6b1f]"
        }`}
      >
        {tag}
      </div>

      {showTip && hasTooltip && (
        <div
          className={`absolute bottom-full mb-2 z-50 w-64 p-3 rounded-lg bg-[#1a1c1e] text-white shadow-xl text-[11.5px] leading-relaxed pointer-events-none transition-opacity ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="font-semibold text-white mb-1">{LABELS[id] || indicator?.name}</p>
          {indicator?.explanation && <p className="text-white/80">{indicator.explanation}</p>}
          {watchout && (
            <p className="text-[#e3ab5c] mt-1.5 text-[10.5px]">
              <strong className="text-white/90">Watch:</strong> {watchout}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Decision Intelligence Banner ─────────────────────────────────────────

export interface BannerProps {
  di: DecisionIntelligence;
  stockType?: StockTypeLabel | null;
  /** Technical score — rendered as the header ring with an optional breakdown. */
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
  const [activeHorizon, setActiveHorizon] = useState<HorizonKey>(() => getInitialHorizon(di));
  const [showRaw, setShowRaw] = useState(false);
  const [showScoresPopover, setShowScoresPopover] = useState(false);

  // Score & Grade calculation
  const score = scores?.final_score ?? di.convictionScore ?? 0;
  const grade = scores?.grade || (score >= 85 ? "A+" : score >= 70 ? "A" : score >= 55 ? "B" : score >= 40 ? "C" : "D");

  // SVG Score Ring constants (radius 19 matches HTML)
  const radius = 19;
  const circumference = 2 * Math.PI * radius; // ~119.38
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  // Fit Badge logic
  const fitHorizon =
    IDEAL_FOR_HORIZON[di.idealFor] ||
    (di.idealFor?.toLowerCase().includes("swing")
      ? "Swing"
      : di.idealFor?.toLowerCase().includes("position")
      ? "Positional"
      : di.idealFor?.toLowerCase().includes("invest")
      ? "Investor"
      : "");
  const fitBadgeText = fitHorizon ? `Best Fit: ${fitHorizon}` : "Not suitable right now";

  // Subtitle: use bottomLine if present, fallback to currentRegime description
  const bannerSub =
    di.bottomLine ||
    (di.currentRegime?.description
      ? `${di.currentRegime.label ? di.currentRegime.label + " — " : ""}${di.currentRegime.description}`
      : di.currentRegime?.label) ||
    "";

  // Active insight data
  const activeInsight = useMemo(() => getInsightForHorizon(di, activeHorizon), [di, activeHorizon]);
  const activeScore = getHorizonScore(di, activeHorizon);
  const fit = horizonFit(activeScore);

  // Indicators lookup dictionary
  const indicatorsMap = useMemo(() => {
    const map = new Map<string, DecisionIntelligenceIndicator>();
    (di.indicators || []).forEach((ind) => {
      if (ind.id) map.set(ind.id, ind);
      if (ind.name) map.set(ind.name.toLowerCase().replace(/\s+/g, "_"), ind);
    });
    return map;
  }, [di.indicators]);

  return (
    <div
      className="w-full bg-white border border-[#e6e7e5] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(20,20,20,0.04)] font-sans text-[#1a1c1e]"
      style={{
        background: "var(--qc-card, #ffffff)",
        borderColor: "var(--qc-hair, #e6e7e5)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-[#eeefed]"
        style={{ borderColor: "var(--qc-hair, #eeefed)" }}
      >
        <div className="flex items-center gap-[9px]">
          {/* Orbital / atom logo mark from v4 HTML */}
          <svg className="w-[22px] h-[22px] shrink-0 text-[#1a1c1e]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="9.5" ry="3.6" stroke="currentColor" strokeWidth="1.3" />
            <ellipse
              cx="12"
              cy="12"
              rx="9.5"
              ry="3.6"
              stroke="currentColor"
              strokeWidth="1.3"
              transform="rotate(60 12 12)"
            />
          </svg>
          <span className="text-[14px] font-semibold text-[#1a1c1e]">Decision Intelligence</span>
        </div>

        <div className="flex items-center gap-2">
          {isUpdating && (
            <span
              title="A newer analysis is generating; showing the previous one."
              className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 bg-[var(--qc-blue-soft,#eef2ff)] text-[var(--qc-blue,#4338ca)] text-[9.5px] font-mono uppercase tracking-wider"
            >
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Updating
            </span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshDisabled}
              title="Refresh Technical Analysis"
              className="p-1 rounded text-[#9aa0a6] hover:text-[#1a1c1e] transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshDisabled ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowRaw(true)}
            title="View Raw Decision Intelligence Payload"
            className="p-1 rounded text-[#9aa0a6] hover:text-[#1a1c1e] transition-colors"
          >
            <Braces className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Banner (Dark stylized gradient) ── */}
      <div
        className="relative mx-5 mt-4 p-[18px_20px_20px] rounded-[10px] text-white overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(90,110,220,0.35), transparent 60%), linear-gradient(135deg, #241b3d, #120e1e)",
        }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.05em] text-white/50 uppercase">
              OUR READ ON THIS STOCK
            </span>
            {di.breakoutQuality && (
              <span className="text-[9.5px] font-bold tracking-[0.04em] px-2.5 py-0.5 rounded-full border border-[rgba(111,217,154,0.5)] text-[#6fd99a] bg-transparent">
                {di.breakoutQuality}
              </span>
            )}
          </div>

          {/* Score Ring on Dark with optional interactive breakdown */}
          <div
            className="relative w-[44px] h-[44px] shrink-0 cursor-pointer select-none"
            onMouseEnter={() => scores && setShowScoresPopover(true)}
            onMouseLeave={() => scores && setShowScoresPopover(false)}
            onClick={() => scores && setShowScoresPopover((v) => !v)}
            title={scores ? "Click/hover to see score breakdown" : undefined}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#b3701c"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference.toFixed(1)}
                strokeDashoffset={offset.toFixed(1)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[14px] font-semibold text-white">
              {Math.round(score)}
            </div>
            <div className="absolute -bottom-[3px] -right-[3px] w-[18px] h-[18px] rounded-full bg-[#2f7d54] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1c1533]">
              {grade}
            </div>

            {/* Hover breakdown popover */}
            {showScoresPopover && scores && (
              <div
                className="absolute right-0 top-full mt-2 z-50 w-64 p-3.5 bg-white border border-[#eeefed] rounded-xl shadow-2xl text-[#1a1c1e] text-left pointer-events-auto"
                style={{ background: "var(--qc-card, #ffffff)", borderColor: "var(--qc-hair, #eeefed)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#eeefed] mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#6b7178]">
                    Module Breakdown
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1a1c1e]">{scores.final_score}/100</span>
                </div>
                <div className="space-y-1.5">
                  {SCORE_MODULES.map(({ key, label, max }) => {
                    const val = scores[key as keyof TechnicalsScores] as number | undefined;
                    return (
                      <div key={key} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6b7178] truncate">{label}</span>
                        <span className="font-mono font-semibold ml-2 text-[#1a1c1e]">
                          {val != null ? `${val}/${max}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Tag */}
        <div className="text-[19px] font-bold leading-[1.3] mb-[9px]">{di.tag}</div>

        {/* Banner Sub */}
        {bannerSub && (
          <div className="text-[12.5px] leading-[1.55] text-white/65">{bannerSub}</div>
        )}

        {/* Banner Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: "LENS", value: di.lens },
            { label: "IDEAL FOR", value: di.idealFor },
            { label: "TIMEFRAME", value: di.timeframe },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline gap-1.5 px-3 py-[7px] rounded-full bg-white/[0.06] border border-white/[0.12] text-[11px]"
            >
              <span className="text-[9.5px] font-semibold tracking-[0.03em] text-white/45">{label}</span>
              <span className="font-semibold text-white">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section: READ THIS FOR YOUR KIND OF TRADING ── */}
      <div className="flex items-center gap-2 px-5 mt-[18px] mb-2.5">
        <div className="text-[11px] font-semibold tracking-[0.02em] text-[#9aa0a6] uppercase">
          READ THIS FOR YOUR KIND OF TRADING
        </div>
        <div
          className="text-[10.5px] font-semibold tracking-[0.01em] text-white px-[9px] py-[3px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(90,110,220,0.35), transparent 60%), linear-gradient(135deg, #241b3d, #120e1e)",
          }}
        >
          {fitBadgeText}
        </div>
      </div>

      {/* Pills: Horizon Selector */}
      <div className="flex gap-1.5 px-5 mb-3">
        {(["swing", "positional", "investor"] as HorizonKey[]).map((h) => {
          const isActive = activeHorizon === h;
          return (
            <button
              key={h}
              type="button"
              onClick={() => setActiveHorizon(h)}
              className={`flex-1 text-center py-2 px-1 rounded-full text-[11px] font-semibold tracking-[0.01em] transition-colors select-none ${
                isActive
                  ? "bg-[#1a1c1e] text-white"
                  : "bg-[#eeefed] text-[#6b7178] hover:bg-[#e6e7e5]"
              }`}
            >
              {HORIZON_LABEL[h]}
            </button>
          );
        })}
      </div>

      {/* Active Insight Panel */}
      <div className="mx-5 p-[14px_15px] bg-[#f6f7f6] border border-[#eeefed] rounded-[10px]">
        {/* Levels Grid: Timeframe / Entry / Stop / Target */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3.5">
          <div className="bg-white border border-[#eeefed] rounded-[10px] p-[8px_4px] text-center">
            <div className="text-[8.5px] font-semibold tracking-[0.03em] text-[#9aa0a6] mb-1 uppercase">
              TIMEFRAME
            </div>
            <div className="font-mono text-[12.5px] font-bold text-[#1a1c1e]">
              {HORIZON_TIMEFRAME[activeHorizon]}
            </div>
          </div>

          <div className="bg-white border border-[#eeefed] rounded-[10px] p-[8px_4px] text-center">
            <div className="text-[8.5px] font-semibold tracking-[0.03em] text-[#9aa0a6] mb-1 uppercase">
              ENTRY
            </div>
            <div className="font-mono text-[12.5px] font-bold text-[#1a1c1e]">
              {fmtLevel(activeInsight?.idealEntry)}
            </div>
          </div>

          <div className="bg-white border border-[#eeefed] rounded-[10px] p-[8px_4px] text-center">
            <div className="text-[8.5px] font-semibold tracking-[0.03em] text-[#9aa0a6] mb-1 uppercase">
              STOP
            </div>
            <div className="font-mono text-[12.5px] font-bold text-[#b13a4c]">
              {fmtLevel(activeInsight?.stopLoss)}
            </div>
          </div>

          <div className="bg-white border border-[#eeefed] rounded-[10px] p-[8px_4px] text-center">
            <div className="text-[8.5px] font-semibold tracking-[0.03em] text-[#9aa0a6] mb-1 uppercase">
              TARGET
            </div>
            <div className="font-mono text-[12.5px] font-bold text-[#20744a]">
              {fmtLevel(activeInsight?.target)}
            </div>
          </div>
        </div>

        {/* Fit Line */}
        <div
          className={`text-[12px] font-semibold mb-2.5 ${
            fit.level === "strong" ? "text-[#20744a]" : "text-[#9aa0a6]"
          }`}
        >
          {fit.phrase} for {HORIZON_TRADING_STYLE[activeHorizon]}
        </div>

        {/* Action Rows */}
        <div className="flex gap-[9px] py-[7px]">
          <span className="shrink-0 w-[78px] text-[10.5px] text-[#9aa0a6] pt-[1px]">If buying new</span>
          <span className="text-[12.5px] leading-[1.45] font-semibold text-[#1a1c1e]">
            {activeInsight?.new_position || "—"}
          </span>
        </div>

        <div className="flex gap-[9px] py-[7px] border-t border-[#eeefed]">
          <span className="shrink-0 w-[78px] text-[10.5px] text-[#9aa0a6] pt-[1px]">If holding</span>
          <span className="text-[12.5px] leading-[1.45] font-semibold text-[#1a1c1e]">
            {activeInsight?.existing_position || "—"}
          </span>
        </div>

        <div className="flex gap-[9px] py-[7px] border-t border-[#eeefed]">
          <span className="shrink-0 w-[78px] text-[10.5px] text-[#9aa0a6] pt-[1px]">Watch for</span>
          <span className="text-[12.5px] leading-[1.45] font-semibold text-[#1a1c1e]">
            {activeInsight?.watch_for || "—"}
          </span>
        </div>
      </div>

      {/* ── Section: SIGNAL BREAKDOWN ── */}
      <div className="text-[11px] font-semibold tracking-[0.02em] text-[#9aa0a6] px-5 mt-[18px] mb-2.5 uppercase">
        SIGNAL BREAKDOWN
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-5">
        {ORDERED_INDICATOR_IDS.map((id, index) => {
          const ind = indicatorsMap.get(id);
          return (
            <SignalTile
              key={id}
              id={id}
              indicator={ind}
              stockType={stockType}
              align={index % 2 === 1 ? "right" : "left"}
            />
          );
        })}
      </div>

      {/* ── Section: CONVICTION ── */}
      <div className="m-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[11px] font-semibold tracking-[0.02em] text-[#9aa0a6] uppercase">
            CONVICTION
          </span>
          <span className="font-mono text-[11px] font-semibold text-[#9a6b1f]">
            {di.convictionLevel} — {di.convictionScore}/100
          </span>
        </div>

        <div className="h-[5px] bg-[#eeefed] rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-[#b3701c] rounded-[3px] transition-[width] duration-400 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, di.convictionScore))}%` }}
          />
        </div>

        <div className="flex justify-between text-[9.5px] text-[#9aa0a6] mt-1.5">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      {/* Raw Payload Modal for diagnostics */}
      {showRaw && (
        <RawDataDialog
          title="Decision Intelligence Payload"
          data={di}
          onClose={() => setShowRaw(false)}
        />
      )}
    </div>
  );
}
