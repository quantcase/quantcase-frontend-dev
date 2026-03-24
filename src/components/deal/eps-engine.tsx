"use client";

import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { EpsEngineSection, EpsScenario } from "@/types/deal";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";

interface EpsEngineProps {
  data?: EpsEngineSection;
}

type ScenarioKey = "bear" | "base" | "bull";

const scenarioConfig: {
  key: ScenarioKey;
  label: string;
  icon: typeof TrendingDown;
}[] = [
  { key: "bear", label: "BEAR CASE", icon: TrendingDown },
  { key: "base", label: "BASE CASE", icon: Zap },
  { key: "bull", label: "BULL CASE", icon: TrendingUp },
];

function GuidanceBox({
  guidance,
  result,
  resultColor,
}: {
  guidance?: string;
  result?: string;
  resultColor: string;
}) {
  if (!guidance && !result) return null;
  return (
    <div className="mt-2 rounded border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800">
        <div className="bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
            Mgmt Guidance
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
            {guidance}
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
            Outcome
          </p>
          <p className={`text-[10px] font-semibold leading-snug ${resultColor}`}>
            {result}
          </p>
        </div>
      </div>
    </div>
  );
}

// Normalize static camelCase data → API snake_case shape
function normalizeStatic(s: typeof epsEngineData.scenarios.bear): EpsScenario {
  return {
    industry_cagr:    { value: s.industryCagr.value,       note: s.industryCagr.note },
    revenue_growth:   { value: s.revenueGrowth.value,      note: s.revenueGrowth.note,      mgmt_guidance: s.revenueGrowth.mgmtGuidance,    mgmt_result: s.revenueGrowth.mgmtResult },
    margin_trajectory:{ value: s.marginTrajectory.value,   note: s.marginTrajectory.note,   mgmt_guidance: s.marginTrajectory.mgmtGuidance, mgmt_result: s.marginTrajectory.mgmtResult },
    execution_alpha:  { rating: s.executionAlpha.rating,   value: s.executionAlpha.value,   note: s.executionAlpha.note },
    expected_eps_cagr:{ value: s.expectedEpsCagr.value,    subtitle: s.expectedEpsCagr.subtitle },
  };
}

export function EpsEngine({ data }: EpsEngineProps) {
  const title              = data?.meta?.title            ?? epsEngineData.title;
  const subtitle           = data?.meta?.subtitle         ?? epsEngineData.subtitle;
  const subSectionTitle    = data?.sub_section_title      ?? epsEngineData.subSectionTitle;
  const subSectionSubtitle = data?.sub_section_subtitle   ?? epsEngineData.subSectionSubtitle;
  const insight            = data?.insight                ?? epsEngineData.insight;

  const static_ = epsEngineData.scenarios;
  const scenarios: Record<ScenarioKey, EpsScenario> = {
    bear: data?.scenarios?.bear ?? normalizeStatic(static_.bear),
    base: data?.scenarios?.base ?? normalizeStatic(static_.base),
    bull: data?.scenarios?.bull ?? normalizeStatic(static_.bull),
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172B] uppercase tracking-[0.01em] mb-0.5">{title}</h3>
          {subtitle && <p className="text-[14px] text-[#888888]">{subtitle}</p>}
        </div>
      </div>

      {/* Sub-section Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
          {subSectionTitle}
        </p>
        <p className="text-xs text-[#888888] mt-0.5">{subSectionSubtitle}</p>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarioConfig.map((cfg) => {
          const s = scenarios[cfg.key];
          const Icon = cfg.icon;

          return (
            <div
              key={cfg.key}
              className="rounded-xl border border-[#E2E2E2] bg-white overflow-hidden flex flex-col"
            >
              <div className="p-5 flex flex-col flex-1 gap-0">
                {/* Case label */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100">
                    <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {cfg.label}
                  </span>
                </div>

                {/* Industry CAGR */}
                <div className="pb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Industry CAGR
                  </p>
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-zinc-900">
                      {s.industry_cagr?.value}
                    </span>
                    {s.industry_cagr?.note && (
                      <span className="font-normal text-zinc-500 ml-1">
                        {s.industry_cagr.note}
                      </span>
                    )}
                  </p>
                </div>

                {/* Revenue Growth */}
                <div className="border-t border-zinc-100 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Revenue Growth (CAGR)
                  </p>
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-zinc-900">
                      {s.revenue_growth?.value}
                    </span>
                    {s.revenue_growth?.note && (
                      <span className="font-normal text-zinc-500 ml-1">
                        {s.revenue_growth.note}
                      </span>
                    )}
                  </p>
                  <GuidanceBox
                    guidance={s.revenue_growth?.mgmt_guidance}
                    result={s.revenue_growth?.mgmt_result}
                    resultColor="text-zinc-700"
                  />
                </div>

                {/* Margin Trajectory */}
                <div className="border-t border-zinc-100 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Margin Trajectory
                  </p>
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-zinc-900">
                      {s.margin_trajectory?.value}
                    </span>
                    {s.margin_trajectory?.note && (
                      <span className="font-normal text-zinc-500 ml-1">
                        {s.margin_trajectory.note}
                      </span>
                    )}
                  </p>
                  <GuidanceBox
                    guidance={s.margin_trajectory?.mgmt_guidance}
                    result={s.margin_trajectory?.mgmt_result}
                    resultColor="text-zinc-700"
                  />
                </div>

                {/* Execution Alpha */}
                <div className="border-t border-zinc-100 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Execution Alpha{s.execution_alpha?.rating && ` (${s.execution_alpha.rating})`}
                  </p>
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-zinc-900">
                      {s.execution_alpha?.value}
                    </span>
                    {s.execution_alpha?.note && (
                      <span className="font-normal text-zinc-500 ml-1">
                        {s.execution_alpha.note}
                      </span>
                    )}
                  </p>
                </div>

                {/* Expected EPS CAGR — pushed to bottom */}
                <div className="mt-auto border-t border-zinc-100 pt-3">
                  <div className="rounded-lg p-4 bg-[#F5F5F5]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">
                      Expected EPS CAGR
                    </p>
                    <p className="text-[26px] font-normal leading-none text-[#0F172B]">
                      {s.expected_eps_cagr?.value}
                    </p>
                    {s.expected_eps_cagr?.subtitle && (
                      <p className="text-[11px] text-[#888888] mt-0.5 leading-snug">
                        {s.expected_eps_cagr.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="rounded-lg bg-[#F5F5F5] border border-[#E2E2E2] p-4 flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-white border border-[#E2E2E2] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
            EPS Engine Insight
          </p>
          <p className="text-sm text-[#121212]">{insight}</p>
        </div>
      </div>
    </div>
  );
}
