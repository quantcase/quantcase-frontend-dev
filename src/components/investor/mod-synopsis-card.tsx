"use client";

import Link from "next/link";
import { DarkGradientCard, MonoLabel } from "@/components/ds";

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
  onOpenBreakdown?: () => void;
  isShadow?: boolean;
  onUploadPortfolio?: () => void;
}

const RATING_META: Record<SubScore["rating"], { color: string; bg: string; border: string; barColor: string }> = {
  STRONG:    { color: "var(--qc-up,#1F7A4A)",   bg: "rgba(31,122,74,0.18)",   border: "rgba(31,122,74,0.5)",   barColor: "var(--qc-up,#1F7A4A)"    },
  FAIR:      { color: "var(--qc-warn,#B4731A)",  bg: "rgba(180,115,26,0.18)",  border: "rgba(180,115,26,0.5)",  barColor: "var(--qc-warn,#B4731A)"   },
  STRETCHED: { color: "var(--qc-down,#DC2626)",  bg: "rgba(220,38,38,0.18)",   border: "rgba(220,38,38,0.5)",   barColor: "var(--qc-down,#DC2626)"   },
  WEAK:      { color: "var(--qc-down,#DC2626)",  bg: "rgba(220,38,38,0.18)",   border: "rgba(220,38,38,0.5)",   barColor: "var(--qc-down,#DC2626)"   },
};

function ScoreTile({ label, score, rating }: SubScore) {
  const meta = RATING_META[rating];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 10,
        padding: "14px 16px 12px",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <MonoLabel size={9} tracking="0.12em" color="rgba(255,255,255,0.40)">
        {label}
      </MonoLabel>
      <div style={{ fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-on-dark)", lineHeight: 1, margin: "6px 0 6px" }}>
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
      <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.12)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${score}%`, background: meta.barColor, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function MODSynopsisCard({ headline, subScores, draggingSymbols, onOpenBreakdown, isShadow, onUploadPortfolio }: MODSynopsisCardProps) {
  return (
    <DarkGradientCard radius={14} style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>

      {/* Header — mono label + optional upload button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <MonoLabel size={10} tracking="0.14em" color="rgba(255,255,255,0.45)">
          {isShadow ? "Shadow Portfolio · MOD Synopsis" : "Your Portfolio · MOD Synopsis"}
        </MonoLabel>
        {isShadow && onUploadPortfolio && (
          <button
            onClick={onUploadPortfolio}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink)",
              fontFamily: "var(--qc-font-sans)",
              background: "#fff", border: "none",
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
          color: "var(--qc-on-dark)", margin: 0,
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

      {/* Footer — dragging signal pills + breakdown link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {draggingSymbols.length > 0 && (
            <span style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "rgba(255,255,255,0.45)" }}>
              Dragging Deal score:
            </span>
          )}
          {draggingSymbols.map((s) => (
            <Link
              key={s}
              href={`/screener/management?symbol=${s}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 999, padding: "5px 12px",
                fontSize: "var(--qc-fz-12)", color: "rgba(255,255,255,0.88)",
                fontFamily: "var(--qc-font-sans)",
                textDecoration: "none",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--qc-down,#DC2626)", flexShrink: 0 }} />
              {s}
            </Link>
          ))}
        </div>
        <button
          onClick={onOpenBreakdown}
          style={{
            fontSize: "var(--qc-fz-11)", color: "rgba(139,180,248,0.9)", background: "none",
            fontFamily: "var(--qc-font-sans)",
            border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap",
            letterSpacing: "var(--qc-track-pill)",
          }}
        >
          Open MOD breakdown →
        </button>
      </div>
    </DarkGradientCard>
  );
}
