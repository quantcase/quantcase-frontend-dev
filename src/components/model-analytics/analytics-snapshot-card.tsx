import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface SnapshotStat {
  label: string;
  value: string | number;
}

interface AnalyticsSnapshotCardProps {
  stats: SnapshotStat[];
  liveDataLabel?: string;
}

export function AnalyticsSnapshotCard({ stats, liveDataLabel = "Live Data" }: AnalyticsSnapshotCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-zinc-400" />
            Analytics Snapshot
          </CardTitle>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            {liveDataLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
