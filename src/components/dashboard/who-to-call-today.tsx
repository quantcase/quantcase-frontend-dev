import { Avatar, Badge, ActionButton, ColorRail, LimeCountPip, MonoLabel } from "@/components/ds";
import type { BadgeVariant } from "@/components/ds/Badge";
import { PhoneCall } from "lucide-react";

const CLIENTS = [
  {
    id: "1",
    initials: "RM",
    name: "Rahul Mehta",
    badge: "CRITICAL",
    badgeVariant: "crit" as BadgeVariant,
    railColor: "var(--qc-down)",
    railOpacity: 1,
    why: <>Anxious about small-cap volatility on last call. Portfolio drifted <b>+6% mid-cap</b>. No updated allocation brief sent.</>,
    aum: "₹3.2 Cr",
    ret: "−6.0% · 30d",
    retNeg: true,
    cta: "Call Now",
    lastTouch: "2d ago",
  },
  {
    id: "2",
    initials: "VK",
    name: "Varun Kapoor",
    badge: "HIGH RISK",
    badgeVariant: "warn" as BadgeVariant,
    railColor: "var(--qc-warn)",
    railOpacity: 1,
    why: <>Mid-cap overweight <b>+9%</b>. Small-cap near threshold. <b>14 days no interaction</b> — relationship cold.</>,
    aum: "₹7.1 Cr",
    ret: "−9.2% · 30d",
    retNeg: true,
    cta: "Rebalance",
    lastTouch: "16d ago",
  },
  {
    id: "3",
    initials: "AS",
    name: "Anita Shah",
    badge: "PENDING PROMISE",
    badgeVariant: "warn" as BadgeVariant,
    railColor: "var(--qc-warn)",
    railOpacity: 0.55,
    why: <>Asked for <b>EV &amp; Green Energy</b> sector update for 2025 allocation. Report drafted but not sent.</>,
    aum: "₹5.8 Cr",
    ret: "+1.4% · 30d",
    retNeg: false,
    cta: "Send Report",
    lastTouch: "7d ago",
  },
];

export function WhoToCallToday() {
  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", alignSelf: "start" }}
    >
      {/* Header — matches RM Heartbeat header style */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneCall className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Who to call today</MonoLabel>
          <LimeCountPip count={3} />
        </div>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--qc-ink-3)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ALL CLIENTS →
        </span>
      </div>

      {/* Content — white inner card matching RM Heartbeat's graph canvas wrapper */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)" }}>
        {CLIENTS.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: "36px minmax(0,1fr) 120px 100px",
              gap: 18,
              alignItems: "center",
              padding: "16px 18px",
              borderTop: i === 0 ? "none" : "1px solid var(--qc-hair-2)",
              position: "relative",
            }}
          >
            <ColorRail color={c.railColor} opacity={c.railOpacity} />
            <Avatar initials={c.initials} size={36} />

            {/* Body */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", color: "var(--qc-ink)" }}>{c.name}</span>
                <Badge variant={c.badgeVariant}>{c.badge}</Badge>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>{c.why}</div>
              <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 10, color: "var(--qc-ink-3)", marginTop: 6 }}>{c.lastTouch}</div>
            </div>

            {/* Numbers */}
            <div style={{ textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 13, lineHeight: 1.4 }}>
              <div style={{ color: "var(--qc-ink)", fontSize: 13.5 }}>{c.aum}</div>
              <div style={{ fontSize: 11, color: c.retNeg ? "var(--qc-down)" : "var(--qc-up)" }}>{c.ret}</div>
            </div>

            <ActionButton noWrap>{c.cta}</ActionButton>
          </div>
        ))}
      </div>
    </div>
  );
}
