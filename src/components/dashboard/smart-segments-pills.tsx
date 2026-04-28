const SEGMENTS = [
  { id: "1", label: "Needs immediate action", count: 3,  alert: true  },
  { id: "2", label: "Portfolio drift alerts", count: 5,  alert: false },
  { id: "3", label: "High AUM (₹5Cr+)",       count: 7,  alert: false },
  { id: "4", label: "EV / Green Energy interest", count: 4, alert: false },
  { id: "5", label: "Conservative",           count: 6,  alert: false },
  { id: "6", label: "Inactive > 30 days",     count: 2,  alert: false },
  { id: "7", label: "KYC expiring",           count: 1,  alert: false },
];

export function SmartSegmentsPills() {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
          Smart segments
        </h3>
        <a href="#" className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>Create segment →</a>
      </div>
      <div className="flex flex-wrap gap-2 px-5 py-3.5">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-colors hover:bg-[var(--qc-surface-hover)]"
            style={{
              border: seg.alert ? "1px solid #C2410C" : "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-panel)",
              color: seg.alert ? "#C2410C" : "var(--qc-text-body)",
            }}
          >
            {seg.label}
            <span
              className="text-[10px] rounded-sm px-1.5 py-0.5"
              style={{
                background: seg.alert ? "#FEF2EC" : "var(--qc-surface-card)",
                color: seg.alert ? "#C2410C" : "var(--qc-text-muted)",
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
              }}
            >
              {seg.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
