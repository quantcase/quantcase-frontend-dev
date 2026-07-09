"use client";

import Link from "next/link";
import { CardShell, MonoLabel } from "@/components/ds";

interface SubScore {
  label: string;
  score: number;
  rating: "STRONG" | "FAIR" | "STRETCHED" | "WEAK";
}

interface MODSynopsisCardProps {
  overallScore: number;
  headline: string;
  subScores: SubScore[];
  draggingSymbols: string[];
  /** Pillar the dragging symbols weigh on, e.g. "Deal". Defaults to "Deal". */
  draggingLabel?: string;
  onOpenBreakdown?: () => void;
  isShadow?: boolean;
  onUploadPortfolio?: () => void;
}

// Violet accent used for the headline emphasis + interactive links on the light card.
const ACCENT = "#7C3AED";

const RATING_META: Record<SubScore["rating"], { color: string; bg: string; border: string; barColor: string }> = {
  STRONG:    { color: "var(--qc-up,#1F7A4A)",   bg: "var(--qc-up-soft,#E3F1E8)",   border: "rgba(31,122,74,0.30)",  barColor: "var(--qc-up,#1F7A4A)"    },
  FAIR:      { color: "var(--qc-warn,#B4731A)",  bg: "var(--qc-warn-soft,#FAF0D8)", border: "rgba(180,115,26,0.30)", barColor: "var(--qc-warn,#B4731A)"  },
  STRETCHED: { color: "var(--qc-warn,#B4731A)",  bg: "var(--qc-warn-soft,#FAF0D8)", border: "rgba(180,115,26,0.30)", barColor: "var(--qc-warn,#B4731A)"  },
  WEAK:      { color: "var(--qc-down,#B23A2F)",  bg: "var(--qc-down-soft,#F7E6E3)", border: "rgba(178,58,47,0.30)",  barColor: "var(--qc-down,#B23A2F)"  },
};

function ScoreTile({ label, score, rating }: SubScore) {
  const meta = RATING_META[rating];
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
        padding: "14px 16px 12px",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <MonoLabel size={9} tracking="0.12em" color="var(--qc-ink-3)">
        {label}
      </MonoLabel>
      <div style={{ fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1, margin: "6px 0 6px" }}>
        {score}
      </div>
      <span style={{
        display: "inline-block",
        fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)", textTransform: "uppercase",
        fontFamily: "var(--qc-font-sans)",
        color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
        borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", alignSelf: "flex-start",
      }}>
        {rating}
      </span>
      <div style={{ marginTop: 10, height: 3, background: "var(--qc-hair)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${score}%`, background: meta.barColor, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function MODSynopsisCard({ headline, subScores, draggingSymbols, draggingLabel = "Deal", onOpenBreakdown, isShadow, onUploadPortfolio }: MODSynopsisCardProps) {
  return (
    <CardShell radius={14} style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>

      {/* Header — mono label + optional upload button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <MonoLabel size={10} tracking="0.14em" color="var(--qc-ink-3)">
          {isShadow ? "Trackers · MOD Synopsis" : "Your Portfolio · MOD Synopsis"}
        </MonoLabel>
        {isShadow && onUploadPortfolio && (
          <button
            onClick={onUploadPortfolio}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-on-dark)",
              fontFamily: "var(--qc-font-sans)",
              background: "var(--qc-ink)", border: "none",
              borderRadius: 6, padding: "4px 10px",
              cursor: "pointer", whiteSpace: "nowrap",
              letterSpacing: "var(--qc-track-pill)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Connect your portfolio
          </button>
        )}
      </div>

      {/* Headline — serif, matches management verdict card */}
      <p
        style={{
          fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-regular)", lineHeight: 1.35,
          color: "var(--qc-ink)", margin: 0,
          fontFamily: "var(--qc-font-serif)",
          letterSpacing: "var(--qc-track-display)",
        }}
        dangerouslySetInnerHTML={{ __html: headline }}
      />

      {/* Sub-score tiles */}
      <div style={{ display: "flex", gap: 8, flex: 1 }}>
        {subScores.map((s) => (
          <ScoreTile key={s.label} {...s} />
        ))}
      </div>

      {/* Footer — dragging signal + breakdown link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid var(--qc-hair)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {draggingSymbols.length > 0 && (
            <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
              {draggingSymbols.length} holding{draggingSymbols.length === 1 ? "" : "s"} dragging your {draggingLabel} score ·{" "}
              {draggingSymbols.map((s, i) => (
                <span key={s}>
                  <Link
                    href={`/screener/management?symbol=${s}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: ACCENT, fontWeight: "var(--qc-w-medium)", textDecoration: "none" }}
                  >
                    {s}
                  </Link>
                  {i < draggingSymbols.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          )}
        </div>
        <button
          onClick={onOpenBreakdown}
          style={{
            fontSize: "var(--qc-fz-12)", color: ACCENT, background: "none",
            fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-medium)",
            border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap",
            letterSpacing: "var(--qc-track-pill)",
          }}
        >
          Open MOD breakdown →
        </button>
      </div>
    </CardShell>
  );
}
