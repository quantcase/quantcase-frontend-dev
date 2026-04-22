"use client";

import { useState } from "react";

interface QcScoreHeroCardProps {
  score: number | null;
  ratingLabel: string | null;
  mqiLabel?: string | null;
  thesisHeadline?: string | null;
}

type PeriodTab = "Score" | "vs Sector" | "vs Nifty";

export function QcScoreHeroCard({
  score,
  ratingLabel,
  mqiLabel,
  thesisHeadline,
}: QcScoreHeroCardProps) {
  const [activeTab, setActiveTab] = useState<PeriodTab>("Score");
  const [annotVisible, setAnnotVisible] = useState(true);

  const displayScore = score ?? 0;
  const displayRating = ratingLabel ?? "—";

  // y position in 240px SVG: score 100→y20, score 0→y220
  const scoreY = Math.round(220 - (displayScore / 100) * 200);
  const startY = Math.min(215, scoreY + 30);

  const legendItems = [
    { label: "Moat", color: "var(--qc-up, #1F7A4A)", muted: false },
    { label: "Govt. pricing", color: "var(--qc-blue, #2563EB)", muted: false },
    { label: "Crude sensitive", color: "var(--qc-warn, #B4731A)", muted: true },
    { label: "Earnings compression", color: "var(--qc-down, #B23A2F)", muted: true },
  ];

  const headline = thesisHeadline ?? "AI-powered research across management, opportunity and deal factors.";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 360px",
        gap: 14,
        padding: "16px 16px 4px",
      }}
    >
      {/* LEFT: hero-chart */}
      <section
        style={{
          background: "var(--qc-surface-card, #FFFFFF)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 18,
          padding: "16px 20px 18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "var(--qc-text-muted)", textTransform: "uppercase" }}>
            QC Score · Overall Verdict
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              <svg key="list" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
              <svg key="expand" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 14v6h6M20 10V4h-6M20 4l-7 7M4 20l7-7" /></svg>,
            ].map((icon, i) => (
              <button
                key={i}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: "1px solid var(--qc-border-default)",
                  background: "var(--qc-surface-card, #FFFFFF)",
                  color: "var(--qc-text-muted)",
                  display: "grid", placeItems: "center", cursor: "pointer",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </header>

        {/* hero-chart-body: legend | figure | period tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16, padding: "4px 0 10px" }}>
          {/* legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12.5, color: "var(--qc-text-muted)" }}>
            {legendItems.map((item) => (
              <div key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, opacity: item.muted ? 0.5 : 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>

          {/* hero figure */}
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.035em", color: "var(--qc-text-heading)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {score !== null ? displayScore : "—"}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "var(--qc-text-muted)", letterSpacing: 0, fontWeight: 400, marginLeft: 3 }}>/100</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--qc-text-muted)", marginTop: 8 }}>
              {displayRating}
            </div>
          </div>

          {/* period toggle */}
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
            {(["Score", "vs Sector", "vs Nifty"] as PeriodTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "transparent",
                  border: 0,
                  borderBottom: activeTab === tab ? "1.5px solid var(--qc-text-heading)" : "1.5px solid transparent",
                  padding: activeTab === tab ? "6px 10px 4px" : "6px 10px",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 500,
                  color: activeTab === tab ? "var(--qc-text-heading)" : "var(--qc-text-muted)",
                  borderRadius: activeTab === tab ? 0 : 6,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* band chart */}
        <div style={{ position: "relative", margin: "0 -4px" }}>
          <svg viewBox="0 0 920 240" width="100%" height="240" preserveAspectRatio="none">
            {/* threshold bands */}
            <rect x="0" y="0" width="920" height="50" fill="#F0F7DC" opacity=".5" />
            <rect x="0" y="50" width="920" height="60" fill="#FAF5E0" opacity=".4" />
            <rect x="0" y="170" width="920" height="70" fill="#FBE9E6" opacity=".35" />
            {/* dashed threshold lines */}
            <g stroke="var(--qc-border-default)" strokeWidth="1">
              <line x1="0" x2="920" y1="50" y2="50" strokeDasharray="3 4" />
              <line x1="0" x2="920" y1="110" y2="110" strokeDasharray="3 4" />
              <line x1="0" x2="920" y1="170" y2="170" strokeDasharray="3 4" />
            </g>
            {/* sector median dashed */}
            <path d="M0,112 C80,108 160,104 240,100 C320,95 400,90 480,88 C560,86 640,85 720,84 C800,83 880,82 920,82"
              fill="none" stroke="#B8B5AB" strokeWidth="1.6" strokeDasharray="5 4" />
            {/* stock score trajectory */}
            <path
              d={`M0,${startY} C70,${startY - 8} 130,${startY + 2} 200,${Math.min(215, startY + 20)} C270,${Math.min(215, startY + 38)} 330,${Math.min(215, startY + 40)} 400,${Math.min(215, startY + 32)} C470,${scoreY + 24} 530,${scoreY + 15} 600,${scoreY + 12} C670,${scoreY + 9} 730,${scoreY + 22} 800,${scoreY + 30} C860,${scoreY + 36} 900,${scoreY + 32} 920,${scoreY + 28}`}
              fill="none" stroke="#0E0E0C" strokeWidth="2.2" strokeLinejoin="round"
            />
            {/* endpoint dot */}
            <circle cx="920" cy={scoreY + 28} r="5" fill="#0E0E0C" />
            <circle cx="920" cy={scoreY + 28} r="9" fill="none" stroke="#0E0E0C" strokeOpacity=".18" strokeWidth="2" />
            {/* band labels */}
            <text x="906" y="22" textAnchor="end" fontSize="10" fontFamily="'IBM Plex Mono',monospace" fill="#6B8A2E" letterSpacing=".1em">OUTPERFORM · 70+</text>
            <text x="906" y="208" textAnchor="end" fontSize="10" fontFamily="'IBM Plex Mono',monospace" fill="#B23A2F" letterSpacing=".1em">UNDERPERFORM · &lt;45</text>
          </svg>

          {/* floating annotation */}
          {annotVisible && score !== null && (
            <div
              style={{
                position: "absolute", left: "36%", top: "44%",
                transform: "translateX(-50%)",
                background: "var(--qc-surface-card, #FFFFFF)",
                border: "1px solid var(--qc-border-default)",
                borderRadius: 10,
                padding: "10px 12px 8px",
                boxShadow: "0 8px 24px rgba(14,14,12,0.08)",
                minWidth: 180,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", fontVariantNumeric: "tabular-nums" }}>{displayScore}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 5, background: "#DFF0A6", color: "#40580F", letterSpacing: "0.04em" }}>
                  {displayRating}
                </span>
                <button
                  onClick={() => setAnnotVisible(false)}
                  style={{ marginLeft: "auto", width: 18, height: 18, border: 0, background: "transparent", color: "var(--qc-text-muted)", fontSize: 14, cursor: "pointer", lineHeight: 1, padding: 0 }}
                >×</button>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--qc-text-muted)", marginTop: 4, lineHeight: 1.35 }}>
                {mqiLabel ? `${mqiLabel} management quality` : "Combined M · O · D score"}
              </div>
              <div style={{ marginTop: 8, height: 3, background: "#0E0E0C", borderRadius: 999, position: "relative" }}>
                <span style={{ position: "absolute", left: "20%", right: "40%", top: 0, bottom: 0, background: "var(--qc-accent-lime, #D4F26A)", borderRadius: 999 }} />
              </div>
            </div>
          )}

          {/* x-axis */}
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "var(--qc-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 4px 0" }}>
            {["Q3 FY23", "Q4 FY23", "Q1 FY24", "Q2 FY24", "Q3 FY24", "Today"].map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>
      </section>

      {/* RIGHT: insight-card — lime gradient */}
      <aside
        style={{
          background: "linear-gradient(175deg, #E8F3BD 0%, #D6E996 100%)",
          border: "1px solid #C6DC8A",
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* head */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "#4A5F20", textTransform: "uppercase" }}>
            Investment Thesis
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              <svg key="prev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>,
              <svg key="next" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>,
            ].map((icon, i) => (
              <button key={i} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(14,14,12,0.12)", background: "rgba(255,255,255,0.35)", color: "#0E0E0C", display: "grid", placeItems: "center", cursor: "pointer" }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <h3 style={{ margin: "2px 0 8px", fontSize: 18, fontWeight: 500, lineHeight: 1.35, letterSpacing: "-0.01em", color: "#0E0E0C", paddingRight: 20 }}>
          {headline}
        </h3>

        {/* chart */}
        <div style={{ flex: 1, minHeight: 120, position: "relative", margin: "0 -4px" }}>
          <svg viewBox="0 0 360 140" width="100%" height="140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="qc-insight-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#B7D853" stopOpacity=".55" />
                <stop offset="100%" stopColor="#B7D853" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="#9CB844" strokeWidth="1.4" opacity=".38">
              {[18,36,54,72,90,108,126,144,162,180,198,216,234,252,270,288,306,324,342].map((x, i) => (
                <line key={x} x1={x} y1="130" x2={x} y2={Math.max(20, 72 - i * 1.8)} />
              ))}
            </g>
            <path d="M0,85 C50,80 100,75 150,70 C200,65 260,55 320,40 L360,30" fill="none" stroke="#0E0E0C" strokeWidth="2" />
            <path d="M0,85 C50,80 100,75 150,70 C200,65 260,55 320,40 L360,30 L360,140 L0,140 Z" fill="url(#qc-insight-fill)" />
          </svg>
        </div>

        {/* footer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginTop: 6 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "#0E0E0C", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {score !== null ? displayScore : "—"}<span style={{ fontSize: 16, marginLeft: 1 }}>/100</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>
              QC · Score
            </div>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(14,14,12,0.12)", background: "rgba(255,255,255,0.5)", color: "#0E0E0C", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "#0E0E0C", lineHeight: 1 }}>
              {mqiLabel ?? displayRating}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#4A5F20", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, textAlign: "right" }}>
              Rating
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
