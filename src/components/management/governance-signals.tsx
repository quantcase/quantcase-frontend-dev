import { DataValue } from "@/components/molecules/data-value";
import { CheckCircle2 } from "lucide-react";
import type { GovernanceSignal } from "@/types/management";

interface GovernanceSignalsProps {
  signals: GovernanceSignal[];
}

export function GovernanceSignals({ signals }: GovernanceSignalsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
      {signals.length === 0 ? (
        <div className="flex items-start gap-2">
          <span className="text-sm text-zinc-400">No signals available</span>
        </div>
      ) : (
        signals.map((signal) => (
          <div
            key={signal.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-white p-3"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs text-[#121212] leading-snug">
              <DataValue value={signal.text} />
            </span>
          </div>
        ))
      )}
    </div>
  );
}
