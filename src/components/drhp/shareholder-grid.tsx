import type { DrhpShareholder } from "@/types/drhp";

interface ShareholderGridProps {
  shareholders: DrhpShareholder[];
}

export function ShareholderGrid({ shareholders }: ShareholderGridProps) {
  // Deduplicate by name, prefer entries with exitCr data
  const map = new Map<string, DrhpShareholder>();
  for (const s of shareholders) {
    const existing = map.get(s.name);
    if (!existing || (s.exitCr !== null && s.exitCr !== undefined)) {
      map.set(s.name, s);
    }
  }
  const unique = Array.from(map.values()).slice(0, 18);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {unique.map((s) => (
        <div
          key={s.name}
          className="rounded-[8px] border border-[#E2E2E2] px-3 py-2.5 flex flex-col gap-1"
          style={{ background: "#FAFAFA" }}
        >
          <p className="text-[12px] font-medium leading-snug" style={{ color: "#0F172B" }}>{s.name}</p>
          <div className="flex items-center justify-between">
            {s.holdingPct !== null && s.holdingPct !== undefined ? (
              <span className="text-[11px]" style={{ color: "#888888" }}>{s.holdingPct}%</span>
            ) : (
              <span />
            )}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                s.status === "EXIT" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {s.exitCr ? `EXIT ₹${s.exitCr} Cr` : s.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
