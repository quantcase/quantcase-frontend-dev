"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const historicalData = [
  { year: "FY14", value: 22 },
  { year: "FY15", value: 24 },
  { year: "FY16", value: 21 },
  { year: "FY17", value: 23 },
  { year: "FY18", value: 25 },
  { year: "FY19", value: 24 },
  { year: "FY20", value: 28 },
  { year: "FY21", value: 32 },
  { year: "FY22", value: 38 },
  { year: "FY23", value: 45 },
  { year: "FY24", value: 52 },
];

const forecastData = [
  { year: "FY25", value: 60 },
  { year: "FY26", value: 65 },
  { year: "FY27", value: 70 },
  { year: "FY28", value: 75 },
  { year: "FY29", value: 82 },
];

export function TrendCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Historical */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              10-Year Trend
            </h3>
            <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px]">
              Historical
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                  fill="#ede9fe"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Forecast */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              5-Year Forecast
            </h3>
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px]">
              Projection
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
