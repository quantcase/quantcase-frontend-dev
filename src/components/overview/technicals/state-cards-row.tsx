"use client";

// ─── StateCard ────────────────────────────────────────────────────────────────

interface StateCardProps {
  label: string;
  value: string;
  sub: string;
  sentiment: "up" | "down" | "neutral";
  iconPath: string;
  iconCircle?: boolean;
  iconColor?: string;
}

function StateCard({
  label, value, sub, sentiment, iconPath, iconCircle = false, iconColor,
}: StateCardProps) {
  const icnBg =
    iconColor ??
    (sentiment === "up"
      ? "var(--qc-up)"
      : sentiment === "down"
      ? "var(--qc-down)"
      : "var(--qc-ink-2)");
  const valueColor =
    sentiment === "up"
      ? "var(--qc-up)"
      : sentiment === "down"
      ? "var(--qc-down)"
      : "var(--qc-ink)";

  return (
    <div
      style={{
        background: "var(--qc-card)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 96,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", letterSpacing: ".01em", fontFamily: "var(--qc-font-sans)" }}>
          {label}
        </span>
        <div
          style={{
            width: 22, height: 22, borderRadius: 6,
            display: "grid", placeItems: "center",
            color: "#fff", flex: "0 0 auto",
            background: icnBg,
          }}
        >
          <svg
            width="11" height="11" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {iconCircle && <circle cx="12" cy="12" r="9" />}
            <path d={iconPath} />
          </svg>
        </div>
      </div>
      <div
        style={{
          fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.01em",
          color: valueColor, lineHeight: 1.2, marginTop: 2, fontFamily: "var(--qc-font-mono)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", marginTop: "auto", lineHeight: 1.35, fontFamily: "var(--qc-font-sans)" }}>
        {sub}
      </div>
    </div>
  );
}

// ─── StateCardsRow ────────────────────────────────────────────────────────────

export interface StateCardsRowItem {
  label: string;
  value: string;
  sub: string;
  sentiment: "up" | "down" | "neutral";
  iconPath: string;
  iconCircle?: boolean;
  iconColor?: string;
}

export function StateCardsRow({ items }: { items: StateCardsRowItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length},1fr)`,
        gap: 1,
        background: "var(--qc-hair)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        overflow: "hidden",
        margin: "14px 0",
      }}
    >
      {items.map((item) => (
        <StateCard key={item.label} {...item} />
      ))}
    </div>
  );
}
