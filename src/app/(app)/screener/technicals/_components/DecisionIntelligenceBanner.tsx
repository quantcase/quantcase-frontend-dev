"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Brain, TrendingUp } from "lucide-react";
import type { DecisionIntelligence, DecisionIntelligenceIndicator } from "@/types/technicals";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentDot(sentiment: DecisionIntelligenceIndicator["sentiment"]) {
  if (sentiment === "positive") return "var(--qc-up)";
  if (sentiment === "negative") return "var(--qc-down)";
  if (sentiment === "transitional") return "var(--qc-warn)";
  return "var(--qc-ink-2)";
}

function sentimentTile(sentiment: DecisionIntelligenceIndicator["sentiment"]) {
  if (sentiment === "positive") return { border: "rgba(31,122,74,0.25)", bg: "var(--qc-up-soft)" };
  if (sentiment === "negative") return { border: "rgba(178,58,47,0.25)", bg: "var(--qc-down-soft)" };
  if (sentiment === "transitional") return { border: "rgba(180,115,26,0.25)", bg: "var(--qc-warn-soft)" };
  return { border: "var(--qc-hair)", bg: "var(--qc-section)" };
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

function SignalTile({ indicator }: { indicator: DecisionIntelligenceIndicator }) {
  const [tip, setTip] = useState(false);
  const dot = sentimentDot(indicator.sentiment);
  const tile = sentimentTile(indicator.sentiment);
  const watchout = indicator.growthWatchout || indicator.valueWatchout;

  return (
    <div
      className="relative rounded-[8px] border px-3 py-2.5 cursor-default"
      style={{ borderColor: tile.border, background: tile.bg }}
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <p style={{ margin: 0, fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{indicator.name}</p>
      </div>
      <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: dot, fontFamily: "var(--qc-font-sans)", lineHeight: 1.3 }}>{indicator.tag}</p>
      {tip && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-50 w-60 rounded-[10px] border shadow-lg overflow-hidden"
          style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
        >
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--qc-hair)", background: tile.bg }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>{indicator.name}</p>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>{indicator.explanation}</p>
            {watchout && (
              <p style={{ margin: 0, fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", lineHeight: 1.45, fontFamily: "var(--qc-font-sans)" }}>
                <span style={{ fontWeight: "var(--qc-w-semi)" }}>Watch: </span>{watchout}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DecisionIntelligenceBanner({ di }: { di: DecisionIntelligence }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbol = searchParams.get("symbol") ?? "";

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
      </div>

      {/* ── Main card ── */}
      <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, overflow: "hidden" }}>

        {/* TAG banner */}
        <div style={{ background: tc, padding: "10px 14px" }}>
          <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>TAG</p>
          <p style={{ margin: 0, fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", color: "#fff", lineHeight: 1.3, fontFamily: "var(--qc-font-sans)" }}>{di.tag}</p>
        </div>

        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Lens / Ideal For / Timeframe */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[
              { label: "Lens", value: di.lens, sub: null },
              { label: "Ideal For", value: di.idealFor, sub: di.playbook !== "No Setup" ? di.playbook : null },
              { label: "Timeframe", value: di.timeframe, sub: null },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>{label}</p>
                <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", lineHeight: 1.3, fontFamily: "var(--qc-font-sans)" }}>{value}</p>
                {sub && <p style={{ margin: "1px 0 0", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)" }}>{sub}</p>}
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Actionable Insight */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Actionable Insight</p>
            {[
              { label: "New", text: di.actionableInsight.new_position, color: "var(--qc-up)" },
              { label: "Hold", text: di.actionableInsight.existing_position, color: "var(--qc-warn)" },
            ].map(({ label, text, color }) => (
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
            {di.actionableInsight.watch_for && (
              <div style={{
                marginTop: 2, padding: "7px 10px", borderRadius: 8,
                background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
              }}>
                <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>{di.actionableInsight.watch_for}</p>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Signal grid */}
          <div className="grid grid-cols-2 gap-2">
            {di.indicators.map((ind) => (
              <SignalTile key={ind.name} indicator={ind} />
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

      {/* What Can Change */}
      {di.whatCanChange?.length > 0 && (
        <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>What Can Change</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {di.whatCanChange.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "5px 0",
                borderBottom: i < di.whatCanChange.length - 1 ? "1px solid var(--qc-hair)" : "none",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-2)", flexShrink: 0, marginTop: 5 }} />
                <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wyckoff button */}
      {symbol && (
        <button
          onClick={() => router.push(`/screener/wyckoff?symbol=${symbol}`)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            width: "100%", padding: "10px 14px",
            background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14,
            cursor: "pointer", transition: "background .15s, border-color .15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--qc-chip)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--qc-ink-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--qc-card)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--qc-hair)";
          }}
        >
          <TrendingUp style={{ width: 13, height: 13, color: "var(--qc-ink-2)" }} />
          <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink)", textTransform: "uppercase" as const }}>
            Wyckoff Analysis
          </span>
        </button>
      )}

    </div>
  );
}
