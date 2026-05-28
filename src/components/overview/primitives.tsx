"use client";

import React from "react";

// ─── InlineMd ─────────────────────────────────────────────────────────────────
// Renders **bold** markdown tokens inline. Exported for use in child components.
export function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: "var(--qc-w-semi)" }}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ─── SectionShell ────────────────────────────────────────────────────────────
export function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
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
        fontFamily: "var(--qc-font-mono)",
        fontSize: "var(--qc-fz-11)",
        letterSpacing: "var(--qc-track-eyebrow-l)",
        color: "var(--qc-ink)",
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
        fontFamily: "var(--qc-font-mono)",
        fontSize: "var(--qc-fz-10)",
        letterSpacing: ".16em",
        color: "var(--qc-ink-2)",
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
        fontSize: "var(--qc-fz-11)",
        fontFamily: "var(--qc-font-sans)",
        fontWeight: "var(--qc-w-semi)",
        letterSpacing: "var(--qc-track-pill)",
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
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        fontSize: "var(--qc-fz-12)",
        fontFamily: "var(--qc-font-sans)",
        color: "var(--qc-ink)",
        fontWeight: "var(--qc-w-medium)",
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
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
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
          background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
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
            fontSize: "var(--qc-fz-16)",
            fontFamily: "var(--qc-font-sans)",
            fontWeight: "var(--qc-w-medium)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            color: "var(--qc-ink)",
          }}
        >
          <InlineMd text={headline} />
        </div>
        <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.6, color: "var(--qc-ink)", margin: 0 }}>
          <InlineMd text={body} />
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
        <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)" }}>
          {label}
        </span>
        <span
          style={{
            fontSize: "var(--qc-fz-16)",
            fontFamily: "var(--qc-font-mono)",
            fontWeight: "var(--qc-w-medium)",
            letterSpacing: "-0.015em",
            color: "var(--qc-ink)",
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
          background: "var(--qc-chip, #F2F1EC)",
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
            background: "var(--qc-ink)",
            opacity: 0.5,
          }}
        />
      </div>
      <div
        style={{
          fontSize: "var(--qc-fz-11)",
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink-2)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{subLeft}</span>
        <b
          style={{
            color: "var(--qc-ink)",
            fontWeight: "var(--qc-w-medium)",
            fontFamily: "var(--qc-font-mono)",
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
      : "var(--qc-ink-2)";
  return (
    <div
      style={{
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: "var(--qc-fz-11)",
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink-2)",
          letterSpacing: ".02em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--qc-fz-16)",
          fontFamily: "var(--qc-font-mono)",
          fontWeight: "var(--qc-w-medium)",
          letterSpacing: "-0.01em",
          color: "var(--qc-ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "var(--qc-fz-11)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-ink-2)",
              marginLeft: 2,
              fontWeight: "var(--qc-w-regular)",
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: subColor, marginTop: 2 }}>{sub}</div>
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
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
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
          borderRight: "1px solid var(--qc-hair-2)",
        }}
      >
        <MonoEyebrow style={{ marginBottom: 6 }}>{eyebrow}</MonoEyebrow>
        <h4
          style={{
            margin: "0 0 4px",
            fontSize: "var(--qc-fz-14)",
            fontFamily: "var(--qc-font-sans)",
            fontWeight: "var(--qc-w-medium)",
            letterSpacing: "-0.005em",
            color: "var(--qc-ink)",
          }}
        >
          {heading}
        </h4>
        <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.45 }}>
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
