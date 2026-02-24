import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBadgeCard } from "@/components/portfolio/score-badge-card";
import { CheckCircle2, XCircle, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetDeepDive, ConvictionLevel } from "@/types/portfolio";

interface AssetDeepDiveCardProps {
  asset: AssetDeepDive;
}

const convictionConfig: Record<ConvictionLevel, { label: string; color: string }> = {
  strong_buy: {
    label: "Strong Buy",
    color: "bg-emerald-500 hover:bg-emerald-600 text-white border-0",
  },
  buy: {
    label: "Buy",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0",
  },
  hold: {
    label: "Hold",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0",
  },
  sell: {
    label: "Sell",
    color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0",
  },
};

export function AssetDeepDiveCard({ asset }: AssetDeepDiveCardProps) {
  const conviction = convictionConfig[asset.conviction];

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-full">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{asset.company}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span className="font-mono font-medium">{asset.ticker}</span>
              <span className="mx-1.5">•</span>
              {asset.sector}
            </p>
          </div>
          <Button className={cn("font-semibold flex-shrink-0", conviction.color)} size="sm">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            {conviction.label}
          </Button>
        </div>

        {/* Score dimensions */}
        <div className="grid grid-cols-4 gap-2">
          <ScoreBadgeCard
            label="Quality"
            value={asset.qualityScore.value}
            maxValue={asset.qualityScore.maxValue}
            sublabel={asset.qualityScore.sublabel}
            color={asset.qualityScore.color}
            icon={ShieldCheck}
          />
          <ScoreBadgeCard
            label="Growth"
            value={asset.growthScore.value}
            maxValue={asset.growthScore.maxValue}
            sublabel={asset.growthScore.sublabel}
            color={asset.growthScore.color}
            icon={TrendingUp}
          />
          <ScoreBadgeCard
            label="P/E Zone"
            value={asset.peZone.value}
            maxValue={asset.peZone.maxValue}
            sublabel={asset.peZone.sublabel}
            color={asset.peZone.color}
            icon={BarChart3}
          />
          {/* Total score */}
          <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 p-3 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Total Score
            </p>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {asset.totalScore}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/100</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">out of 100</div>
          </div>
        </div>

        {/* Asset class / valuation / suitable for */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Asset Class
            </p>
            <span className="inline-block rounded-md border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {asset.assetClass}
            </span>
          </div>
          <div className="flex items-start gap-1">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                Valuation Zone
              </p>
              <span className="inline-block rounded-md border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {asset.valuationZone}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Suitable For
            </p>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {asset.suitableFor.join(", ")}
            </p>
          </div>
        </div>

        {/* Positive / Risk factors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Positive Factors
              </p>
            </div>
            <ul className="space-y-1.5">
              {asset.positiveFactors.map((factor, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Risk Factors
              </p>
            </div>
            <ul className="space-y-1.5">
              {asset.riskFactors.map((factor, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
