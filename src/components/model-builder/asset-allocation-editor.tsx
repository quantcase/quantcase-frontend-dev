"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  formatCapital,
  ASSET_CLASSES,
  SUB_CLASSES,
  type AssetClassKey,
  type AssetClassAlloc,
  type SubClassAlloc,
} from "./portfolio-builder-stepper";
import type { AssetClassEntry } from "@/types/portfolio";

// ── Primitives ────────────────────────────────────────────────────────────────

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ background: on ? "#475569" : "var(--qc-hair)" }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SliderBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #475569 ${value}%, #E2E2E2 ${value}%)`,
        accentColor: "#475569",
      }}
    />
  );
}

// ── Rebalancing (array-indexed, generic) ──────────────────────────────────────

function rebalanceOthers<T extends { pct: number; enabled?: boolean }>(
  items: T[],
  changedIdx: number,
  delta: number,
): T[] {
  const otherIdxs = items
    .map((_, i) => i)
    .filter((i) => i !== changedIdx && items[i].enabled !== false);
  const othersTotal = otherIdxs.reduce((s, i) => s + items[i].pct, 0);
  const next = [...items];
  if (otherIdxs.length === 0) return next;
  if (othersTotal === 0) {
    const share = Math.round(delta / otherIdxs.length);
    otherIdxs.forEach((i) => {
      next[i] = { ...next[i], pct: Math.max(0, Math.min(100, next[i].pct + share)) };
    });
  } else {
    let remaining = delta;
    otherIdxs.forEach((i, pos) => {
      const adj =
        pos === otherIdxs.length - 1
          ? remaining
          : Math.round((items[i].pct / othersTotal) * delta);
      next[i] = { ...next[i], pct: Math.max(0, Math.min(100, next[i].pct + adj)) };
      remaining -= adj;
    });
  }
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component 1: AssetClassForm
// Toggle + slider for each top-level asset class, maintains 100% sum.
// Used in: Stepper Step 2, Detail page asset allocation section.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssetClassItem {
  key: AssetClassKey;
  enabled: boolean;
  pct: number;
}

interface AssetClassFormProps {
  capital: number;
  items: AssetClassItem[];
  onChange: (items: AssetClassItem[]) => void;
}

export function AssetClassForm({ capital, items, onChange }: AssetClassFormProps) {
  const toggle = (idx: number) => {
    const cur = items[idx];
    let next: AssetClassItem[];
    if (cur.enabled) {
      const base = items.map((item, i) =>
        i === idx ? { ...item, enabled: false, pct: 0 } : item
      );
      next = rebalanceOthers(base, idx, cur.pct).map((item, i) => ({
        ...item,
        enabled: i === idx ? false : items[i].enabled,
      }));
    } else {
      const enabledCount = items.filter((item) => item.enabled).length;
      const newPct = Math.round(100 / (enabledCount + 1));
      const base = items.map((item, i) =>
        i === idx ? { ...item, enabled: true, pct: newPct } : item
      );
      next = rebalanceOthers(base, idx, -newPct).map((item, i) => ({
        ...item,
        enabled: i === idx ? true : items[i].enabled,
      }));
    }
    onChange(next);
  };

  const slide = (idx: number, val: number) => {
    const prev = items[idx].pct;
    const delta = prev - val;
    const base = items.map((item, i) => (i === idx ? { ...item, pct: val } : item));
    const next = rebalanceOthers(base, idx, delta).map((item, i) => ({
      ...item,
      pct: i === idx ? val : item.pct,
    }));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const def = ASSET_CLASSES.find((a) => a.key === item.key);
        const amount = capital * (item.pct / 100);
        return (
          <div key={item.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Toggle on={item.enabled} onClick={() => toggle(idx)} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: item.enabled ? "var(--qc-ink)" : "var(--qc-ink-2)" }}>
                    {def?.label ?? item.key}
                  </p>
                  {def && (
                    <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>{def.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                {item.enabled ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>{item.pct}</p>
                    <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>{formatCapital(amount)}</p>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Off</p>
                )}
              </div>
            </div>
            {item.enabled && (
              <div className="pl-14">
                <SliderBar value={item.pct} onChange={(v) => slide(idx, v)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component 2: SubClassForm
// Toggle + slider for sub-classes within each active asset class.
// Used in: Stepper Step 3, Detail page sub-class panels.
// ─────────────────────────────────────────────────────────────────────────────

export interface SubClassItem {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  pct: number;
}

interface SubClassSectionProps {
  assetKey: AssetClassKey;
  assetLabel: string;
  assetPct: number;
  capital: number;
  subItems: SubClassItem[];
  onChange: (subItems: SubClassItem[]) => void;
  defaultExpanded?: boolean;
}

function SubClassSection({
  assetKey: _assetKey,
  assetLabel,
  assetPct,
  capital,
  subItems,
  onChange,
  defaultExpanded = false,
}: SubClassSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const classCap = capital * (assetPct / 100);

  const toggle = (idx: number) => {
    const cur = subItems[idx];
    let next: SubClassItem[];
    if (cur.enabled) {
      const base = subItems.map((s, i) => (i === idx ? { ...s, enabled: false, pct: 0 } : s));
      next = rebalanceOthers(base, idx, cur.pct).map((s, i) => ({
        ...s,
        enabled: i === idx ? false : subItems[i].enabled,
      }));
    } else {
      const enabledCount = subItems.filter((s) => s.enabled).length;
      const newPct = Math.round(100 / (enabledCount + 1));
      const base = subItems.map((s, i) => (i === idx ? { ...s, enabled: true, pct: newPct } : s));
      next = rebalanceOthers(base, idx, -newPct).map((s, i) => ({
        ...s,
        enabled: i === idx ? true : subItems[i].enabled,
      }));
    }
    onChange(next);
  };

  const slide = (idx: number, val: number) => {
    const prev = subItems[idx].pct;
    const delta = prev - val;
    const base = subItems.map((s, i) => (i === idx ? { ...s, pct: val } : s));
    const next = rebalanceOthers(base, idx, delta).map((s, i) => ({
      ...s,
      pct: i === idx ? val : s.pct,
    }));
    onChange(next);
  };

  return (
    <div className="border-b border-[#E2E2E2] last:border-0">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>{assetLabel}</p>
          <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>
            {assetPct}% of portfolio · {formatCapital(classCap)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-[#E2E2E2] px-3 py-1 text-xs font-medium hover:border-zinc-300 transition-colors"
          style={{ color: "var(--qc-ink)" }}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          sub-classes
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pb-4">
          {subItems.map((sub, i) => {
            const subAmount = classCap * (sub.pct / 100);
            return (
              <div key={sub.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Toggle on={sub.enabled} onClick={() => toggle(i)} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: sub.enabled ? "var(--qc-ink)" : "var(--qc-ink-2)" }}>
                        {sub.label}
                      </p>
                      {sub.description && (
                        <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>{sub.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {sub.enabled ? (
                      <>
                        <p className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>{sub.pct}</p>
                        <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>{formatCapital(subAmount)}</p>
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Off</p>
                    )}
                  </div>
                </div>
                {sub.enabled && (
                  <div className="pl-14">
                    <SliderBar value={sub.pct} onChange={(v) => slide(i, v)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SubClassFormProps {
  capital: number;
  activeAssetKeys: AssetClassKey[];
  assetPcts: Record<AssetClassKey, number>;
  subItemsMap: Record<AssetClassKey, SubClassItem[]>;
  onChange: (assetKey: AssetClassKey, subItems: SubClassItem[]) => void;
  defaultExpanded?: boolean;
}

export function SubClassForm({
  capital,
  activeAssetKeys,
  assetPcts,
  subItemsMap,
  onChange,
  defaultExpanded = false,
}: SubClassFormProps) {
  return (
    <div>
      {activeAssetKeys.map((key) => {
        const def = ASSET_CLASSES.find((a) => a.key === key)!;
        return (
          <SubClassSection
            key={key}
            assetKey={key}
            assetLabel={def.label}
            assetPct={assetPcts[key]}
            capital={capital}
            subItems={subItemsMap[key] ?? []}
            onChange={(next) => onChange(key, next)}
            defaultExpanded={defaultExpanded}
          />
        );
      })}
    </div>
  );
}

// ── Converters: stepper internal format ↔ AssetClassForm items ────────────────

export function assetAllocsToItems(
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>,
): AssetClassItem[] {
  return ASSET_CLASSES.map((def) => ({
    key: def.key,
    enabled: assetAllocs[def.key]?.enabled ?? false,
    pct: assetAllocs[def.key]?.pct ?? 0,
  }));
}

export function itemsToAssetAllocs(
  items: AssetClassItem[],
): Record<AssetClassKey, AssetClassAlloc> {
  return Object.fromEntries(
    items.map((item) => [item.key, { enabled: item.enabled, pct: item.pct }])
  ) as Record<AssetClassKey, AssetClassAlloc>;
}

function subAllocsToItems(
  assetKey: AssetClassKey,
  subAllocs: Record<string, SubClassAlloc>,
): SubClassItem[] {
  return SUB_CLASSES[assetKey].map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    enabled: subAllocs[def.key]?.enabled ?? false,
    pct: subAllocs[def.key]?.pct ?? 0,
  }));
}

export function subAllocsMapToItemsMap(
  subAllocsMap: Record<AssetClassKey, Record<string, SubClassAlloc>>,
): Record<AssetClassKey, SubClassItem[]> {
  return Object.fromEntries(
    (Object.keys(subAllocsMap) as AssetClassKey[]).map((key) => [
      key,
      subAllocsToItems(key, subAllocsMap[key]),
    ])
  ) as Record<AssetClassKey, SubClassItem[]>;
}

export function itemsToSubAllocs(
  items: SubClassItem[],
): Record<string, SubClassAlloc> {
  return Object.fromEntries(
    items.map((item) => [item.key, { enabled: item.enabled, pct: item.pct }])
  );
}

// ── Converters: StoredModel assetClasses ↔ form items ────────────────────────

export function assetClassEntriesToItems(assetClasses: AssetClassEntry[]): AssetClassItem[] {
  return ASSET_CLASSES.map((def) => {
    const existing = assetClasses.find((a) => a.key === def.key);
    return { key: def.key, enabled: !!(existing && existing.pct > 0), pct: existing?.pct ?? 0 };
  });
}

export function assetClassEntriesToSubItemsMap(
  assetClasses: AssetClassEntry[],
): Record<AssetClassKey, SubClassItem[]> {
  return Object.fromEntries(
    ASSET_CLASSES.map((def) => {
      const existing = assetClasses.find((a) => a.key === def.key);
      const subs = SUB_CLASSES[def.key].map((s) => {
        const existingSub = existing?.subClasses.find((sc) => sc.key === s.key);
        return {
          key: s.key,
          label: s.label,
          description: s.description,
          enabled: !!(existingSub && existingSub.pct > 0),
          pct: existingSub?.pct ?? 0,
        };
      });
      return [def.key, subs];
    })
  ) as Record<AssetClassKey, SubClassItem[]>;
}
