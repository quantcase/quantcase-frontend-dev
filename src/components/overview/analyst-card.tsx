import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface AnalystCardProps {
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  recommendationKey: string | null;
  numberOfAnalysts: number | null;
  currentPrice: number | null;
  heldPercentInsiders: number | null;
  heldPercentInstitutions: number | null;
}

const RECOMMENDATION_LABELS: Record<string, { label: string; color: string }> = {
  "strong_buy": { label: "Strong Buy", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  "buy":        { label: "Buy",         color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  "hold":       { label: "Hold",        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "sell":       { label: "Sell",        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  "strong_sell":{ label: "Strong Sell", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  "none":       { label: "No Rating",   color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export function AnalystCard({
  targetMeanPrice,
  targetHighPrice,
  targetLowPrice,
  recommendationKey,
  numberOfAnalysts,
  currentPrice,
  heldPercentInsiders,
  heldPercentInstitutions,
}: AnalystCardProps) {
  const rec = recommendationKey
    ? (RECOMMENDATION_LABELS[recommendationKey] ?? RECOMMENDATION_LABELS["none"])
    : null;

  const upside =
    targetMeanPrice != null && currentPrice != null && currentPrice > 0
      ? ((targetMeanPrice - currentPrice) / currentPrice) * 100
      : null;

  const rangePercent =
    currentPrice != null && targetHighPrice != null && targetLowPrice != null &&
    targetHighPrice !== targetLowPrice
      ? ((currentPrice - targetLowPrice) / (targetHighPrice - targetLowPrice)) * 100
      : null;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Analyst Coverage
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              {numberOfAnalysts != null ? `${numberOfAnalysts} analysts` : "Price targets & ratings"}
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mean target + upside + recommendation badge */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Mean Target</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {targetMeanPrice != null ? `₹${targetMeanPrice.toFixed(0)}` : "—"}
              </span>
              {upside != null && (
                <span className={`text-sm font-semibold ${upside >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          {rec && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${rec.color}`}>
              {rec.label}
            </span>
          )}
        </div>

        {/* Target range bar */}
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Low {targetLowPrice != null ? `₹${targetLowPrice.toFixed(0)}` : "—"}</span>
            <span>High {targetHighPrice != null ? `₹${targetHighPrice.toFixed(0)}` : "—"}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {rangePercent != null && (
              <div
                className="absolute top-0 h-1.5 w-2 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-300"
                style={{ left: `${Math.min(100, Math.max(0, rangePercent))}%` }}
              />
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1 text-center">
            {currentPrice != null ? `Current ₹${currentPrice.toFixed(2)}` : ""}
          </p>
        </div>

        {/* Holdings */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat
            label="Insider Held"
            value={heldPercentInsiders != null ? `${(heldPercentInsiders * 100).toFixed(1)}%` : "—"}
          />
          <Stat
            label="Institution Held"
            value={heldPercentInstitutions != null ? `${(heldPercentInstitutions * 100).toFixed(1)}%` : "—"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
