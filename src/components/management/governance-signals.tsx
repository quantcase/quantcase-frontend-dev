import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { GovernanceSignal } from "@/types/management";

interface GovernanceSignalsProps {
  signals: GovernanceSignal[];
}

export function GovernanceSignals({ signals }: GovernanceSignalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">●</span> GOVERNANCE SIGNALS & EVIDENCE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {signals.map((signal) => (
            <div key={signal.id} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{signal.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
