const STATS = [
  { label: "Total AUM",     value: "₹796 Cr", delta: "+₹14 Cr · 7d",   deltaColor: "#15803D" },
  { label: "Clients",       value: "18",       delta: "+1 this month",   deltaColor: "#15803D" },
  { label: "Active alerts", value: "3",        delta: "2 from yesterday", deltaColor: "var(--qc-text-muted)", valueColor: "#C2410C" },
  { label: "Avg pulse",     value: "71",       delta: "+2 vs last wk",   deltaColor: "#15803D", valueSuffix: "/100" },
];

export function BookAtAGlance() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
          Book at a glance
        </h3>
      </div>
      <div className="grid grid-cols-2" style={{ gap: 1, background: "var(--qc-border-default)" }}>
        {STATS.map((s) => (
          <div key={s.label} className="px-4 py-3.5" style={{ background: "var(--qc-surface-card)" }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--qc-text-muted)" }}>{s.label}</p>
            <p
              className="text-[24px] font-normal leading-none tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: s.valueColor ?? "var(--qc-text-heading)" }}
            >
              {s.value}
              {s.valueSuffix && (
                <span className="text-[13px]" style={{ color: "var(--qc-text-muted)" }}>{s.valueSuffix}</span>
              )}
            </p>
            <p className="text-[11px] mt-1" style={{ color: s.deltaColor, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{s.delta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
