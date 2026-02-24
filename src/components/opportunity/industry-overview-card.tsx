"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, Package, BarChart2, Zap, AlertTriangle } from "lucide-react";

const industryMetrics = [
  { label: "LT INDUSTRY CAGR", value: "12.8%", sub: "Fast Paced", icon: TrendingUp, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "MARKET SIZE", value: "₹2.4T", sub: "Total Addressable", icon: Package, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "MARKET SHARE", value: "24.8%", sub: "Market Leader", icon: BarChart2, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { label: "DEMAND GROWTH", value: "Strong", sub: "Outpaces Supply 2x", icon: Zap, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { label: "SUPPLY CONSTRAINT", value: "Moderate", sub: "2-3 Year Lag", icon: AlertTriangle, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
];

export function IndustryOverviewCard() {
  const [showDeepDive, setShowDeepDive] = useState(true);

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Industry Overview &amp; Market
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs text-zinc-500">
            Weight: 25% of Total Score
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 5 Metric tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {industryMetrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                  <div className={`rounded-md p-1 ${m.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDeepDive ? "Hide Deep Dive" : "Show Deep Dive"}
            {showDeepDive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Deep Dive */}
        {showDeepDive && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Demand-Supply Dynamics</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Demand Side</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Robust domestic consumption led by new airport infrastructure (Tier 2/3 cities), increasing PAX per capita, and premiumization of travel. Order books for industry players are 2.5x TTM rev.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Supply Side</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Industry faces structural supply constraints due to OEM backlogs (Airbus/Boeing). Supply elasticity remains lagging demand by 2-3 years, keeping yields for airport operators robust.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase">
                NET IMPACT
              </Badge>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Supply-demand gap widening in near term (FY24-FY26), favorable for margin expansion and asset turn leverage.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
