import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface MarketDataCardProps {
  week52High: number | null;
  week52Low: number | null;
  price: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  volume: number | null;
  avgVolume: number | null;
  eps: number | null;
  epsForward: number | null;
  dividendYield: number | null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-[28px] font-normal leading-none text-[#0F172B]">{value}</p>
    </div>
  );
}

function formatVol(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)}L`;
  return v.toLocaleString("en-IN");
}

export function MarketDataCard({
  week52High,
  week52Low,
  price,
  fiftyDayAverage,
  twoHundredDayAverage,
  volume,
  avgVolume,
  eps,
  epsForward,
  dividendYield,
}: MarketDataCardProps) {
  const rangePercent =
    price != null && week52High != null && week52Low != null && week52High !== week52Low
      ? ((price - week52Low) / (week52High - week52Low)) * 100
      : null;

  return (
    <Card className="bg-white border border-[#E2E2E2] rounded-[10px] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Market Data
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">Price &amp; Volume</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 52W range bar */}
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>52W Low {week52Low != null ? `₹${week52Low.toFixed(2)}` : "—"}</span>
            <span>52W High {week52High != null ? `₹${week52High.toFixed(2)}` : "—"}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {rangePercent != null && (
              <div
                className="absolute left-0 top-0 h-1.5 rounded-full bg-zinc-900"
                style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
              />
            )}
          </div>
        </div>

        {/* Moving averages + volume */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat label="50D Avg" value={fiftyDayAverage != null ? `₹${fiftyDayAverage.toFixed(2)}` : "—"} />
          <Stat label="200D Avg" value={twoHundredDayAverage != null ? `₹${twoHundredDayAverage.toFixed(2)}` : "—"} />
          <Stat label="Volume" value={volume != null ? formatVol(volume) : "—"} />
          <Stat label="Avg Volume" value={avgVolume != null ? formatVol(avgVolume) : "—"} />
        </div>

        {/* Per share */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat label="EPS (TTM)" value={eps != null ? `₹${eps.toFixed(2)}` : "—"} />
          <Stat label="Fwd EPS" value={epsForward != null ? `₹${epsForward.toFixed(2)}` : "—"} />
          <Stat label="Div Yield" value={dividendYield != null ? `${dividendYield.toFixed(2)}%` : "—"} />
        </div>
      </CardContent>
    </Card>
  );
}
