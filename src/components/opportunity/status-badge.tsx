interface StatusBadgeProps {
  label: string;
  color?: string;
}

function getBadgeStyle(color: string): { color: string; background: string; border: string; dotColor: string } {
  if (color === "green") return {
    color: "var(--qc-up)",
    background: "var(--qc-up-soft)",
    border: "1px solid var(--qc-up)",
    dotColor: "var(--qc-up)",
  };
  if (color === "red") return {
    color: "var(--qc-down)",
    background: "var(--qc-down-soft)",
    border: "1px solid var(--qc-down)",
    dotColor: "var(--qc-down)",
  };
  // yellow / default
  return {
    color: "var(--qc-warn)",
    background: "var(--qc-warn-soft)",
    border: "1px solid var(--qc-warn)",
    dotColor: "var(--qc-warn)",
  };
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const s = getBadgeStyle(color ?? "green");
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold"
      style={{ color: s.color, background: s.background, border: s.border }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.dotColor }} />
      {label}
    </span>
  );
}
