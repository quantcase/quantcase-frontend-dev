"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import type { IndustrySignalBreakdownItem } from "@/types/opportunity";

// ─── CSS-var–based sentiment helpers ─────────────────────────────────────────

export function sentimentVars(sentiment: IndustrySignalBreakdownItem["sentiment"]) {
  if (sentiment === "positive")
    return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "#BBD9C6" };
  if (sentiment === "negative")
    return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "#F0C0BB" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "#E8D4A0" };
}

export function scoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.7) return "var(--qc-up)";
  if (pct >= 0.4) return "var(--qc-warn)";
  return "var(--qc-down)";
}

export function statusVars(status: string, color?: string) {
  const c = (color ?? status ?? "").toLowerCase();
  if (c === "green" || c === "high" || c === "favorable" || c === "strong")
    return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", tagBg: "var(--qc-up)" };
  if (c === "red" || c === "low" || c === "unfavorable" || c === "weak")
    return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", tagBg: "var(--qc-down)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", tagBg: "var(--qc-warn)" };
}

// ─── Shared SignalRow (horizontal bar, same as management card) ───────────────

export function SignalRow({ item }: { item: IndustrySignalBreakdownItem }) {
  const [open, setOpen] = useState(false);
  const sv = sentimentVars(item.sentiment);
  const pct = item.max_score > 0 ? (item.score / item.max_score) * 100 : 0;
  const label = item.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "default" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sv.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--qc-ink)", width: 130, flexShrink: 0, lineHeight: 1.2 }}>{label}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(0,0,0,0.10)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: sv.color, transition: "width .4s" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, width: 46, justifyContent: "flex-end", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: sv.color, fontVariantNumeric: "tabular-nums" }}>
            {item.score}
            <span style={{ color: "var(--qc-ink-3)", fontWeight: 400 }}>/{item.max_score}</span>
          </span>
          <Info style={{ width: 10, height: 10, color: "var(--qc-ink-2)", flexShrink: 0 }} />
        </div>
      </div>

      {open && item.details.length > 0 && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 50,
          width: 280, borderRadius: 14,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, var(--qc-card))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderBottom: "1px solid var(--qc-hair)",
            background: sv.bg, borderRadius: "14px 14px 0 0",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: sv.color }}>{item.score}/{item.max_score}</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sv.color, flexShrink: 0, marginTop: 5 }} />
                <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared IntelligenceCardShell ─────────────────────────────────────────────
// Outer wrapper: row-alt bg + border, 8px padding, 18px radius (matches mgmt card)

export function IntelligenceCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--qc-section)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 18,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {children}
    </div>
  );
}

// ─── Shared card header row ───────────────────────────────────────────────────

export function IntelligenceCardHeader({ icon, title, badge }: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 2px" }}>
      <div style={{
        padding: 6, borderRadius: 8, display: "grid", placeItems: "center",
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-chip)",
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", letterSpacing: "0.01em" }}>
        {title}
      </span>
      {badge && (
        <span style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 500,
          color: "var(--qc-ink-2)",
          background: "var(--qc-chip)", border: "1px solid var(--qc-hair)",
          borderRadius: 4, padding: "2px 8px",
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Score+Signals white card with lime gradient overlay ──────────────────────

interface ScoreCardProps {
  eyebrow: string;
  score: number;
  maxScore: number;
  status: string;
  statusColor?: string;
  takeaway?: string | null;
  signals: IndustrySignalBreakdownItem[];
  subLabels?: [string, string, string];
}

export function ScoreSignalsCard({
  eyebrow, score, maxScore, status, statusColor, takeaway, signals,
  subLabels = ["Low", "Medium", "High"],
}: ScoreCardProps) {
  const theme = statusVars(status, statusColor);
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const barColor = scoreColor(score, maxScore);

  return (
    <div style={{
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 14,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* lime gradient overlay */}
      <div style={{
        position: "absolute", inset: "auto 0 0 0", height: "50%",
        background: "linear-gradient(180deg, transparent 0%, var(--qc-lime-bg) 100%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Score row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              letterSpacing: ".16em", color: "var(--qc-ink-2)",
              textTransform: "uppercase" as const, marginBottom: 6,
            }}>
              {eyebrow}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--qc-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {score}
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "var(--qc-ink-2)", fontWeight: 400 }}>
                /{maxScore}
              </span>
            </div>
          </div>
          <span style={{
            display: "inline-block", borderRadius: 999,
            padding: "4px 11px", fontSize: 11, fontWeight: 600,
            background: theme.bg, color: theme.color,
            border: `1px solid ${theme.color}30`,
            marginTop: 2,
          }}>
            {status}
          </span>
        </div>

        {/* Score bar */}
        <div>
          <div style={{ height: 5, background: "var(--qc-hair)", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: barColor, transition: "width .4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {subLabels.map((l) => (
              <span key={l} style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "var(--qc-hair)" }} />

        {/* Signal rows */}
        {signals.length > 0 && (
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: ".16em", color: "var(--qc-ink-2)",
              textTransform: "uppercase" as const, marginBottom: 8,
            }}>
              Signal Breakdown · hover for details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {signals.map((item) => (
                <SignalRow key={item.key} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaway */}
        {takeaway && (
          <>
            <div style={{ height: 1, background: "var(--qc-hair)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
              }}>
                Key Takeaway
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.005em" }}>
                {takeaway}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared section white sub-card ────────────────────────────────────────────

export function IntelligenceSubCard({ icon, eyebrow, badge, badgeColor, badgeBg, children }: {
  icon?: React.ReactNode;
  eyebrow: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 14,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon && (
          <div style={{
            padding: 5, borderRadius: 6,
            border: "1px solid var(--qc-hair)",
            background: "var(--qc-chip)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
        }}>
          {eyebrow}
        </div>
        {badge && (
          <span style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 9px", borderRadius: 999,
            background: badgeBg ?? "var(--qc-chip)",
            border: `1px solid ${badgeColor ? `${badgeColor}30` : "var(--qc-hair)"}`,
            fontSize: 10, fontWeight: 600,
            color: badgeColor ?? "var(--qc-ink-2)",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: badgeColor ?? "var(--qc-ink-2)", flexShrink: 0 }} />
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Clamped text with hover-to-expand popover ───────────────────────────────

function ClampedText({ text, clamp = 2 }: { text: string; clamp?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", minWidth: 0 }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <p style={{
        margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: clamp,
        WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
        overflow: "hidden",
        cursor: "default",
      }}>
        {text}
      </p>
      {open && (
        <div style={{
          position: "absolute", left: 0, top: "100%", marginTop: 4,
          zIndex: 50, width: 300, borderRadius: 12,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, var(--qc-card))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          padding: "10px 12px",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>{text}</p>
        </div>
      )}
    </div>
  );
}

// ─── Shared strategy rows (vertically stacked label+value, clamped) ──────────

export function StrategyRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
            color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            letterSpacing: ".12em",
          }}>
            {r.label}
          </span>
          <ClampedText text={r.value} clamp={3} />
        </div>
      ))}
    </div>
  );
}

// ─── Shared watch-out / bullet list (clamped) ────────────────────────────────

export function BulletList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((point, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "6px 0",
          borderBottom: i < items.length - 1 ? "1px solid var(--qc-hair)" : "none",
        }}>
          <span style={{ fontSize: 12, color: "var(--qc-ink-2)", flexShrink: 0, lineHeight: 1.5, userSelect: "none" }}>–</span>
          <ClampedText text={point} clamp={2} />
        </div>
      ))}
    </div>
  );
}
