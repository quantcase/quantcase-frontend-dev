import type { DrhpProceedsBreakdown } from "@/types/drhp";

interface ProceedsTableProps {
  breakdown: DrhpProceedsBreakdown[];
}

export function ProceedsTable({ breakdown }: ProceedsTableProps) {
  const items = breakdown.filter((b) => b.pct !== null && b.pct > 0);

  // Deduplicate by purpose
  const seen = new Set<string>();
  const unique = items.filter((b) => {
    if (seen.has(b.purpose)) return false;
    seen.add(b.purpose);
    return true;
  });

  const max = Math.max(...unique.map((b) => b.pct ?? 0));

  return (
    <div className="flex flex-col gap-2">
      {unique.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] leading-snug pr-4" style={{ color: "#121212" }}>{item.purpose}</p>
            <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: "#0F172B" }}>{item.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "#F5F5F5" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${((item.pct ?? 0) / max) * 100}%`, background: "#0F172B" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
