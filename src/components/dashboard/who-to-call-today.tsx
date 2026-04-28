const CLIENTS = [
  {
    id: "1",
    initials: "RM",
    name: "Rahul Mehta",
    badge: "Critical",
    badgeType: "critical" as const,
    why: <>Anxious about small-cap volatility on last call. Portfolio drifted <strong>+6% mid-cap</strong>. No updated allocation brief sent.</>,
    aum: "₹3.2 Cr",
    ret: "-6.0% · 30d",
    retNeg: true,
    cta: "Call Now",
    lastTouch: "2d ago",
  },
  {
    id: "2",
    initials: "VK",
    name: "Varun Kapoor",
    badge: "High Risk",
    badgeType: "critical" as const,
    why: <>Mid-cap overweight <strong>+9%</strong>. Small-cap near threshold. <strong>14 days no interaction</strong> — relationship cold.</>,
    aum: "₹7.1 Cr",
    ret: "-9.2% · 30d",
    retNeg: true,
    cta: "Rebalance",
    lastTouch: "16d ago",
  },
  {
    id: "3",
    initials: "AS",
    name: "Anita Shah",
    badge: "Pending Promise",
    badgeType: "warning" as const,
    why: <>Asked for <strong>EV &amp; Green Energy</strong> sector update for 2025 allocation. Report drafted but not sent.</>,
    aum: "₹5.8 Cr",
    ret: "+1.4% · 30d",
    retNeg: false,
    cta: "Send Report",
    lastTouch: "7d ago",
  },
];

const BADGE_STYLES = {
  critical: { bg: "#FEF2EC", color: "#C2410C" },
  warning:  { bg: "#FEF7E6", color: "#B45309" },
};

const AVATAR_STYLES = {
  critical: { bg: "#C2410C" },
  warning:  { bg: "#B45309" },
};

export function WhoToCallToday() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
          Who to call today
          <span
            className="text-[11px] font-normal normal-case tracking-normal rounded-full px-2 py-0.5"
            style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          >
            3
          </span>
        </h3>
        <a href="#" className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>All clients →</a>
      </div>

      {/* Client rows */}
      <div className="divide-y" style={{ borderColor: "var(--qc-border-default)" }}>
        {CLIENTS.map((c) => (
          <div
            key={c.id}
            className="grid gap-4 items-center px-5 py-4 cursor-pointer transition-colors hover:bg-[var(--qc-surface-hover)]"
            style={{ gridTemplateColumns: "auto 1fr auto auto" }}
          >
            {/* Avatar */}
            <div
              className="size-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              style={{ background: AVATAR_STYLES[c.badgeType].bg, color: "#fff" }}
            >
              {c.initials}
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{c.name}</p>
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-sm"
                  style={{ background: BADGE_STYLES[c.badgeType].bg, color: BADGE_STYLES[c.badgeType].color }}
                >
                  {c.badge}
                </span>
              </div>
              <p className="text-[12px] leading-[1.5]" style={{ color: "var(--qc-text-body)" }}>{c.why}</p>
            </div>

            {/* Meta */}
            <div className="text-right">
              <p className="text-[13px] font-medium" style={{ color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{c.aum}</p>
              <p className="text-[11px] mt-0.5" style={{ color: c.retNeg ? "#C2410C" : "#15803D", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{c.ret}</p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-1">
              <button
                className="text-[12px] font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap"
                style={{ background: "var(--qc-text-heading)", color: "#FCFCFA" }}
              >
                {c.cta}
              </button>
              <span className="text-[10px]" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{c.lastTouch}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
