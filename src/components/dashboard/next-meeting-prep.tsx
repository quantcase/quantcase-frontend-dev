import Link from "next/link";

export function NextMeetingPrep() {
  return (
    <div
      className="grid gap-7 items-center px-6 py-4 rounded-xl relative overflow-hidden"
      style={{
        gridTemplateColumns: "auto 1fr 2fr auto",
        background: "linear-gradient(135deg, #FFFBF0 0%, #FEF7E6 100%)",
        border: "1px solid #F0E2BB",
      }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: "#B45309" }} />

      {/* Time rail */}
      <div className="flex flex-col gap-0.5 pr-6 min-w-[110px]" style={{ borderRight: "1px solid rgba(180,83,9,0.18)" }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#B45309" }}>Next meeting · in 47 min</p>
        <p className="text-[32px] font-normal leading-none tracking-[-0.02em]" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}>
          11:30
        </p>
        <p className="text-[10px]" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>Zoom · 30 min</p>
      </div>

      {/* Client info */}
      <div className="flex gap-3 items-center">
        <div
          className="size-11 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
          style={{ background: "var(--qc-text-heading)", color: "#FCFCFA" }}
        >
          PV
        </div>
        <div>
          <p className="text-[15px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>
            Priya Venkat{" "}
            <span className="text-[12px] font-normal ml-1.5" style={{ color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>₹4.6 Cr</span>
          </p>
          <p className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>Client since Mar 2022 · last met 11 Apr</p>
        </div>
      </div>

      {/* What to bring up */}
      <div className="pl-6" style={{ borderLeft: "1px solid rgba(180,83,9,0.18)" }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--qc-text-muted)" }}>What to bring up</p>
        <div className="flex flex-col gap-1">
          {[
            "Infra holding pending review (flagged 2w ago)",
            "She asked about NPS allocation last call — never followed up",
            "Birthday next week · personal note worth sending",
          ].map((point) => (
            <p key={point} className="text-[12px] leading-[1.45] relative pl-3.5" style={{ color: "var(--qc-text-heading)" }}>
              <span className="absolute left-0 font-semibold" style={{ color: "#B45309" }}>→</span>
              {point}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Link
          href="/brief/priya-venkat"
          className="text-[11px] font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)", textDecoration: "none" }}
        >
          Brief me →
        </Link>
        <button
          className="text-[12px] font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap"
          style={{ background: "var(--qc-text-heading)", color: "#FCFCFA" }}
        >
          Open file
        </button>
      </div>
    </div>
  );
}
