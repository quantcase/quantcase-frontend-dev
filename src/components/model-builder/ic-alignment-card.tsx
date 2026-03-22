import { CheckCircle2, AlertCircle } from "lucide-react";

interface ICAlignmentCardProps {
  title: string;
  description: string;
  status?: "ok" | "over" | "under";
}

export function ICAlignmentCard({ title, description, status = "under" }: ICAlignmentCardProps) {
  const isOk = status === "ok";
  const isOver = status === "over";

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          {isOk
            ? <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            : <AlertCircle className="h-3 w-3 text-zinc-400" />
          }
          IC Alignment
        </p>
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
        <p className="text-sm font-semibold mb-1" style={{ color: isOver ? "#dc2626" : "#0F172B" }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: "#888888" }}>{description}</p>
      </div>
    </div>
  );
}
