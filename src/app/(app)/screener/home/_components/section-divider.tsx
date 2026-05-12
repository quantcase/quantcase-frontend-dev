"use client";

export function SectionDivider({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
      <div className="flex flex-col items-center gap-0.5 px-1">
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {title}
        </span>
        <span style={{ fontSize: 10, color: "var(--qc-ink-2)", letterSpacing: "0.02em" }}>
          {subtitle}
        </span>
      </div>
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
    </div>
  );
}
