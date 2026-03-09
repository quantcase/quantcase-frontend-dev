"use client";

import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";

type ScenarioKey = "bear" | "base" | "bull";

const scenarioConfig: {
  key: ScenarioKey;
  label: string;
  icon: typeof TrendingDown;
  iconBg: string;
  iconColor: string;
  labelColor: string;
  guidanceResultColor: string;
  marginBullColor: string;
  executionValueColor: string;
  epsBg: string;
  epsValueColor: string;
  epsSubtitleColor: string;
}[] = [
  {
    key: "bear",
    label: "BEAR CASE",
    icon: TrendingDown,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
    labelColor: "text-red-500",
    guidanceResultColor: "text-red-500",
    marginBullColor: "text-red-500",
    executionValueColor: "text-zinc-900 dark:text-zinc-50",
    epsBg: "bg-red-50 dark:bg-red-900/20",
    epsValueColor: "text-red-500",
    epsSubtitleColor: "text-red-400",
  },
  {
    key: "base",
    label: "BASE CASE",
    icon: Zap,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    labelColor: "text-blue-600",
    guidanceResultColor: "text-blue-500",
    marginBullColor: "text-emerald-600",
    executionValueColor: "text-blue-600",
    epsBg: "bg-blue-50 dark:bg-blue-900/20",
    epsValueColor: "text-blue-600",
    epsSubtitleColor: "text-blue-400",
  },
  {
    key: "bull",
    label: "BULL CASE",
    icon: TrendingUp,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
    labelColor: "text-emerald-600",
    guidanceResultColor: "text-emerald-500",
    marginBullColor: "text-emerald-600",
    executionValueColor: "text-emerald-600",
    epsBg: "bg-emerald-50 dark:bg-emerald-900/20",
    epsValueColor: "text-emerald-600",
    epsSubtitleColor: "text-emerald-500",
  },
];

export function EpsEngine() {
  const { title, subtitle, subSectionTitle, subSectionSubtitle, scenarios, insight } =
    epsEngineData;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* Sub-section Header */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          {subSectionTitle}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subSectionSubtitle}</p>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarioConfig.map((cfg) => {
          const s = scenarios[cfg.key];
          const Icon = cfg.icon;
          const marginIsNegative = s.marginTrajectory.value.startsWith("-");
          const marginColor = marginIsNegative ? "text-red-500" : cfg.marginBullColor;

          return (
            <Card
              key={cfg.key}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <CardContent className="p-5 space-y-4">
                {/* Case Label */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${cfg.iconBg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${cfg.labelColor}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Industry CAGR */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                    Industry CAGR
                  </p>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {s.industryCagr.value}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      {s.industryCagr.note}
                    </span>
                  </p>
                </div>

                {/* Revenue Growth */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                    Revenue Growth (CAGR)
                  </p>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {s.revenueGrowth.value}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      {s.revenueGrowth.note}
                    </span>
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                    <span className="text-[10px] text-zinc-500">
                      Mgmt Guidance: {s.revenueGrowth.mgmtGuidance} →
                    </span>
                    <span className={`text-[10px] font-semibold ${cfg.guidanceResultColor}`}>
                      {s.revenueGrowth.mgmtResult}
                    </span>
                  </div>
                </div>

                {/* Margin Trajectory */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                    Margin Trajectory
                  </p>
                  <p className="text-base font-bold">
                    <span className={marginColor}>{s.marginTrajectory.value}</span>{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      {s.marginTrajectory.note}
                    </span>
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                    <span className="text-[10px] text-zinc-500">
                      Mgmt Guidance: {s.marginTrajectory.mgmtGuidance} →
                    </span>
                    <span className={`text-[10px] font-semibold ${cfg.guidanceResultColor}`}>
                      {s.marginTrajectory.mgmtResult}
                    </span>
                  </div>
                </div>

                {/* Execution Alpha */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                    Execution Alpha ({s.executionAlpha.rating})
                  </p>
                  <p className="text-base font-bold">
                    <span className={cfg.executionValueColor}>{s.executionAlpha.value}</span>{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      {s.executionAlpha.note}
                    </span>
                  </p>
                </div>

                {/* Expected EPS CAGR box */}
                <div className={`rounded-lg p-3 ${cfg.epsBg}`}>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${cfg.epsValueColor} mb-0.5`}
                  >
                    Expected EPS CAGR
                  </p>
                  <p className={`text-3xl font-bold ${cfg.epsValueColor}`}>
                    {s.expectedEpsCagr.value}
                  </p>
                  <p className={`text-xs ${cfg.epsSubtitleColor}`}>
                    {s.expectedEpsCagr.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* EPS Engine Insight */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
            EPS Engine Insight
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{insight}</p>
        </div>
      </div>
    </div>
  );
}
