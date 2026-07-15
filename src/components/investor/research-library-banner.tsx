"use client";

import Link from "next/link";

interface ResearchLibraryBannerProps {
  newIcNotes: number;
  catalystsNext30Days: number;
  subtitle?: string;
  href: string;
  onOpenJournal?: () => void;
}

const DEFAULT_SUBTITLE = "DRHP verdicts, management commentary & thesis updates";

export function ResearchLibraryBanner({
  newIcNotes,
  catalystsNext30Days,
  subtitle = DEFAULT_SUBTITLE,
  href,
  onOpenJournal,
}: ResearchLibraryBannerProps) {
  return (
    <Link
      href={onOpenJournal ? "#" : href}
      onClick={onOpenJournal ? (e) => { e.preventDefault(); onOpenJournal(); } : undefined}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{
        background: "var(--qc-ink)",
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
              fontSize: "var(--qc-fz-14)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-on-dark)",
              marginBottom: 5,
              letterSpacing: "var(--qc-track-display)",
            }}
          >
            Research Library
          </div>
          <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "rgba(255,255,255,0.5)", display: "flex", flexWrap: "wrap", gap: "0 6px" }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: "var(--qc-w-semi)" }}>
              {newIcNotes} new IC notes
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: "var(--qc-w-semi)" }}>
              {catalystsNext30Days} catalysts in next 30 days
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Right: pill stats + CTA */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap" style={{ flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "4px 12px",
              letterSpacing: "var(--qc-track-mono)",
            }}
          >
            {newIcNotes} IC Notes
          </span>
          <span
            style={{
              fontSize: "var(--qc-fz-11)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "4px 12px",
              letterSpacing: "var(--qc-track-mono)",
            }}
          >
            {catalystsNext30Days} Catalysts
          </span>
        </div>

        <div
          style={{
            fontSize: "var(--qc-fz-12)",
            fontWeight: "var(--qc-w-semi)",
            fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-ink)",
            background: "var(--qc-card)",
            borderRadius: 8,
            padding: "8px 18px",
            whiteSpace: "nowrap",
            letterSpacing: "var(--qc-track-pill)",
          }}
        >
          Open journal →
        </div>
      </div>
    </Link>
  );
}
