"use client";

import React from "react";

// ─── Shimmer base ─────────────────────────────────────────────────────────────

function Shimmer({
  className = "",
  style,
  rounded = 8,
}: {
  className?: string;
  style?: React.CSSProperties;
  rounded?: number;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ borderRadius: rounded, ...style }}
    />
  );
}

// ─── KeyRatioTiles skeleton ───────────────────────────────────────────────────

export function KeyRatioTilesSkeleton() {
  return (
    <div className="px-4">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 overflow-hidden"
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 16,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={[
              "px-5 py-3.5 flex flex-col gap-2",
              i >= 2 ? "border-t border-[var(--qc-hair-2)] lg:border-t-0" : "",
              i === 0 ? "" :
              i === 1 ? "border-l border-[var(--qc-hair-2)]" :
              i === 2 ? "sm:border-l border-[var(--qc-hair-2)]" :
              i === 3 ? "sm:border-l-0 lg:border-l border-[var(--qc-hair-2)]" :
              "border-l border-[var(--qc-hair-2)]",
            ].filter(Boolean).join(" ")}
          >
            <Shimmer style={{ height: 10, width: "55%" }} rounded={4} />
            <Shimmer style={{ height: 20, width: "70%" }} rounded={5} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── IMScoreCard skeleton (3 pillar columns) ──────────────────────────────────

export function IMScoreCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      {/* Narrative bar */}
      <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        <Shimmer style={{ height: 9, width: "25%" }} rounded={4} />
        <Shimmer style={{ height: 13, width: "90%" }} rounded={4} />
        <Shimmer style={{ height: 13, width: "75%" }} rounded={4} />
      </div>
      {/* 3 pillar cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--qc-card)",
              border: "1px solid var(--qc-hair)",
              borderRadius: 14,
              padding: "18px 18px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Shimmer style={{ height: 9, width: 70 }} rounded={4} />
                <Shimmer style={{ height: 13, width: 90 }} rounded={5} />
              </div>
              {/* Score ring */}
              <Shimmer style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0 }} rounded={999} />
            </div>
            {/* Divider */}
            <Shimmer style={{ height: 1, width: "100%" }} rounded={0} />
            {/* Lens rows */}
            {Array.from({ length: 3 }).map((_, j) => (
              <Shimmer key={j} style={{ height: 36 }} rounded={8} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TechnicalsCard skeleton ──────────────────────────────────────────────────

export function TechnicalsCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Shimmer style={{ height: 10, width: "20%" }} rounded={4} />
      {/* State cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} style={{ height: 90 }} rounded={12} />
        ))}
      </div>
      {/* MA strip */}
      <Shimmer style={{ height: 52 }} rounded={12} />
      {/* Momentum panel */}
      <Shimmer style={{ height: 110 }} rounded={12} />
    </div>
  );
}

// ─── DecisionIntelligencePanel skeleton ──────────────────────────────────────

export function DecisionIntelligenceSkeleton() {
  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <Shimmer style={{ height: 10, width: "45%" }} rounded={4} />
      {/* Rating badge */}
      <Shimmer style={{ height: 48, width: "100%" }} rounded={12} />
      {/* Section label */}
      <Shimmer style={{ height: 9, width: "35%" }} rounded={4} />
      {/* 3 MOD tiles */}
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} style={{ height: 58 }} rounded={10} />
        ))}
      </div>
      {/* Section label */}
      <Shimmer style={{ height: 9, width: "35%" }} rounded={4} />
      {/* 6 fundamental tiles */}
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} style={{ height: 58 }} rounded={10} />
        ))}
      </div>
      {/* Section label */}
      <Shimmer style={{ height: 9, width: "28%" }} rounded={4} />
      {/* 4 technicals tiles */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} style={{ height: 58 }} rounded={10} />
        ))}
      </div>
    </div>
  );
}

// ─── CompanyProfileCard skeleton ──────────────────────────────────────────────

export function CompanyProfileSkeleton() {
  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Company name + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Shimmer style={{ height: 22, width: "40%" }} rounded={6} />
        <Shimmer style={{ height: 20, width: 80 }} rounded={20} />
      </div>
      {/* Description lines */}
      <Shimmer style={{ height: 13, width: "100%" }} rounded={4} />
      <Shimmer style={{ height: 13, width: "85%" }} rounded={4} />
      <Shimmer style={{ height: 13, width: "65%" }} rounded={4} />
    </div>
  );
}
