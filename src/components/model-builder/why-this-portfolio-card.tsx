import { FileText, Pencil } from "lucide-react";

interface WhyThisPortfolioCardProps {
  points: string[];
  onEdit?: () => void;
}

export function WhyThisPortfolioCard({ points, onEdit }: WhyThisPortfolioCardProps) {
  const isEmpty = points.length === 0 || (points.length === 1 && points[0].startsWith("No rationale"));

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          <FileText className="h-3 w-3" />
          Why This Portfolio
        </p>
        {onEdit && (
          <button onClick={onEdit} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
        {isEmpty ? (
          <p className="text-sm" style={{ color: "#888888" }}>
            No rationale added yet. Edit this model to add portfolio thesis points.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 flex-shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>{point}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
