"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface TractionTile {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface CardItem {
  headline: string;
  sub: string;
  delta: string;
  deltaColor: string;
  borderColor: string;
  icon: "check" | "up" | "down" | "warn";
}

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
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
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
  if (unit === "days") return `${v} days`;
  return `${v}`;
}

function sigDirection(s: TopSignal): "up" | "down" | "warn" {
  if (s.direction === "beat" || s.direction === "above") return "up";
  if (s.direction === "miss" || s.direction === "below") return "down";
  const text = (s.label + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("declin") || text.includes("pressure") || text.includes("head")) return "down";
  if (s.actual_value != null && s.actual_value > 0 &&
      (s.metric.toLowerCase().includes("growth") || s.metric.toLowerCase().includes("expansion"))) return "up";
  return "warn";
}

function buildTractionTiles(topSignals: TopSignal[], km: Record<string, string>): TractionTile[] {
  const withValue = topSignals.filter((s) => s.actual_value != null);
  const highImpact = withValue.filter((s) => s.impact === "high");
  const pool = highImpact.length >= 4 ? highImpact : withValue;
  const picked = pool.slice(0, 4);

  // Pad with key_metrics
  const kmEntries = Object.entries(km);
  let ki = 0;
  while (picked.length < 4 && ki < kmEntries.length) {
    const [k, v] = kmEntries[ki++];
    picked.push({
      signal_id: k, metric: k, label: k.replace(/_/g, " "),
      actual_value: null, guided_value: null, actual_date: null, guided_date: null,
      unit: null, delta: null, delta_pct: null, direction: null, impact: null, statement: v,
    });
  }

  return picked.slice(0, 4).map((s) => {
    const dir = sigDirection(s);
    return {
      label: s.label.slice(0, 22),
      value: s.actual_value != null ? formatVal(s) : (s.statement?.slice(0, 16) ?? "—"),
      sub: s.statement?.slice(0, 70) ?? "",
      color: dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)",
    };
  });
}

function buildCards(topSignals: TopSignal[], lens: LensDetail): CardItem[] {
  const cards: CardItem[] = [];

  // Positive signals
  const posSigs = topSignals.filter((s) =>
    s.actual_value != null && (s.direction === "beat" || s.direction === "above" ||
    (s.actual_value > 0 && s.metric.toLowerCase().includes("growth")))
  );
  posSigs.slice(0, 2).forEach((s) => {
    cards.push({
      icon: "up",
      headline: s.label,
      sub: s.statement?.slice(0, 100) ?? "",
      delta: formatVal(s),
      deltaColor: "var(--qc-up)",
      borderColor: "var(--qc-up)",
    });
  });

  // Warning signals (miss or declining)
  const warnSigs = topSignals.filter((s) =>
    s.direction === "miss" || s.direction === "below" ||
    (s.statement ?? "").toLowerCase().includes("declin") ||
    (s.statement ?? "").toLowerCase().includes("pressure")
  );
  if (warnSigs.length > 0) {
    warnSigs.slice(0, 1).forEach((s) => {
      cards.push({
        icon: "warn",
        headline: s.label,
        sub: s.statement?.slice(0, 100) ?? "",
        delta: formatVal(s),
        deltaColor: "var(--qc-warn)",
        borderColor: "var(--qc-warn)",
      });
    });
  } else if (lens.risks.length > 0) {
    cards.push({
      icon: "warn",
      headline: lens.risks[0].slice(0, 80),
      sub: "",
      delta: "Watch",
      deltaColor: "var(--qc-warn)",
      borderColor: "var(--qc-warn)",
    });
  }

  // Fill remaining from highlights as positive
  let hi = 0;
  while (cards.length < 4 && hi < lens.highlights.length) {
    cards.push({
      icon: "check",
      headline: lens.highlights[hi].slice(0, 80),
      sub: "",
      delta: "Positive",
      deltaColor: "var(--qc-up)",
      borderColor: "var(--qc-up)",
    });
    hi++;
  }

  // Fill remaining from any unused signals
  const usedIds = new Set(cards.map((_, i) => topSignals[i]?.signal_id));
  for (const s of topSignals) {
    if (cards.length >= 4) break;
    if (usedIds.has(s.signal_id)) continue;
    const dir = sigDirection(s);
    cards.push({
      icon: dir === "up" ? "up" : dir === "down" ? "down" : "warn",
      headline: s.label,
      sub: s.statement?.slice(0, 100) ?? "",
      delta: s.actual_value != null ? formatVal(s) : "—",
      deltaColor: dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)",
      borderColor: dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)",
    });
  }

  return cards.slice(0, 4);
}

const ICON_SYMBOLS: Record<string, string> = {
  check: "✓",
  up: "↑",
  down: "↓",
  warn: "!",
};

export function LensDetailCustomer({ lens }: Props) {
  const topSignals = dedup(lens.top_signals ?? []);
  const km = lens.key_metrics;

  const tiles = buildTractionTiles(topSignals, km);
  const cards = buildCards(topSignals, lens);

  const st = lens.status ?? "";
  const statusColor = st.toUpperCase() === "STRONG" ? "var(--qc-up)" : st.toUpperCase() === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)";

  const summaryMetrics = tiles.slice(0, 3).map((t) => ({
    label: t.label,
    value: t.value,
    sub: t.sub.slice(0, 40),
  }));

  // Quote: use best statement from top signals
  const quoteSig = topSignals.find((s) => s.statement && s.statement.length > 80);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Customer Traction header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            CUSTOMER TRACTION
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {st.charAt(0).toUpperCase() + st.slice(1).toLowerCase()}
          </span>
        </div>

        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            {lens.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 0 }}>
          {tiles.map((tile, i) => (
            <div key={i} style={{
              padding: "16px 14px", background: "var(--qc-card)",
              borderRight: i < tiles.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              display: "flex", flexDirection: "column", gap: 5,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: tile.color, margin: 0 }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
                {tile.value}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
                {tile.sub.slice(0, 60)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote / analyst note */}
      {(quoteSig || lens.takeaway) && (
        <div style={{
          borderLeft: "3px solid var(--qc-ink)",
          paddingLeft: 16, paddingTop: 4, paddingBottom: 4, margin: "0 2px",
        }}>
          <p style={{
            fontSize: 13, fontStyle: "italic",
            color: "var(--qc-ink)", margin: "0 0 6px", lineHeight: 1.65,
            fontFamily: "var(--qc-font-serif, Georgia, serif)",
          }}>
            {quoteSig?.statement?.slice(0, 200) ?? lens.takeaway?.slice(0, 200) ?? ""}
          </p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
            Quantcase competitive analysis
          </p>
        </div>
      )}

      {/* Signal cards — 2×2 grid */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              padding: "13px 14px",
              background: "var(--qc-card)",
              border: `1px solid ${card.borderColor}30`,
              borderLeft: `3px solid ${card.borderColor}`,
              borderRadius: 8,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: card.borderColor, fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
                    {ICON_SYMBOLS[card.icon]}
                  </span>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.35 }}>
                    {card.headline}
                  </p>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: 10, fontWeight: 700,
                  color: card.deltaColor, whiteSpace: "nowrap",
                  border: `1px solid ${card.deltaColor}40`,
                  borderRadius: 4, padding: "2px 7px",
                }}>
                  {card.delta}
                </span>
              </div>
              {card.sub && (
                <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4, paddingLeft: 21 }}>
                  {card.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Risks section if no cards could fill */}
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
