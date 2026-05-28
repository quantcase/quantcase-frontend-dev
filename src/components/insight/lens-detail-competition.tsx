"use client";

import { useState, useEffect } from "react";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import { BACKEND_URL } from "@/lib/constants";

interface Props {
  lens: LensDetail;
  signals: Signal[];
  ticker?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
    }}>
      {children}
    </p>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: active ? 700 : 500,
      padding: "4px 12px", borderRadius: 20,
      border: `1px solid ${active ? "var(--qc-warn)" : "var(--qc-hair)"}`,
      color: active ? "var(--qc-warn)" : "var(--qc-ink-2)",
      background: active ? "var(--qc-warn-soft)" : "var(--qc-card)",
      whiteSpace: "nowrap", cursor: "default",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </span>
  );
}

function statusColor(s: string | null | undefined) {
  const u = (s ?? "").toUpperCase();
  if (u === "STRONG") return "var(--qc-up)";
  if (u === "WEAK") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function dedup(signals: TopSignal[]): TopSignal[] {
  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.signal_id)) return false;
    seen.add(s.signal_id);
    return true;
  });
}

function getKm(km: Record<string, string>, ...fragments: string[]): string {
  for (const key of Object.keys(km)) {
    if (fragments.every((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      return km[key];
    }
  }
  return "—";
}

function formatSigValue(s: TopSignal): string {
  if (s.actual_value == null) return "—";
  const v = s.actual_value;
  const unit = s.unit ?? "";
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  return `${v}`;
}

// ── sub-components ────────────────────────────────────────────────────────────

interface PillarTileProps {
  label: string;
  rating: string;
  sub: string;
  color: string;
  score: number;
  max: number;
}

function PillarTile({ label, rating, sub, color, score, max }: PillarTileProps) {
  return (
    <div style={{ padding: "16px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0, lineHeight: 1.1 }}>{rating}</p>
      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{sub}</p>
      <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
        {Array.from({ length: max }).map((_, j) => (
          <div key={j} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: j < score ? color : "var(--qc-hair)",
          }} />
        ))}
      </div>
    </div>
  );
}

interface SignalCardProps {
  icon: "check" | "up" | "down" | "warn";
  headline: string;
  sub: string;
  badge: string;
  badgeColor: string;
}

function SignalCard({ icon, headline, sub, badge, badgeColor }: SignalCardProps) {
  const isPos = icon === "check" || icon === "up";
  const borderColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";
  const arrow = icon === "check" ? "✓" : icon === "up" ? "↑" : icon === "warn" ? "!" : "↓";
  const arrowColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 8,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: arrowColor, fontWeight: 700, fontSize: 14 }}>{arrow}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>{headline}</p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>{sub}</p>
      </div>
      {badge && (
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: badgeColor, whiteSpace: "nowrap" }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Peer company card ─────────────────────────────────────────────────────────

function ratingColor(r: string) {
  const l = r.toLowerCase();
  if (l === "strong" || l === "excellent" || l.includes("high")) return "var(--qc-up)";
  if (l === "weak" || l === "poor" || l.includes("decl")) return "var(--qc-down)";
  if (l === "expensive" || l.includes("under") || l.includes("down")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

function RatingChip({ label, value }: { label: string; value: string }) {
  const color = ratingColor(value);
  return (
    <div style={{
      border: `1px solid ${color}44`,
      borderRadius: 8, padding: "6px 10px",
      display: "inline-flex", flexDirection: "column", gap: 1,
      background: `${color}08`,
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

interface PeerCardData {
  ticker: string;
  callId: string;
  competitionLens: LensDetail | null;
  managementScore: number | null;
  opportunityScore: number | null;
  dealScore: number | null;
}

function scoreLabel(score: number | null): string {
  if (score === null) return "N/A";
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Weak";
}

function buildPeerMetrics(km: Record<string, string>, topSignals: TopSignal[]) {
  // Pick up to 4 key metrics generically — prefer % growth signals, then whatever is available
  const sigItems = topSignals
    .filter((s) => s.actual_value != null)
    .slice(0, 4)
    .map((s) => ({ label: s.label.slice(0, 16), value: formatSigValue(s) }));

  if (sigItems.length >= 4) return sigItems;

  // Pad with key_metrics
  const kmItems = Object.entries(km).slice(0, 4 - sigItems.length).map(([k, v]) => ({
    label: k.replace(/_/g, " ").slice(0, 16),
    value: String(v).slice(0, 14),
  }));

  return [...sigItems, ...kmItems];
}

function CompetitionPeerCard({ ticker, data }: { ticker: string; data: PeerCardData }) {
  const competitionLens = data.competitionLens;
  const km = competitionLens?.key_metrics ?? {};
  const topSigs = competitionLens?.top_signals ?? [];
  const statusCol = competitionLens ? statusColor(competitionLens.status) : "var(--qc-ink-3)";
  const metrics = buildPeerMetrics(km, topSigs).slice(0, 4);

  const mgmt = scoreLabel(data.managementScore);
  const opp = scoreLabel(data.opportunityScore);
  const deal = scoreLabel(data.dealScore);

  return (
    <div style={{ padding: "18px 20px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>NSE: {ticker}</p>
        </div>
        {competitionLens && (
          <span style={{ fontSize: 10, fontWeight: 700, color: statusCol, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {competitionLens.status}
          </span>
        )}
      </div>

      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
          M.O.D. FRAMEWORK
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <RatingChip label="MANAGEMENT" value={mgmt} />
          <RatingChip label="OPPORTUNITY" value={opp} />
          <RatingChip label="DEAL" value={deal} />
        </div>
      </div>

      {metrics.length > 0 && (
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            KEY METRICS
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {metrics.map((f) => (
              <RatingChip key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Primary card (current company) ────────────────────────────────────────────

function PrimaryPeerCard({ ticker, lens }: { ticker: string; lens: LensDetail }) {
  const km = lens.key_metrics;
  const topSigs = dedup(lens.top_signals ?? []);
  const statusCol = statusColor(lens.status);
  const metrics = buildPeerMetrics(km, topSigs).slice(0, 4);

  const modLabel = lens.score >= 70 ? "Strong" : lens.score >= 40 ? "Moderate" : "Weak";

  return (
    <div style={{ padding: "18px 20px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>NSE: {ticker}</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: statusCol, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {lens.status}
        </span>
      </div>

      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
          M.O.D. FRAMEWORK
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <RatingChip label="OPPORTUNITY" value={modLabel} />
        </div>
      </div>

      {metrics.length > 0 && (
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            KEY METRICS
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {metrics.map((f) => (
              <RatingChip key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Peer slot ─────────────────────────────────────────────────────────────────

interface LensesApiResponse {
  ticker: string;
  callId: string;
  categories: Record<string, LensDetail[]>;
}

function PeerSlot({ ticker, onDeselect }: { ticker: string; onDeselect: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PeerCardData | null>(null);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`${BACKEND_URL}/api/lenses?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res: LensesApiResponse) => {
        const cats = res.categories ?? {};
        const competitionLens = cats.opportunity?.find((l) => l.slug === "competition" && l.computed) ?? null;
        const avg = (arr: LensDetail[]) => {
          const scores = arr.map((l) => l.score).filter((s): s is number => s !== null);
          return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        };
        setData({
          ticker,
          callId: res.callId,
          competitionLens,
          managementScore: avg(cats.management ?? []),
          opportunityScore: avg(cats.opportunity ?? []),
          dealScore: avg(cats.deal ?? []),
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  const cellStyle: React.CSSProperties = {
    background: "var(--qc-section)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const closeBtn = (
    <button
      onClick={onDeselect}
      style={{
        position: "absolute", top: 8, right: 8,
        background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
        borderRadius: 6, width: 22, height: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--qc-ink-3)", fontSize: 12, lineHeight: 1,
        zIndex: 1,
      }}
      aria-label={`Remove ${ticker}`}
    >
      ×
    </button>
  );

  if (loading) {
    return (
      <div style={{ ...cellStyle, alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", minHeight: 160 }}>
        {closeBtn}
        <div style={{
          width: 16, height: 16, border: "2px solid var(--qc-hair)",
          borderTopColor: "var(--qc-ink-3)", borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
          {ticker}
        </p>
      </div>
    );
  }

  const hasData = data && (data.competitionLens !== null || data.managementScore !== null);

  if (!hasData) {
    return (
      <div style={{ ...cellStyle, alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", minHeight: 160 }}>
        {closeBtn}
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>{ticker}</p>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
          Analysis not yet computed
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...cellStyle, flex: 1 }}>
      {closeBtn}
      <CompetitionPeerCard ticker={ticker} data={data} />
    </div>
  );
}

function PeerCell({ index: _index }: { index: number }) {
  return (
    <div style={{
      padding: "40px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, background: "var(--qc-section)", minHeight: 160,
    }}>
      <span style={{ fontSize: 22, color: "var(--qc-hair)", lineHeight: 1 }}>⊕</span>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
        SELECT PEER {_index}
      </p>
    </div>
  );
}

// ── build pillar tiles generically from lens data ─────────────────────────────

function buildPillars(lens: LensDetail, topSignals: TopSignal[]): PillarTileProps[] {
  const km = lens.key_metrics;

  // Market Position: find highest-impact signal with actual value
  const topSig = topSignals.find((s) => s.impact === "high" && s.actual_value != null);
  const marketSub = topSig ? `${formatSigValue(topSig)} — ${topSig.label.slice(0, 40)}` : getKm(km, "growth");
  const marketScore = lens.score >= 70 ? 3 : lens.score >= 40 ? 2 : 1;

  // Pricing Power: look for cost/margin/pass-through signals
  const pricingSig = topSignals.find((s) =>
    s.metric.toLowerCase().includes("cost") || s.metric.toLowerCase().includes("margin") ||
    s.label.toLowerCase().includes("margin") || s.label.toLowerCase().includes("pricing")
  );
  const pricingSub = pricingSig ? pricingSig.statement?.slice(0, 50) ?? pricingSig.label.slice(0, 50) : "Pricing dynamics from key metrics";
  const pricingScore = pricingSig?.direction === "beat" ? 3 : 2;

  // Entry Barriers: qualitative from highlights
  const barrierSub = lens.highlights[1]?.slice(0, 50) ?? "Competitive moat assessment";
  const barrierScore = lens.score >= 60 ? 3 : lens.score >= 40 ? 2 : 1;

  return [
    {
      label: "Market Position",
      rating: lens.score >= 70 ? "Strong" : lens.score >= 40 ? "Medium" : "Weak",
      sub: marketSub.slice(0, 60),
      color: lens.score >= 70 ? "var(--qc-up)" : lens.score >= 40 ? "var(--qc-warn)" : "var(--qc-down)",
      score: marketScore, max: 3,
    },
    {
      label: "Pricing Power",
      rating: pricingScore === 3 ? "High" : "Medium",
      sub: pricingSub,
      color: pricingScore === 3 ? "var(--qc-up)" : "var(--qc-warn)",
      score: pricingScore, max: 3,
    },
    {
      label: "Entry Barriers",
      rating: barrierScore === 3 ? "High" : "Medium",
      sub: barrierSub,
      color: barrierScore >= 3 ? "var(--qc-up)" : "var(--qc-warn)",
      score: barrierScore, max: 3,
    },
    {
      label: "Porter's Score",
      rating: `${Math.round(lens.score / 10)}/10`,
      sub: lens.description.slice(0, 55),
      color: lens.score >= 70 ? "var(--qc-up)" : lens.score >= 40 ? "var(--qc-warn)" : "var(--qc-down)",
      score: Math.round(lens.score / 10), max: 10,
    },
  ];
}

// ── build signal cards generically from lens top_signals ─────────────────────

function buildSignalCards(lens: LensDetail, topSignals: TopSignal[]): SignalCardProps[] {
  const cards: SignalCardProps[] = [];

  const highImpact = topSignals.filter((s) => s.impact === "high");
  const pool = highImpact.length >= 2 ? highImpact : topSignals;

  // Positive signals (up to 2)
  const posSignals = pool.filter((s) => s.direction === "beat" || s.direction === "above" ||
    (s.actual_value != null && s.actual_value > 0 && s.metric.toLowerCase().includes("growth")));
  posSignals.slice(0, 2).forEach((s) => {
    cards.push({
      icon: "up",
      headline: s.label,
      sub: s.statement?.slice(0, 100) ?? lens.highlights[cards.length]?.slice(0, 100) ?? "",
      badge: formatSigValue(s),
      badgeColor: "var(--qc-up)",
    });
  });

  // Negative/watch signals (up to 2)
  const negSignals = pool.filter((s) => s.direction === "miss" || s.direction === "below");
  const warnSignals = negSignals.length === 0 ? lens.risks.slice(0, 2).map((r) => ({
    icon: "warn" as const,
    headline: r.slice(0, 80),
    sub: "",
    badge: "Watch",
    badgeColor: "var(--qc-warn)",
  })) : negSignals.slice(0, 2).map((s) => ({
    icon: "down" as const,
    headline: s.label,
    sub: s.statement?.slice(0, 100) ?? "",
    badge: formatSigValue(s),
    badgeColor: "var(--qc-down)",
  }));

  cards.push(...warnSignals);

  // Ensure exactly 4 cards
  while (cards.length < 4) {
    const extra = pool[cards.length];
    if (!extra) break;
    cards.push({
      icon: "up",
      headline: extra.label,
      sub: extra.statement?.slice(0, 100) ?? "",
      badge: formatSigValue(extra),
      badgeColor: "var(--qc-up)",
    });
  }

  return cards.slice(0, 4);
}

// ── Derive ticker from callId (e.g. AADHARHFC_FY2026_Q3 → AADHARHFC) ─────────

function tickerFromCallId(callId: string | undefined): string {
  if (!callId) return "COMPANY";
  return callId.split("_")[0];
}

// ── Peer ticker suggestions from key_metrics or a generic fallback list ───────

const FALLBACK_PEERS = ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "SBIN", "INFY", "TCS", "WIPRO", "TATAMOTORS", "MSWIL"];

// ── main export ───────────────────────────────────────────────────────────────

export function LensDetailCompetition({ lens, signals: _signals, ticker }: Props) {
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [swotExpanded, setSwotExpanded] = useState(false);

  const topSignals = dedup(lens.top_signals ?? []);
  const km = lens.key_metrics;
  const statusCol = statusColor(lens.status);

  const primaryTicker = ticker ?? "COMPANY";

  // Derive peer suggestions from key_metrics keys mentioning other companies, else fall back
  const peerTickers = FALLBACK_PEERS.filter((t) => t !== primaryTicker).slice(0, 8);

  const pillars = buildPillars(lens, topSignals);
  const signalCards = buildSignalCards(lens, topSignals);
  const quoteSignal = topSignals.find((s) => s.statement && s.statement.length > 60) ?? null;

  // Summary metrics: top 3 signals with actual values
  const summaryMetrics = topSignals
    .filter((s) => s.actual_value != null)
    .slice(0, 3)
    .map((s) => ({
      label: s.label.slice(0, 20),
      value: formatSigValue(s),
      sub: s.statement?.slice(0, 40) ?? "",
    }));

  // Subtitle line
  const subtitleSig = topSignals.find((s) => s.actual_value != null && s.impact === "high");
  const subtitle = subtitleSig
    ? `${formatSigValue(subtitleSig)} ${subtitleSig.label} — ${lens.highlights[0]?.slice(0, 60) ?? ""}`
    : lens.description.slice(0, 120);

  function togglePeer(ticker: string) {
    setSelectedPeers((prev) => {
      if (prev.includes(ticker)) return prev.filter((t) => t !== ticker);
      if (prev.length >= 3) return prev;
      return [...prev, ticker];
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── COMPETITIVE POSITION ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <SectionLabel>COMPETITIVE POSITION</SectionLabel>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: `1px solid ${statusCol}`,
            borderRadius: 20, padding: "3px 12px",
            color: statusCol, background: "var(--qc-card)",
          }}>
            • {lens.status}
          </span>
        </div>

        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {subtitle.slice(0, 140)}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
          {pillars.map((p, i) => <PillarTile key={i} {...p} />)}
        </div>

        {quoteSignal && (
          <div style={{ padding: "16px 20px", background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{
                fontSize: 13, fontStyle: "italic",
                color: "var(--qc-ink)", margin: 0, lineHeight: 1.7,
                fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {quoteSignal.statement?.slice(0, 240)}{(quoteSignal.statement?.length ?? 0) > 240 ? "…" : ""}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "6px 0 0" }}>
                Quantcase peer analysis
              </p>
            </div>
          </div>
        )}

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, padding: "14px 16px",
          background: "var(--qc-card)",
          borderTop: "1px solid var(--qc-hair)",
        }}>
          {signalCards.map((card, i) => <SignalCard key={i} {...card} />)}
        </div>

        {/* Collapsible: Detailed KPI & SWOT */}
        <div
          onClick={() => setSwotExpanded((v) => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", cursor: "pointer",
            background: "var(--qc-section)", borderTop: "1px solid var(--qc-hair)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--qc-ink-2)", fontWeight: 500 }}>Detailed Peer KPI & SWOT</span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{swotExpanded ? "▲" : "▼"}</span>
        </div>
        {swotExpanded && (
          <div style={{ padding: "14px 16px", background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
            {Object.keys(km).length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--qc-hair)", borderRadius: 8, overflow: "hidden" }}>
                {Object.entries(km).slice(0, 8).map(([k, v], i, arr) => (
                  <div key={k} style={{
                    padding: "12px 14px", background: "var(--qc-section)",
                    borderRight: i % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
                    borderBottom: i < arr.length - 2 ? "1px solid var(--qc-hair)" : undefined,
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 3px" }}>
                      {k.replace(/_/g, " ")}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No detailed metrics available</p>
            )}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={summaryMetrics}
      />

      {/* ── SIGNAL QUADRANT / PEER COMPARISON ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionLabel>SIGNAL QUADRANT</SectionLabel>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
                background: "var(--qc-section)", borderRadius: 20,
                padding: "2px 10px", border: "1px solid var(--qc-hair)",
              }}>
                vs Peer Set
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
              Select up to 3 peers to compare signals side-by-side
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: "1px solid var(--qc-warn)",
            borderRadius: 20, padding: "3px 12px",
            color: "var(--qc-warn)", background: "var(--qc-warn-soft)",
          }}>
            • Peer Comparison
          </span>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginRight: 4 }}>
              PEER SET
            </span>
            <Chip active>{primaryTicker} ✓</Chip>
            {peerTickers.map((t) => {
              const isActive = selectedPeers.includes(t);
              const isDisabled = !isActive && selectedPeers.length >= 3;
              return (
                <span key={t} onClick={() => !isDisabled && togglePeer(t)}
                  style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.45 : 1 }}>
                  <Chip active={isActive}>{t}{isActive ? " ✓" : ""}</Chip>
                </span>
              );
            })}
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr", gap: 1, background: "var(--qc-hair)",
        }}>
          <div style={{ background: "var(--qc-card)", display: "flex", flexDirection: "column" }}>
            <PrimaryPeerCard ticker={primaryTicker} lens={lens} />
          </div>
          {selectedPeers[0] ? (
            <PeerSlot ticker={selectedPeers[0]} onDeselect={() => togglePeer(selectedPeers[0])} />
          ) : <PeerCell index={1} />}
          {selectedPeers[1] ? (
            <PeerSlot ticker={selectedPeers[1]} onDeselect={() => togglePeer(selectedPeers[1])} />
          ) : <PeerCell index={2} />}
          {selectedPeers[2] ? (
            <PeerSlot ticker={selectedPeers[2]} onDeselect={() => togglePeer(selectedPeers[2])} />
          ) : <PeerCell index={3} />}
        </div>
      </div>
    </div>
  );
}
