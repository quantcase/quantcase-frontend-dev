"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ModScoreEntry {
  ticker: string;
  companyName: string;
  sector: string;
  /** L3 Management score (0–100) */
  mgmt: number;
  /** L3 Opportunity score (0–100) */
  opp: number;
  /** L3 Deal score (0–100) */
  deal: number;
  /** L4 composite score (0–100) */
  composite: number;
  /** Short thesis / signal text */
  signal: string;
  /** Optional category tag (e.g. "PROMOTER BUYING") */
  tag?: string;
  /** Tag colour variant */
  tagVariant?: "up" | "warn" | "neutral";
}

// ── Static data (replace with API data later) ─────────────────────────────────

const STATIC_ENTRIES: ModScoreEntry[] = [
  {
    ticker: "APLAPOLLO",
    companyName: "APL Apollo Tubes",
    sector: "Metals",
    mgmt: 84,
    opp: 80,
    deal: 78,
    composite: 81,
    signal: "Promoters added ₹142 Cr of their own stock last month — the largest open-market buy in three years.",
    tag: "PROMOTER BUYING",
    tagVariant: "up",
  },
  {
    ticker: "JIOFIN",
    companyName: "Jio Financial Services",
    sector: "NBFC",
    mgmt: 70,
    opp: 78,
    deal: 45,
    composite: 64,
    signal: "Four quarters listed, still no disclosed lending-book target or return-on-equity ambition.",
    tag: "NO STATED PLAN",
    tagVariant: "warn",
  },
  {
    ticker: "COFORGE",
    companyName: "Coforge",
    sector: "IT Services",
    mgmt: 82,
    opp: 78,
    deal: 71,
    composite: 79,
    signal: "Raised revenue guidance twice this year and landed both, with margin holding steady despite the raise.",
    tag: "GUIDANCE BEAT",
    tagVariant: "up",
  },
  {
    ticker: "ZOMATO",
    companyName: "Zomato",
    sector: "Consumer Internet",
    mgmt: 76,
    opp: 88,
    deal: 55,
    composite: 73,
    signal: "Quick commerce growing 70% YoY; management signalling path to profitability by FY26.",
    tag: "GROWTH MOMENTUM",
    tagVariant: "up",
  },
  {
    ticker: "LICI",
    companyName: "Life Insurance Corp.",
    sector: "Insurance",
    mgmt: 61,
    opp: 65,
    deal: 58,
    composite: 62,
    signal: "VNB margin expansion story intact but new business mix shift towards ULIP warrants monitoring.",
    tagVariant: "neutral",
  },
  {
    ticker: "POLYCAB",
    companyName: "Polycab India",
    sector: "Cables & Wires",
    mgmt: 88,
    opp: 82,
    deal: 74,
    composite: 83,
    signal: "Distribution reach expanded to 4,000+ towns; export order book at all-time high.",
    tag: "DISTRIBUTION MOAT",
    tagVariant: "up",
  },
  {
    ticker: "DIXON",
    companyName: "Dixon Technologies",
    sector: "Electronics Mfg",
    mgmt: 80,
    opp: 91,
    deal: 68,
    composite: 80,
    signal: "PLI wins in mobile and IT hardware; revenue run-rate doubling every 18 months.",
    tag: "PLI BENEFICIARY",
    tagVariant: "up",
  },
  {
    ticker: "COALINDIA",
    companyName: "Coal India",
    sector: "Mining",
    mgmt: 55,
    opp: 42,
    deal: 72,
    composite: 58,
    signal: "High dividend yield (8.2%) with stable volumes but long-term demand risk as renewable capacity grows.",
    tag: "HIGH YIELD",
    tagVariant: "neutral",
  },
];

// ── Score Donut ────────────────────────────────────────────────────────────────

function getDonutColor(score: number): string {
  if (score >= 75) return "var(--qc-up)";
  if (score >= 55) return "var(--qc-golden-ink)";
  return "var(--qc-down)";
}

function ScoreDonut({
  score,
  label,
  size = 56,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getDonutColor(score);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--qc-hair)"
            strokeWidth={4}
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            position: "absolute",
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-14)",
            fontWeight: "var(--qc-w-semi)",
            color,
            letterSpacing: "-0.02em",
          }}
        >
          {Math.round(score)}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--qc-font-mono)",
          fontSize: "var(--qc-fz-9)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--qc-ink-3)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────

function TagChip({ label, variant }: { label: string; variant?: "up" | "warn" | "neutral" }) {
  const bg =
    variant === "up"
      ? "var(--qc-up-soft)"
      : variant === "warn"
      ? "var(--qc-warn-soft)"
      : "var(--qc-section)";
  const color =
    variant === "up"
      ? "var(--qc-up)"
      : variant === "warn"
      ? "var(--qc-warn)"
      : "var(--qc-ink-2)";
  const border =
    variant === "up"
      ? "rgba(31, 122, 74, 0.2)"
      : variant === "warn"
      ? "rgba(180, 115, 26, 0.2)"
      : "var(--qc-hair)";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: "var(--qc-font-mono)",
        fontSize: "var(--qc-fz-9)",
        fontWeight: "var(--qc-w-semi)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── Single Card ────────────────────────────────────────────────────────────────

function ModScoreCard({ entry }: { entry: ModScoreEntry }) {
  return (
    <Link
      href={`/screener/overview?symbol=${encodeURIComponent(entry.ticker)}`}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "0 0 280px",
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 16,
        padding: "16px 18px",
        textDecoration: "none",
        gap: 12,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        cursor: "pointer",
        minWidth: 0,
      }}
      className="mod-score-card"
    >
      {/* ── Top row: tag + ticker ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {entry.tag && (
            <div style={{ marginBottom: 6 }}>
              <TagChip label={entry.tag} variant={entry.tagVariant} />
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-17)",
              fontWeight: "var(--qc-w-semi)",
              color: "var(--qc-ink)",
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.ticker}
          </div>
          <div
            style={{
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-11)",
              color: "var(--qc-ink-3)",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.companyName} · {entry.sector}
          </div>
        </div>
      </div>

      {/* ── Score donuts row ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "4px 0",
        }}
      >
        <ScoreDonut score={entry.mgmt} label="MGMT" />
        <ScoreDonut score={entry.opp} label="OPP" />
        <ScoreDonut score={entry.deal} label="DEAL" />
      </div>

      {/* ── Signal text ─── */}
      <p
        style={{
          margin: 0,
          fontFamily: "var(--qc-font-sans)",
          fontSize: "var(--qc-fz-12)",
          color: "var(--qc-ink-2)",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {entry.signal}
      </p>

      {/* ── Footer ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid var(--qc-hair)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            color: "var(--qc-ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          QC {entry.composite} · COMPOSITE
        </span>
        <span
          style={{
            fontFamily: "var(--qc-font-sans)",
            fontSize: "var(--qc-fz-12)",
            color: "var(--qc-ink-2)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          Open →
        </span>
      </div>
    </Link>
  );
}

// ── Strip ─────────────────────────────────────────────────────────────────────

export function ModScoresStrip({ entries = STATIC_ENTRIES }: { entries?: ModScoreEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div style={{ padding: "0 0 12px" }}>
      {/* ── Section header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-bold)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--qc-ink)",
            }}
          >
            Worth Your Attention
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 22,
              padding: "0 6px",
              borderRadius: 999,
              background: "var(--qc-section)",
              border: "1px solid var(--qc-hair)",
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-semi)",
              color: "var(--qc-ink-2)",
            }}
          >
            {entries.length}
          </span>
          <span
            style={{
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-11)",
              color: "var(--qc-ink-3)",
            }}
          >
            L3 + L4 complete
          </span>
        </div>

        {/* Scroll arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => scrollBy(-320)}
            aria-label="Scroll left"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid var(--qc-hair)",
              background: "var(--qc-card)",
              color: "var(--qc-ink-2)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <button
            onClick={() => scrollBy(320)}
            aria-label="Scroll right"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid var(--qc-hair)",
              background: "var(--qc-card)",
              color: "var(--qc-ink-2)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Scrollable card track ── */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: 4,
        }}
        // Hide scrollbar on webkit
        className="hide-scrollbar"
      >
        {entries.map((entry) => (
          <ModScoreCard key={entry.ticker} entry={entry} />
        ))}

        {/* Right-fade sentinel to hint more content */}
        <div style={{ flex: "0 0 1px" }} />
      </div>

      {/* ── Hover styles ── */}
      <style>{`
        .mod-score-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border-color: var(--qc-hair-strong) !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
