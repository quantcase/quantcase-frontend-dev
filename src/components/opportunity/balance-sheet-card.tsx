"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingDown, BarChart2, ShieldCheck, Gauge, Award, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { safeMetric, type BalanceSheetSection } from "@/types/opportunity";

interface BalanceSheetCardProps {
  data?: BalanceSheetSection;
  takeaway?: string;
}

function splitLabelBody(item: string): [string, string] {
  const idx = item.indexOf(": ");
  if (idx === -1) return ["", item];
  return [item.slice(0, idx), item.slice(idx + 2)];
}

export function BalanceSheetCard({ data, takeaway }: BalanceSheetCardProps) {
  const [showDetails, setShowDetails] = useState(true);

  const m = data?.metrics;
  const balanceSheetMetrics = [
    { ...safeMetric(m?.net_debt_ebitda), icon: TrendingDown, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(m?.debt_equity), icon: BarChart2, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(m?.interest_coverage), icon: ShieldCheck, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(m?.current_ratio), icon: Gauge, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(m?.credit_rating), icon: Award, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  const strengths = data?.strengths ?? [];
  const considerations = data?.considerations ?? [];

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {balanceSheetMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className={`rounded-lg border border-zinc-100 dark:border-zinc-800 p-3 ${m.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${m.iconColor}`}>{m.label}</p>
                  <div className={`rounded-md p-1 ${m.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                <p className={`text-[11px] mt-0.5 ${m.iconColor} opacity-80`}>{m.sublabel}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDetails ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showDetails && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Balance Sheet Assessment</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Strengths</p>
                </div>
                {strengths.map((item, i) => {
                  const [label, body] = splitLabelBody(item);
                  return (
                    <div key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <div>
                        {label && <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}: </span>}
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Considerations</p>
                </div>
                {considerations.map((item, i) => {
                  const [label, body] = splitLabelBody(item);
                  return (
                    <div key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      <div>
                        {label && <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}: </span>}
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {takeaway && (
          <div className="border-t border-purple-100 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-900/20 -mx-6 px-6 py-3 rounded-b-lg">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">FINANCIAL TAKEAWAY: </span>
              {takeaway}
            </p>
          </div>
        )}
    </div>
  );
}
