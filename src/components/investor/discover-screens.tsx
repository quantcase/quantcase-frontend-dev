"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { MonoLabel } from "@/components/ds";

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
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair-2)",
        borderRadius: 10,
        padding: "16px 18px 14px",
        textDecoration: "none",
        flex: 1,
        cursor: "pointer",
      }}
    >
      {/* Icon + badge row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
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
              fontSize: "var(--qc-fz-10)",
              fontWeight: "var(--qc-w-bold)",
              fontFamily: "var(--qc-font-sans)",
              color: screen.badgeColor ?? "#7c3aed",
              background: screen.badgeColor ? `${screen.badgeColor}15` : "#f3f0ff",
              border: `1px solid ${screen.badgeColor ?? "#7c3aed"}30`,
              borderRadius: 20,
              padding: "3px 10px",
              letterSpacing: "var(--qc-track-eyebrow)",
              textTransform: "uppercase",
            }}
          >
            {screen.badgeLabel}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: "var(--qc-fz-14)",
          fontWeight: "var(--qc-w-semi)",
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink)",
          marginBottom: 8,
          lineHeight: 1.3,
          letterSpacing: "var(--qc-track-display)",
        }}
      >
        {screen.title}
      </div>

      <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
        {screen.description}
      </p>

      <div style={{ height: 1, background: "var(--qc-hair-2)", marginBottom: 14 }} />

      <div style={{ display: "flex", gap: 20 }}>
        {screen.stats.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink)", lineHeight: 1 }}>
              {s.value}
            </span>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-9)",
                fontWeight: "var(--qc-w-medium)",
                color: "var(--qc-ink-3)",
                letterSpacing: "var(--qc-track-eyebrow)",
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
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Header — matches WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Discover · Worth your attention this week</MonoLabel>
        </div>
        <Link
          href="/screener/home"
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: "var(--qc-track-mono)",
            color: "var(--qc-ink-3)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          ALL SCREENS →
        </Link>
      </div>

      {/* Subtitle */}
      <div className="px-2 pb-2" style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: -8 }}>
        Curated screens · click any to see the names
      </div>

      {/* 3-column card grid inside white inner card */}
      <div
        className="rounded-[10px]"
        style={{
          background: "var(--qc-card)",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {screens.map((s) => (
          <ScreenCard key={s.id} screen={s} />
        ))}
      </div>
    </div>
  );
}
