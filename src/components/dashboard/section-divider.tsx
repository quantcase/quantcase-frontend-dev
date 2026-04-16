interface SectionDividerProps {
  label: string;
  sublabel?: string;
}

export function SectionDivider({ label, sublabel }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex-1 h-px bg-[#E2E2E2]" />
      <div className="flex flex-col items-center gap-0.5 px-1">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#0F172B",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: 10, color: "#888888", letterSpacing: "0.02em" }}>{sublabel}</span>
        )}
      </div>
      <div className="flex-1 h-px bg-[#E2E2E2]" />
    </div>
  );
}
