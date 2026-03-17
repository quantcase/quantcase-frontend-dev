import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataValue } from "@/components/molecules/data-value";
import { formatLabel } from "@/lib/utils";
import type { TrustScore } from "@/types/management";
import { Shield } from "lucide-react";

function getTrustColor(overall: string | undefined): string {
  const upper = String(overall ?? "").toUpperCase();
  if (upper === "HIGH") return "text-emerald-600 dark:text-emerald-400";
  if (upper === "LOW") return "text-red-600 dark:text-red-400";
  return "text-zinc-900 dark:text-zinc-50";
}

interface TrustPanelProps {
  trust: TrustScore;
}

function getRatingBlocks(value: number): { filled: number; total: number } {
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
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
            MANAGEMENT QUALITY SUMMARY
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Overall Trust Level</p>
          <p className={`text-2xl font-normal ${getTrustColor(trust.overall)}`}>
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
                <div className="flex justify-between items-center">
                  <span className="text-xs font-light text-zinc-600 dark:text-zinc-400">{formatLabel(key)}</span>
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
