"use client";

import Link from "next/link";

interface ResearchLibraryBannerProps {
  newIcNotes: number;
  catalystsNext30Days: number;
  subtitle: string;
  href: string;
}

export function ResearchLibraryBanner({ newIcNotes, catalystsNext30Days, subtitle, href }: ResearchLibraryBannerProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px dashed #D4D4D4",
        borderRadius: 14,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Icon + text */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Search icon box */}
        <div
          style={{
            width: 42,
            height: 42,
            border: "1px solid #E2E2E2",
            borderRadius: 10,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", marginBottom: 3 }}>
            Research Library
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>
            <span style={{ fontWeight: 600, color: "#0F172B" }}>{newIcNotes} new IC notes</span>
            <span style={{ color: "#aaa", margin: "0 5px" }}>·</span>
            <span style={{ fontWeight: 600, color: "#0F172B" }}>{catalystsNext30Days} catalysts in next 30 days</span>
            <span style={{ color: "#aaa", margin: "0 5px" }}>·</span>
            <span>{subtitle}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#0F172B",
          background: "#fff",
          border: "1px solid #E2E2E2",
          borderRadius: 8,
          padding: "7px 16px",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Open library →
      </Link>
    </div>
  );
}
