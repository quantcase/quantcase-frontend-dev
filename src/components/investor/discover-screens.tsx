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
        padding: "20px 20px 18px",
        textDecoration: "none",
        flex: 1,
        gap: 0,
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Icon + badge row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div
          style={{
            width: 38,
            height: 38,
            border: "1px solid rgba(18,18,18,0.10)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(18,18,18,0.03)",
            flexShrink: 0,
          }}
          dangerouslySetInnerHTML={{ __html: screen.iconSvg }}
        />
        {screen.badgeLabel && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: screen.badgeColor ?? "#7c3aed",
              background: screen.badgeColor ? `${screen.badgeColor}15` : "#f3f0ff",
              border: `1px solid ${screen.badgeColor ?? "#7c3aed"}30`,
              borderRadius: 20,
              padding: "3px 10px",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {screen.badgeLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#0F172B",
          marginBottom: 8,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {screen.title}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>
        {screen.description}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "#F0F0F0", marginBottom: 16 }} />

      {/* Stats row */}
      <div style={{ display: "flex", gap: 20 }}>
        {screen.stats.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#0F172B", lineHeight: 1 }}>
              {s.value}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#aaa",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
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
        padding: "18px 20px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#0F172B",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            DISCOVER · WORTH YOUR ATTENTION THIS WEEK
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            Curated screens · click any to see the names
          </div>
        </div>
        <Link
          href="/screener/home"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#555",
            textDecoration: "none",
            background: "#fff",
            border: "1px solid #E2E2E2",
            borderRadius: 6,
            padding: "5px 12px",
          }}
        >
          All screens →
        </Link>
      </div>

      {/* 3-column card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {screens.map((s) => (
          <ScreenCard key={s.id} screen={s} />
        ))}
      </div>
    </div>
  );
}
