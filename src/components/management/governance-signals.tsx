import { DataValue } from "@/components/molecules/data-value";
import { CheckCircle2, XCircle } from "lucide-react";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { GovernanceSignal } from "@/types/management";

interface GovernanceSignalsProps {
  signals: GovernanceSignal[];
}

export function GovernanceSignals({ signals }: GovernanceSignalsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
        {signals.length === 0 ? (
          <div className="flex items-start gap-2">
            <span className="text-sm text-zinc-400">No signals available</span>
          </div>
        ) : (
          signals.map((signal) => {
            const statements = [
              ...(signal.targets?.map((t) => t.statement) ?? []),
              ...(signal.risks?.map((r) => r.risk) ?? []),
            ].filter(Boolean);

            const Icon = signal.isPositive ? CheckCircle2 : XCircle;
            const iconColor = signal.isPositive ? "text-emerald-600" : "text-red-600";

            const card = (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white p-3">
                <Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                <span className="text-xs text-[#121212] leading-snug">
                  <DataValue value={signal.text} />
                </span>
              </div>
            );

            if (statements.length === 0) {
              return <div key={signal.id}>{card}</div>;
            }

            return (
              <TooltipRoot key={signal.id}>
                <TooltipTrigger asChild>{card}</TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-sm max-h-60 overflow-y-auto p-3 space-y-1.5"
                >
                  {statements.map((stmt, i) => (
                    <p key={i} className="text-xs leading-relaxed">
                      {i + 1}. {stmt}
                    </p>
                  ))}
                </TooltipContent>
              </TooltipRoot>
            );
          })
        )}
      </div>
    </TooltipProvider>
  );
}
