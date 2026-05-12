interface SectionDividerProps {
  label: string;
  sublabel?: string;
}

export function SectionDivider({ label, sublabel }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
      <div className="flex flex-col items-center gap-0.5 px-1">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--qc-ink)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: 10, color: "var(--qc-ink-2)", letterSpacing: "0.02em" }}>{sublabel}</span>
        )}
      </div>
      <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
    </div>
  );
}
