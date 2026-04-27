import Link from "next/link";

const RAIL_COLORS: Record<string, string> = {
  asked: "#C2410C",
  life:  "#15803D",
  idle:  "#1E40AF",
  gap:   "#B45309",
};

const TAG_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  asked: { bg: "#FEF2EC", color: "#C2410C", label: "Client asked" },
  life:  { bg: "#ECFDF5", color: "#15803D", label: "Life event"   },
  idle:  { bg: "#EFF6FF", color: "#1E40AF", label: "Idle cash"    },
  gap:   { bg: "#FEF7E6", color: "#B45309", label: "Coverage gap" },
};

const OPPORTUNITIES = [
  {
    id: "1",
    briefId: "priya-venkat",
    type: "asked",
    initials: "PV",
    name: "Priya Venkat",
    fit: "92%",
    headline: <>Asked about <em style={{ fontStyle: "italic", color: "#6B21A8" }}>NPS allocation</em> on last call. Never followed up.</>,
    evidence: '"Should we be doing NPS? What\'s the actual tax benefit at our slab?" · 11 Apr',
    value: "~₹50K /yr value",
  },
  {
    id: "2",
    briefId: "rahul-mehta",
    type: "life",
    initials: "RM",
    name: "Rahul Mehta",
    fit: "88%",
    headline: <>Daughter <em style={{ fontStyle: "italic", color: "#6B21A8" }}>turns 14 this month</em>. No education corpus.</>,
    evidence: "4 years to undergrad · current SIPs are general-purpose, no goal-linked plan",
    value: "₹35K/mo SIP",
  },
  {
    id: "3",
    briefId: "suresh-nair",
    type: "idle",
    initials: "SN",
    name: "Suresh Nair",
    fit: "78%",
    headline: <><em style={{ fontStyle: "italic", color: "#6B21A8" }}>₹62 L</em> in savings for 4 months · ~₹2L/yr lost vs liquid funds</>,
    evidence: "HDFC SB balance >₹50L since Dec · conservative profile fits liquid + ultra-short split",
    value: "₹2.1 L/yr uplift",
  },
];

export function OpportunitiesPanel() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
        <div>
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
            Opportunities worth a conversation
            <span
              className="text-[11px] font-normal normal-case tracking-normal rounded-full px-2 py-0.5"
              style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
            >
              12
            </span>
          </h3>
          <p className="text-[11px] mt-1" style={{ color: "var(--qc-text-muted)" }}>
            Observations from client data · ranked by receptivity, not commission
          </p>
        </div>
        <a href="#" className="text-[11px] whitespace-nowrap mt-0.5" style={{ color: "var(--qc-text-muted)" }}>All 12 →</a>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3" style={{ gap: 1, background: "var(--qc-border-default)" }}>
        {OPPORTUNITIES.map((opp) => {
          const tag = TAG_STYLES[opp.type];
          const railColor = RAIL_COLORS[opp.type];
          return (
            <div
              key={opp.id}
              className="flex cursor-pointer transition-colors hover:bg-[var(--qc-surface-hover)]"
              style={{ background: "var(--qc-surface-card)" }}
            >
              {/* Colored left rail */}
              <div className="w-1 flex-shrink-0 rounded-l-sm" style={{ background: railColor }} />

              {/* Body */}
              <div className="flex flex-col gap-2.5 px-4 py-4 flex-1">
                {/* Top: client info + fit */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                      style={{ background: "var(--qc-text-heading)", color: "#FCFCFA" }}
                    >
                      {opp.initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{opp.name}</p>
                      <span
                        className="text-[9px] font-semibold uppercase tracking-[0.06em] rounded-sm px-1.5 py-0.5 inline-block mt-0.5"
                        style={{ background: tag.bg, color: tag.color }}
                      >
                        {tag.label}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] rounded-sm px-1.5 py-0.5 flex-shrink-0"
                    style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)", color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                  >
                    Fit {opp.fit}
                  </span>
                </div>

                {/* Headline */}
                <p className="text-[15px] font-normal leading-[1.35] tracking-[-0.005em]" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}>
                  {opp.headline}
                </p>

                {/* Evidence quote */}
                <p
                  className="text-[11px] leading-[1.5] italic"
                  style={{ color: "var(--qc-text-body)", borderLeft: "2px solid var(--qc-border-default)", paddingLeft: 10 }}
                >
                  {opp.evidence}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: "1px dashed var(--qc-border-default)" }}>
                  <span className="text-[11px] font-medium" style={{ color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{opp.value}</span>
                  <Link
                    href={`/brief/${opp.briefId}`}
                    className="text-[11px] font-medium px-3 py-1 rounded-md"
                    style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", color: "var(--qc-text-body)", textDecoration: "none" }}
                  >
                    Brief →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ background: "var(--qc-surface-panel)", borderTop: "1px solid var(--qc-border-default)" }}
      >
        <p className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>
          <strong style={{ color: "var(--qc-text-heading)", fontWeight: 600 }}>9 more</strong>
          {" opportunities · ₹38.4 Cr total opportunity AUM · 7 coverage gaps · ₹14.2 Cr idle cash across book"}
        </p>
        <button
          className="text-[11px] font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap ml-4"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)" }}
        >
          Open Opportunities →
        </button>
      </div>
    </div>
  );
}
