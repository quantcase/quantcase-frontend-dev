"use client";

import {
  SubClassForm,
  subAllocsMapToItemsMap,
  itemsToSubAllocs,
} from "./asset-allocation-editor";
import type { RiskProfileType } from "@/types/portfolio";
import type { AssetClassKey, AssetClassAlloc, SubClassAlloc } from "./stepper-types";
import { RISK_PROFILES, formatCapital } from "./stepper-constants";

interface Step3Props {
  riskProfile: RiskProfileType;
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  subAllocsMap: Record<AssetClassKey, Record<string, SubClassAlloc>>;
  setSubAllocsMap: (m: Record<AssetClassKey, Record<string, SubClassAlloc>>) => void;
  activeClasses: AssetClassKey[];
}

export function Step3SubClasses({
  riskProfile,
  capital,
  assetAllocs,
  subAllocsMap,
  setSubAllocsMap,
  activeClasses,
}: Step3Props) {
  const riskLabel = riskProfile === "goal-based"
    ? "Goal-based"
    : (RISK_PROFILES.find((p) => p.type === riskProfile)?.label ?? riskProfile);

  const summaryTiles = [
    { label: "Profile",        value: riskLabel },
    { label: "Capital",        value: formatCapital(capital) },
    { label: "Active classes", value: String(activeClasses.length) },
    { label: "Total alloc",    value: "100%", highlight: true },
  ];

  const subItemsMap = subAllocsMapToItemsMap(subAllocsMap);
  const assetPcts = Object.fromEntries(
    activeClasses.map((k) => [k, assetAllocs[k].pct])
  ) as Record<AssetClassKey, number>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 pb-2">
        {summaryTiles.map(({ label, value, highlight }) => (
          <div key={label} className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "var(--qc-ink-2)" }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: highlight ? "#166534" : "var(--qc-ink)" }}>{value}</p>
          </div>
        ))}
      </div>

      <SubClassForm
        capital={capital}
        activeAssetKeys={activeClasses}
        assetPcts={assetPcts}
        subItemsMap={subItemsMap}
        onChange={(key, nextItems) =>
          setSubAllocsMap({ ...subAllocsMap, [key]: itemsToSubAllocs(nextItems) })
        }
      />
    </div>
  );
}
