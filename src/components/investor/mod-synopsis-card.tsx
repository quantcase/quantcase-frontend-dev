"use client";

import Link from "next/link";

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

const ratingColor: Record<SubScore["rating"], string> = {
  STRONG:    "#22c55e",
  FAIR:      "#f59e0b",
  STRETCHED: "#ef4444",
  WEAK:      "#ef4444",
};

const ratingBg: Record<SubScore["rating"], string> = {
  STRONG:    "rgba(34,197,94,0.18)",
  FAIR:      "rgba(245,158,11,0.18)",
  STRETCHED: "rgba(239,68,68,0.18)",
  WEAK:      "rgba(239,68,68,0.18)",
};

function ScoreTile({ label, score, rating }: SubScore) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 10,
        padding: "14px 16px",
        minWidth: 120,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
        {score}
      </div>
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 600,
          color: ratingColor[rating],
          background: ratingBg[rating],
          borderRadius: 4,
          padding: "2px 7px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {rating}
      </span>
      {/* Progress bar */}
      <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.12)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${score}%`, background: ratingColor[rating], borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function MODSynopsisCard({ headline, subScores, draggingSymbols, onOpenBreakdown, isShadow, onUploadPortfolio }: MODSynopsisCardProps) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0F172B 0%, #1e293b 100%)",
        borderRadius: 14,
        padding: "24px 24px 20px",
        color: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 24px rgba(15,23,43,0.18)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {isShadow ? "SHADOW PORTFOLIO · MOD SYNOPSIS" : "YOUR PORTFOLIO · MOD SYNOPSIS"}
        </div>
        {isShadow && onUploadPortfolio && (
          <button
            onClick={onUploadPortfolio}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, fontWeight: 500, color: "#0F172B",
              background: "#fff", border: "none",
              borderRadius: 6, padding: "4px 10px",
              cursor: "pointer", whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload portfolio
          </button>
        )}
      </div>

      {/* Headline */}
      <p
        style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.4, color: "#fff", margin: 0 }}
        dangerouslySetInnerHTML={{ __html: headline }}
      />

      {/* Sub-score tiles */}
      <div style={{ display: "flex", gap: 8 }}>
        {subScores.map((s) => (
          <ScoreTile key={s.label} {...s} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          {draggingSymbols.length} holdings dragging your Deal score ·{" "}
          {draggingSymbols.map((s, i) => (
            <span key={s}>
              <Link href={`/screener/management?symbol=${s}`} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(139,180,248,0.9)", textDecoration: "none" }}>
                {s}
              </Link>
              {i < draggingSymbols.length - 1 && ", "}
            </span>
          ))}
        </span>
        <button
          onClick={onOpenBreakdown}
          style={{
            fontSize: 12, color: "rgba(139,180,248,0.9)", background: "none",
            border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap",
          }}
        >
          Open MOD breakdown →
        </button>
      </div>
    </div>
  );
}
