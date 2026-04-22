"use client";

import { ArrowDown } from "lucide-react";
import type { EpsEngineSection, EpsScenario } from "@/types/deal";
import { fmtDealNum } from "@/lib/utils";
import { epsEngineData } from "@/components/deal/detailed-analysis-data";

interface EpsEngineProps {
  data?: EpsEngineSection;
}

type ScenarioKey = "bear" | "base" | "bull";

const scenarioColors: Record<ScenarioKey, { cssVar: string; label: string }> = {
  bull: { cssVar: "var(--qc-up)", label: "Bull case — optimistic" },
  base: { cssVar: "var(--qc-blue)", label: "Base case — as per mgmt guidance" },
  bear: { cssVar: "var(--qc-down)", label: "Bear case — risk-heavy" },
};

const scenarioOrder: ScenarioKey[] = ["bull", "base", "bear"];

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
        <p className="text-[11px] font-semibold uppercase tracking-wider pt-3" style={{ color: "var(--qc-text-muted)" }}>
          {label}
        </p>
        {scenarioOrder.map((key) => {
          const s = scenarios[key];
          const metric = s[field];
          const cssVar = scenarioColors[key].cssVar;
          const isEps = field === "expected_eps_cagr";

          return (
            <div
              key={key}
              className="rounded-lg px-4 py-3"
              style={{
                background: isEps ? `${cssVar}12` : "var(--qc-surface-panel)",
                border: `1px solid ${isEps ? cssVar : "var(--qc-border-default)"}`,
                borderColor: isEps ? `${cssVar}40` : "var(--qc-border-default)",
              }}
            >
              <p className="text-lg font-semibold" style={{ color: cssVar }}>
                {fmtDealNum(metric?.value)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--qc-text-muted)" }}>
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
              <ArrowDown className="h-4 w-4" style={{ color: "var(--qc-text-muted)" }} />
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
          const { cssVar, label } = scenarioColors[key];
          return (
            <span
              key={key}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ border: `1px solid ${cssVar}60`, color: "var(--qc-text-body)" }}
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[180px_1fr_1fr_1fr] gap-4">
        <div />
        {scenarioOrder.map((key) => (
          <p key={key} className="text-xs font-bold uppercase tracking-wider" style={{ color: scenarioColors[key].cssVar }}>
            {key === "bull" ? "BULL CASE" : key === "base" ? "BASE CASE" : "BEAR CASE"}
          </p>
        ))}
      </div>

      {/* Metric rows */}
      <MetricRow label="Industry Growth" scenarios={scenarios} field="industry_cagr" />
      <MetricRow label="Revenue CAGR" scenarios={scenarios} field="revenue_growth" />
      <MetricRow label="Margin Trajectory" scenarios={scenarios} field="margin_trajectory" />
      <MetricRow label="EPS CAGR Forecast" scenarios={scenarios} field="expected_eps_cagr" isLast />

      {/* Bottom cards */}
      {(topUpsideLever || primaryRiskFactor) && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          {topUpsideLever && (
            <div className="rounded-lg px-5 py-4" style={{ background: "var(--qc-up-soft)", border: "1px solid var(--qc-up)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--qc-up)" }}>
                Top Upside Lever
              </p>
              <p className="text-base font-medium" style={{ color: "var(--qc-text-heading)" }}>{topUpsideLever}</p>
            </div>
          )}
          {primaryRiskFactor && (
            <div className="rounded-lg px-5 py-4" style={{ background: "var(--qc-down-soft)", border: "1px solid var(--qc-down)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--qc-down)" }}>
                Primary Risk Factor
              </p>
              <p className="text-base font-medium" style={{ color: "var(--qc-text-heading)" }}>{primaryRiskFactor}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
