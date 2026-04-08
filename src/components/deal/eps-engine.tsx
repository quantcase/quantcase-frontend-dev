"use client";

import { ArrowDown } from "lucide-react";
import type { EpsEngineSection, EpsScenario } from "@/types/deal";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";

interface EpsEngineProps {
  data?: EpsEngineSection;
}

type ScenarioKey = "bear" | "base" | "bull";

const scenarioColors: Record<ScenarioKey, { text: string; header: string; label: string }> = {
  bull: { text: "text-emerald-600", header: "text-emerald-600", label: "Bull case — optimistic" },
  base: { text: "text-blue-600", header: "text-blue-600", label: "Base case — as per mgmt guidance" },
  bear: { text: "text-red-600", header: "text-red-600", label: "Bear case — risk-heavy" },
};

const scenarioOrder: ScenarioKey[] = ["bull", "base", "bear"];

// Normalize static camelCase data → API snake_case shape
function normalizeStatic(s: typeof epsEngineData.scenarios.bear): EpsScenario {
  return {
    industry_cagr:     { value: s.industryCagr.value,       note: s.industryCagr.note },
    revenue_growth:    { value: s.revenueGrowth.value,      note: s.revenueGrowth.note,      mgmt_guidance: s.revenueGrowth.mgmtGuidance,    mgmt_result: s.revenueGrowth.mgmtResult },
    margin_trajectory: { value: s.marginTrajectory.value,   note: s.marginTrajectory.note,   mgmt_guidance: s.marginTrajectory.mgmtGuidance, mgmt_result: s.marginTrajectory.mgmtResult },
    execution_alpha:   { rating: s.executionAlpha.rating,   value: s.executionAlpha.value,   note: s.executionAlpha.note },
    expected_eps_cagr: { value: s.expectedEpsCagr.value,    subtitle: s.expectedEpsCagr.subtitle },
  };
}

interface MetricRowProps {
  label: string;
  scenarios: Record<ScenarioKey, EpsScenario>;
  field: "industry_cagr" | "revenue_growth" | "margin_trajectory" | "expected_eps_cagr";
  isLast?: boolean;
}

function MetricRow({ label, scenarios, field, isLast }: MetricRowProps) {
  return (
    <>
      <div className="grid grid-cols-[180px_1fr_1fr_1fr] items-start gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 pt-3">
          {label}
        </p>
        {scenarioOrder.map((key) => {
          const s = scenarios[key];
          const metric = s[field];
          const colors = scenarioColors[key];
          const isEps = field === "expected_eps_cagr";

          return (
            <div
              key={key}
              className={`rounded-lg border px-4 py-3 ${
                isEps
                  ? key === "bull"
                    ? "bg-emerald-50/50 border-emerald-200/60"
                    : key === "base"
                    ? "bg-blue-50/50 border-blue-200/60"
                    : "bg-red-50/50 border-red-200/60"
                  : "bg-[#F5F5F5] border-[#E2E2E2]"
              }`}
            >
              <p className={`text-lg font-semibold ${isEps ? colors.text : colors.text}`}>
                {metric?.value}
              </p>
              <p className={`text-xs mt-0.5 text-[#888888]`}>
                {"note" in (metric || {}) ? (metric as { note?: string })?.note : ""}
                {"subtitle" in (metric || {}) ? (metric as { subtitle?: string })?.subtitle : ""}
              </p>
            </div>
          );
        })}
      </div>
      {!isLast && (
        <div className="grid grid-cols-[180px_1fr_1fr_1fr] gap-4">
          <div />
          {scenarioOrder.map((key) => (
            <div key={key} className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-zinc-500" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function EpsEngine({ data }: EpsEngineProps) {
  const static_ = epsEngineData.scenarios;
  const scenarios: Record<ScenarioKey, EpsScenario> = {
    bear: data?.scenarios?.bear ?? normalizeStatic(static_.bear),
    base: data?.scenarios?.base ?? normalizeStatic(static_.base),
    bull: data?.scenarios?.bull ?? normalizeStatic(static_.bull),
  };

  const topUpsideLever = data?.top_upside_lever;
  const primaryRiskFactor = data?.primary_risk_factor;

  return (
    <div className="space-y-5">
      {/* Legend pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {scenarioOrder.map((key) => {
          const cfg = scenarioColors[key];
          const borderColor =
            key === "bull"
              ? "border-emerald-600/40"
              : key === "base"
              ? "border-blue-600/40"
              : "border-red-600/40";
          return (
            <span
              key={key}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${borderColor} text-[#121212]`}
            >
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[180px_1fr_1fr_1fr] gap-4">
        <div />
        {scenarioOrder.map((key) => (
          <p
            key={key}
            className={`text-xs font-bold uppercase tracking-wider ${scenarioColors[key].header}`}
          >
            {key === "bull" ? "BULL CASE" : key === "base" ? "BASE CASE" : "BEAR CASE"}
          </p>
        ))}
      </div>

      {/* Metric rows */}
      <MetricRow label="Industry Growth" scenarios={scenarios} field="industry_cagr" />
      <MetricRow label="Revenue CAGR" scenarios={scenarios} field="revenue_growth" />
      <MetricRow label="Margin Trajectory" scenarios={scenarios} field="margin_trajectory" />
      <MetricRow label="EPS CAGR Forecast" scenarios={scenarios} field="expected_eps_cagr" isLast />

      {/* Bottom cards: upside lever + risk factor */}
      {(topUpsideLever || primaryRiskFactor) && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          {topUpsideLever && (
            <div className="rounded-lg bg-emerald-50/90 border border-emerald-200/60 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Top Upside Lever
              </p>
              <p className="text-base font-medium text-zinc-900">{topUpsideLever}</p>
            </div>
          )}
          {primaryRiskFactor && (
            <div className="rounded-lg bg-red-50/90 border border-red-200/60 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">
                Primary Risk Factor
              </p>
              <p className="text-base font-medium text-zinc-900">{primaryRiskFactor}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
