"use client";

import Link from "next/link";

export interface DiscoverScreen {
  id: string;
  iconSvg: string;
  badgeLabel?: string;
  badgeColor?: string;
  title: string;
  description: string;
  stats: { value: string | number; label: string }[];
  href: string;
}

interface DiscoverScreensProps {
  screens: DiscoverScreen[];
}

function ScreenCard({ screen }: { screen: DiscoverScreen }) {
  return (
    <Link
      href={screen.href}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #E2E2E2",
        borderRadius: 12,
        padding: "18px 20px",
        textDecoration: "none",
        flex: 1,
        gap: 0,
      }}
    >
      {/* Icon row + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: "1px solid #E2E2E2",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: screen.iconSvg }}
        />
        {screen.badgeLabel && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: screen.badgeColor ?? "#7c3aed",
              background: screen.badgeColor ? `${screen.badgeColor}18` : "#f3f0ff",
              border: `1px solid ${screen.badgeColor ?? "#7c3aed"}33`,
              borderRadius: 5,
              padding: "3px 9px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {screen.badgeLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 500, color: "#0F172B", marginBottom: 8, fontFamily: "Georgia, serif" }}>
        {screen.title}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.55, margin: "0 0 20px", flex: 1 }}>
        {screen.description}
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 24 }}>
        {screen.stats.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172B" }}>{s.value}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

export function DiscoverScreens({ screens }: DiscoverScreensProps) {
  return (
    <div
      style={{
        background: "#F5F5F5",
        border: "1px solid #E2E2E2",
        borderRadius: 14,
        padding: "16px 20px 20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            DISCOVER · WORTH YOUR ATTENTION THIS WEEK
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
            Curated screens · click any to see the names
          </div>
        </div>
        <Link href="#" style={{ fontSize: 12, color: "#888", textDecoration: "none", marginTop: 2 }}>
          All screens →
        </Link>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E2E2E2", margin: "12px 0 14px" }} />

      {/* 3-column card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {screens.map((s) => (
          <ScreenCard key={s.id} screen={s} />
        ))}
      </div>
    </div>
  );
}
