"use client";

import Link from "next/link";
import {
  Compass,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Percent,
  ShieldCheck,
  Flame,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { MonoLabel } from "@/components/ds";
import type { DiscoverScreenDto, DiscoverBadgeKind } from "@/types/investor-dashboard";

// Icon-key → lucide icon. Backend sends a string key (not SVG); unknown keys fall back to a chart.
const ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  refresh: RefreshCw,
  "dollar-sign": DollarSign,
  percent: Percent,
  shield: ShieldCheck,
  flame: Flame,
  chart: BarChart3,
};

// Render the icon for a given key. Declared at module scope so the resolved
// lucide component isn't created during ScreenCard's render.
function ScreenIcon({ icon }: { icon: string }) {
  const Icon: LucideIcon = ICON_MAP[icon] ?? BarChart3;
  return <Icon size={16} strokeWidth={2} style={{ color: "#555" }} />;
}

// Badge color from the design system, keyed off the semantic badge kind.
const BADGE_COLORS: Record<DiscoverBadgeKind, string> = {
  warning: "#d97706",
  new: "#7c3aed",
  info: "#0891b2",
};

function badgeColor(kind?: DiscoverBadgeKind): string {
  return kind ? BADGE_COLORS[kind] : "#7c3aed";
}

interface DiscoverScreensProps {
  screens: DiscoverScreenDto[];
}

function ScreenCard({ screen }: { screen: DiscoverScreenDto }) {
  const bColor = badgeColor(screen.badge_kind);
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
        >
          <ScreenIcon icon={screen.icon} />
        </div>
        {screen.badge_label && (
          <span
            style={{
              fontSize: "var(--qc-fz-10)",
              fontWeight: "var(--qc-w-bold)",
              fontFamily: "var(--qc-font-sans)",
              color: bColor,
              background: `${bColor}15`,
              border: `1px solid ${bColor}30`,
              borderRadius: 20,
              padding: "3px 10px",
              letterSpacing: "var(--qc-track-eyebrow)",
              textTransform: "uppercase",
            }}
          >
            {screen.badge_label}
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
        className="rounded-[10px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          background: "var(--qc-card)",
          padding: "14px",
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
