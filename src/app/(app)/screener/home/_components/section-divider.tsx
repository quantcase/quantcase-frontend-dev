"use client";

export function SectionDivider({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
      <div className="flex flex-col items-center gap-0.5 px-1">
        <span style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)" }}>
          {title}
        </span>
        <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", letterSpacing: "var(--qc-track-mono)" }}>
          {subtitle}
        </span>
      </div>
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
    </div>
  );
}
