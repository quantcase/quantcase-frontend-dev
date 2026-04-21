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
      : "var(--qc-text-muted)");
  const valueColor =
    sentiment === "up"
      ? "var(--qc-up)"
      : sentiment === "down"
      ? "var(--qc-down)"
      : "var(--qc-text-heading)";

  return (
    <div
      style={{
        background: "var(--qc-surface-white)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 96,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "var(--qc-text-body)", letterSpacing: ".01em" }}>
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
          fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em",
          color: valueColor, lineHeight: 1.2, marginTop: 2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--qc-text-muted)", marginTop: "auto", lineHeight: 1.35 }}>
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
        background: "var(--qc-border-default)",
        border: "1px solid var(--qc-border-default)",
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
