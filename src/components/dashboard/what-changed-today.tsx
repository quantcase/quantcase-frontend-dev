const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  Alert:     { bg: "#FEF2EC", color: "#C2410C" },
  Research:  { bg: "#EFF6FF", color: "#1E40AF" },
  Completed: { bg: "#ECFDF5", color: "#15803D" },
  Action:    { bg: "#FEF7E6", color: "#B45309" },
};

const ITEMS = [
  {
    id: "1",
    time: "09:42",
    tag: "Alert",
    title: "Meridian Holdings — portfolio value below threshold",
    desc: <>Triggered drift alert. Held by <strong>Rahul Mehta</strong> (₹3.2 Cr). Position size 4.2% of book.</>,
    cta: "Review →",
  },
  {
    id: "2",
    time: "08:15",
    tag: "Research",
    title: "Emerging Markets Outlook — new note published",
    desc: <>Relevant to <strong>4 clients</strong>: Anita Shah, Priya Venkat, Suresh Nair, Kapoor &amp; Sons. Auto-tagged to portfolios.</>,
    cta: "Read →",
  },
  {
    id: "3",
    time: "07:50",
    tag: "Completed",
    title: "Northwind Capital — rebalance executed",
    desc: <>6 holdings rebalanced successfully. Confirmation sent to client. No further action needed.</>,
    cta: "View →",
  },
  {
    id: "4",
    time: "Yest",
    tag: "Action",
    title: "Apex Ventures — redemption request ₹8.2 Cr",
    desc: <>Submitted by client. Pending your approval. Settlement timeline: T+2.</>,
    cta: "Approve →",
  },
  {
    id: "5",
    time: "Yest",
    tag: "Research",
    title: "Bluechip Growth Fund — Q4 transcript flagged",
    desc: <>Management tone analysis flagged for review. Held by <strong>3 clients</strong>. Worth reading before next call.</>,
    cta: "Open →",
  },
];

export function WhatChangedToday() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
          What changed today
          <span
            className="text-[11px] font-normal normal-case tracking-normal rounded-full px-2 py-0.5"
            style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          >
            5
          </span>
        </h3>
        <a href="#" className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>All activity →</a>
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "var(--qc-border-default)" }}>
        {ITEMS.map((item) => {
          const tagStyle = TAG_STYLES[item.tag] ?? TAG_STYLES.Research;
          return (
            <div
              key={item.id}
              className="grid items-center gap-5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[var(--qc-surface-hover)] relative"
              style={{ gridTemplateColumns: "90px 1fr auto" }}
            >
              {/* Connector dot */}
              <div
                className="absolute rounded-full"
                style={{ left: 106, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, background: "var(--qc-border-default)" }}
              />

              {/* Time + tag */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[12px] font-medium" style={{ color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{item.time}</p>
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.04em] rounded-sm px-1.5 py-0.5 w-fit"
                  style={{ background: tagStyle.bg, color: tagStyle.color }}
                >
                  {item.tag}
                </span>
              </div>

              {/* Body */}
              <div>
                <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--qc-text-heading)" }}>{item.title}</p>
                <p className="text-[12px] leading-[1.5]" style={{ color: "var(--qc-text-body)" }}>{item.desc}</p>
              </div>

              {/* CTA */}
              <button
                className="text-[11px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)" }}
              >
                {item.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
