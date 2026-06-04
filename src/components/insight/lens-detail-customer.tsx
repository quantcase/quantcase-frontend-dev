"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
  ticker?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function dedup(signals: TopSignal[]): TopSignal[] {
  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.signal_id)) return false;
    seen.add(s.signal_id);
    return true;
  });
}

function formatVal(s: TopSignal): string {
  const v = s.actual_value;
  if (v == null) return "—";
  const unit = s.unit ?? "";
  if (unit === "%") return `${v > 0 ? "+" : ""}${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "x") return `${v}x`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "₹") return `₹${v}`;
  if (unit === "users") {
    if (v >= 10_000_000) return `${(v / 10_000_000).toFixed(2)} Cr`;
    if (v >= 100_000) return `${(v / 100_000).toFixed(1)}L`;
    return v.toLocaleString("en-IN");
  }
  if (unit === "count") {
    if (v >= 100_000) return `${(v / 100_000).toFixed(1)}L`;
    return v.toLocaleString("en-IN");
  }
  // Bare large numbers — abbreviate using Indian scale
  if (typeof v === "number" && Math.abs(v) >= 100_000) {
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (abs >= 10_000_000) return `${sign}${(abs / 10_000_000).toFixed(2)} Cr`;
    return `${sign}${(abs / 100_000).toFixed(1)}L`;
  }
  return typeof v === "number" ? v.toLocaleString("en-IN") : `${v}`;
}

function statusColor(s: string | null | undefined): string {
  const u = (s ?? "").toUpperCase();
  if (u === "STRONG") return "var(--qc-up)";
  if (u === "WEAK") return "var(--qc-down)";
  return "var(--qc-warn)";
}

// Determine if a signal is positive, negative, or neutral
function sigSentiment(s: TopSignal): "up" | "down" | "warn" {
  if (s.direction === "beat" || s.direction === "above") return "up";
  if (s.direction === "miss" || s.direction === "below") return "down";
  const text = ((s.label ?? "") + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("declin") || text.includes("miss") || text.includes("pressure") || text.includes("headwind")) return "down";
  if (s.actual_value != null && s.actual_value > 0 && (
    s.metric.toLowerCase().includes("growth") ||
    s.metric.toLowerCase().includes("rev") ||
    s.metric.toLowerCase().includes("ebitda") ||
    s.metric.toLowerCase().includes("share")
  )) return "up";
  return "warn";
}

// Determine color for a value based on its content
function valueColor(s: TopSignal): string {
  const sentiment = sigSentiment(s);
  if (sentiment === "up") return "var(--qc-up)";
  if (sentiment === "down") return "var(--qc-down)";
  return "var(--qc-warn)";
}

// Format period from computed_at (e.g. "2025-12-31" → "Q3 FY26")
function periodFromDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  let quarter: number;
  let fyYear: number;
  // Indian FY: Apr=Q1, Jul=Q2, Oct=Q3, Jan=Q4
  if (month >= 4 && month <= 6) { quarter = 1; fyYear = year + 1; }
  else if (month >= 7 && month <= 9) { quarter = 2; fyYear = year + 1; }
  else if (month >= 10 && month <= 12) { quarter = 3; fyYear = year + 1; }
  else { quarter = 4; fyYear = year; }
  return `Q${quarter} FY${String(fyYear).slice(2)}`;
}

// Pick the period from the most recent actual_date among signals, else computed_at
function derivePeriod(signals: TopSignal[], computedAt: string | null): string {
  const dates = signals
    .map((s) => s.actual_date)
    .filter(Boolean)
    .sort()
    .reverse();
  return periodFromDate(dates[0] ?? computedAt);
}

// ── Tile selection ─────────────────────────────────────────────────────────────

interface TractionTile {
  label: string;
  value: string;
  sub: string;
  color: string;
}

function buildTractionTiles(topSignals: TopSignal[]): TractionTile[] {
  // Prefer high-impact signals with actual values, then all with values
  const withValue = topSignals.filter((s) => s.actual_value != null);
  const highImpact = withValue.filter((s) => s.impact === "high");
  // Deduplicate by metric (keep first per metric)
  const seen = new Set<string>();
  const dedupedPool: TopSignal[] = [];
  for (const s of (highImpact.length >= 2 ? highImpact : withValue)) {
    if (!seen.has(s.metric)) {
      seen.add(s.metric);
      dedupedPool.push(s);
    }
  }
  return dedupedPool.slice(0, 4).map((s) => ({
    label: s.label,
    value: formatVal(s),
    sub: s.statement?.slice(0, 70) ?? "",
    color: valueColor(s),
  }));
}

// ── Signal cards ───────────────────────────────────────────────────────────────

interface CardItem {
  sentiment: "up" | "down" | "warn";
  headline: string;
  sub: string;
  badge: string;
  badgeLabel: string;
}

function buildCards(topSignals: TopSignal[], lens: LensDetail): CardItem[] {
  const cards: CardItem[] = [];
  // Deduplicate by metric for cards
  const seenMetrics = new Set<string>();
  const dedupedSignals: TopSignal[] = [];
  for (const s of topSignals) {
    if (!seenMetrics.has(s.metric)) {
      seenMetrics.add(s.metric);
      dedupedSignals.push(s);
    }
  }

  // Collect positives (high-impact growth signals)
  const posSigs = dedupedSignals.filter((s) => sigSentiment(s) === "up" && s.impact === "high");
  // Collect watch/warn signals
  const warnSigs = dedupedSignals.filter((s) => sigSentiment(s) === "down" || s.direction === "miss");
  // Fill remaining from all signals
  const otherSigs = dedupedSignals.filter((s) => sigSentiment(s) === "up" && s.impact !== "high");

  const usedIds = new Set<string>();

  // Add top 2 positive high-impact
  for (const s of posSigs) {
    if (cards.length >= 2) break;
    cards.push({ sentiment: "up", headline: s.label, sub: s.statement?.slice(0, 100) ?? "", badge: formatVal(s), badgeLabel: "Lock-in" });
    usedIds.add(s.signal_id);
  }

  // Add 1 warn/risk signal if exists
  if (warnSigs.length > 0 && cards.length < 4) {
    const s = warnSigs[0];
    if (!usedIds.has(s.signal_id)) {
      cards.push({ sentiment: "down", headline: s.label, sub: s.statement?.slice(0, 100) ?? "", badge: formatVal(s), badgeLabel: "Watch" });
      usedIds.add(s.signal_id);
    }
  } else if (lens.risks.length > 0 && cards.length < 4) {
    cards.push({ sentiment: "warn", headline: lens.risks[0].slice(0, 80), sub: "", badge: "Watch", badgeLabel: "Watch" });
  }

  // Fill remaining slots with other positives or any signal
  for (const s of [...otherSigs, ...dedupedSignals]) {
    if (cards.length >= 4) break;
    if (usedIds.has(s.signal_id)) continue;
    const sentiment = sigSentiment(s);
    cards.push({ sentiment, headline: s.label, sub: s.statement?.slice(0, 100) ?? "", badge: formatVal(s), badgeLabel: "" });
    usedIds.add(s.signal_id);
  }

  // Fill from highlights if still < 4
  let hi = 0;
  while (cards.length < 4 && hi < lens.highlights.length) {
    cards.push({ sentiment: "up", headline: lens.highlights[hi].slice(0, 80), sub: "", badge: "Positive", badgeLabel: "" });
    hi++;
  }

  return cards.slice(0, 4);
}

// ── sub-components ────────────────────────────────────────────────────────────

function TractionTile({ tile, isLast, highlight }: { tile: TractionTile; isLast: boolean; highlight?: boolean }) {
  return (
    <div style={{
      padding: "16px 14px",
      background: highlight ? `color-mix(in srgb, ${tile.color} 6%, var(--qc-card))` : "var(--qc-card)",
      borderRight: !isLast ? "1px solid var(--qc-hair)" : undefined,
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: tile.color, margin: 0 }}>
        {tile.label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
        {tile.value}
      </p>
      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
        {tile.sub.slice(0, 60)}
      </p>
    </div>
  );
}

function SignalCard({ card }: { card: CardItem }) {
  const borderColor = card.sentiment === "up" ? "var(--qc-up)" : card.sentiment === "down" ? "var(--qc-down)" : "var(--qc-warn)";
  const arrow = card.sentiment === "up" ? "✓" : card.sentiment === "down" ? "↓" : "!";

  // Badge styling: Lock-in = green outline, Watch = amber, default = neutral
  const badgeBorder = card.badgeLabel === "Lock-in" ? "var(--qc-up)"
    : card.badgeLabel === "Watch" ? "var(--qc-warn)"
    : borderColor;
  const badgeColor = card.badgeLabel === "Lock-in" ? "var(--qc-up)"
    : card.badgeLabel === "Watch" ? "var(--qc-warn)"
    : borderColor;

  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 8,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: borderColor, fontWeight: 700, fontSize: 14 }}>{arrow}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>{card.headline}</p>
        {card.sub && (
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>{card.sub}</p>
        )}
      </div>
      {card.badge && (
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 700,
          color: badgeColor, whiteSpace: "nowrap",
          border: `1px solid ${badgeBorder}50`,
          borderRadius: 4, padding: "2px 7px",
        }}>
          {card.badgeLabel || card.badge}
        </span>
      )}
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export function LensDetailCustomer({ lens }: Props) {
  const topSignals = dedup(lens.top_signals ?? []);

  const tiles = buildTractionTiles(topSignals);
  const cards = buildCards(topSignals, lens);

  const st = lens.status ?? "";
  const dotColor = statusColor(st);
  const statusLabel = st.charAt(0).toUpperCase() + st.slice(1).toLowerCase();

  const period = derivePeriod(topSignals, lens.computed_at);

  // Quote: prefer the longest statement among high-impact signals, then lens.takeaway
  const quoteSig = topSignals
    .filter((s) => s.statement && s.statement.length > 60)
    .sort((a, b) => (b.statement?.length ?? 0) - (a.statement?.length ?? 0))[0];
  const quoteText = quoteSig?.statement ?? lens.takeaway;

  const summaryMetrics = tiles.slice(0, 3).map((t) => ({
    label: t.label,
    value: t.value,
    sub: t.sub.slice(0, 40),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Customer Traction panel */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header row */}
        <div style={{
          padding: "10px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "var(--qc-ink-3)",
          }}>
            CUSTOMER TRACTION
          </span>
          {period && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: "var(--qc-ink-3)",
              border: "1px solid var(--qc-hair)",
              borderRadius: 4, padding: "1px 7px",
              background: "var(--qc-section)",
            }}>
              {period}
            </span>
          )}
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 600,
            color: dotColor, display: "flex", alignItems: "center", gap: 5,
            border: `1px solid ${dotColor}40`, borderRadius: 20, padding: "2px 10px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
            {statusLabel}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            {lens.description}
          </p>
        </div>

        {/* KPI Tiles — 2 or 4 columns */}
        {tiles.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(tiles.length, 4)}, 1fr)` }}>
            {tiles.map((tile, i) => (
              <TractionTile
                key={i}
                tile={tile}
                isLast={i === tiles.length - 1}
                highlight={tile.color === "var(--qc-down)" || tile.color === "var(--qc-warn)"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quote block */}
      {quoteText && (
        <div style={{
          borderLeft: "3px solid var(--qc-ink)",
          paddingLeft: 16, paddingTop: 4, paddingBottom: 4, margin: "0 2px",
        }}>
          <p style={{
            fontSize: 13, fontStyle: "italic",
            color: "var(--qc-ink)", margin: "0 0 6px", lineHeight: 1.65,
            fontFamily: "var(--qc-font-serif, Georgia, serif)",
          }}>
            {quoteText.slice(0, 240)}
          </p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
            Quantcase customer analysis
            {period ? ` · ${period}` : ""}
          </p>
        </div>
      )}

      {/* Signal cards — 2×2 grid */}
      {cards.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {cards.map((card, i) => (
            <SignalCard key={i} card={card} />
          ))}
        </div>
      )}

      {/* Risks section — shown when no cards available */}
      {cards.length === 0 && lens.risks.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              RISK FACTORS
            </p>
          </div>
          <div style={{ padding: "14px 16px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 10 }}>
            {lens.risks.slice(0, 4).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0 }}>↓</span>
                <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={summaryMetrics}
      />
    </div>
  );
}
