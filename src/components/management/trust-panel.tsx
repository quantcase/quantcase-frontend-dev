import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import { formatLabel } from "@/lib/utils";
import type { TrustScore } from "@/types/management";
import { Shield } from "lucide-react";

interface TrustPanelProps {
  trust: TrustScore;
}

function getRatingBlocks(value: number): { filled: number; total: number } {
  // Convert percentage to 4-block scale
  if (value >= 90) return { filled: 4, total: 4 };
  if (value >= 75) return { filled: 4, total: 4 };
  if (value >= 60) return { filled: 3, total: 4 };
  if (value >= 40) return { filled: 2, total: 4 };
  if (value >= 20) return { filled: 1, total: 4 };
  return { filled: 0, total: 4 };
}

export function TrustPanel({ trust }: TrustPanelProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
            MANAGEMENT QUALITY SUMMARY
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">Overall Trust Level</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            <DataValue value={trust.overall} />
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            <span className="text-[10px]">LOW</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
            <span className="text-[10px]">MODERATE</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full" />
            <span className="text-[10px]">HIGH</span>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(trust.subfactors).map(([key, value]) => {
            const blocks = getRatingBlocks(value);
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{formatLabel(key)}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: blocks.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded-sm ${
                          i < blocks.filled
                            ? "bg-green-600 dark:bg-green-400"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
