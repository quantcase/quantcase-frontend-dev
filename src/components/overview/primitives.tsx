"use client";

import React from "react";

// ─── SectionShell ────────────────────────────────────────────────────────────
export function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--qc-surface-row-alt)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────────
// Monospace eyebrow at the top of every section card.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: ".12em",
        color: "var(--qc-text-body)",
        textTransform: "uppercase",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

// ─── MonoEyebrow ─────────────────────────────────────────────────────────────
// Smaller monospace label used inside panels.
export function MonoEyebrow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: ".16em",
        color: "var(--qc-text-muted)",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SentimentPill ───────────────────────────────────────────────────────────
// Verdict pill in the top-right of hero sections (e.g. "Uptrend", "Undervalued").
export function SentimentPill({
  label,
  sentiment,
}: {
  label: string;
  sentiment: "up" | "down" | "neutral";
}) {
  const bg =
    sentiment === "up"
      ? "var(--qc-up-soft)"
      : sentiment === "down"
      ? "var(--qc-down-soft)"
      : "var(--qc-warn-soft)";
  const border =
    sentiment === "up"
      ? "rgba(31, 122, 74, 0.25)"
      : sentiment === "down"
      ? "rgba(178, 58, 47, 0.25)"
      : "rgba(180, 115, 26, 0.25)";
  const color =
    sentiment === "up"
      ? "var(--qc-up)"
      : sentiment === "down"
      ? "var(--qc-down)"
      : "var(--qc-warn)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".04em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

// ─── DotChip ─────────────────────────────────────────────────────────────────
// Pill tag with a colored dot. Used in narrative sidebars.
function DotChip({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: "var(--qc-surface-white)",
        border: "1px solid var(--qc-border-default)",
        fontSize: 11.5,
        color: "var(--qc-text-body)",
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

// ─── NarrativeSidebar ────────────────────────────────────────────────────────
// The lime-gradient narrative card on the right of hero sections.
interface NarrativeSidebarProps {
  eyebrow: string;
  headline: string;
  body: string;
  tags: { label: string; color: string }[];
}

export function NarrativeSidebar({ eyebrow, headline, body, tags }: NarrativeSidebarProps) {
  return (
    <aside
      style={{
        background: "var(--qc-surface-white)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 18,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "60%",
          background: "linear-gradient(180deg, transparent 0%, var(--qc-accent-lime-bg, #E9F4C4) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          height: "100%",
        }}
      >
        <MonoEyebrow>{eyebrow}</MonoEyebrow>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            color: "var(--qc-text-heading)",
          }}
        >
          {headline}
        </div>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--qc-text-body)", margin: 0 }}>
          {body}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
          {tags.map(({ label, color }) => (
            <DotChip key={label} label={label} dotColor={color} />
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── MetricBar ───────────────────────────────────────────────────────────────
// Horizontal fill bar with label + value row and sub-label row.
// Used for momentum, volatility, ROCE, ROE, D/E, etc.
interface MetricBarProps {
  label: string;
  value: string;
  fillPct: number;
  fillColor: string;
  /** Position (0-100) of the midpoint / benchmark tick. Defaults to 50. */
  benchmarkPct?: number;
  subLeft: string;
  subRight: string;
}

export function MetricBar({
  label,
  value,
  fillPct,
  fillColor,
  benchmarkPct = 50,
  subLeft,
  subRight,
}: MetricBarProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--qc-text-body)", fontWeight: 500 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            color: "var(--qc-text-heading)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--qc-chip-bg, #F2F1EC)",
          borderRadius: 999,
          overflow: "visible",
          marginBottom: 6,
          position: "relative",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            borderRadius: 999,
            width: `${Math.min(fillPct, 100)}%`,
            background: fillColor,
          }}
        />
        <span
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            width: 2,
            left: `${benchmarkPct}%`,
            background: "var(--qc-text-heading)",
            opacity: 0.5,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--qc-text-muted)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{subLeft}</span>
        <b
          style={{
            color: "var(--qc-text-body)",
            fontWeight: 500,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {subRight}
        </b>
      </div>
    </div>
  );
}

// ─── StatTile ────────────────────────────────────────────────────────────────
// Small bordered stat box with label, large value, and sub-label.
export function StatTile({
  label,
  value,
  unit,
  sub,
  subSentiment = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  subSentiment?: "pos" | "neg" | "neutral";
}) {
  const subColor =
    subSentiment === "pos"
      ? "var(--qc-up)"
      : subSentiment === "neg"
      ? "var(--qc-down)"
      : "var(--qc-text-muted)";
  return (
    <div
      style={{
        border: "1px solid var(--qc-border-default)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--qc-text-muted)",
          letterSpacing: ".02em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "var(--qc-text-heading)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 11,
              color: "var(--qc-text-muted)",
              marginLeft: 2,
              fontWeight: 400,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: subColor, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ─── SidebarPanelLayout ───────────────────────────────────────────────────────
// Two-column panel: narrow left sidebar with heading + desc, wide right content.
// Used in "Returns & Leverage" and "Momentum & Volatility".
export function SidebarPanelLayout({
  eyebrow,
  heading,
  description,
  children,
  style,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--qc-surface-white)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 16,
        alignItems: "start",
        ...style,
      }}
    >
      <div
        style={{
          minWidth: 160,
          paddingRight: 16,
          borderRight: "1px solid var(--qc-border-inner)",
        }}
      >
        <MonoEyebrow style={{ marginBottom: 6 }}>{eyebrow}</MonoEyebrow>
        <h4
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.005em",
            color: "var(--qc-text-heading)",
          }}
        >
          {heading}
        </h4>
        <p style={{ margin: 0, fontSize: 11.5, color: "var(--qc-text-body)", lineHeight: 1.45 }}>
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
