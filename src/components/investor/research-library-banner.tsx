"use client";

import Link from "next/link";

interface ResearchLibraryBannerProps {
  newIcNotes: number;
  catalystsNext30Days: number;
  subtitle: string;
  href: string;
}

export function ResearchLibraryBanner({
  newIcNotes,
  catalystsNext30Days,
  subtitle,
  href,
}: ResearchLibraryBannerProps) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        background: "#0F172B",
        borderRadius: 14,
        padding: "20px 26px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {/* Left: icon + text */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1, minWidth: 0 }}>
        {/* Icon box */}
        <div
          style={{
            width: 44,
            height: 44,
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 5,
              letterSpacing: "-0.01em",
            }}
          >
            Research Library
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", flexWrap: "wrap", gap: "0 6px" }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              {newIcNotes} new IC notes
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              {catalystsNext30Days} catalysts in next 30 days
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Right: pill stats + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "4px 12px",
              letterSpacing: "0.03em",
            }}
          >
            {newIcNotes} IC Notes
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "4px 12px",
              letterSpacing: "0.03em",
            }}
          >
            {catalystsNext30Days} Catalysts
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#0F172B",
            background: "#fff",
            borderRadius: 8,
            padding: "8px 18px",
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
          }}
        >
          Open library →
        </div>
      </div>
    </Link>
  );
}
