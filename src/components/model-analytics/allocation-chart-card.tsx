"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/portfolio/donut-chart";
import type { AllocationSegment } from "@/types/portfolio";

interface AllocationChartCardProps {
  segments: AllocationSegment[];
  totalInvestedPercent: number;
}

export function AllocationChartCard({ segments, totalInvestedPercent }: AllocationChartCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Current Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DonutChart
          data={segments}
          innerLabel={`${totalInvestedPercent}%`}
          innerSubLabel="Invested"
        />

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4">
          {segments.map((seg) => (
            <div key={seg.name} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {seg.name}{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{seg.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
