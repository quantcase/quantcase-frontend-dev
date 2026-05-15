"use client";

import { useState } from "react";
import ApexChart from "@/components/molecules/apex-chart";
import type { ShareholdingSection, ShareholdingChild } from "@/hooks/useShareholding";
import { MonoEyebrow } from "@/components/overview/primitives";

// Purple-ink ramp → lime accent, derived from qc-* tokens
const SHAREHOLDING_COLORS = ["#210B2C", "#3D1C54", "#6B2FA0", "#9A60C8", "#C6DC8A", "#FFEB99", "#F3F2EE"];

// Non-promoter child IDs bucketed into DII / FII / Retail
const DII_IDS = new Set([
  "nonPromoterInst",
  "npMutualFunds",
  "npBanksFiIns",
  "npInsurance",
  "npFiBanks",
  "npCentralStateGovt",
  "npVentureCapital",
  "otherInstNp",
]);

const FII_IDS = new Set([
  "npFiis",
  "npForeignVenture",
  "npQfiInst",
]);

// Everything else in non-promoters falls into Retail (npNonInst, npCorpBodies, npIndividuals,
// npIndvUpto1L, npIndvOver1L, npQfi, otherNonInstNp, etc.)

type GroupKey = "promoters" | "dii" | "fii" | "retail";

interface GroupItem {
  key: GroupKey;
  label: string;
  value: number;
  children: Array<{ label: string; value: number }>;
}

function buildGroups(sections: ShareholdingSection[], period: string): GroupItem[] {
  const valueOf = (s: ShareholdingSection | ShareholdingChild) =>
    s.data.find((d) => d.quarter === period)?.value ?? null;

  const promotersSection = sections.find((s) => s.id === "promoters");
  const nonPromotersSection = sections.find((s) => s.id === "nonPromoters");

  const promoterValue = promotersSection ? valueOf(promotersSection) : null;

  // Build DII / FII / Retail from non-promoter children
  const diiChildren: Array<{ label: string; value: number }> = [];
  const fiiChildren: Array<{ label: string; value: number }> = [];
  const retailChildren: Array<{ label: string; value: number }> = [];

  for (const child of nonPromotersSection?.children ?? []) {
    const v = valueOf(child);
    if (v === null || v === 0) continue;
    const entry = { label: child.label, value: v };
    if (DII_IDS.has(child.id)) diiChildren.push(entry);
    else if (FII_IDS.has(child.id)) fiiChildren.push(entry);
    else retailChildren.push(entry);
  }

  const sum = (arr: Array<{ value: number }>) => arr.reduce((acc, x) => acc + x.value, 0);

  const groups: GroupItem[] = [];

  if (promoterValue !== null && promoterValue > 0) {
    // Promoter children as drill-down
    const promoterChildren = (promotersSection?.children ?? [])
      .map((c) => ({ label: c.label, value: valueOf(c) ?? 0 }))
      .filter((c) => c.value > 0);
    groups.push({ key: "promoters", label: "Promoters", value: promoterValue, children: promoterChildren });
  }

  const diiTotal = sum(diiChildren);
  if (diiTotal > 0) groups.push({ key: "dii", label: "DII", value: diiTotal, children: diiChildren });

  const fiiTotal = sum(fiiChildren);
  if (fiiTotal > 0) groups.push({ key: "fii", label: "FII", value: fiiTotal, children: fiiChildren });

  const retailTotal = sum(retailChildren);
  if (retailTotal > 0) groups.push({ key: "retail", label: "Retail & Others", value: retailTotal, children: retailChildren });

  return groups;
}

function makeDonutOptions(labels: string[], groupLabel: string): ApexCharts.ApexOptions {
  return {
    chart: {
      type: "donut",
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
    },
    labels,
    colors: SHAREHOLDING_COLORS,
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "58%",
          labels: {
            show: true,
            total: {
              show: true,
              label: groupLabel,
              fontSize: "11px",
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#5A5A54", // --qc-ink-2
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `${total.toFixed(1)}%`;
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val: number) => `${val.toFixed(1)}%` },
    },
    stroke: { width: 2, colors: ["#FFFFFF"] },
  };
}

export function ShareholdingCharts({
  sections,
  quarters,
}: {
  sections: ShareholdingSection[];
  quarters: string[];
}) {
  const period =
    [...quarters].reverse().find((q) =>
      sections.some((s) => {
        if (s.id === "total") return false;
        const dp = s.data.find((d) => d.quarter === q);
        return dp?.value !== null && dp?.value !== undefined;
      })
    ) ?? quarters[quarters.length - 1];

  const groups = buildGroups(sections, period);
  const maxValue = groups.length > 0 ? Math.max(...groups.map((g) => g.value)) : 1;

  const [selectedKey, setSelectedKey] = useState<GroupKey>("promoters");

  const selected = groups.find((g) => g.key === selectedKey) ?? groups[0];

  const donutSeries = selected?.children.map((c) => c.value) ?? [];
  const donutLabels = selected?.children.map((c) => c.label) ?? [];
  const donutOptions = makeDonutOptions(donutLabels, selected?.label ?? "");

  return (
    <div className="grid grid-cols-2 gap-8" style={{ alignItems: "start" }}>
      {/* Left — horizontal bar chart (groups) */}
      <div>
        <MonoEyebrow style={{ marginBottom: 14 }}>Latest Quarter · {period}</MonoEyebrow>
        <div className="space-y-4">
          {groups.map((group) => {
            const isSelected = group.key === selectedKey;
            return (
              <div
                key={group.key}
                onClick={() => setSelectedKey(group.key)}
                style={{ cursor: "pointer" }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "var(--qc-ink)" : "var(--qc-ink)",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {group.label}
                  {isSelected && (
                    <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "var(--qc-ink-2)", letterSpacing: "0.05em" }}>
                      ← breakdown
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 24,
                      background: "var(--qc-section)",
                      borderRadius: 6,
                      overflow: "hidden",
                      border: isSelected ? "1px solid var(--qc-ink)" : "1px solid var(--qc-hair-2)",
                    }}
                  >
                    <div
                      style={{
                        width: `${(group.value / maxValue) * 100}%`,
                        height: "100%",
                        background: "var(--qc-ink)",
                        opacity: isSelected ? 1 : 0.45,
                        borderRadius: 6,
                        transition: "width 0.4s ease, opacity 0.2s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--qc-ink)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: "0.02em",
                      minWidth: 52,
                      textAlign: "right",
                    }}
                  >
                    {group.value.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — donut chart (breakdown of selected group) */}
      <div>
        <MonoEyebrow style={{ marginBottom: 14 }}>
          {selected?.label ?? "Shareholding"} Breakdown
        </MonoEyebrow>
        {donutSeries.length > 0 ? (
          <>
            <ApexChart
              type="donut"
              series={donutSeries}
              options={donutOptions}
              height={280}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 16px",
                marginTop: 12,
                justifyContent: "center",
              }}
            >
              {selected?.children.map((child, i) => (
                <div key={child.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--qc-ink)",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {child.label}:{" "}
                    <strong style={{ color: "var(--qc-ink)" }}>
                      {child.value.toFixed(1)}
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--qc-ink-2)", padding: "40px 0", textAlign: "center" }}>
            No breakdown available
          </div>
        )}
      </div>
    </div>
  );
}
