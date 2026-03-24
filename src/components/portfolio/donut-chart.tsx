"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSegment } from "@/types/portfolio";

interface DonutChartProps {
  data: AllocationSegment[];
  innerLabel?: string;
  innerSubLabel?: string;
}

export function DonutChart({ data, innerLabel, innerSubLabel }: DonutChartProps) {
  return (
    <div className="relative w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ padding: '0px 10px' }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      {innerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{innerLabel}</span>
          {innerSubLabel && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{innerSubLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
