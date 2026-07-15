import type { DrhpShareholder } from "@/types/drhp";

interface ShareholderGridProps {
  shareholders: DrhpShareholder[];
}

export function ShareholderGrid({ shareholders }: ShareholderGridProps) {
  const unique = Array.from(new Map(shareholders.map((s) => [s.name, s])).values()).slice(0, 18);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {unique.map((s) => (
        <div
          key={s.name}
          className="rounded-[8px] border border-hair bg-secondary px-3 py-2.5 flex items-center justify-between gap-2"
        >
          <p className="text-[12px] font-medium leading-snug truncate" style={{ color: "var(--qc-ink)" }}>{s.name}</p>
          <span
            className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider ${
              s.status === "EXIT" ? "text-down" : "text-up"
            }`}
          >
            {s.status}
          </span>
        </div>
      ))}
    </div>
  );
}
